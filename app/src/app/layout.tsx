import type { Metadata } from "next";
import "./globals.css";
import { WalletContextProvider } from "@/components/WalletContextProvider";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "PayPulse - Conditional Group Payment Protocol",
  description:
    "Pool USDC with your group towards a shared payment target on Solana with non-custodial, trustless conditional settlement.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col">
        <WalletContextProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-500">
            PayPulse Protocol • Built on Solana
          </footer>
        </WalletContextProvider>
      </body>
    </html>
  );
}
