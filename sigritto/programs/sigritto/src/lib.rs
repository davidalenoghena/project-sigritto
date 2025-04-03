use anchor_lang::prelude::*;
//use anchor_lang::solana_program::pubkey::Pubkey;
use anchor_lang::solana_program::{pubkey::Pubkey, system_instruction};

declare_id!("FvQihDMQ3Y55X3ZV1oowcm5CM2iwgioEiyV54KfXPWks"); // Replace with your actual program ID

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
    
    /// Request a withdrawal from the multisig wallet
    pub fn request_withdrawal(ctx: Context<RequestWithdrawal>, amount: u64) -> Result<()> {
        let multisig = &mut ctx.accounts.multisig;
        let requester = &ctx.accounts.signer;

        // Ensure the requester is an owner
        if !multisig.owners.contains(&requester.key()) {
            return err!(MultisigError::NotAnOwner);
        }

        // Check if there s enough balance
        if amount > multisig.balance {
            return err!(MultisigError::InsufficientBalance);
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
    let threshold = ctx.accounts.multisig.threshold;
    let balance = ctx.accounts.multisig.balance;
    let multisig_key = ctx.accounts.multisig.key();
    let bump = ctx.bumps.multisig;

    // Create mutable references after extracting data
    let multisig = &mut ctx.accounts.multisig;
    let transaction_index = multisig
        .pending_transactions
        .iter()
        .position(|t| t.id == transaction_id)
        .ok_or(MultisigError::TransactionNotFound)?;
    
    // Extract required data from transaction before mutation
    let (to, amount) = {
        let transaction = &multisig.pending_transactions[transaction_index];
        (transaction.to, transaction.amount)
    };

    // Perform checks using pre-extracted values
    require!(!multisig.pending_transactions[transaction_index].executed, MultisigError::TransactionAlreadyExecuted);
    require!(multisig.pending_transactions[transaction_index].approvals.len() as u8 >= threshold, MultisigError::ThresholdNotMet);
    require!(amount <= balance, MultisigError::InsufficientBalance);

    // Perform the transfer using the extracted data
    let transfer_instruction = system_instruction::transfer(
        &multisig_key,
        &to,
        amount,
    );
    
    anchor_lang::solana_program::program::invoke_signed(
        &transfer_instruction,
        &[
            multisig.to_account_info(), // Use existing mutable reference
            ctx.accounts.recipient.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
        &[&[b"multisig", &[bump]]],
    )?;

    // Update state after transfer
    multisig.balance -= amount;
    multisig.pending_transactions[transaction_index].executed = true;
    multisig.pending_transactions.remove(transaction_index);
    
    Ok(())
}

    /// Query the current balance of the multisig wallet (view function)
    pub fn get_wallet_balance(ctx: Context<GetWalletBalance>) -> Result<u64> {
        let multisig = &ctx.accounts.multisig;
        Ok(multisig.balance)
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
        seeds = [b"multisig"],
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
}

// Helper function to determine max owners based on category
fn get_max_owners(category: &UserCategory) -> u8 {
    match category {
        UserCategory::Free => 3,  // Max owners for Free users
        UserCategory::Pro => 10,  // Max owners for Pro users
    }
}

//Program Id: FvQihDMQ3Y55X3ZV1oowcm5CM2iwgioEiyV54KfXPWks

//Signature: CNo2f2LVBXMkJ8kZ8WrYbBNZ8pyqNioKGYHggFXbmuHdWbRgKGkf957hvM5bLUboo5CeKWHvHNvZLAuTaJbVs3p