'use client';

import { getSigrittoProgram, getSigrittoProgramId, UserCategory } from './sigritto-exports';
import { Program } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, Keypair, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
//import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';

import { useAnchorProvider } from '@/components/walletConnect'

// Define argument interfaces for mutations
interface InitializeArgs {
    owners: string[]; // Array of owner public key strings
    threshold: number; // u8 in Rust, but number in JS
    category: UserCategory; // Simplified enum representation
}
export function useSigrittoProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getSigrittoProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = getSigrittoProgram(provider);

    const multisigPda = PublicKey.findProgramAddressSync(
        [Buffer.from('multisig')],
        programId
    )[0];

    // Fetch the multisig wallet account
    const multisigAccount = useQuery({
        queryKey: ['multisigwallet', 'fetch', { cluster, multisigPda }],
        queryFn: () => program.account.multisigWallet.fetch(multisigPda),
    });

    // Fetch the program account info
    const getProgramAccount = useQuery({
        queryKey: ['get-program-account', { cluster }],
        queryFn: () => connection.getParsedAccountInfo(programId),
    });

    // Update the initialization mutation in sigritto-data-access.tsx
    const initialize = useMutation<string, Error, InitializeArgs>({
        mutationKey: ["multisig-wallet", "initialize", { cluster }],
        mutationFn: async ({ owners, threshold, category }) => {
            try {
                const ownerPubkeys = owners.map((owner) => {
                    try {
                        return new PublicKey(owner.trim()) // Add trim() and validation
                    } catch (error) {
                        throw new Error(`Invalid Solana address: ${owner}. 
                    Ensure it's a base58 string without special characters (0, O, I, l are invalid)`)
                    }
                })

                // Check for duplicates after validation
                const uniqueKeys = new Set(ownerPubkeys.map(pk => pk.toBase58()))
                if (uniqueKeys.size !== ownerPubkeys.length) {
                    throw new Error("Duplicate owner addresses detected")
                }

                const categoryEnum = category === UserCategory.Free
                    ? { free: {} }
                    : { pro: {} }

                return program.methods
                    .initializeMultisigWallet(ownerPubkeys, threshold, categoryEnum)
                    .accounts({
                        signer: provider.wallet.publicKey,
                    })
                    .rpc()
            } catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Initialization failed: ${error.message}`)
                }
                throw error
            }
        },
        onSuccess: (signature) => {
            transactionToast(signature)
            multisigAccount.refetch()
        },
        onError: (error) => {
            console.error("Detailed error:", error)
            toast.error(`Multisig creation failed: ${error.message}`)
        }
    });

  return {
    program,
    programId,
    multisigAccount,
    getProgramAccount,
    initialize,
  };
}

export function useSigrittoProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, multisigAccount } = useSigrittoProgram();

  const accountQuery = useQuery({
    queryKey: ['multisig_wallet', 'fetch', { cluster, account }],
    queryFn: () => program.account.multisigWallet.fetch(account),
  });

  return {
    accountQuery,
  };
}
