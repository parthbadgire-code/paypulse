use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("PayPu1se11111111111111111111111111111111111");

#[program]
pub mod paypulse {
    use super::*;

    /// IX-01: Create a conditional group payment pool
    pub fn create_pool(
        ctx: Context<CreatePool>,
        pool_id: u64,
        target_amount: u64,
        deadline: i64,
    ) -> Result<()> {
        instructions::create_pool::handler(ctx, pool_id, target_amount, deadline)
    }

    /// IX-02: Deposit USDC towards the pool target
    pub fn contribute(ctx: Context<Contribute>, amount: u64) -> Result<()> {
        instructions::contribute::handler(ctx, amount)
    }

    /// IX-03: Settle fully funded pool directly to designated recipient
    pub fn settle_pool(ctx: Context<SettlePool>) -> Result<()> {
        instructions::settle_pool::handler(ctx)
    }

    /// IX-04: Mark an underfunded pool as expired once deadline has passed
    pub fn expire_pool(ctx: Context<ExpirePool>) -> Result<()> {
        instructions::expire_pool::handler(ctx)
    }

    /// IX-05: Claim full individual deposit refund from an expired pool
    pub fn claim_refund(ctx: Context<ClaimRefund>) -> Result<()> {
        instructions::claim_refund::handler(ctx)
    }
}
