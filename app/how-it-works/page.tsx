import Link from "next/link";
import type { Metadata } from "next";
import styles from "./how.module.css";

export const metadata: Metadata = { title: "How it works", description: "Learn how ICFT collateralized borrowing, liquidity supply, risk limits and liquidations work." };

const stages = [
  ["01", "Choose collateral", "Deposit ETH, wBTC or wstETH from the collateral list. The protocol uses the oracle's USD price to establish the value supporting your position."],
  ["02", "Open credit", "Borrow ICFT only within the capacity shown by the dApp. Borrowing capacity is based on collateral value, current debt and the maximum loan-to-value limit."],
  ["03", "Manage the position", "Watch the health of your position. Repay ICFT to reduce debt, or add collateral when price moves reduce your safety margin."],
  ["04", "Close on your terms", "Repay your outstanding debt, then withdraw collateral that is no longer needed. All actions are confirmed in your own wallet."],
] as const;

export default function HowItWorksPage() {
  return <main className={styles.page}>
    <nav className={`${styles.nav} shell`}>
      <Link href="/" className="brand"><span>ICFT</span><i>+</i></Link>
      <div className={styles.links}><Link href="/">Lending</Link><Link href="/faq">FAQ</Link><Link href="/dapp">Open dApp</Link></div>
      <Link className={styles.return} href="/">Back to site ↖</Link>
    </nav>

    <section className={`${styles.hero} shell`}>
      <div><span className="kicker">ICFT / HOW IT WORKS</span><h1>Credit, without<br /><em>the hidden parts.</em></h1><p>ICFT is a collateralized lending protocol. It lets users borrow ICFT against on-chain assets, while liquidity suppliers provide the capital that makes borrowing possible.</p><div className={styles.actions}><Link className="button primary" href="/dapp">Open dApp <b>↗</b></Link><Link className="button ghost" href="/faq">Read FAQ</Link></div></div>
      <div className={styles.diagram} aria-label="Collateral flows into an ICFT credit position"><span className={styles.asset}>ETH</span><span className={styles.asset}>wBTC</span><span className={styles.asset}>wstETH</span><div className={styles.pool}>ICFT<br /><small>CREDIT POOL</small></div><i>↓</i><strong>YOUR POSITION</strong></div>
    </section>

    <section className={`${styles.intro} shell`}><span className="kicker">THE SIMPLE VERSION</span><h2>Collateral stays on-chain.<br />Credit is issued against it.</h2><p>When you deposit an approved asset, the lending pool records its value in USD. You can borrow ICFT up to the protocol's risk limit. As long as the position remains healthy, you decide when to repay and withdraw.</p></section>

    <section className={`${styles.stages} shell`}><div className={styles.sectionHead}><span className="kicker">A BORROWER'S PATH</span><h2>Four moves.<br />One clear position.</h2></div><div className={styles.stageGrid}>{stages.map(([number, title, body]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>

    <section className={`${styles.split} shell`}><article><span className="kicker">FOR BORROWERS</span><h2>Your position has a health limit.</h2><p>Borrowing is limited to 80% LTV in the current testnet configuration. The liquidation threshold is 90%. Asset prices and accrued interest can change your LTV even while you are away, so leaving a buffer matters.</p><Link href="/faq" className={styles.textLink}>Learn about liquidation risk ↗</Link></article><article><span className="kicker">FOR LIQUIDITY SUPPLIERS</span><h2>Capital earns from real usage.</h2><p>Liquidity suppliers receive icftLP shares. Borrower interest increases the pool's assets: 85% is directed to LP capital and 15% to the insurance reserve. LP value is tied to the pool, not a fixed rate promise.</p><Link href="/dapp/liquidity" className={styles.textLink}>Explore liquidity in dApp ↗</Link></article></section>

    <section className={`${styles.risk} shell`}><div><span>RISK IS PART OF THE DESIGN</span><h2>What protects<br />the pool?</h2></div><div className={styles.riskList}><p><b>Price feeds</b>Collateral is valued through the configured PriceOracle, with freshness checks for oracle data.</p><p><b>Collateral limits</b>The RiskEngine enforces maximum LTV and the liquidation threshold before borrowing or withdrawals.</p><p><b>Liquidations</b>When a position is unsafe, a permitted liquidator can repay debt and seize collateral under the protocol rules.</p><p><b>Insurance first</b>Realized bad debt is first directed to the insurance reserve before it reaches LP capital.</p></div></section>

    <section className={`${styles.start} shell`}><div><span className="kicker">READY TO EXPLORE?</span><h2>Start small.<br /><em>Stay in control.</em></h2></div><div><p>The current deployment is for Ethereum Sepolia only. Use a test-only wallet, test assets, and verify every wallet confirmation before signing.</p><Link className="button primary" href="/dapp">Open testnet dApp <b>↗</b></Link></div></section>
  </main>;
}
