import Link from "next/link";
import type { Metadata } from "next";
import styles from "./start.module.css";

export const metadata: Metadata = { title: "Get started", description: "Prepare a test-only wallet and explore ICFT borrowing or liquidity supply on Ethereum Sepolia." };

const setup = [
  ["01", "Use a test-only wallet", "Create or select a wallet that holds no mainnet assets. Never share its seed phrase, even for testnet support."],
  ["02", "Switch to Ethereum Sepolia", "The ICFT baseline is deployed on Sepolia, chain ID 11155111. Confirm the network in your wallet before every transaction."],
  ["03", "Get test ETH", "You need Sepolia ETH to pay transaction gas and, if borrowing, to use as native ETH collateral. It has no production value."],
] as const;

const flows = [
  ["Borrow", "Deposit ETH, wBTC or wstETH", "Review borrowing capacity", "Borrow ICFT and monitor your LTV", "/dapp"],
  ["Supply liquidity", "Hold test ICFT", "Approve the ICFT Liquidity Vault", "Receive icftLP shares and track pool assets", "/dapp/liquidity"],
] as const;

export default function StartPage() {
  return <main className={styles.page}>
    <nav className={`${styles.nav} shell`}><Link href="/" className="brand"><span>ICFT</span><i>+</i></Link><div className={styles.links}><Link href="/how-it-works">How it works</Link><Link href="/status">Status</Link><Link href="/faq">FAQ</Link></div><Link className={styles.return} href="/dapp">Open dApp ↗</Link></nav>
    <section className={`${styles.hero} shell`}><div><span className="kicker">ICFT / GET STARTED</span><h1>Start with<br /><em>small signals.</em></h1><p>ICFT is currently an early-stage Ethereum Sepolia protocol. This guide helps you test the interface carefully without confusing a testnet action for a production financial transaction.</p><Link className="button primary" href="/dapp">Open testnet dApp <b>↗</b></Link></div><div className={styles.card}><span>TESTNET SESSION</span><div><i>01</i><b>Connect a wallet</b><p>Use the connect button in the dApp. Select your preferred wallet and approve Sepolia.</p></div><div><i>02</i><b>Inspect first</b><p>Review current prices, pool liquidity and risk limits before you submit anything.</p></div><strong>NO MAINNET FUNDS</strong></div></section>
    <section className={`${styles.setup} shell`}><div><span className="kicker">BEFORE YOU CONNECT</span><h2>Three things<br />to prepare.</h2></div><div className={styles.setupGrid}>{setup.map(([number, title, body]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    <section className={`${styles.choose} shell`}><div className={styles.chooseHead}><span className="kicker">CHOOSE A PATH</span><h2>Borrow or supply.</h2><p>Both paths interact with live Sepolia contracts. They are designed for testing and interface validation only.</p></div><div className={styles.flowGrid}>{flows.map(([title, first, second, third, href]) => <article key={title}><span>{title === "Borrow" ? "01 / CREDIT" : "02 / LIQUIDITY"}</span><h3>{title}</h3><ol><li>{first}</li><li>{second}</li><li>{third}</li></ol><Link href={href}>{title === "Borrow" ? "Open borrowing flow" : "Open liquidity flow"} ↗</Link></article>)}</div></section>
    <section className={`${styles.review} shell`}><div><span className="kicker">RIGHT BEFORE SIGNING</span><h2>Read the wallet<br />confirmation.</h2></div><div><p><b>Network</b> must be Ethereum Sepolia.</p><p><b>Target</b> must match the intended ICFT contract or proxy.</p><p><b>Method and amount</b> must match the action you selected in the dApp.</p><p><b>Approval</b> should grant only the amount you understand and intend to use.</p></div></section>
    <section className={`${styles.end} shell`}><div><span>WHEN IN DOUBT</span><h2>Pause, inspect,<br /><em>then proceed.</em></h2></div><p>The protocol status page lists live proxy addresses and current parameters. The FAQ explains each user flow before you need to sign.</p><div><Link className="button primary" href="/status">View protocol status <b>↗</b></Link><Link className={styles.secondary} href="/faq">Read the FAQ</Link></div></section>
  </main>;
}
