import Link from "next/link";
import { ShieldCheck, Clock, Users, ArrowRight, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
          <ShieldCheck className="w-4 h-4" /> Non-Custodial Conditional Payments
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Trustless Group Payments on{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-emerald-400">
            Solana
          </span>
        </h1>
        <p className="text-lg text-zinc-400 leading-relaxed">
          Pool USDC with your group towards a shared target without trusting an organizer.
          If the exact target is reached, the settlement recipient claims the funds. If the deadline expires unmet,
          every contributor reclaims 100% of their deposit.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/create"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:opacity-95 transition flex items-center gap-2"
          >
            Create a Payment Pool <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#how-it-works"
            className="px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold hover:bg-zinc-800 transition"
          >
            How It Works
          </a>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div className="h-10 w-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Zero Organizer Custody</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Funds are locked in program-derived vault accounts. No organizer, developer, or admin has access to redirect or take custody of your money.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">All-or-Nothing Settlement</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Settlement triggers atomically once and only when 100% of the funding target is reached, preventing partial payouts or underfunded deliveries.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div className="h-10 w-10 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Permissionless Refunds</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            If the target is unmet when the deadline passes, anyone can trigger expiration, enabling every depositor to immediately reclaim their refund.
          </p>
        </div>
      </div>

      {/* Protocol Protocol Overview Table */}
      <div id="how-it-works" className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-6">
        <h2 className="text-2xl font-bold text-white">Core Protocol State Machine</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
            <span className="text-xs font-mono uppercase text-purple-400 font-bold">State 1: Funding</span>
            <p className="text-zinc-300 font-semibold">Active Contributions</p>
            <p className="text-zinc-400 text-xs">
              Contributors deposit USDC before the deadline up to the target amount. Each contributor’s total is tracked in an individual ContributionRecord PDA.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
            <span className="text-xs font-mono uppercase text-emerald-400 font-bold">State 2: Settled</span>
            <p className="text-zinc-300 font-semibold">Full Funding Achieved</p>
            <p className="text-zinc-400 text-xs">
              Once total contributions equal the target amount, the predetermined recipient atomically settles the pool and receives 100% of the USDC.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
            <span className="text-xs font-mono uppercase text-rose-400 font-bold">State 3: Expired</span>
            <p className="text-zinc-300 font-semibold">Underfunded Cutoff</p>
            <p className="text-zinc-400 text-xs">
              If the deadline arrives with unmet funding, any signer permissionlessly expires the pool, allowing contributors to reclaim their full deposits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
