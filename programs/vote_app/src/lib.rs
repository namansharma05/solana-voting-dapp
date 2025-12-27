use anchor_lang::prelude::*;
mod contexts;
mod errors;
use errors::*;
mod state;
use anchor_lang::system_program;
use contexts::*;
declare_id!("3dZFVdmBgBW9TzVrji84rehpN3BNqaVv85WS6KDTwn3e");

#[program]
pub mod vote_app {
    use anchor_spl::token::{mint_to, transfer, MintTo, Transfer};

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

        let proposal_counter_account = &mut ctx.accounts.proposal_counter_account;
        require!(
            proposal_counter_account.proposal_count == 0,
            VoteError::ProposalCountAlreadyInitialized
        );
        proposal_counter_account.proposal_count = 1;
        proposal_counter_account.authority = ctx.accounts.authority.key();

        Ok(())
    }

    pub fn buy_tokens(ctx: Context<BuyTokens>) -> Result<()> {
        //1. user will transfer SOL from buyer to sol_vault,
        let treasury_config_account = &mut ctx.accounts.treasury_config_account;
        let sol = treasury_config_account.sol_price;
        let token_amount = treasury_config_account.tokens_per_purchase;

        let transfer_ix = anchor_lang::system_program::Transfer {
            from: ctx.accounts.buyer.to_account_info(),
            to: ctx.accounts.sol_vault.to_account_info(),
        };

        system_program::transfer(
            CpiContext::new(ctx.accounts.system_program.to_account_info(), transfer_ix),
            sol,
        )?;

        //2. Mint tokens to buyer_token_account
        let mint_authority_seeds = &[b"mint_authority".as_ref(), &[ctx.bumps.mint_authority]];
        let signer_seeds = &[&mint_authority_seeds[..]];
        let cpi_accounts = MintTo {
            mint: ctx.accounts.x_mint.to_account_info(),
            to: ctx.accounts.buyer_token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer_seeds,
        );

        //3. x_mint token
        mint_to(cpi_ctx, token_amount)?;
        Ok(())
    }

    pub fn register_voter(ctx: Context<RegisterVoter>) -> Result<()> {
        let voter_account = &mut ctx.accounts.voter_account;
        voter_account.voter_id = ctx.accounts.authority.key();

        Ok(())
    }

    pub fn register_proposal(
        ctx: Context<RegisterProposal>,
        proposal_info: String,
        deadline: i64,
        token_amount: u64,
    ) -> Result<()> {
        let clock = Clock::get()?;
        require!(deadline > clock.unix_timestamp, VoteError::InvalidDeadline);

        let proposal_account = &mut ctx.accounts.proposal_account;
        // transfer tokens from proposal_token_account to treasury_token_account
        let cpi_accounts = Transfer {
            from: ctx.accounts.proposal_token_account.to_account_info(),
            to: ctx.accounts.treasury_token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };

        let cpi_context =
            CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);

        transfer(cpi_context, token_amount)?;

        proposal_account.authority = ctx.accounts.authority.key();
        proposal_account.deadline = deadline;
        proposal_account.proposal_info = proposal_info;

        let proposal_counter_account = &mut ctx.accounts.proposal_counter_account;

        proposal_account.proposal_id = proposal_counter_account.proposal_count;

        proposal_counter_account.proposal_count = proposal_counter_account
            .proposal_count
            .checked_add(1)
            .ok_or(VoteError::ProposalCountOverflow)?;

        Ok(())
    }
}
