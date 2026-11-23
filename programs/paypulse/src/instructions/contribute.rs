use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::errors::PayPulseError;
use crate::state::{ContributionRecord, Pool, PoolStatus};

#[derive(Accounts)]
pub struct Contribute<'info> {
    #[account(mut)]
    pub contributor: Signer<'info>,

    #[account(
        mut,
        seeds = [b"pool", pool.organizer.as_ref(), &pool.pool_id.to_le_bytes()],
        bump = pool.bump
    )]
    pub pool: Account<'info, Pool>,

    #[account(
        mut,
        seeds = [b"vault", pool.key().as_ref()],
        bump = pool.vault_bump,
        constraint = pool_vault.mint == pool.usdc_mint
    )]
    pub pool_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = contributor_usdc.mint == pool.usdc_mint,
        constraint = contributor_usdc.owner == contributor.key()
    )]
    pub contributor_usdc: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = contributor,
        space = ContributionRecord::LEN,
        seeds = [b"contribution", pool.key().as_ref(), contributor.key().as_ref()],
        bump
    )]
    pub contribution_record: Account<'info, ContributionRecord>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Contribute>, amount: u64) -> Result<()> {
    require!(amount > 0, PayPulseError::ZeroContributionAmount);

    let pool = &mut ctx.accounts.pool;
    require!(pool.status == PoolStatus::Funding, PayPulseError::PoolNotFunding);

    let current_time = Clock::get()?.unix_timestamp;
    require!(current_time < pool.deadline, PayPulseError::PoolDeadlinePassed);

    let remaining_target = pool
        .target_amount
        .checked_sub(pool.total_contributed)
        .ok_or(PayPulseError::ContributionExceedsTarget)?;
    require!(amount <= remaining_target, PayPulseError::ContributionExceedsTarget);

    // Transfer USDC from contributor to pool vault
    let cpi_accounts = Transfer {
        from: ctx.accounts.contributor_usdc.to_account_info(),
        to: ctx.accounts.pool_vault.to_account_info(),
        authority: ctx.accounts.contributor.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, amount)?;

    // Increment pool cumulative contributions
    pool.total_contributed = pool
        .total_contributed
        .checked_add(amount)
        .ok_or(PayPulseError::ContributionExceedsTarget)?;

    // Record or increment contributor deposit
    let record = &mut ctx.accounts.contribution_record;
    record.pool = pool.key();
    record.contributor = ctx.accounts.contributor.key();
    record.amount = record.amount.checked_add(amount).unwrap();
    record.refunded = false;
    record.bump = ctx.bumps.contribution_record;

    Ok(())
}
