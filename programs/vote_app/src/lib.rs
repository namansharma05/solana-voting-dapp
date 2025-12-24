use anchor_lang::prelude::*;
mod contexts;
mod state;
use contexts::*;
declare_id!("3dZFVdmBgBW9TzVrji84rehpN3BNqaVv85WS6KDTwn3e");

#[program]
pub mod vote_app {
    use super::*;

    pub fn initialize_treasury(
        ctx: Context<InitializeTreasury>,
        sol_price: u64,
        token_per_purchase: u64,
    ) -> Result<()> {
        let treasury_config_account = &mut ctx.accounts.treasury_config_account;
        treasury_config_account.authority = ctx.accounts.authority.key();
        treasury_config_account.bump = ctx.bumps.sol_vault;
        treasury_config_account.sol_price = sol_price;
        treasury_config_account.x_mint = ctx.accounts.x_mint.key();
        treasury_config_account.tokens_per_purchase = token_per_purchase;

        Ok(())
    }
}
