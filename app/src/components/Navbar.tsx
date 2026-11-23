"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Layers, PlusCircle } from "lucide-react";

// Dynamically import WalletMultiButton to prevent SSR hydration mismatches
const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export const Navbar = () => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white hover:opacity-90">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-600 to-emerald-400 flex items-center justify-center text-black font-extrabold shadow-lg shadow-purple-500/20">
              P
            </div>
            <span>PayPulse</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">
              Explore Pools
            </Link>
            <Link href="/create" className="hover:text-white transition-colors flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              Create Pool
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Devnet
          </div>
          <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg !text-sm !font-medium !h-10" />
        </div>
      </div>
    </header>
  );
};
