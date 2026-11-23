import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

export const SEED_POOL = Buffer.from("pool");
export const SEED_VAULT = Buffer.from("vault");
export const SEED_CONTRIBUTION = Buffer.from("contribution");

export function getPoolPda(
  programId: PublicKey,
  organizer: PublicKey,
  poolId: anchor.BN
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEED_POOL, organizer.toBuffer(), poolId.toArrayLike(Buffer, "le", 8)],
    programId
  );
}

export function getVaultPda(
  programId: PublicKey,
  poolPda: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEED_VAULT, poolPda.toBuffer()],
    programId
  );
}

export function getContributionPda(
  programId: PublicKey,
  poolPda: PublicKey,
  contributor: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEED_CONTRIBUTION, poolPda.toBuffer(), contributor.toBuffer()],
    programId
  );
}
