use anchor_lang::prelude::*;

declare_id!("2ozqMut8UKfiW9CxazuzqwLi9Bxd1NnVwXhbc3VZe8bQ");

#[program]
pub mod sigritto {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
