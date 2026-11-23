use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use crate::errors::PayPulseError;
use crate::state::{Pool, PoolStatus};

#[derive(Accounts)]
#[instruction(pool_id: u64)]
pub struct CreatePool<'info> {
    #[account(mut)]
    pub organizer: Signer<'info>,

    /// CHECK: Designated settlement destination wallet pubkey
    pub recipient: UncheckedAccount<'info>,

    pub usdc_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = organizer,
        space = Pool::LEN,
        seeds = [b"pool", organizer.key().as_ref(), &pool_id.to_le_bytes()],
        bump
    )]
    pub pool: Account<'info, Pool>,

    #[account(
        init,
        payer = organizer,
        token::mint = usdc_mint,
        token::authority = pool,
        seeds = [b"vault", pool.key().as_ref()],
        bump
    )]
    pub pool_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<CreatePool>,
    pool_id: u64,
    target_amount: u64,
    deadline: i64,
) -> Result<()> {
    require!(target_amount > 0, PayPulseError::InvalidTargetAmount);

    let current_time = Clock::get()?.unix_timestamp;
    require!(deadline > current_time, PayPulseError::DeadlineInPast);

    let pool = &mut ctx.accounts.pool;
    pool.organizer = ctx.accounts.organizer.key();
    pool.recipient = ctx.accounts.recipient.key();
    pool.usdc_mint = ctx.accounts.usdc_mint.key();
    pool.pool_id = pool_id;
    pool.target_amount = target_amount;
    pool.total_contributed = 0;
    pool.total_refunded = 0;
    pool.deadline = deadline;
    pool.status = PoolStatus::Funding;
    pool.bump = ctx.bumps.pool;
    pool.vault_bump = ctx.bumps.pool_vault;

    Ok(())
}
