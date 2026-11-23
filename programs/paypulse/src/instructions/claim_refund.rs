use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::errors::PayPulseError;
use crate::state::{ContributionRecord, Pool, PoolStatus};

#[derive(Accounts)]
pub struct ClaimRefund<'info> {
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
        mut,
        seeds = [b"contribution", pool.key().as_ref(), contributor.key().as_ref()],
        bump = contribution_record.bump,
        constraint = contribution_record.contributor == contributor.key() @ PayPulseError::UnauthorizedContributor
    )]
    pub contribution_record: Account<'info, ContributionRecord>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<ClaimRefund>) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    let contribution_record = &mut ctx.accounts.contribution_record;

    require!(pool.status == PoolStatus::Expired, PayPulseError::PoolNotExpired);
    require!(
        !contribution_record.refunded && contribution_record.amount > 0,
        PayPulseError::NothingToRefund
    );

    let refund_amount = contribution_record.amount;

    // Seeds for signing from pool PDA
    let pool_id_bytes = pool.pool_id.to_le_bytes();
    let seeds = &[
        b"pool",
        pool.organizer.as_ref(),
        pool_id_bytes.as_ref(),
        &[pool.bump],
    ];
    let signer = &[&seeds[..]];

    let cpi_accounts = Transfer {
        from: ctx.accounts.pool_vault.to_account_info(),
        to: ctx.accounts.contributor_usdc.to_account_info(),
        authority: pool.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::transfer(cpi_ctx, refund_amount)?;

    contribution_record.refunded = true;
    pool.total_refunded = pool
        .total_refunded
        .checked_add(refund_amount)
        .ok_or(PayPulseError::NothingToRefund)?;

    Ok(())
}
