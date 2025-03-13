import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MultisigWallet } from "../target/types/multisig_wallet"; // Adjust path to your IDL
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert } from "chai";

describe("multisig_wallet", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.MultisigWallet as Program<MultisigWallet>;
    const wallet = provider.wallet;

    // Generate keypairs for owners
    const owner1 = anchor.web3.Keypair.generate();
    const owner2 = anchor.web3.Keypair.generate();
    const owner3 = anchor.web3.Keypair.generate();

    // Multisig wallet PDA
    const [multisigPda, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from("multisig")],
        program.programId
    );

    // Helper function to airdrop lamports to an account
    async function airdrop(pubkey: PublicKey, amount: number) {
        const signature = await provider.connection.requestAirdrop(pubkey, amount);
        await provider.connection.confirmTransaction(signature);
    }

    // Setup: Airdrop funds to owners and multisig PDA
    before(async () => {
        await airdrop(wallet.publicKey, 10 * LAMPORTS_PER_SOL);
        await airdrop(owner1.publicKey, 2 * LAMPORTS_PER_SOL);
        await airdrop(owner2.publicKey, 2 * LAMPORTS_PER_SOL);
        await airdrop(owner3.publicKey, 2 * LAMPORTS_PER_SOL);
        await airdrop(multisigPda, 5 * LAMPORTS_PER_SOL); // Initial balance for multisig
    });

    it("Initializes the multisig wallet", async () => {
        const owners = [owner1.publicKey, owner2.publicKey, owner3.publicKey];
        const threshold = 2;

        await program.methods
            .initializeMultisigWallet(owners, threshold, { free: {} })
            .accounts({
                multisig: multisigPda,
                signer: wallet.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        const multisigAccount = await program.account.multisigWallet.fetch(multisigPda);
        assert.equal(multisigAccount.owners.length, 3);
        assert.equal(multisigAccount.threshold, threshold);
        assert.equal(multisigAccount.transactionCount.toNumber(), 0);
        assert.equal(multisigAccount.pendingTransactions.length, 0);
        assert.ok(multisigAccount.balance.toNumber() > 0); // Should have initial balance
    });

    it("Requests a withdrawal", async () => {
        const amount = 1 * LAMPORTS_PER_SOL;

        await program.methods
            .requestWithdrawal(new anchor.BN(amount))
            .accounts({
                multisig: multisigPda,
                signer: owner1.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([owner1])
            .rpc();

        const multisigAccount = await program.account.multisigWallet.fetch(multisigPda);
        assert.equal(multisigAccount.pendingTransactions.length, 1);
        const tx = multisigAccount.pendingTransactions[0];
        assert.equal(tx.id.toNumber(), 0);
        assert.equal(tx.to.toBase58(), owner1.publicKey.toBase58());
        assert.equal(tx.amount.toNumber(), amount);
        assert.equal(tx.approvals.length, 1);
        assert.equal(tx.approvals[0].toBase58(), owner1.publicKey.toBase58());
        assert.equal(tx.executed, false);
    });

    it("Approves a withdrawal request", async () => {
        const transactionId = new anchor.BN(0);

        await program.methods
            .approveRequest(transactionId)
            .accounts({
                multisig: multisigPda,
                signer: owner2.publicKey,
            })
            .signers([owner2])
            .rpc();

        const multisigAccount = await program.account.multisigWallet.fetch(multisigPda);
        const tx = multisigAccount.pendingTransactions[0];
        assert.equal(tx.approvals.length, 2);
        assert.ok(tx.approvals.some((key) => key.equals(owner2.publicKey)));
    });

    it("Executes a withdrawal request", async () => {
        const transactionId = new anchor.BN(0);
        const recipientBalanceBefore = await provider.connection.getBalance(owner1.publicKey);

        await program.methods
            .executeRequest(transactionId)
            .accounts({
                multisig: multisigPda,
                recipient: owner1.publicKey,
                signer: owner1.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([owner1])
            .rpc();

        const multisigAccount = await program.account.multisigWallet.fetch(multisigPda);
        assert.equal(multisigAccount.pendingTransactions.length, 0); // Transaction removed

        const recipientBalanceAfter = await provider.connection.getBalance(owner1.publicKey);
        assert.ok(recipientBalanceAfter > recipientBalanceBefore); // Balance increased
    });

    it("Fails to initialize with too many owners", async () => {
        const owners = Array(11).fill(owner1.publicKey); // Exceeds max for Free (3)
        const threshold = 2;

        try {
            await program.methods
                .initializeMultisigWallet(owners, threshold, { free: {} })
                .accounts({
                    multisig: multisigPda,
                    signer: wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();
            assert.fail("Should have failed due to too many owners");
        } catch (err) {
            assert.include(err.toString(), "TooManyOwners");
        }
    });

    it("Fails to execute with insufficient approvals", async () => {
        // Request a new withdrawal
        await program.methods
            .requestWithdrawal(new anchor.BN(0.5 * LAMPORTS_PER_SOL))
            .accounts({
                multisig: multisigPda,
                signer: owner1.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([owner1])
            .rpc();

        const transactionId = new anchor.BN(1);

        try {
            await program.methods
                .executeRequest(transactionId)
                .accounts({
                    multisig: multisigPda,
                    recipient: owner1.publicKey,
                    signer: owner1.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .signers([owner1])
                .rpc();
            assert.fail("Should have failed due to threshold not met");
        } catch (err) {
            assert.include(err.toString(), "ThresholdNotMet");
        }
    });
});