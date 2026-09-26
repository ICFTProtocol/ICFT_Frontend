"use client";

import Link from "next/link";
import { formatUnits } from "viem";
import { useBlockNumber } from "wagmi";
import { useState } from "react";
import { protocol } from "../../lib/protocol";
import { copyText } from "../../lib/copy";
import { useProtocolData } from "../dapp/useProtocolData";
import styles from "./status.module.css";

const amount = (value: bigint, digits = 2) => Number(formatUnits(value, 18)).toLocaleString("en-US", { maximumFractionDigits: digits });
const money = (value: bigint) => `$${amount(value)}`;
const compact = (value: string) => `${value.slice(0, 6)}...${value.slice(-4)}`;

const modules = [
  ["ICFT token", "icft"],
  ["Price oracle", "oracle"],
  ["Risk engine", "riskEngine"],
  ["Rate model", "interestRateModel"],
  ["Lending pool", "lendingPool"],
] as const;

export default function StatusPage() {
  const live = useProtocolData();
  const block = useBlockNumber({ watch: true, query: { refetchInterval: 15_000 } });
  const state = live.pool.paused ? "MAINTENANCE" : live.isError || block.isError ? "RPC UNAVAILABLE" : live.isLoading || block.isLoading ? "SYNCING" : "LIVE READ";

  return <main className={styles.page}>
    <nav className={`${styles.nav} shell`}><Link href="/" className="brand"><span>ICFT</span><i>+</i></Link><div className={styles.links}><Link href="/how-it-works">How it works</Link><Link href="/risk">Risk</Link><Link href="/faq">FAQ</Link></div><Link className={styles.return} href="/dapp">Open dApp ↗</Link></nav>
    <section className={`${styles.hero} shell`}><div><span className="kicker">ICFT / PROTOCOL STATUS</span><h1>See what is<br /><em>actually live.</em></h1><p>Public read-only data from the configured Ethereum Sepolia deployment. No wallet connection is required to inspect this page.</p></div><div className={styles.live}><span><i /> {state}</span><strong>Ethereum<br />Sepolia</strong><small>Chain ID 11155111</small>{block.data ? <b>Block #{block.data.toLocaleString()}</b> : <b>Waiting for RPC...</b>}</div></section>
    <section className={`${styles.metrics} shell`}><Metric label="Fund A available inventory" value={`${amount(live.pool.availableLiquidity, 0)} ICFT`} /><Metric label="Fund A utilization" value={`${Number(live.pool.utilizationBps) / 100}%`} /><Metric label="USDT settlement" value="Planned" /><Metric label="Current borrow APR" value={`${Number(live.risk.borrowRateBps) / 100}%`} /></section>
    <section className={`${styles.prices} shell`}><div className={styles.sectionHead}><span className="kicker">ORACLE SNAPSHOT</span><h2>Collateral prices.</h2><p>USD values normalized by the PriceOracle. wstETH is disabled while oracle remediation is in progress. The page refreshes approximately every 15 seconds.</p></div><div className={styles.priceGrid}><Price symbol="ETH" label="Native Ether" value={money(live.prices.eth)} /><Price symbol="wBTC" label="Wrapped Bitcoin" value={money(live.prices.wbtc)} /><Price symbol="ICFT" label="Protocol credit asset" value={money(live.prices.icft)} /></div></section>
    <section className={`${styles.risk} shell`}><div><span className="kicker">ACTIVE PARAMETERS</span><h2>Risk limits<br />on this baseline.</h2></div><div className={styles.parameterList}><Param label="Maximum LTV" value={`${Number(live.risk.maxLtvBps) / 100}%`} note="Caps new borrowing and collateral withdrawals." /><Param label="Target LTV" value={`${Number(live.risk.targetLtvBps) / 100}%`} note="A conservative reference point for position management." /><Param label="Liquidation threshold" value={`${Number(live.risk.liquidationThresholdBps) / 100}%`} note="A position may become eligible for liquidation at this level." /><Param label="Liquidation bonus" value={`${Number(live.risk.liquidationBonusBps) / 100}%`} note="Protocol parameter used in collateral seizure calculations." /></div></section>
    <section className={`${styles.modules} shell`}><div className={styles.moduleHead}><span className="kicker">DEPLOYMENT DIRECTORY</span><h2>Active contract entrypoints.</h2><p>These are the configured proxy-facing addresses used by the public interface.</p></div><div className={styles.moduleGrid}>{modules.map(([label, key]) => <Module key={key} label={label} value={protocol[key]} />)}</div></section>
    <section className={`${styles.end} shell`}><div><span>TRANSPARENCY STARTS HERE</span><h2>Check first.<br /><em>Then interact.</em></h2></div><p>Status is informative, not a security guarantee. Confirm the network, contract target and transaction details again in your wallet.</p><Link className="button primary" href="/dapp">Open dApp <b>↗</b></Link></section>
  </main>;
}

function Metric({ label, value }: { label: string; value: string }) { return <article><span>{label}</span><strong>{value}</strong><small>Live Sepolia read</small></article>; }
function Price({ symbol, label, value }: { symbol: string; label: string; value: string }) { return <article><span>{symbol}</span><div><b>{label}</b><strong>{value}</strong></div><i>LIVE</i></article>; }
function Param({ label, value, note }: { label: string; value: string; note: string }) { return <article><div><span>{label}</span><p>{note}</p></div><strong>{value}</strong></article>; }
function Module({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { if (await copyText(value)) { setCopied(true); window.setTimeout(() => setCopied(false), 1_500); } };
  return <article><span><i /> PROXY</span><h3>{label}</h3><code title={value}>{compact(value)}</code><div><button onClick={copy}>{copied ? "Copied" : "Copy address"}</button><a href={`https://sepolia.etherscan.io/address/${value}`} target="_blank" rel="noreferrer">Inspect ↗</a></div></article>;
}
