import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { PROGRAM_ID, SEED_POOL, SEED_VAULT, SEED_CONTRIBUTION } from "./constants";

export function findPoolPda(organizer: PublicKey, poolId: BN): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEED_POOL, organizer.toBuffer(), poolId.toArrayLike(Buffer, "le", 8)],
    PROGRAM_ID
  );
}

export function findVaultPda(poolPda: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEED_VAULT, poolPda.toBuffer()],
    PROGRAM_ID
  );
}

export function findContributionPda(poolPda: PublicKey, contributor: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEED_CONTRIBUTION, poolPda.toBuffer(), contributor.toBuffer()],
    PROGRAM_ID
  );
}

export function formatUSDC(baseUnits: BN | number | string, decimals = 6): string {
  const num = typeof baseUnits === "number" ? baseUnits : Number(baseUnits.toString());
  return (num / Math.pow(10, decimals)).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

export function formatTimestamp(timestampSec: BN | number): string {
  const sec = typeof timestampSec === "number" ? timestampSec : timestampSec.toNumber();
  return new Date(sec * 1000).toLocaleString();
}
