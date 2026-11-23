"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ArrowLeft, PlusCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { DEVNET_USDC_MINT } from "@/lib/constants";

export default function CreatePoolPage() {
  const { connected, publicKey } = useWallet();
  const [targetAmount, setTargetAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [deadlineHours, setDeadlineHours] = useState("24");
  const [poolId, setPoolId] = useState(Date.now().toString());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) {
      alert("Please connect your wallet first.");
      return;
    }
    // Anchor interaction will be executed here with the provider
    alert(`Ready to create pool with ID ${poolId}, target: ${targetAmount} USDC, recipient: ${recipient}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition">
        <ArrowLeft className="w-4 h-4" /> Back to Overview
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Create a Payment Pool</h1>
        <p className="text-sm text-zinc-400">
          Initialize a conditional group pool on Solana. You (the organizer) will pay rent for the pool PDA and token vault.
        </p>
      </div>

      {!connected && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Connect your wallet to configure and deploy a new payment pool.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Pool ID (Unique per Organizer)
          </label>
          <input
            type="number"
            value={poolId}
            onChange={(e) => setPoolId(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Target Amount (USDC)
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              placeholder="e.g. 500"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
            />
            <span className="absolute right-4 top-2.5 text-xs font-semibold text-zinc-500">
              USDC
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1.5">
            Exact amount required for recipient settlement. Cannot be zero.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Designated Settlement Recipient (Solana Address)
          </label>
          <input
            type="text"
            placeholder="e.g. 4Nd1mBQv... (Wallet Pubkey)"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
          />
          <p className="text-xs text-zinc-500 mt-1.5">
            Only this wallet address can trigger settlement and receive the pool funds once funded.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Deadline Duration
          </label>
          <select
            value={deadlineHours}
            onChange={(e) => setDeadlineHours(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="1">1 Hour</option>
            <option value="6">6 Hours</option>
            <option value="24">24 Hours</option>
            <option value="72">3 Days (72 Hours)</option>
            <option value="168">7 Days (1 Week)</option>
          </select>
          <p className="text-xs text-zinc-500 mt-1.5">
            Must be in the future. After this timestamp, if underfunded, anyone can mark expired for refunds.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Token Mint
          </label>
          <input
            type="text"
            readOnly
            value={DEVNET_USDC_MINT.toBase58()}
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800/60 text-zinc-500 font-mono text-xs cursor-not-allowed"
          />
          <p className="text-xs text-zinc-500 mt-1.5">
            Devnet USDC Canonical Mint immutably bound to the pool.
          </p>
        </div>

        <button
          type="submit"
          disabled={!connected}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Initialize Payment Pool (IX-01)
        </button>
      </form>
    </div>
  );
}
