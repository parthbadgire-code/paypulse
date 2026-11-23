import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export type PoolStatus = "Funding" | "Settled" | "Expired";

export interface PoolAccount {
  publicKey: PublicKey;
  organizer: PublicKey;
  recipient: PublicKey;
  usdcMint: PublicKey;
  poolId: BN;
  targetAmount: BN;
  totalContributed: BN;
  totalRefunded: BN;
  deadline: BN;
  status: PoolStatus;
  bump: number;
  vaultBump: number;
}

export interface ContributionAccount {
  publicKey: PublicKey;
  pool: PublicKey;
  contributor: PublicKey;
  amount: BN;
  refunded: boolean;
  bump: number;
}
