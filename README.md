# PayPulse — Conditional Group Payment Protocol on Solana

[![Solana](https://img.shields.io/badge/Solana-Anchor-purple.svg)](https://solana.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Framework](https://img.shields.io/badge/Framework-Next.js%2014-black.svg)](https://nextjs.org)

> **Capstone Assignment 2: Program Specification & Implementation**  
> **Team Members:** Parth Badgire, Sidharth Punna, Tatsuki Ogasawara  
> **Category:** Payments & Conditional Escrow  
> **Stack:** Solana, Anchor, SPL Token (USDC), Next.js, TypeScript, Tailwind CSS

---

## 1. Overview

**PayPulse** is a conditional group payment protocol on Solana that enables multiple participants to pool USDC toward a shared payment target without granting custody to an organizer.

1. **Pool Creation:** An organizer initializes a payment pool with a target amount, a deadline, and a designated settlement recipient.
2. **Contributions:** Contributors deposit USDC into the pool before the deadline. Funds are held in a Program Derived Address (PDA) vault owned solely by the program.
3. **Atomic Settlement:** If the exact funding target is reached, the predetermined recipient can atomically claim 100% of the pooled funds.
4. **Permissionless Expiration & Refund:** If the deadline passes without reaching the target, anyone can mark the pool expired so each contributor can individually reclaim their full USDC deposit.

---

## 2. System Architecture & State Machine

```
                   ┌───────────────────────────────────────┐
                   │               create_pool             │
                   │ (Organizer sets target, deadline, rec)│
                   └──────────────────┬────────────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
      ┌─────────────────┤      Funding (Active)     │◄────────────────┐
      │                 └─────────────┬─────────────┘                 │
      │                               │                               │
      │ contribute(amount)            │ contribute(amount)            │ contribute(amount)
      │ [pool.total < target]         │ [pool.total == target]        │ [pool.total < target]
      └───────────────────────────────┘                               │
                                      │                               │
                      ┌───────────────┴───────────────┐               │
                      │                               │               │
  [target reached]    ▼                               ▼ [deadline passed & underfunded]
     ┌─────────────────────────────────┐    ┌──────────────────────────────────┐
     │           settle_pool           │    │           expire_pool            │
     │      (Recipient claims funds)   │    │     (Permissionless trigger)     │
     └────────────────┬────────────────┘    └─────────────────┬────────────────┘
                      │                                       │
                      ▼                                       ▼
       ┌─────────────────────────────┐         ┌─────────────────────────────┐
       │           Settled           │         │           Expired           │
       │    (Terminal State - Done)  │         │  (Terminal State - Refunds) │
       └─────────────────────────────┘         └──────────────┬──────────────┘
                                                              │
                                                              ▼
                                                    ┌────────────────────┐
                                                    │    claim_refund    │
                                                    │(Contributors claim)│
                                                    └────────────────────┘
```

---

## 3. Account Models & PDAs

### Program Accounts
- **`Pool`**: Stores metadata including `organizer`, `recipient`, `usdc_mint`, `pool_id`, `target_amount`, `total_contributed`, `total_refunded`, `deadline`, `status` (`Funding`, `Settled`, `Expired`), and PDA bumps.
  - **PDA Seeds**: `["pool", organizer.key().as_ref(), pool_id.to_le_bytes()]`
- **`pool_vault`**: SPL Token Account owned by the Pool PDA.
  - **PDA Seeds**: `["vault", pool.key().as_ref()]`
- **`ContributionRecord`**: Tracks individual contributor's cumulative deposit and refunded flag.
  - **PDA Seeds**: `["contribution", pool.key().as_ref(), contributor.key().as_ref()]`

---

## 4. Program Instructions

| ID | Instruction | Signer | Purpose |
|----|-------------|--------|---------|
| **IX-01** | `create_pool(pool_id, target_amount, deadline)` | Organizer | Creates pool and vault; validates future deadline and non-zero target. |
| **IX-02** | `contribute(amount)` | Contributor | Transfers USDC into vault, increments pool total, updates `ContributionRecord`. |
| **IX-03** | `settle_pool()` | Recipient | Verifies full funding and transfers all USDC directly to designated recipient. |
| **IX-04** | `expire_pool()` | Any Signer | Verifies underfunded deadline expiry and shifts pool status to `Expired`. |
| **IX-05** | `claim_refund()` | Contributor | Reclaims 100% of recorded contribution from vault back to contributor. |

---

## 5. Security & Invariants

- **REQ-25 (Balance Conservation):** The USDC balance held in the pool vault strictly equals `total_contributed - total_refunded` (or zero once settled).
- **REQ-26 (Irreversible States):** Status transitions `Funding -> Settled` and `Funding -> Expired` are irreversible and mutually exclusive.
- **REQ-27 (Non-Custodial Guarantee):** Organizers have zero authority to extract or redirect pool funds. Only recipients can settle funded pools, and only contributors can claim refunds on expired pools.
- **Mint Verification:** Pool and instructions strictly validate that token mints match the designated USDC mint, preventing mock token substitution attacks.
- **Post-Deadline Settlement Protection:** Reaching 100% of the funding target prevents expiration, guaranteeing the recipient cannot be front-run or griefed at the deadline.

---

## 6. Repository Structure

```
paypulse/
├── programs/
│   └── paypulse/
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs                   # Entrypoint & instruction dispatch
│           ├── errors.rs                # 13 custom error codes
│           ├── state/
│           │   ├── mod.rs
│           │   ├── pool.rs              # Pool account & PoolStatus enum
│           │   └── contribution.rs      # ContributionRecord account
│           └── instructions/
│               ├── mod.rs
│               ├── create_pool.rs       # IX-01
│               ├── contribute.rs        # IX-02
│               ├── settle_pool.rs       # IX-03
│               ├── expire_pool.rs       # IX-04
│               └── claim_refund.rs      # IX-05
├── tests/
│   ├── paypulse.ts                      # Mocha/Chai integration test suite
│   └── helpers.ts                       # PDA derivation helpers
├── app/                                 # Next.js 14 Frontend Application
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx                 # Overview & state machine explorer
│       │   ├── create/page.tsx          # Create pool form
│       │   └── pool/[id]/page.tsx       # Live pool details, contribute, settle, refund
│       ├── components/
│       │   ├── Navbar.tsx
│       │   └── WalletContextProvider.tsx
│       ├── lib/
│       │   ├── anchor-client.ts
│       │   └── constants.ts
│       └── types/
│           └── index.ts
├── Anchor.toml                          # Anchor configuration
├── Cargo.toml                           # Cargo workspace definition
├── package.json                         # Root project scripts
└── SPECIFICATION.md                     # Full Capstone 2 specification
```

---

## 7. Getting Started

### Prerequisites
- [Rust & Cargo](https://rustup.rs/) (v1.75+ or 1.89+)
- [Solana CLI](https://docs.solanalabs.com/cli/install) (v1.18+)
- [Anchor CLI](https://www.anchor-lang.com/docs/installation) (v0.30.1+)
- [Node.js](https://nodejs.org/) (v18+) & [Yarn](https://yarnpkg.com/)

### Build On-Chain Program
```bash
# Build Anchor program
anchor build
```

### Run Tests
```bash
# Run automated integration tests on local validator
anchor test
```

### Run Frontend
```bash
# Navigate to web application directory
cd app

# Install dependencies
yarn install

# Start development server
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.
