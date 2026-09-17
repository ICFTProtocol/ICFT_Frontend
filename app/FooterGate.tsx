"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

export function FooterGate() {
  const pathname = usePathname();
  if (pathname.startsWith("/dapp")) return null;

  return <footer className="footer">
    <div className="shell footerGrid">
      <div className="footerLead"><a className="footerBrand" href="/#top" aria-label="ICFT home"><Image src="/icft-banner.png" alt="ICFT" width={818} height={305} /></a><p>Programmable credit, transparent collateral and an on-chain lending primitive for the ICFT ecosystem.</p><span className="testnetBadge">● ETHEREUM SEPOLIA</span><div className="footerSocials"><a href="https://github.com/ICFTProtocol/ICFT-on-chain" target="_blank" rel="noreferrer" aria-label="GitHub"><svg viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9c.04-1-.35-2-.99-2.76 3.24-.36 6.65-1.59 6.65-7.21A5.6 5.6 0 0 0 20.17 4.3 5.2 5.2 0 0 0 20 1s-1.22-.39-4 1.5a13.8 13.8 0 0 0-7.3 0C5.92.61 4.7 1 4.7 1a5.2 5.2 0 0 0-.17 3.3A5.6 5.6 0 0 0 3 8.1c0 5.61 3.4 6.85 6.65 7.21A3.45 3.45 0 0 0 8.7 18v4" /></svg></a><a href="https://sepolia.etherscan.io" target="_blank" rel="noreferrer" aria-label="Sepolia Etherscan"><svg viewBox="0 0 24 24"><path d="M4 12 12 4.5l8 7.5-8 8-8-8Z" /><path d="m8 12 4 4 4-4" /><path d="m8 12 4-4 4 4" /></svg></a></div></div>
      <div className="footerLinks"><h4>Explore</h4><a href="/start">Get started</a><a href="/dapp">Open dApp</a><a href="/dapp/positions">Positions</a><a href="/dapp/markets">Markets</a><a href="/dapp/liquidity">Liquidity</a><a href="/roadmap">Roadmap</a><a href="/about">About ICFT</a></div>
      <div className="footerLinks"><h4>Protocol</h4><a href="/how-it-works">How it works</a><a href="/tokenomics">Tokenomics</a><a href="/risk">Risk & security</a><a href="/faq">FAQ</a><a href="https://github.com/ICFTProtocol/ICFT-on-chain" target="_blank" rel="noreferrer">Smart contracts ↗</a></div>
      <div className="footerNetwork"><h4>Network</h4><strong>Ethereum Sepolia</strong><span>Chain ID 11155111</span><span>Testnet-only baseline</span><a href="/status">Protocol status</a><a href="/legal/terms">Terms of use</a><a href="/legal/privacy">Privacy notice</a><a href="/legal/testnet">Testnet notice</a><a href="https://sepolia.etherscan.io" target="_blank" rel="noreferrer">Open explorer ↗</a></div>
    </div>
    <div className="footerBottomLogo" aria-label="ICFT logo" />
    <div className="shell footerBase"><span>© 2026 ICFT contributors. GPL-3.0-only.</span><span>No production assets. No investment advice.</span><a href="/#top">Back to top ↑</a></div>
  </footer>;
}
