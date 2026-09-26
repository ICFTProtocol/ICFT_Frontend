import Link from "next/link";
import type { Metadata } from "next";
import styles from "./roadmap.module.css";

export const metadata: Metadata = { title: "Roadmap", description: "ICFT's path from the current Sepolia baseline through testnet hardening and production readiness." };

const phases = [
  ["NOW", "Upgradeable Sepolia baseline", "Maintenance", ["ETH and wBTC collateral after oracle remediation", "Borrowing, repayment and collateral management under controlled testing", "Protocol-owned Fund A credit inventory", "Public dApp, status and transparent risk pages"]],
  ["NEXT", "Testnet hardening", "Planned", ["Independent testing of user and liquidation flows", "Oracle and RPC resilience checks", "Upgrade simulations and storage-layout validation", "Operational monitoring for the liquidation bot"]],
  ["THEN", "Production readiness", "Not live", ["Formal audit and remediation cycle", "Governance and privileged-role design", "Token distribution controls and vesting design", "Real liquidity and market-integration requirements"]],
  ["LATER", "Protocol expansion", "Exploratory", ["Deeper liquidity routes", "Additional approved collateral after risk review", "Automation and integrator tooling", "Progressive decentralization of protocol control"]],
] as const;

export default function RoadmapPage() {
  return <main className={styles.page}>
    <nav className={`${styles.nav} shell`}><Link href="/" className="brand"><span>ICFT</span><i>+</i></Link><div className={styles.links}><Link href="/how-it-works">How it works</Link><Link href="/status">Status</Link><Link href="/faq">FAQ</Link></div><Link className={styles.return} href="/dapp">Open dApp ↗</Link></nav>
    <section className={`${styles.hero} shell`}><span className="kicker">ICFT / ROADMAP</span><h1>Build carefully.<br /><em>Earn confidence.</em></h1><p>ICFT is currently an early Sepolia protocol baseline. This roadmap describes the engineering work required to move forward responsibly, rather than promising launch dates.</p><div className={styles.marker}><i /> CURRENT PHASE: TESTNET BASELINE</div></section>
    <section className={`${styles.timeline} shell`}>{phases.map(([when, title, state, points], index) => <article className={index === 0 ? styles.current : ""} key={title}><div className={styles.rail}><i /><span>{when}</span></div><div className={styles.phase}><div><span>{state}</span><h2>{title}</h2></div><ul>{points.map((point) => <li key={point}>{point}</li>)}</ul></div></article>)}</section>
    <section className={`${styles.principles} shell`}><div><span className="kicker">HOW WE DECIDE TO ADVANCE</span><h2>No phase is<br />a checkbox.</h2></div><div><article><b>Security before scale</b><p>Feature breadth does not replace threat modelling, independent review, test coverage and incident preparation.</p></article><article><b>Evidence before mainnet</b><p>Production use needs demonstrated operational readiness, reliable data sources, controlled upgrades and explicit risk ownership.</p></article><article><b>Transparency over certainty</b><p>Roadmap items can change. Status, risk and contract information should be more useful than unverified launch promises.</p></article></div></section>
    <section className={`${styles.end} shell`}><div><span>FOLLOW THE CURRENT BASELINE</span><h2>Use Sepolia.<br /><em>Watch the system.</em></h2></div><p>Explore current contracts and metrics first, then use a separate test-only wallet to interact with the dApp.</p><div><Link className="button primary" href="/status">View status <b>↗</b></Link><Link className={styles.secondary} href="/dapp">Open dApp</Link></div></section>
  </main>;
}
