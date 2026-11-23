use anchor_lang::prelude::*;

#[error_code]
pub enum PayPulseError {
    #[msg("Target amount must be greater than zero.")]
    InvalidTargetAmount,

    #[msg("Deadline must be in the future.")]
    DeadlineInPast,

    #[msg("Contribution amount must be greater than zero.")]
    ZeroContributionAmount,

    #[msg("Payment pool is not currently in an active funding state.")]
    PoolNotFunding,

    #[msg("The deadline for this payment pool has already passed.")]
    PoolDeadlinePassed,

    #[msg("Contribution exceeds the remaining required amount to reach target.")]
    ContributionExceedsTarget,

    #[msg("Only the designated recipient can settle this pool.")]
    UnauthorizedRecipient,

    #[msg("Funding target has not been reached yet.")]
    TargetNotReached,

    #[msg("Pool deadline has not yet arrived.")]
    DeadlineNotReached,

    #[msg("Funding target was successfully reached; cannot expire pool.")]
    TargetAlreadyReached,

    #[msg("Only the contributor can claim a refund for their own deposit.")]
    UnauthorizedContributor,

    #[msg("Refunds can only be claimed on expired pools.")]
    PoolNotExpired,

    #[msg("No refundable balance found or refund has already been claimed.")]
    NothingToRefund,
}
