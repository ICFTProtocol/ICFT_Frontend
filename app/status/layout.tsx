import type { Metadata } from "next";

export const metadata: Metadata = { title: "Protocol status", description: "Live read-only ICFT deployment status, prices, pool metrics and proxy addresses on Ethereum Sepolia.", robots: { index: false, follow: true } };

export default function StatusLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
