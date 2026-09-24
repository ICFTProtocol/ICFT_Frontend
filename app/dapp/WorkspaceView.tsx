"use client";

import Link from "next/link";
import { useState } from "react";
import { formatUnits } from "viem";
import { useBlockNumber } from "wagmi";
import { WalletButton } from "../WalletButton";
import styles from "./dapp.module.css";
import ui from "./workspace.module.css";
import { useProtocolData } from "./useProtocolData";
import { useWalletActivity } from "./useWalletActivity";

const assetMeta = [{ id: "ETH", name: "Native Ether" }, { id: "wBTC", name: "Wrapped Bitcoin" }, { id: "wstETH", name: "Wrapped staked Ether" }];

export function WorkspaceView({ view }: { view: string }) {
  const data = useProtocolData();
  const activity = useWalletActivity(data.address);
  const block = useBlockNumber({ watch: true });
  const [usdDisplay, setUsdDisplay] = useState(true);
  const [riskAlerts, setRiskAlerts] = useState(true);
  const connected = data.isConnected;
  const maxLtv = bps(data.risk.maxLtvBps);
  const liquidation = bps(data.risk.liquidationThresholdBps);
  const apr = bps(data.risk.borrowRateBps);
  const action = (name: string) => `/dapp?action=${name}`;

  if (view === "positions") return <Page title="Your positions" sub={connected ? "Live account state from Ethereum Sepolia" : "Connect your Sepolia wallet to load a position"}>
    <section className={ui.overviewGrid}><Stat label="Total collateral" value={usd(data.position.collateralUsd)} detail="Live oracle value" /><Stat label="Outstanding debt" value={usd(data.position.debtUsd)} detail={`Interest ${usd(data.position.accruedInterestUsd, 6)}`} /><Stat label="Current LTV" value={data.position.debtUsd === 0n ? "0.0%" : bps(data.position.ltvBps)} detail={data.position.liquidatable ? "Liquidation eligible" : `Threshold ${liquidation}`} /></section>
    <section className={ui.card}><div className={ui.cardHead}><div><span>COLLATERAL BASKET</span><h3>{connected ? "Your deposited assets" : "Wallet not connected"}</h3></div><Link className={styles.mainButton} href={action("Deposit")}>Deposit collateral →</Link></div><AssetLine asset="ETH" value={amount(data.position.collateralNative)} detail={usd(data.prices.eth)} /><AssetLine asset="wBTC" value={amount(data.position.collateralWbtc, 8)} detail={usd(data.prices.wbtc)} /><AssetLine asset="wstETH" value={amount(data.position.collateralWsteth)} detail={usd(data.prices.wsteth)} /></section>
    <section className={ui.card}><div className={ui.cardHead}><div><span>DEBT MANAGEMENT</span><h3>Live borrowing controls</h3></div><b>{amount(data.position.availableBorrow)} ICFT available</b></div><div className={ui.actionCards}><Action title="Borrow ICFT" text={`Current model APR ${apr}.`} href={action("Borrow")} icon="↗" /><Action title="Repay debt" text="Uses an exact full-repay MAX." href={action("Repay")} icon="↓" /><Action title="Withdraw" text="Contract verifies post-withdraw LTV." href={action("Withdraw")} icon="−" /></div></section>
  </Page>;

  if (view === "markets") return <Page title="Collateral markets" sub="Live prices and protocol parameters from Sepolia">
    <section className={ui.card}><div className={ui.tableHeader}><span>ASSET</span><span>ORACLE PRICE</span><span>MAX LTV</span><span>LIQ. THRESHOLD</span><span>BORROW APR</span><span /></div>{assetMeta.map(({ id, name }) => <div className={ui.tableRow} key={id}><div className={ui.asset}><i>{id === "wstETH" ? "S" : id[0]}</i><b>{id}<small>{name}</small></b></div><b>{usd(priceFor(data, id))}</b><b>{maxLtv}</b><b>{liquidation}</b><div><b>{apr}</b><small>Rate model</small></div><Link href={action("Deposit")}>Deposit →</Link></div>)}</section>
    <section className={ui.callout}><b>Global risk model</b><p>Current Solidity applies the same max LTV and liquidation threshold to every supported collateral asset. Values above are read from RiskEngine, not hard-coded in the UI.</p></section>
  </Page>;

  if (view === "liquidity") return <Page title="Market status" sub="Market information and the protocol-owned credit reserve are separate concepts">
    <section className={ui.overviewGrid}><Stat label="Market venue" value="Not live" detail="No official Sepolia DEX or CEX pair" /><Stat label="Market cap" value="Not available" detail="Requires an official market price" /><Stat label="Credit reserve" value={`${amount(data.pool.availableLiquidity)} ICFT`} detail="Protocol inventory available to borrow" /></section>
    <section className={ui.split}><article className={ui.card}><div className={ui.cardHead}><div><span>MARKET LIQUIDITY</span><h3>Buy and sell routes are not live.</h3></div><span className={ui.pill}>TESTNET</span></div><p className={ui.copy}>ICFT does not currently expose an official exchange pair through this interface. The whitepaper market model pairs protocol-provided ICFT with external LP-provided USDT; this is market infrastructure, not public LendingPool credit liquidity. Do not rely on unofficial pools, token listings or prices. Once an official venue is approved, this page will publish the verified route, pair address, liquidity depth and repayment guidance.</p></article><article className={`${ui.card} ${ui.allocation}`}><span>PROTOCOL CREDIT RESERVE</span><div><b>{amount(data.pool.availableLiquidity, 0)}</b><p>ICFT currently available for borrowing</p></div><div><b>{bps(data.pool.utilizationBps)}</b><p>Current reserve utilization</p></div><small>This reserve is protocol-owned credit inventory. It is not a public LP product and does not offer user supply or redemption actions.</small></article></section>
  </Page>;

  if (view === "activity") return <Page title="Activity ledger" sub="On-chain events emitted for the connected wallet">
    <section className={ui.card}><div className={ui.feedToolbar}><div><button className={ui.selected}>Your events</button></div><span>SEPOLIA BLOCK {block.data?.toString() ?? "…"}</span></div>{!connected && <div className={ui.emptyState}><i>⌁</i><div><b>Connect a wallet to read its events</b><p>Activity is loaded directly from LendingPool logs on Sepolia.</p></div></div>}{connected && activity.loading && <div className={ui.emptyState}><i>…</i><div><b>Reading protocol events</b><p>Loading collateral, borrow and repayment logs from Sepolia.</p></div></div>}{connected && !activity.loading && activity.items.length === 0 && <div className={ui.emptyState}><i>⌁</i><div><b>No ICFT events for this wallet</b><p>Your confirmed protocol operations will appear here directly from emitted contract events.</p></div></div>}{activity.items.map((item) => <Feed key={item.id} title={item.title} value={item.amount} detail={`${item.detail} · block ${item.block.toString()}`} ok={item.ok} />)}</section>
    <section className={ui.callout}><b>Live protocol state</b><p>Available liquidity: {amount(data.pool.availableLiquidity)} ICFT. Oracle ETH price: {usd(data.prices.eth)}. This state refreshes every 15 seconds.</p></section>
  </Page>;

  return <Page title="Profile & settings" sub="Connected wallet, network state and local display preferences">
    <section className={ui.profile}><article className={ui.profileIdentity}><i>+</i><div><span>WALLET</span><h3>{connected ? compact(data.address) : "Not connected"}</h3><p>{connected ? "Wallet reads are active on Ethereum Sepolia." : "Use Connect wallet in the top-right corner to load your protocol data."}</p></div>{connected ? <Link className={styles.mainButton} href="/dapp">Open action center →</Link> : <WalletButton className={styles.mainButton} />}</article><section className={ui.overviewGrid}><Stat label="Network" value="Sepolia" detail="Chain ID 11155111" /><Stat label="ICFT balance" value={amount(data.balances.icft)} detail="Wallet token balance" /><Stat label="Credit reserve" value={amount(data.pool.availableLiquidity, 0)} detail="Protocol-owned inventory" /></section><article className={ui.card}><div className={ui.cardHead}><div><span>DISPLAY PREFERENCES</span><h3>Workspace settings</h3></div></div><div className={ui.settings}><Toggle title="Show balances in USD" text="Show oracle-denominated values alongside token amounts." checked={usdDisplay} onChange={setUsdDisplay} /><Toggle title="Risk notifications" text="Highlight liquidation eligibility in the position view." checked={riskAlerts} onChange={setRiskAlerts} /><Toggle title="Auto-refresh RPC data" text="Protocol reads refresh every 15 seconds while the dApp is open." checked onChange={() => undefined} disabled /></div></article></section>
  </Page>;
}

function Page({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) { return <section className={ui.view}><div className={ui.viewHead}><div><span>ICFT / WORKSPACE</span><h2>{title}</h2><p>{sub}</p></div><Link className={styles.connect} href="/dapp">Action center ↗</Link></div>{children}</section>; }
function Stat({ label, value, detail }: { label: string; value: string; detail: string }) { return <article className={ui.stat}><span>{label}</span><b>{value}</b><small>{detail}</small></article>; }
function Action({ icon, title, text, href }: { icon: string; title: string; text: string; href: string }) { return <Link className={ui.actionCard} href={href}><i>{icon}</i><b>{title}<small>{text}</small></b><span>→</span></Link>; }
function AssetLine({ asset, value, detail }: { asset: string; value: string; detail: string }) { return <div className={ui.tableRow}><div className={ui.asset}><i>{asset === "wstETH" ? "S" : asset[0]}</i><b>{asset}<small>Deposited collateral</small></b></div><b>{value}</b><div /><div><b>{detail}</b><small>Live oracle price</small></div></div>; }
function Feed({ title, value, detail, ok }: { title: string; value: string; detail: string; ok: boolean }) { return <article className={ui.feed}><i className={ok ? ui.success : ""}>{ok ? "✓" : "!"}</i><div><b>{title}<small>{detail}</small></b></div><strong>{value}</strong></article>; }
function Toggle({ title, text, checked, onChange, disabled = false }: { title: string; text: string; checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) { return <label className={ui.toggle}><div><b>{title}</b><p>{text}</p></div><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} disabled={disabled} /><span /></label>; }
function priceFor(data: ReturnType<typeof useProtocolData>, asset: string) { return asset === "ETH" ? data.prices.eth : asset === "wBTC" ? data.prices.wbtc : data.prices.wsteth; }
function amount(value: bigint, decimals = 18) { return new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(Number(formatUnits(value, decimals))); }
function usd(value: bigint, fraction = 2) { return `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: fraction }).format(Number(formatUnits(value, 18)))}`; }
function bps(value: bigint) { return `${(Number(value) / 100).toFixed(1)}%`; }
function compact(address?: string) { return address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Not connected"; }
