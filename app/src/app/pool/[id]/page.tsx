"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowDownToLine,
  Coins,
  Share2,
} from "lucide-react";

export default function PoolDetailsPage() {
  const params = useParams();
  const poolId = params.id as string;
  const { connected, publicKey } = useWallet();

  const [depositAmount, setDepositAmount] = useState("");

  // Demo state values (connected to on-chain pool fetch in live app)
  const target = 500;
  const contributed = 350;
  const remaining = target - contributed;
  const percent = Math.min(100, Math.round((contributed / target) * 100));
  const status = "Funding"; // "Funding" | "Settled" | "Expired"

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) {
      alert("Please connect wallet");
      return;
    }
    alert(`Contributing ${depositAmount} USDC to Pool ${poolId}`);
  };

  const handleSettle = () => {
    alert("Triggering SettlePool (IX-03)");
  };

  const handleExpire = () => {
    alert("Triggering ExpirePool (IX-04)");
  };

  const handleClaimRefund = () => {
    alert("Triggering ClaimRefund (IX-05)");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Pool Header Card */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">Pool #{poolId}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {status}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              PDA: Pool111111111111111111111111111111111111111
            </p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Shareable pool link copied!");
            }}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700 transition flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" /> Share Pool Link
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-zinc-300">
              {contributed} USDC raised
            </span>
            <span className="font-semibold text-white">
              Target: {target} USDC ({percent}%)
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Remaining needed: {remaining} USDC</span>
            <span className="flex items-center gap-1 text-amber-400/90">
              <Clock className="w-3.5 h-3.5" /> Deadline: In 14 hours
            </span>
          </div>
        </div>
      </div>

      {/* Action Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contributor Action Card */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Coins className="w-5 h-5 text-purple-400" />
            Contribute USDC (IX-02)
          </div>
          <p className="text-xs text-zinc-400">
            Deposit up to {remaining} USDC before the deadline. Funds will be held in the trustless pool vault.
          </p>

          <form onSubmit={handleContribute} className="space-y-4 pt-2">
            <div>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  max={remaining}
                  placeholder={`Max ${remaining}`}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setDepositAmount(remaining.toString())}
                  className="absolute right-3 top-2.5 text-xs font-semibold text-purple-400 hover:text-purple-300"
                >
                  MAX
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!connected}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm disabled:opacity-50 transition"
            >
              Deposit USDC
            </button>
          </form>
        </div>

        {/* Status / Settlement / Expiration Card */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Lifecycle Actions
          </div>
          <p className="text-xs text-zinc-400">
            Atomic settlement to the recipient once fully funded, or permissionless expiration and refund if deadline passes underfunded.
          </p>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleSettle}
              disabled={contributed < target}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Settle Pool (Recipient Only)
            </button>

            <button
              onClick={handleExpire}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-sm transition flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Expire Underfunded Pool
            </button>

            <button
              onClick={handleClaimRefund}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-sm transition flex items-center justify-center gap-2"
            >
              <ArrowDownToLine className="w-4 h-4 text-pink-400" /> Claim Contributor Refund
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
