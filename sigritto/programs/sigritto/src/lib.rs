use anchor_lang::prelude::*;
use anchor_lang::solana_program::pubkey::Pubkey;

declare_id!("5jAp6TAEegjtconAwrAu4T62FS4yyg4CwykuFhdJv3Dp"); // Program ID

#[program]
pub mod multisig_wallet {
    use super::*;

    /// Initialize the multisig wallet
    pub fn initialize_multisig_wallet(
        ctx: Context<InitializeMultisig>,
        owners: Vec<Pubkey>,
        threshold: u8,
        category: UserCategory,
    ) -> Result<()> {
        let multisig = &mut ctx.accounts.multisig;

        let max_owners = get_max_owners(&category);

        // Validate number of owners
        if owners.len() > max_owners as usize {
            return err!(MultisigError::TooManyOwners);
        }

        // Validate threshold
        if threshold < 2 {
            return err!(MultisigError::ThresholdTooLow);
        }
        if threshold as usize > owners.len() {
            return err!(MultisigError::ThresholdExceedsOwners);
        }

        // Initialize the multisig wallet state
        multisig.owners = owners;
        multisig.threshold = threshold;
        multisig.transaction_count = 0;
        multisig.pending_transactions = Vec::new(); // Using Vec instead of HashMap for simplicity
        multisig.balance = 0;

        Ok(())
    }

    // Add more instructions here (e.g., propose_transaction, approve_transaction, etc.) as needed
}

// Accounts structure for initializing the multisig wallet
#[derive(Accounts)]
pub struct InitializeMultisig<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + MultisigWallet::INITIAL_SIZE,
        seeds = [b"multisig"],
        bump
    )]
    pub multisig: Account<'info, MultisigWallet>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Multisig wallet account data structure
#[account]
#[derive(Default)]
pub struct MultisigWallet {
    pub owners: Vec<Pubkey>, // List of owner public keys
    pub threshold: u8,       // Minimum number of approvals required
    pub transaction_count: u64, // Counter for transactions
    pub pending_transactions: Vec<Transaction>, // List of pending transactions
    pub balance: u64,        // Wallet balance in lamports
}

impl MultisigWallet {
    // Initial size estimate for space allocation (adjust as needed)
    const INITIAL_SIZE: usize = 32 * 10 + // owners (assuming max 10 owners for now)
        1 +                              // threshold
        8 +                              // transaction_count
        4 + (8 + 32 + 8 + 4 + 32 + 1) * 10 + // pending_transactions (assuming max 10 txs)
        8;                               // balance
}

// Transaction data structure
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct Transaction {
    pub id: u64,              // Transaction ID
    pub to: Pubkey,           // Recipient's public key
    pub amount: u64,          // Amount to send
    pub approvals: Vec<Pubkey>, // List of approvers
    pub executed: bool,       // Whether the transaction has been executed
}

// User category enum
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum UserCategory {
    Free,
    Pro,
}

// Error codes
#[error_code]
pub enum MultisigError {
    #[msg("Number of owners exceeds the limit for this category")]
    TooManyOwners,
    #[msg("Threshold must be at least 2 to ensure collaboration")]
    ThresholdTooLow,
    #[msg("Threshold cannot exceed the number of owners")]
    ThresholdExceedsOwners,
}

// Helper function to determine max owners based on category
fn get_max_owners(category: &UserCategory) -> u8 {
    match category {
        UserCategory::Free => 3,  // Max owners for Free users
        UserCategory::Pro => 10,  // Max owners for Pro users
    }
}