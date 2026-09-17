import type { Metadata } from "next";
import "./globals.css";
import "./link-reset.css";
import "./landing.css";
import "./density.css";
import "./routing.css";
import "./footer.css";
import "./nav-fixes.css";
import { Providers } from "./providers";
import { FooterGate } from "./FooterGate";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "ICFT | Credit, onchain", template: "%s | ICFT" },
  description: "ICFT is an early-stage collateralized lending protocol on Ethereum Sepolia.",
  applicationName: "ICFT",
  keywords: ["ICFT", "DeFi", "lending", "Ethereum Sepolia", "collateral", "testnet"],
  icons: { icon: "/logo.png" },
  openGraph: { type: "website", siteName: "ICFT", title: "ICFT | Credit, onchain", description: "Transparent collateralized lending on Ethereum Sepolia.", images: [{ url: "/logo.png", width: 300, height: 150, alt: "ICFT" }] },
  twitter: { card: "summary", title: "ICFT | Credit, onchain", description: "Transparent collateralized lending on Ethereum Sepolia." }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Providers>{children}</Providers><FooterGate /></body></html>;
}
