import Link from "next/link";
import type { Metadata } from "next";
import styles from "./about.module.css";

export const metadata: Metadata = { title: "About", description: "The ICFT mission, current Sepolia baseline and principles guiding the protocol's development." };

const principles = [
  ["01", "Collateral before credit", "Credit should be backed by transparent on-chain collateral and enforceable risk boundaries, not opaque discretionary decisions."],
  ["02", "Readable mechanics", "A user should be able to see what supports their borrowing capacity, how interest changes and when risk increases."],
  ["03", "Progressive responsibility", "The protocol moves from a constrained testnet baseline toward production only when security, operations and governance are ready."],
] as const;

export default function AboutPage() {
  return <main className={styles.page}>
    <nav className={`${styles.nav} shell`}><Link href="/" className="brand"><span>ICFT</span><i>+</i></Link><div className={styles.links}><Link href="/how-it-works">How it works</Link><Link href="/roadmap">Roadmap</Link><Link href="/status">Status</Link></div><Link className={styles.return} href="/dapp">Open dApp ↗</Link></nav>
    <section className={`${styles.hero} shell`}><div><span className="kicker">ABOUT ICFT</span><h1>Credit built<br />to be <em>inspectable.</em></h1><p>ICFT is an on-chain crypto-credit protocol in early testnet development. It explores a simple premise: users should be able to access liquidity against transparent collateral without needing to sell the assets they hold.</p><div className={styles.tags}><span>ETHEREUM SEPOLIA</span><span>UPGRADEABLE BASELINE</span><span>TESTNET ONLY</span></div></div><div className={styles.symbol}><div>+</div><span>ICFT<br />CREDIT LAYER</span><i>EST.<br />2026</i></div></section>
    <section className={`${styles.statement} shell`}><span className="kicker">THE IDEA</span><h2>Keep collateral.<br />Access credit.</h2><p>Crypto holders often face a trade-off: sell an asset to access liquidity, or remain exposed to price volatility with no liquidity option. ICFT is designed around collateralized borrowing: approved on-chain assets support a position, while ICFT provides the credit asset users borrow and later repay.</p></section>
    <section className={`${styles.principles} shell`}><div className={styles.principleHead}><span className="kicker">WHAT GUIDES THE BUILD</span><h2>Three operating<br />principles.</h2></div><div className={styles.principleGrid}>{principles.map(([number, title, body]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    <section className={`${styles.today} shell`}><div><span className="kicker">WHERE IT IS TODAY</span><h2>An engineering<br />baseline, not a finish line.</h2></div><div><p>The current ICFT deployment runs on Ethereum Sepolia. It supports collateralized borrowing, liquidity shares, an insurance reserve, configurable risk limits and upgradeable protocol modules.</p><p>It is intended for interface testing, contract verification and operational learning. It is not a production protocol and must not be used with mainnet funds.</p><div><Link href="/status">Inspect current status ↗</Link><Link href="/risk">Understand the risks ↗</Link></div></div></section>
    <section className={`${styles.direction} shell`}><div><span>THE DIRECTION</span><h2>From a lending pool<br />to programmable credit.</h2></div><p>The immediate work is testnet hardening: validating core flows, monitoring dependencies, improving automation and resolving security findings. Longer-term protocol expansion depends on that foundation, not on a launch narrative.</p><Link className="button primary" href="/roadmap">View roadmap <b>↗</b></Link></section>
  </main>;
}
