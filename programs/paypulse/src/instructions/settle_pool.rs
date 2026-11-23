use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::errors::PayPulseError;
use crate::state::{Pool, PoolStatus};

#[derive(Accounts)]
pub struct SettlePool<'info> {
    #[account(
        mut,
        constraint = recipient.key() == pool.recipient @ PayPulseError::UnauthorizedRecipient
    )]
    pub recipient: Signer<'info>,

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
        constraint = recipient_usdc.mint == pool.usdc_mint,
        constraint = recipient_usdc.owner == recipient.key()
    )]
    pub recipient_usdc: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<SettlePool>) -> Result<()> {
    let pool = &mut ctx.accounts.pool;

    require!(pool.status == PoolStatus::Funding, PayPulseError::PoolNotFunding);
    require!(
        pool.total_contributed == pool.target_amount,
        PayPulseError::TargetNotReached
    );

    let amount_to_transfer = pool.total_contributed;

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
        to: ctx.accounts.recipient_usdc.to_account_info(),
        authority: pool.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::transfer(cpi_ctx, amount_to_transfer)?;

    pool.status = PoolStatus::Settled;

    Ok(())
}
