# Capstone Assignment 2: Program Specification - PayPulse

**Project Name:** PayPulse - Conditional Group Payment Protocol  
**Category:** Payments  
**Blockchain & Stack:** Solana (Rust, Anchor, SPL Token, Next.js)  
**Team Members:** Parth Badgire, Sidharth Punna, Tatsuki Ogasawara  

---

## 1. The Specification

### 1.1 Overview
PayPulse is a conditional group payment protocol on Solana that enables multiple participants to pool USDC toward a shared payment target without granting custody to an organizer. An organizer initializes a payment pool with a target amount, a deadline, and a predetermined settlement recipient. Contributors deposit USDC before the deadline; if the exact funding target is reached, the recipient can atomically claim the pooled funds. If the deadline passes without reaching the target, anyone can mark the pool expired so contributors can individually reclaim their full deposits.

### 1.2 Scope
#### In Scope (Two-Week Proof of Concept)
- Creating single-currency (USDC) payment pools with a fixed target, deadline, and designated recipient.
- Allowing multiple contributors to make one or more USDC deposits up to the remaining pool target before the deadline.
- Atomic full settlement to the designated recipient once total contributions equal the target amount.
- Permissionless pool expiration after the deadline if the target is unmet, followed by individual contributor refund claims.
- Frontend integration for creating pools, sharing pool links, contributing USDC, settling, and claiming refunds.

#### Out of Scope (Deferred Post-POC)
- Multi-currency pools or SOL/token swaps during contribution.
- Partial settlements, milestone payouts, or protocol fee extraction.
- On-chain governance, dispute resolution, or oracle-based external event verification.
- Fiat on-ramps/off-ramps or cross-chain bridging.
- Automated cranking/keepers (all state transitions are triggered by explicit wallet transactions).

---

### 1.3 Actors and Use Cases
All actors who sign transactions are real Solana wallets:
- **Organizer:** Creates and configures a payment pool with a target amount, deadline, and recipient wallet.
- **Contributor:** Deposits USDC into an active pool before the deadline and claims a refund if the pool expires unsuccessfully.
- **Recipient:** Claims the pooled USDC once the funding target is achieved.
- **Any Signer (Permissionless Caller):** Triggers the state transition from active funding to expired once the deadline passes without reaching the target.

| UC ID | Use Case | Primary Actor | Summary of On-Chain State Change |
|-------|----------|---------------|----------------------------------|
| **UC-01** | Create a Payment Pool | Organizer | Initializes a new payment pool in an active funding state with target, deadline, recipient, and zero balance. |
| **UC-03** | Contribute USDC | Contributor | Transfers USDC from contributor to pool custody, increments pool total, and updates contributor's recorded deposit. |
| **UC-04** | Settle a Successful Pool | Recipient | Transfers total pooled USDC to the designated recipient and marks the pool as settled. |
| **UC-05** | Expire an Unsuccessful Pool | Any Signer | Marks an underfunded pool as expired once the deadline timestamp has been reached. |
| **UC-06** | Claim a Contribution Refund | Contributor | Transfers the contributor's recorded USDC deposit back to them and marks their contribution as refunded. |

*(Note: LOI use cases UC-02 "View a Payment Pool" and UC-07 "View Contribution History" perform zero on-chain state changes and are handled off-chain via RPC reads and transaction indexers).*

---

### 1.4 Requirements and Traceability

| ID | Kind | Requirement | Traces To | Test (Given / When / Then) |
|---|---|---|---|---|
| **REQ-01** | Behaviour | When an organizer creates a payment pool with a valid target amount, future deadline, and recipient, the program shall initialize the pool in an active funding state with zero contributed funds. | UC-01 | Given target = 500 USDC, future deadline, recipient wallet; When organizer creates pool; Then pool is active with 0 USDC contributed. |
| **REQ-02** | Refusal | If specified target amount is zero, program shall refuse creation (`InvalidTargetAmount`). | UC-01 | Given target = 0 USDC; When organizer tries to create pool; Then creation is refused. |
| **REQ-03** | Refusal | If specified deadline is <= current ledger timestamp, program shall refuse creation (`DeadlineInPast`). | UC-01 | Given deadline in past; When organizer tries to create pool; Then creation is refused. |
| **REQ-04** | Behaviour | When contributor deposits USDC into active pool before deadline, transfer deposit amount from contributor into pool custody. | UC-03 | Given active pool & contributor with 200 USDC; When contributor deposits 100 USDC; Then contributor balance decreases by 100 and pool vault holds 100. |
| **REQ-05** | Behaviour | When contributor deposits USDC, increase pool's total contributed amount by deposit amount. | UC-03 | Given active pool with 150 USDC; When deposits 50 USDC; Then total contributed becomes 200 USDC. |
| **REQ-06** | Behaviour | When contributor deposits USDC, increase contributor's recorded contribution by deposit amount. | UC-03 | Given contributor with 40 USDC deposited; When deposits 60 USDC; Then their recorded contribution becomes 100 USDC. |
| **REQ-07** | Refusal | If deposit amount is zero, refuse contribution (`ZeroContributionAmount`). | UC-03 | Given active pool; When deposit is 0 USDC; Then refused and balances unchanged. |
| **REQ-08** | Refusal | If pool is not in active funding state, refuse contribution (`PoolNotFunding`). | UC-03 | Given pool already settled or expired; When deposit attempted; Then refused. |
| **REQ-09** | Refusal | If current timestamp >= pool deadline, refuse contribution (`PoolDeadlinePassed`). | UC-03 | Given deadline has passed; When contributor deposits; Then refused. |
| **REQ-10** | Refusal | If deposit amount exceeds remaining amount required to reach target, refuse contribution (`ContributionExceedsTarget`). | UC-03 | Given target 500, contributed 450; When deposit 60; Then refused. |
| **REQ-11** | Access | Program shall only allow designated recipient to settle a successful pool (`UnauthorizedRecipient`). | UC-04 | Given fully funded pool; When non-recipient tries to settle; Then refused. |
| **REQ-12** | Behaviour | When total contributed == target and recipient settles, transfer all pooled USDC to recipient. | UC-04 | Given target 500, contributed 500; When recipient settles; Then recipient receives 500, vault holds 0. |
| **REQ-13** | Behaviour | When designated recipient settles fully funded pool, transition pool status to `Settled`. | UC-04 | Given active pool with 500/500 USDC; When recipient settles; Then status becomes Settled. |
| **REQ-14** | Refusal | If total contributed < target amount, refuse settlement (`TargetNotReached`). | UC-04 | Given pool with 400/500 USDC; When recipient settles; Then refused. |
| **REQ-15** | Refusal | If pool is not in active funding state, refuse settlement (`PoolNotFunding`). | UC-04 | Given settled pool; When settling again; Then refused. |
| **REQ-16** | Behaviour | When timestamp >= deadline and total contributed < target, transition pool to `Expired`. | UC-05 | Given target 500, contributed 300, deadline passed; When any signer expires pool; Then status becomes Expired. |
| **REQ-17** | Refusal | If current timestamp < deadline, refuse expiration (`DeadlineNotReached`). | UC-05 | Given deadline in future; When signer expires; Then refused. |
| **REQ-18** | Refusal | If total contributed == target amount, refuse expiration (`TargetAlreadyReached`). | UC-05 | Given target reached but deadline passed; When signer expires; Then refused (preserves recipient settlement). |
| **REQ-19** | Refusal | If pool is not in active funding state, refuse expiration (`PoolNotFunding`). | UC-05 | Given settled or expired pool; When expiring; Then refused. |
| **REQ-20** | Access | Program shall only allow a contributor to claim a refund for their own recorded contribution (`UnauthorizedContributor`). | UC-06 | Given expired pool; When wallet B tries to claim contributor A's refund; Then refused. |
| **REQ-21** | Behaviour | When contributor claims refund from expired pool, transfer their recorded contribution amount from pool vault back to contributor. | UC-06 | Given expired pool with 300 USDC and contributor A deposited 100 USDC; When contributor A claims; Then receives 100 USDC, vault holds 200 USDC. |
| **REQ-22** | Behaviour | When contributor claims refund, mark their contribution as refunded. | UC-06 | Given contributor A with 100 USDC; When claims refund; Then contribution record marked refunded. |
| **REQ-23** | Refusal | If pool is not in expired state, refuse refund (`PoolNotExpired`). | UC-06 | Given active or settled pool; When contributor tries to claim refund; Then refused. |
| **REQ-24** | Refusal | If contributor has already been refunded or has zero recorded contribution, refuse refund (`NothingToRefund`). | UC-06 | Given contributor already refunded; When claiming again; Then refused and no USDC moves. |
| **REQ-25** | Invariant Rule | Balance conservation: vault USDC balance == total recorded contributions - total settled or refunded payouts. | Rule | Fuzz: Execute sequences; assert conservation equation after every step. |
| **REQ-26** | Invariant Rule | One-way state machine: pool can never transition out of Settled or Expired, nor be both. | Rule | Fuzz: Test boundary transitions; assert irreversible terminal states. |
| **REQ-27** | Invariant Rule | Non-custodial guarantee: organizer cannot withdraw or redirect pooled funds unless they are the designated recipient of a settled pool or claiming their own refund. | Rule | Fuzz: Attempt unauthorized organizer calls; assert zero unauthorized balance changes. |

---

### 1.5 Architecture & Account Schemas

#### PDAs
1. **Pool PDA**: `["pool", organizer.key(), pool_id.to_le_bytes()]`
2. **Pool Vault PDA**: `["vault", pool.key()]` (SPL Token Account owned by Pool PDA)
3. **ContributionRecord PDA**: `["contribution", pool.key(), contributor.key()]`

#### Account Structures
```rust
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum PoolStatus {
    Funding,
    Settled,
    Expired,
}

#[account]
pub struct Pool {
    pub organizer: Pubkey,       // 32 bytes
    pub recipient: Pubkey,       // 32 bytes
    pub usdc_mint: Pubkey,       // 32 bytes
    pub pool_id: u64,            // 8 bytes
    pub target_amount: u64,      // 8 bytes
    pub total_contributed: u64,  // 8 bytes
    pub total_refunded: u64,     // 8 bytes
    pub deadline: i64,           // 8 bytes
    pub status: PoolStatus,      // 1 byte
    pub bump: u8,                // 1 byte
    pub vault_bump: u8,          // 1 byte
}

#[account]
pub struct ContributionRecord {
    pub pool: Pubkey,            // 32 bytes
    pub contributor: Pubkey,     // 32 bytes
    pub amount: u64,             // 8 bytes
    pub refunded: bool,          // 1 byte
    pub bump: u8,                // 1 byte
}
```
