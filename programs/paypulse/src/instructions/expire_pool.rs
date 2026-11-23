use anchor_lang::prelude::*;
use crate::errors::PayPulseError;
use crate::state::{Pool, PoolStatus};

#[derive(Accounts)]
pub struct ExpirePool<'info> {
    pub caller: Signer<'info>,

    #[account(
        mut,
        seeds = [b"pool", pool.organizer.as_ref(), &pool.pool_id.to_le_bytes()],
        bump = pool.bump
    )]
    pub pool: Account<'info, Pool>,
}

pub fn handler(ctx: Context<ExpirePool>) -> Result<()> {
    let pool = &mut ctx.accounts.pool;

    require!(pool.status == PoolStatus::Funding, PayPulseError::PoolNotFunding);

    let current_time = Clock::get()?.unix_timestamp;
    require!(current_time >= pool.deadline, PayPulseError::DeadlineNotReached);

    require!(
        pool.total_contributed < pool.target_amount,
        PayPulseError::TargetAlreadyReached
    );

    pool.status = PoolStatus::Expired;

    Ok(())
}
