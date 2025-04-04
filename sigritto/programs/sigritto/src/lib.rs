use anchor_lang::prelude::*;
use anchor_lang::solana_program::{pubkey::Pubkey, system_instruction};

declare_id!("FvQihDMQ3Y55X3ZV1oowcm5CM2iwgioEiyV54KfXPWks"); // Replace with your actual program ID

#[program]
pub mod multisig_wallet {
    use super::*;

    /// Initialize the multisig wallet
    pub fn initialize_multisig_wallet(
        ctx: Context<InitializeMultisig>,
        nonce: u8,
        owners: Vec<Pubkey>,
        threshold: u8,
        category: UserCategory,
    ) -> Result<()> {
        let multisig = &mut ctx.accounts.multisig;
        let creator = &ctx.accounts.creator;

        let max_owners = get_max_owners(&category);

        // Validate number of owners
        if owners.len() > max_owners as usize {
            return err!(MultisigError::TooManyOwners);
        }
        // Chedk for same address in owners
        if has_duplicates(&owners) {
            return err!(MultisigError::DuplicateOwners);
        }

        // Validate threshold
        if threshold < 2 {
            return err!(MultisigError::ThresholdTooLow);
        }
        if threshold as usize > owners.len() {
            return err!(MultisigError::ThresholdExceedsOwners);
        }

        // Initialize the multisig wallet state
        multisig.creator = creator.key();
        multisig.owners = owners;
        multisig.threshold = threshold;
        multisig.transaction_count = 0;
        multisig.pending_transactions = Vec::new();
        multisig.nonce = nonce;
        multisig.created_at = Clock::get()?.unix_timestamp;

        emit!(WalletCreated {
            creator: creator.key(),
            wallet: multisig.key(),
            timestamp: Clock::get()?.unix_timestamp
        });

        Ok(())
    }
    
    /// Request a withdrawal from the multisig wallet
    pub fn request_withdrawal(ctx: Context<RequestWithdrawal>, amount: u64) -> Result<()> {
        let multisig = &mut ctx.accounts.multisig;
        let requester = &ctx.accounts.signer;

        let balance = multisig.to_account_info().lamports();
        
        if amount > balance {
            return err!(MultisigError::InsufficientBalance);
        }

        // Ensure the requester is an owner
        if !multisig.owners.contains(&requester.key()) {
            return err!(MultisigError::NotAnOwner);
        }

        // Create a new transaction
        let transaction_id = multisig.transaction_count;
        multisig.transaction_count += 1;

        let transaction = Transaction {
            id: transaction_id,
            to: requester.key(), // Assuming requester is withdrawing to themselves; adjust if needed
            amount,
            approvals: vec![requester.key()], // Requester auto-approves their request
            executed: false,
        };

        multisig.pending_transactions.push(transaction);
        Ok(())
    }

    /// Approve a pending withdrawal request
    pub fn approve_request(ctx: Context<ApproveRequest>, transaction_id: u64) -> Result<()> {
        let multisig = &mut ctx.accounts.multisig;
        let approver = &ctx.accounts.signer;

        if !multisig.owners.contains(&approver.key()) {
            return err!(MultisigError::NotAnOwner);
        }

        let transaction = multisig
            .pending_transactions
            .iter_mut()
            .find(|t| t.id == transaction_id)
            .ok_or(MultisigError::TransactionNotFound)?;

        if transaction.executed {
            return err!(MultisigError::TransactionAlreadyExecuted);
        }
        if transaction.approvals.contains(&approver.key()) {
            return err!(MultisigError::AlreadyApproved);
        }

        transaction.approvals.push(approver.key());
        Ok(())
    }

    /// Execute a pending withdrawal request once threshold is met
    pub fn execute_request(ctx: Context<ExecuteRequest>, transaction_id: u64) -> Result<()> {
    // Extract necessary data before mutable borrows
    let bump = ctx.bumps.multisig;
    let multisig = &mut ctx.accounts.multisig;

    let transaction_index = multisig
        .pending_transactions
        .iter()
        .position(|t| t.id == transaction_id)
        .ok_or(MultisigError::TransactionNotFound)?;

    let transaction = &multisig.pending_transactions[transaction_index];

    require!(!transaction.executed, MultisigError::TransactionAlreadyExecuted);
    require!(
        transaction.approvals.len() as u8 >= multisig.threshold,
        MultisigError::ThresholdNotMet
    );
    require!(
        ctx.accounts.recipient.key() == transaction.to,
        MultisigError::RecipientMismatch
    );

    // Use actual account balance instead of stored value
    let balance = multisig.to_account_info().lamports();
    require!(transaction.amount <= balance, MultisigError::InsufficientBalance);
    
    // Prepare PDA signature
    let seeds = &[
        b"multisig".as_ref(),
        multisig.creator.as_ref(),
        &[multisig.nonce],
        &[bump],
    ];

    // Perform the transfer using the extracted data
    // let transfer_instruction = system_instruction::transfer(
    //     &multisig_key,
    //     &to,
    //     amount,
    // );

    let transfer_instruction = system_instruction::transfer(
        &multisig.key(),
        &transaction.to,
        transaction.amount,
    );
    
    anchor_lang::solana_program::program::invoke_signed(
        &transfer_instruction,
        &[
            multisig.to_account_info(), // Use existing mutable reference
            ctx.accounts.recipient.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
        &[seeds],
    )?;

    // Update state after transfer
    multisig.pending_transactions.remove(transaction_index);
    
    Ok(())
}

    /// Query the current balance of the multisig wallet (view function)
    pub fn get_wallet_balance(ctx: Context<GetWalletBalance>) -> Result<u64> {
        let multisig = &ctx.accounts.multisig;
        Ok(multisig.to_account_info().lamports())
    }

    /// Retrieve a list of pending transactions (view function)
    pub fn get_pending_transactions(ctx: Context<GetPendingTransactions>) -> Result<Vec<Transaction>> {
        let multisig = &ctx.accounts.multisig;
        Ok(multisig.pending_transactions.clone())
    }

    /// Retrieve the list of current owners (view function)
    pub fn get_owners(ctx: Context<GetOwners>) -> Result<Vec<Pubkey>> {
        let multisig = &ctx.accounts.multisig;
        Ok(multisig.owners.clone())
    }
}

// New accounts structure for execute_request
#[derive(Accounts)]
pub struct ExecuteRequest<'info> {
    #[account(
        mut,
        seeds = [
            b"multisig", 
            multisig.creator.as_ref(), 
            &[multisig.nonce]
        ],
        bump,
    )]
    pub multisig: Account<'info, MultisigWallet>,
    
    /// CHECK: The recipient is safely validated in the instruction logic.
    #[account(mut)]
    pub recipient: AccountInfo<'info>,  // The destination account
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Multisig wallet account data structure
#[account]
#[derive(Default)]
pub struct MultisigWallet {
    pub creator: Pubkey,          // Track creator
    pub owners: Vec<Pubkey>,
    pub threshold: u8,
    pub transaction_count: u64,
    pub pending_transactions: Vec<Transaction>,
    pub nonce: u8,                // Unique per creator
    pub created_at: i64,          // Creation timestamp
}

impl MultisigWallet {
    // Initial size estimate for space allocation (adjust as needed)
    pub const SIZE: usize = 32 +  // creator
        4 + (32 * 10) +           // owners (max 10)
        1 +                       // threshold
        8 +                       // transaction_count
        4 + (8 + 32 + 8 + 4 + 32 + 1) * 10 + // transactions
        1 +                       // nonce
        8;                        // created_at
}

// Accounts structure for initializing the multisig wallet
#[derive(Accounts)]
#[instruction(nonce: u8)]
pub struct InitializeMultisig<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + MultisigWallet::SIZE,
        seeds = [
            b"multisig", 
            creator.key().as_ref(), 
            &[nonce]
        ],
        bump
    )]
    pub multisig: Account<'info, MultisigWallet>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RequestWithdrawal<'info> {
    #[account(mut)]
    pub multisig: Account<'info, MultisigWallet>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ApproveRequest<'info> {
    #[account(mut)]
    pub multisig: Account<'info, MultisigWallet>,
    #[account(mut)]
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetWalletBalance<'info> {
    pub multisig: Account<'info, MultisigWallet>,
}

#[derive(Accounts)]
pub struct GetPendingTransactions<'info> {
    pub multisig: Account<'info, MultisigWallet>,
}

#[derive(Accounts)]
pub struct GetOwners<'info> {
    pub multisig: Account<'info, MultisigWallet>,
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
    #[msg("Number of owners not enough for multisig")]
    TooFewOwners,
    #[msg("Threshold must be at least 2 to ensure collaboration")]
    ThresholdTooLow,
    #[msg("Threshold cannot exceed the number of owners")]
    ThresholdExceedsOwners,
    #[msg("Signer is not an owner of the multisig wallet")]
    NotAnOwner,
    #[msg("Insufficient balance in the multisig wallet")]
    InsufficientBalance,
    #[msg("Owner already exists in the multisig wallet")]
    OwnerAlreadyExists,
    #[msg("Transaction already executed")]
    TransactionAlreadyExecuted,
    #[msg("Signer has already approved this transaction")]
    AlreadyApproved,
    #[msg("Transaction not found")]
    TransactionNotFound,
    #[msg("Threshold not met for execution")]
    ThresholdNotMet,
    #[msg("Recipient account does not match transaction record")]
    RecipientMismatch,
    #[msg("Duplicate owners not allowed")]
    DuplicateOwners,
}

// Event logging
#[event]
pub struct WalletCreated {
    pub creator: Pubkey,
    pub wallet: Pubkey,
    pub timestamp: i64,
}

// Helper function to determine max owners based on category
fn get_max_owners(category: &UserCategory) -> u8 {
    match category {
        UserCategory::Free => 3,  // Max owners for Free users
        UserCategory::Pro => 10,  // Max owners for Pro users
    }
}

fn has_duplicates(owners: &[Pubkey]) -> bool {
    let mut seen = std::collections::HashSet::new();
    owners.iter().any(|owner| !seen.insert(owner))
}