# PayPulse — Conditional Group Payment Protocol on Solana

[![Solana](https://img.shields.io/badge/Solana-Anchor-purple.svg)](https://solana.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Framework](https://img.shields.io/badge/Framework-Next.js%2014-black.svg)](https://nextjs.org)

PayPulse is a conditional group payment protocol on Solana that enables multiple participants to pool USDC toward a shared payment target without granting custody to an organizer.

---

## 1. Overview

In traditional group payment setups, contributors must trust a single organizer with full custody of their funds. If the target is not reached or the organizer disappears, contributors risk losing their money.

**PayPulse provides non-custodial, guaranteed conditional settlement:**
- **Zero Organizer Custody**: Contributed funds reside strictly in a Program Derived Address (PDA) token vault owned by the smart contract.
- **Atomic Full Settlement**: If the exact funding target is reached, the predetermined settlement recipient can atomically claim 100% of the pooled funds.
- **Permissionless Expiration & 100% Refunds**: If the deadline passes without reaching the target, anyone can trigger pool expiration, enabling every contributor to individually reclaim their full USDC deposit.

---

## 2. Protocol State Machine

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
- **`Pool`**: Stores pool configuration and accounting state including `organizer`, `recipient`, `usdc_mint`, `pool_id`, `target_amount`, `total_contributed`, `total_refunded`, `deadline`, and `status` (`Funding`, `Settled`, `Expired`).
  - **PDA Seeds**: `["pool", organizer.key().as_ref(), pool_id.to_le_bytes()]`
- **`pool_vault`**: SPL Token Account owned by the Pool PDA.
  - **PDA Seeds**: `["vault", pool.key().as_ref()]`
- **`ContributionRecord`**: Tracks an individual contributor's cumulative deposit and refunded status.
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

- **Conservation of Funds**: The USDC balance held in the pool vault strictly equals `total_contributed - total_refunded` (or zero once settled).
- **One-Way State Machine**: Status transitions `Funding -> Settled` and `Funding -> Expired` are irreversible and mutually exclusive.
- **Non-Custodial Guarantee**: Organizers have zero authority to extract or redirect pool funds. Only recipients can settle funded pools, and only contributors can claim refunds on expired pools.
- **Mint Verification**: Vault and ATA transfers strictly validate that token mints match the designated USDC mint, preventing mock token substitution attacks.
- **Post-Deadline Settlement Protection**: Reaching 100% of the funding target prevents expiration, guaranteeing the recipient cannot be front-run or griefed at the deadline.

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
│               ├── create_pool.rs       # IX-01: Create pool & token vault
│               ├── contribute.rs        # IX-02: Deposit USDC
│               ├── settle_pool.rs       # IX-03: Settle 100% funds to recipient
│               ├── expire_pool.rs       # IX-04: Mark underfunded pool expired
│               └── claim_refund.rs      # IX-05: Refund contributor deposit
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
└── package.json                         # Root project scripts
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

---

## License

This project is licensed under the [MIT License](LICENSE).
