use anchor_lang::prelude::*;

#[account]
pub struct ContributionRecord {
    pub pool: Pubkey,        // 32 bytes: parent Pool PDA
    pub contributor: Pubkey, // 32 bytes: depositor wallet
    pub amount: u64,         // 8 bytes: total USDC base units contributed
    pub refunded: bool,      // 1 byte: true once refund is claimed
    pub bump: u8,            // 1 byte: PDA canonical bump
}

impl ContributionRecord {
    pub const LEN: usize = 8 + // discriminator
        32 +                    // pool
        32 +                    // contributor
        8 +                     // amount
        1 +                     // refunded
        1;                      // bump
}
