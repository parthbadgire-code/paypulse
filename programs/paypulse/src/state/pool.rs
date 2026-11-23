use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum PoolStatus {
    Funding,
    Settled,
    Expired,
}

#[account]
pub struct Pool {
    pub organizer: Pubkey,      // 32 bytes: creator wallet
    pub recipient: Pubkey,      // 32 bytes: designated payout wallet
    pub usdc_mint: Pubkey,      // 32 bytes: accepted SPL token mint
    pub pool_id: u64,           // 8 bytes: unique identifier per organizer
    pub target_amount: u64,     // 8 bytes: exact USDC base units required
    pub total_contributed: u64, // 8 bytes: cumulative USDC deposited
    pub total_refunded: u64,    // 8 bytes: cumulative USDC refunded after expiry
    pub deadline: i64,          // 8 bytes: Unix timestamp cutoff
    pub status: PoolStatus,     // 1 byte: Funding, Settled, or Expired
    pub bump: u8,               // 1 byte: PDA canonical bump
    pub vault_bump: u8,         // 1 byte: pool_vault PDA canonical bump
}

impl Pool {
    pub const LEN: usize = 8 +   // discriminator
        32 +                      // organizer
        32 +                      // recipient
        32 +                      // usdc_mint
        8 +                       // pool_id
        8 +                       // target_amount
        8 +                       // total_contributed
        8 +                       // total_refunded
        8 +                       // deadline
        1 +                       // status
        1 +                       // bump
        1;                        // vault_bump
}
