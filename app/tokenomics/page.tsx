import Link from "next/link";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import styles from "./tokenomics.module.css";

export const metadata: Metadata = { title: "Tokenomics", description: "ICFT's fixed supply and canonical MVP allocation for lending inventory, liquidity and protocol reserves." };

const allocations = [
  ["Strategic reserve", "280M", "28%", "Long-term protocol reserve and future resilience."],
  ["Fund A", "200M", "20%", "Initial lending inventory for the ICFT credit pool."],
  ["Future investors", "160M", "16%", "Future financing, subject to governance and release design."],
  ["Market liquidity", "150M", "15%", "Market-making and liquidity initiatives; not a public protocol LP allocation."],
  ["Developers", "100M", "10%", "Protocol development and sustained engineering work."],
  ["Founder", "80M", "8%", "Founder allocation under the project’s tokenomics plan."],
  ["Ecosystem / grants", "30M", "3%", "Community, integrations and ecosystem grants."],
] as const;

export default function TokenomicsPage() {
  return <main className={styles.page}>
    <nav className={`${styles.nav} shell`}><Link href="/" className="brand"><span>ICFT</span><i>+</i></Link><div className={styles.links}><Link href="/how-it-works">How it works</Link><Link href="/risk">Risk</Link><Link href="/faq">FAQ</Link></div><Link className={styles.return} href="/dapp">Open dApp ↗</Link></nav>
    <section className={`${styles.hero} shell`}><div><span className="kicker">ICFT / TOKENOMICS</span><h1>One billion.<br /><em>One credit layer.</em></h1><p>ICFT has a fixed supply of 1,000,000,000 tokens. The current MVP allocation establishes lending inventory, liquidity capacity, ecosystem resources and long-term protocol reserves.</p></div><div className={styles.supply}><span>FIXED TOTAL SUPPLY</span><strong>1B</strong><b>ICFT</b><small>No uncontrolled minting in the current token contract.</small></div></section>
    <section className={`${styles.principles} shell`}><article><span>01</span><h2>Fixed supply</h2><p>The ERC-20 supply is created once at deployment. The current contract does not provide an unrestricted mint function.</p></article><article><span>02</span><h2>Credit inventory</h2><p>Fund A is protocol-owned lending inventory. It supplies the initial capital that allows borrowers to draw ICFT against collateral.</p></article><article><span>03</span><h2>Not a market promise</h2><p>Token allocations do not guarantee market liquidity, value, returns, a listing or a public LP product.</p></article></section>
    <section className={`${styles.allocation} shell`}><div className={styles.allocationHead}><span className="kicker">MVP ALLOCATION</span><h2>Where the supply starts.</h2><p>Canonical allocation used by the current MVP specification. Transfer restrictions, vesting and governance processes require further production design.</p></div><div className={styles.allocationList}>{allocations.map(([name, amount, percent, detail], index) => <article key={name}><span className={styles.index}>0{index + 1}</span><div><h3>{name}</h3><p>{detail}</p></div><strong>{amount}<small>ICFT</small></strong><b>{percent}</b><i style={{ "--size": percent } as CSSProperties} /></article>)}</div></section>
    <section className={`${styles.flow} shell`}><div><span className="kicker">TOKEN IN THE PROTOCOL</span><h2>ICFT connects<br />collateral to credit.</h2></div><div className={styles.flowSteps}><article><span>COLLATERAL</span><b>ETH · wBTC</b><p>Users deposit approved assets to the LendingPool.</p></article><i>→</i><article><span>CREDIT</span><b>Borrow ICFT</b><p>Borrowing capacity is determined by risk limits and oracle prices.</p></article><i>→</i><article><span>REPAYMENT</span><b>ICFT returns</b><p>Principal returns to protocol inventory; interest follows the approved reserve policy.</p></article></div></section>
    <section className={`${styles.note} shell`}><div><span>IMPORTANT CONTEXT</span><h2>Early-stage testnet economics.</h2></div><p>This page describes the project’s canonical MVP allocation, not a solicitation to purchase tokens. Parameters, token distribution controls, governance, liquidity venues and vesting require further design and security review before any production use.</p><Link className="button primary" href="/risk">Read risk disclosure <b>↗</b></Link></section>
  </main>;
}
