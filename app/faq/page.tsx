"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./faq.module.css";

type Topic = "All" | "Getting started" | "Borrowing" | "Liquidity" | "Risk & security" | "Technical";

type Question = {
  topic: Exclude<Topic, "All">;
  question: string;
  answer: string;
};

const topics: Topic[] = ["All", "Getting started", "Borrowing", "Liquidity", "Risk & security", "Technical"];

const questions: Question[] = [
  { topic: "Getting started", question: "Which network should I use?", answer: "The current interface is configured for Ethereum Sepolia, chain ID 11155111. Use test ETH and test assets only. The protocol is not approved for mainnet use." },
  { topic: "Getting started", question: "Which wallet can I connect?", answer: "Use an EIP-1193 compatible wallet such as MetaMask, Rabby, Coinbase Wallet or another connector offered in the wallet modal. Verify the active account and Sepolia network before signing." },
  { topic: "Getting started", question: "What assets can secure a position?", answer: "The active collateral registry supports native ETH, wBTC and wstETH on Sepolia. Asset availability comes from the deployed registry, so the dApp is the source of truth for the currently enabled assets." },
  { topic: "Borrowing", question: "What happens when I deposit collateral?", answer: "The LendingPool records collateral against your wallet address. Native ETH is sent with the transaction; ERC-20 collateral requires an approval followed by a deposit transaction." },
  { topic: "Borrowing", question: "How much ICFT can I borrow?", answer: "Available borrowing capacity is derived from your USD-denominated collateral value, current debt and the protocol maximum LTV. The displayed capacity can change when oracle prices or accrued debt change." },
  { topic: "Borrowing", question: "How is interest accrued?", answer: "The protocol uses a global borrow index. Your debt grows in line with this index, and the rate model changes rates according to current pool utilization. A loan does not lock a personal APR at opening." },
  { topic: "Borrowing", question: "How do I repay or fully close a loan?", answer: "Hold sufficient ICFT, approve the LendingPool to spend it, then submit a repayment. Repay can be partial; after all debt is repaid, collateral can be withdrawn subject to the pool rules." },
  { topic: "Borrowing", question: "Why can a collateral withdrawal revert?", answer: "A withdrawal is rejected when it would leave the position above the maximum LTV. Add collateral or repay ICFT first, then retry with a smaller amount." },
  { topic: "Liquidity", question: "What do LP shares represent?", answer: "icftLP shares represent a proportional claim on the ICFT Liquidity Vault assets. The share value can increase as interest is allocated to LP capital and can decrease if losses reach LP capital." },
  { topic: "Liquidity", question: "Where does LP yield come from?", answer: "Borrower interest is split by the protocol: 85% increases LP assets and 15% is retained in the insurance reserve. Yield is not promised and depends on repayment, utilization and protocol losses." },
  { topic: "Liquidity", question: "Can I redeem shares immediately?", answer: "A redemption can only succeed when the vault and lending pool have sufficient available ICFT liquidity. Capital currently borrowed by users is not instantly withdrawable." },
  { topic: "Liquidity", question: "What is the insurance reserve for?", answer: "The reserve is the first loss buffer for realised bad debt. It is intended to absorb losses before they reduce LP assets; it does not guarantee that LPs cannot lose funds." },
  { topic: "Risk & security", question: "When can a position be liquidated?", answer: "A position becomes eligible when its risk metrics cross the configured liquidation threshold. A third-party liquidation operator can repay debt and seize collateral according to the configured liquidation bonus." },
  { topic: "Risk & security", question: "What should I check before signing?", answer: "Read the wallet transaction target, method, amount and network. Never share a seed phrase, never use a wallet holding mainnet assets for testnet experimentation, and reject unexpected approvals." },
  { topic: "Risk & security", question: "Are oracle prices guaranteed to be current?", answer: "No. The PriceOracle validates configured feeds and freshness limits, but feeds can be stale or unavailable. The dApp should be treated as an interface, while contract state is the final source of truth." },
  { topic: "Technical", question: "Are the protocol contracts upgradeable?", answer: "Yes. The testnet baseline uses proxies with separate upgrade administration. Upgrades must preserve storage layout and require a review, deployment simulation and post-upgrade verification." },
  { topic: "Technical", question: "Why do token amounts and USD values use different decimals?", answer: "ERC-20 assets may have their own decimals, while protocol USD accounting is normalized to 18 decimals. The dApp formats values for display, but contract calls use raw integer units." },
  { topic: "Technical", question: "Where can I inspect deployed contracts?", answer: "Use the links in the protocol control room or Sepolia Etherscan. Confirm that the proxy address, implementation and network match the current testnet baseline before relying on a transaction." }
];

export default function FaqPage() {
  const [topic, setTopic] = useState<Topic>("All");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(questions[0].question);
  const normalizedQuery = query.trim().toLowerCase();
  const visible = questions.filter((item) => (topic === "All" || item.topic === topic) && (!normalizedQuery || `${item.question} ${item.answer} ${item.topic}`.toLowerCase().includes(normalizedQuery)));

  return <main className={styles.page}>
    <nav className={`${styles.nav} shell`}>
      <Link href="/" className="brand"><span>ICFT</span><i>+</i></Link>
      <div className={styles.navLinks}><Link href="/">Lending</Link><Link href="/how-it-works">How it works</Link><Link href="/dapp">Open dApp</Link></div>
      <Link className={styles.return} href="/">Back to site ↖</Link>
    </nav>

    <section className={`${styles.hero} shell`}>
      <span className="kicker">ICFT / KNOWLEDGE BASE</span>
      <h1>Answers before<br /><em>actions.</em></h1>
      <p>Practical guidance for using the current ICFT Sepolia lending baseline. Search the protocol, then verify every transaction in your wallet.</p>
      <label className={styles.search}><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search collateral, repayments, liquidations..." /><kbd>ESC</kbd></label>
    </section>

    <section className={`${styles.library} shell`}>
      <aside className={styles.topicPanel}><span>FILTER BY TOPIC</span>{topics.map((item) => <button className={topic === item ? styles.activeTopic : ""} key={item} onClick={() => setTopic(item)}>{item}<b>{item === "All" ? questions.length : questions.filter((question) => question.topic === item).length}</b></button>)}<div className={styles.notice}><b>SEPOLIA ONLY</b><p>Do not send mainnet funds or rely on this testnet deployment for production use.</p></div></aside>
      <div className={styles.results}><div className={styles.resultsHead}><span>{visible.length} {visible.length === 1 ? "answer" : "answers"}</span><p>{topic === "All" ? "All protocol topics" : topic}</p></div>{visible.length > 0 ? visible.map((item) => <article className={`${styles.item} ${open === item.question ? styles.open : ""}`} key={item.question}><button onClick={() => setOpen(open === item.question ? null : item.question)} aria-expanded={open === item.question}><span><small>{item.topic}</small>{item.question}</span><b>+</b></button><div className={styles.answer}><p>{item.answer}</p></div></article>) : <div className={styles.empty}><span>NO MATCHES</span><h2>Try a broader term.</h2><button onClick={() => { setQuery(""); setTopic("All"); }}>Clear search</button></div>}</div>
    </section>

    <section className={`${styles.help} shell`}><div><span className="kicker">STILL NEED CONTEXT?</span><h2>Inspect the live<br />testnet baseline.</h2></div><p>The dApp exposes active pool data and wallet actions. Contract addresses and a Sepolia explorer link are available from the lending page control room.</p><Link className="button primary" href="/dapp">Open dApp <b>↗</b></Link></section>
  </main>;
}
