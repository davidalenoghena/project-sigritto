use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};

declare_id!("2ozqMut8UKfiW9CxazuzqwLi9Bxd1NnVwXhbc3VZe8bQ");

#[program]
pub mod sigritto {
    use super::*;

    pub fn initialize_wallet(
        ctx: Context<InitializeWallet>,
        required_signers: u8,
        signers: Vec<Pubkey>
    ) -> Result<()> {
        let wallet = &mut ctx.accounts.multisig_wallet;
        wallet.owner = ctx.accounts.owner.key();
        wallet.required_signers = required_signers;
        wallet.signers = signers;
        wallet.is_initialized = true;
        Ok(())
    }

    pub fn create_transaction(
        ctx: Context<CreateTransaction>,
        amount: u64,
        destination: Pubkey
    ) -> Result<()> {
        let wallet = &ctx.accounts.multisig_wallet;
        let transaction = &mut ctx.accounts.transaction;

        require!(
            wallet.signers.contains(&ctx.accounts.proposer.key()),
            MultisigError::Unauthorized
        );

        transaction.wallet = wallet.key();
        transaction.amount = amount;
        transaction.destination = destination;
        transaction.proposer = ctx.accounts.proposer.key();
        transaction.approvals = vec![ctx.accounts.proposer.key()];
        transaction.executed = false;

        Ok(())
    }

    pub fn approve_transaction(
        ctx: Context<ApproveTransaction>
    ) -> Result<()> {
        let wallet = &ctx.accounts.multisig_wallet;
        let transaction = &mut ctx.accounts.transaction;

        require!(
            wallet.signers.contains(&ctx.accounts.signer.key()),
            MultisigError::Unauthorized
        );
        
        require!(
            !transaction.approvals.contains(&ctx.accounts.signer.key()),
            MultisigError::AlreadyApproved
        );

        transaction.approvals.push(ctx.accounts.signer.key());

        if transaction.approvals.len() >= wallet.required_signers as usize {
            let token_program = ctx.accounts.token_program.to_account_info();
            let cpi_accounts = token::Transfer {
                from: ctx.accounts.token_account.to_account_info(),
                to: ctx.accounts.destination_account.to_account_info(),
                authority: ctx.accounts.multisig_wallet.to_account_info(),
            };
            let cpi_ctx = CpiContext::new(token_program, cpi_accounts);
            token::transfer(cpi_ctx, transaction.amount)?;
            transaction.executed = true;
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeWallet<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + MultisigWallet::LEN,
        seeds = [b"multisig", owner.key().as_ref()],
        bump
    )]
    pub multisig_wallet: Account<'info, MultisigWallet>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateTransaction<'info> {
    #[account(mut)]
    pub multisig_wallet: Account<'info, MultisigWallet>,
    #[account(
        init,
        payer = proposer,
        space = 8 + Transaction::LEN,
        seeds = [b"transaction", multisig_wallet.key().as_ref(), &clock.unix_timestamp.to_le_bytes()],
        bump
    )]
    pub transaction: Account<'info, Transaction>,
    #[account(mut)]
    pub proposer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
pub struct ApproveTransaction<'info> {
    #[account(mut)]
    pub multisig_wallet: Account<'info, MultisigWallet>,
    #[account(mut)]
    pub transaction: Account<'info, Transaction>,
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub destination_account: Account<'info, TokenAccount>,
    pub signer: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct MultisigWallet {
    pub owner: Pubkey,
    pub required_signers: u8,
    pub signers: Vec<Pubkey>,
    pub is_initialized: bool,
}

#[account]
pub struct Transaction {
    pub wallet: Pubkey,
    pub amount: u64,
    pub destination: Pubkey,
    pub proposer: Pubkey,
    pub approvals: Vec<Pubkey>,
    pub executed: bool,
}

impl MultisigWallet {
    pub const LEN: usize = 32 + 1 + 4 + (32 * 10) + 1; // Rough estimate, adjust based on max signers
}

impl Transaction {
    pub const LEN: usize = 32 + 8 + 32 + 32 + 4 + (32 * 10) + 1; // Rough estimate
}

#[error_code]
pub enum MultisigError {
    #[msg("Unauthorized signer")]
    Unauthorized,
    #[msg("Already approved this transaction")]
    AlreadyApproved,
}