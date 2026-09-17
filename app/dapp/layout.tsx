import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import styles from "./dapp.module.css";
import { WalletButton } from "./WalletButton";
import { DappNav } from "./DappNav";
import chrome from "./chrome.module.css";

export const metadata: Metadata = {
  title: "Credit terminal",
  description: "ICFT testnet lending workspace on Ethereum Sepolia.",
  robots: { index: false, follow: false }
};

export default function DappLayout({ children }: Readonly<{children:React.ReactNode}>) {
  return <div className={styles.app}><aside className={`${styles.side} ${chrome.side}`}><Link href="/" className={`${styles.logo} ${chrome.logo}`} aria-label="ICFT home"><Image className={chrome.image} src="/icft-banner.png" alt="ICFT" width={818} height={305} priority /></Link><span className={`${styles.caption} ${chrome.caption}`}>CREDIT TERMINAL</span><DappNav /><div className={styles.sideFoot}><span>NETWORK</span><strong><i />Ethereum Sepolia</strong><small>Testnet baseline v0.1</small></div></aside><section className={styles.main}><header className={styles.top}><div><span className={styles.crumb}>ICFT / {""}WORKSPACE</span><h1>Good afternoon, explorer.</h1></div><div className={styles.topActions}><WalletButton /></div></header>{children}</section></div>;
}
