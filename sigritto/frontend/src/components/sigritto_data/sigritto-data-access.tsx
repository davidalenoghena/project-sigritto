'use client';

import { getSigrittoProgram, getSigrittoProgramId, UserCategory } from './sigritto-exports';
import { Cluster, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useTransactionToast } from '../ui/ui-layout';
import { useAnchorProvider } from '@/components/walletConnect';
import BN from 'bn.js';

// Enhanced argument interfaces
interface InitializeArgs {
    owners: string[];
    threshold: number;
    category: UserCategory;
    nonce: number;
}

interface TransactionArgs {
    creator: PublicKey;
    nonce: number;
}

interface WithdrawalArgs extends TransactionArgs {
    amount: BN;
}

interface ApprovalArgs extends TransactionArgs {
    transactionId: number;
}

interface ExecuteArgs extends TransactionArgs {
    transactionId: number;
    recipient: PublicKey;
}

export function useSigrittoProgram() {
    //const connection = new Connection("https://api.testnet.sonic.game", "confirmed");
    const { cluster } = useCluster();
    const transactionToast = useTransactionToast();
    const provider = useAnchorProvider();

    // Add null check for provider
    const program = useMemo(() => {
        return provider ? getSigrittoProgram(provider) : null
    }, [provider])

    const programId = useMemo(
        () => getSigrittoProgramId(cluster.network as Cluster),
        [cluster]
    );
    // const program = getSigrittoProgram(provider);

    // Helper to compute PDA
    const getMultisigPDA = (creator: PublicKey, nonce: number) => {
        return PublicKey.findProgramAddressSync(
            [
                Buffer.from('multisig'),
                creator.toBuffer(),
                Buffer.from([nonce])
            ],
            programId
        )[0];
    };

    // Generic multisig account fetcher
    const fetchMultisigAccount = async (creator: PublicKey, nonce: number) => {
        const multisigPDA = getMultisigPDA(creator, nonce);
        return program.account.multisigWallet.fetch(multisigPDA);
    };

    // Initialize Multisig Wallet
    const initialize = useMutation<string, Error, InitializeArgs>({
        mutationKey: ["multisig-wallet", "initialize", { cluster }],
        mutationFn: async ({ owners, threshold, category, nonce }) => {
            try {
                const ownerPubkeys = owners.map(owner => new PublicKey(owner.trim()));
                const uniqueKeys = new Set(ownerPubkeys.map(pk => pk.toBase58()));

                if (uniqueKeys.size !== ownerPubkeys.length) {
                    throw new Error("Duplicate owner addresses detected");
                }

                const categoryEnum = category === UserCategory.Free
                    ? { free: {} }
                    : { pro: {} };

                const multisigPDA = getMultisigPDA(provider.wallet.publicKey, nonce);

                return await program.methods
                    .initializeMultisigWallet(nonce, ownerPubkeys, threshold, categoryEnum)
                    .accounts({
                        multisig: multisigPDA,
                        creator: provider.wallet.publicKey
                    })
                    .rpc();
            } catch (error: any) {
                throw new Error(`Initialization failed: ${error.message}`);
            }
        },
        onSuccess: (signature) => {
            transactionToast(signature);
        },
        onError: (error) => {
            toast.error(`Multisig creation failed: ${error.message}`);
        }
    });

    // Request Withdrawal
    const requestWithdrawal = useMutation<string, Error, WithdrawalArgs>({
        mutationKey: ["multisig-wallet", "request-withdrawal", { cluster }],
        mutationFn: async ({ creator, nonce, amount }) => {
            try {
                const multisigPDA = getMultisigPDA(creator, nonce);

                return await program.methods
                    .requestWithdrawal(new BN(amount))
                    .accounts({
                        multisig: multisigPDA,
                        signer: provider.wallet.publicKey
                    })
                    .rpc();
            } catch (error: any) {
                throw new Error(`Withdrawal request failed: ${error.message}`);
            }
        },
        onSuccess: (signature) => transactionToast(signature),
        onError: (error) => toast.error(error.message)
    });

    // Approve Request
    const approveRequest = useMutation<string, Error, ApprovalArgs>({
        mutationKey: ["multisig-wallet", "approve-request", { cluster }],
        mutationFn: async ({ creator, nonce, transactionId }) => {
            try {
                const multisigPDA = getMultisigPDA(creator, nonce);

                return await program.methods
                    .approveRequest(new BN(transactionId))
                    .accounts({
                        multisig: multisigPDA,
                        signer: provider.wallet.publicKey
                    })
                    .rpc();
            } catch (error: any) {
                throw new Error(`Approval failed: ${error.message}`);
            }
        },
        onSuccess: (signature) => transactionToast(signature),
        onError: (error) => toast.error(error.message)
    });

    // Execute Request
    const executeRequest = useMutation<string, Error, ExecuteArgs>({
        mutationKey: ["multisig-wallet", "execute-request", { cluster }],
        mutationFn: async ({ creator, nonce, transactionId, recipient }) => {
            try {
                const multisigPDA = getMultisigPDA(creator, nonce);

                return await program.methods
                    .executeRequest(new BN(transactionId))
                    .accounts({
                        multisig: multisigPDA,
                        recipient: recipient,
                        signer: provider.wallet.publicKey,
                    })
                    .rpc();
            } catch (error: any) {
                throw new Error(`Execution failed: ${error.message}`);
            }
        },
        onSuccess: (signature) => transactionToast(signature),
        onError: (error) => toast.error(error.message)
    });

    // Query: Get Wallet Balance
    const getWalletBalance = (creator: PublicKey, nonce: number) => useQuery<number, Error>({
        queryKey: ['walletBalance', { cluster, creator, nonce }],
        queryFn: async () => {
            const multisigPDA = getMultisigPDA(creator, nonce);
            return program.methods.getWalletBalance()
                .accounts({ multisig: multisigPDA })
                .view() as Promise<number>;
        },
        enabled: !!program && !!creator
    });

    // Query: Get Pending Transactions
    const getPendingTransactions = (creator: PublicKey, nonce: number) => useQuery<any[], Error>({
        queryKey: ['pendingTransactions', { cluster, creator, nonce }],
        queryFn: async () => {
            const multisigPDA = getMultisigPDA(creator, nonce);
            const account = await program.account.multisigWallet.fetch(multisigPDA);
            return account.pendingTransactions;
        },
        enabled: !!program && !!creator
    });

    // Query: Get Owners
    const getOwners = (creator: PublicKey, nonce: number) => useQuery<PublicKey[], Error>({
        queryKey: ['multisigOwners', { cluster, creator, nonce }],
        queryFn: async () => {
            const multisigPDA = getMultisigPDA(creator, nonce);
            const account = await program.account.multisigWallet.fetch(multisigPDA);
            return account.owners;
        },
        enabled: !!program && !!creator
    });

    const searchMultisigWallet = (creator: PublicKey, nonce: number) => useQuery({
        queryKey: ['multisig-wallet', 'search', { cluster, creator, nonce }],
        queryFn: async () => {
            return fetchMultisigAccount(creator, nonce);
        },
        enabled: !!creator && nonce !== undefined,
        retry: 1, // Optional: Reduce retries for non-existent accounts
    });

    return {
        program: program || undefined,
        programId,
        initialize,
        requestWithdrawal,
        approveRequest,
        executeRequest,
        getWalletBalance,
        getPendingTransactions,
        getOwners,
        fetchMultisigAccount,
        searchMultisigWallet
    };
}