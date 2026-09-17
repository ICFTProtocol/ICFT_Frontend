import type { Metadata } from "next";

export const metadata: Metadata = { title: "FAQ", description: "Answers about ICFT collateral, borrowing, liquidity, liquidations and the Ethereum Sepolia testnet." };

export default function FaqLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
