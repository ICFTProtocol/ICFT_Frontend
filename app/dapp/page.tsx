"use client";

import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import styles from "./prototype.module.css";
import flow from "./flow.module.css";
import transaction from "./transaction.module.css";
import { useProtocolData } from "./useProtocolData";
import { useProtocolActions } from "./useProtocolActions";

type Action = "Deposit" | "Borrow" | "Repay" | "Supply" | "Redeem" | "Withdraw";
type FlowStep = "entry" | "review" | "complete";

const markets = [
  { asset: "ETH", name: "Native Ether", price: "$2,448.00", ltv: "80%", apy: "4.9%", accent: "eth" },
  { asset: "wBTC", name: "Wrapped Bitcoin", price: "$77,896.37", ltv: "80%", apy: "5.4%", accent: "btc" },
  { asset: "wstETH", name: "Wrapped staked Ether", price: "$2,500.00", ltv: "80%", apy: "4.7%", accent: "steth" },
];

const copy: Record<Action, { title: string; description: string; button: string; assets: string[]; approval: boolean }> = {
  Deposit: { title: "Deposit collateral", description: "Add a supported asset to your collateral basket.", button: "Review deposit", assets: ["ETH", "wBTC", "wstETH"], approval: false },
  Borrow: { title: "Borrow ICFT", description: "Draw ICFT against your collateral while staying inside the protocol risk limits.", button: "Review borrow", assets: ["ICFT"], approval: false },
  Repay: { title: "Repay ICFT", description: "Reduce your debt and restore account health. Interest is repaid before principal.", button: "Review repayment", assets: ["ICFT"], approval: true },
  Supply: { title: "Supply liquidity", description: "Supply ICFT to the vault and mint icftLP receipt shares.", button: "Review supply", assets: ["ICFT"], approval: true },
  Redeem: { title: "Redeem LP shares", description: "Burn icftLP shares to withdraw your proportional ICFT from available pool liquidity.", button: "Review redemption", assets: ["icftLP"], approval: false },
  Withdraw: { title: "Withdraw collateral", description: "Withdraw only the amount that keeps your health factor above the liquidation threshold.", button: "Review withdrawal", assets: ["ETH", "wBTC", "wstETH"], approval: false },
};

export default function DappHome() {
  const data = useProtocolData();
  const tx = useProtocolActions();
  const [action, setAction] = useState<Action | null>(null);
  const [asset, setAsset] = useState("ETH");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<FlowStep>("entry");

  function openAction(next: Action, nextAsset = next === "Deposit" || next === "Withdraw" ? "ETH" : next === "Redeem" ? "icftLP" : "ICFT") {
    setAction(next); setAsset(nextAsset); setAmount(""); setStep("entry");
  }
  function closeAction() { setAction(null); setStep("entry"); }

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("action");
    const allowed: Action[] = ["Deposit", "Borrow", "Repay", "Supply", "Redeem", "Withdraw"];
    if (requested && allowed.includes(requested as Action)) openAction(requested as Action);
    // Query links only open a local preview. They never create a transaction.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actionCopy = action ? copy[action] : null;
  const requiresApproval = actionCopy?.approval || (action === "Deposit" && asset !== "ETH");
  const maxAmount = action === "Borrow" ? inputAmount(data.position.availableBorrow) : action === "Repay" ? inputAmount(data.position.fullRepayIcft) : action === "Supply" ? inputAmount(data.balances.icft) : action === "Redeem" ? inputAmount(data.balances.lp) : action === "Deposit" && asset === "ETH" ? inputAmount(data.balances.native) : action === "Deposit" && asset === "wBTC" ? inputAmount(data.balances.wbtc, 8) : action === "Deposit" ? inputAmount(data.balances.wsteth) : asset === "ETH" ? inputAmount(data.position.collateralNative) : asset === "wBTC" ? inputAmount(data.position.collateralWbtc, 8) : inputAmount(data.position.collateralWsteth);
  const livePrice = (market: string, fallback: string) => market === "ETH" ? usd(data.prices.eth) : market === "wBTC" ? usd(data.prices.wbtc) : market === "wstETH" ? usd(data.prices.wsteth) : fallback;
  async function confirmTransaction() {
    if (!action) return;
    if (await tx.submit(action, asset, amount)) setStep("complete");
  }

  return <>
    <section className={styles.stage}><div><span className={styles.liveDot} />{data.isError ? "SEPOLIA READ FAILED" : data.isLoading ? "SYNCING SEPOLIA" : "SEPOLIA LIVE"}</div><p>{data.isError ? "The RPC or an on-chain read is temporarily unavailable. No transaction has been sent. Retry the public reads before acting." : data.isConnected ? "Live protocol and wallet data refresh every 15 seconds. Review each transaction carefully before confirming." : "Protocol data is live. Connect a wallet to load your position and balances."}</p>{data.isError ? <button className={transaction.retry} onClick={() => void data.refresh()}>Retry reads ↻</button> : <a href="#workspace">See workspace <b>↓</b></a>}</section>
    {(tx.txHash || tx.pendingLabel || tx.error) && <section className={transaction.bar}><div><span>{tx.error ? "TRANSACTION NEEDS ATTENTION" : tx.pendingLabel ? "TRANSACTION IN PROGRESS" : "LAST CONFIRMED TRANSACTION"}</span><b>{tx.error ?? tx.pendingLabel ?? "Confirmed on Ethereum Sepolia."}</b></div>{tx.txHash && <a href={`https://sepolia.etherscan.io/tx/${tx.txHash}`} target="_blank" rel="noreferrer">View on Etherscan ↗</a>}<button onClick={() => { tx.clearError(); tx.clearTransaction(); }}>Dismiss</button></section>}
    <section className={styles.welcome} id="workspace"><div><span className={styles.eyebrow}>ICFT / CREDIT WORKSPACE</span><h2>Build a position<br /><em>with intent.</em></h2><p>Use collateral to access ICFT, manage your risk in one place, or provide liquidity to the protocol.</p></div><div className={styles.welcomeActions}><button className={styles.primary} onClick={() => openAction("Deposit")}>Deposit collateral <b>+</b></button><button className={styles.ghost} onClick={() => openAction("Supply")}>Supply ICFT <b>↗</b></button></div></section>

    <section className={styles.accountGrid}><article className={styles.positionCard}><div className={styles.cardTop}><div><span className={styles.eyebrow}>YOUR POSITION</span><strong>{data.isConnected ? compactAddress(data.address) : "Not connected"}</strong></div><span className={styles.status}>{data.position.liquidatable ? "AT RISK" : "READY"}</span></div><div className={styles.positionNumbers}><Metric label="Collateral" value={usd(data.position.collateralUsd)} foot={data.isConnected ? "Live oracle value" : "Connect wallet to load"} /><Metric label="Outstanding debt" value={usd(data.position.debtUsd)} foot={`Interest ${usd(data.position.accruedInterestUsd, 6)}`} /><Metric label="Available to borrow" value={token(data.position.availableBorrow)} foot="Capped by pool liquidity" /></div><div className={styles.healthLine}><span>Current LTV</span><div><i /><i /><i /><i /><i /></div><b>{data.position.debtUsd === 0n ? "0.0%" : bps(data.position.ltvBps)}</b></div></article><article className={styles.creditCard}><span className={styles.eyebrow}>PROTOCOL CREDIT LINE</span><div className={styles.creditValue}>{token(data.position.availableBorrow)}</div><p>Available credit is capped by collateral value, global risk parameters and available pool liquidity.</p><button onClick={() => openAction("Borrow")}>Open borrow flow <b>→</b></button></article></section>

    <section className={`${styles.actionStrip} ${flow.actionStrip}`} aria-label="Protocol actions"><ActionButton icon="+" title="Deposit" text="Add collateral" onClick={() => openAction("Deposit")} /><ActionButton icon="↗" title="Borrow" text="Draw ICFT credit" onClick={() => openAction("Borrow")} /><ActionButton icon="↓" title="Repay" text="Reduce debt" onClick={() => openAction("Repay")} /><ActionButton icon="◒" title="Supply" text="Mint icftLP shares" onClick={() => openAction("Supply")} /><ActionButton icon="↙" title="Redeem" text="Withdraw ICFT" onClick={() => openAction("Redeem")} /><ActionButton icon="−" title="Withdraw" text="Release collateral" onClick={() => openAction("Withdraw")} /></section>

    <section className={styles.contentGrid}><article className={styles.panel}><div className={styles.panelHead}><div><span className={styles.eyebrow}>COLLATERAL MARKETS</span><h3>Choose your backing.</h3></div><span className={flow.globalRisk}>GLOBAL RISK MODEL</span></div><div className={styles.marketHead}><span>ASSET</span><span>ORACLE PRICE</span><span>MAX LTV</span><span>BORROW APR</span><span /></div>{markets.map((market) => <div className={styles.marketRow} key={market.asset}><div className={styles.asset}><i className={styles[market.accent]}>{market.asset === "wstETH" ? "S" : market.asset[0]}</i><strong>{market.asset}<small>{market.name}</small></strong></div><b>{livePrice(market.asset, market.price)}</b><b>{market.ltv}</b><b>{market.apy}</b><button onClick={() => openAction("Deposit", market.asset)}>Deposit <span>→</span></button></div>)}</article><article className={`${styles.panel} ${styles.riskPanel}`}><span className={styles.eyebrow}>RISK GUIDE</span><h3>Keep margin<br /><em>on your side.</em></h3><div className={styles.riskRule}><b>80%</b><span>Maximum loan-to-value</span></div><div className={styles.riskRule}><b>90%</b><span>Liquidation threshold</span></div><div className={styles.riskRule}><b>5%</b><span>Liquidation incentive</span></div><button onClick={() => openAction("Deposit")}>See a position preview <b>→</b></button></article></section>

    <section className={styles.lowerGrid}><article className={`${styles.panel} ${styles.liquidity}`}><div className={styles.panelHead}><div><span className={styles.eyebrow}>LIQUIDITY DESK</span><h3>Put ICFT to work.</h3></div><span className={styles.status}>LP VAULT</span></div><div className={styles.liquidityNumbers}><Metric label="Pool assets" value={token(data.pool.lpAssets)} foot="Fund A + LP capital" /><Metric label="Pool utilization" value={bps(data.pool.utilizationBps)} foot={`${token(data.pool.availableLiquidity)} available`} /></div><div className={flow.liquidityActions}><button className={styles.primary} onClick={() => openAction("Supply")}>Supply ICFT <b>↗</b></button><button className={styles.ghost} onClick={() => openAction("Redeem")}>Redeem {token(data.balances.lp, 4, "icftLP")} <b>↙</b></button></div></article><article className={`${styles.panel} ${styles.activityPanel}`}><div className={styles.panelHead}><div><span className={styles.eyebrow}>WALLET BALANCES</span><h3>{data.isConnected ? token(data.balances.native, 4, "ETH") : "Connect a wallet."}</h3></div></div><div className={styles.activityEmpty}><span>◌</span><p>{data.isConnected ? `${token(data.balances.icft, 4)} · ${token(data.balances.wbtc, 4, "wBTC", 8)} · ${token(data.balances.wsteth, 4, "wstETH")}` : "Your ICFT and collateral balances will load here."}</p></div></article></section>

    {action && actionCopy && <div className={styles.backdrop} role="presentation" onMouseDown={closeAction}><section className={`${styles.modal} ${flow.modal}`} role="dialog" aria-modal="true" aria-labelledby="action-title" onMouseDown={(event) => event.stopPropagation()}><button className={styles.close} aria-label="Close" onClick={closeAction}>×</button><FlowIndicator step={step} /><span className={styles.eyebrow}>{step === "complete" ? "TRANSACTION CONFIRMED" : "TRANSACTION REVIEW"}</span><h2 id="action-title">{actionCopy.title}</h2>
      {step === "entry" && <><p>{actionCopy.description}</p><label>Asset<select value={asset} onChange={(event) => setAsset(event.target.value)}>{actionCopy.assets.map((item) => <option key={item}>{item}</option>)}</select></label><label>Amount<div className={styles.inputWrap}><input value={amount} inputMode="decimal" placeholder="0.00" onChange={(event) => setAmount(event.target.value)} /><button onClick={() => setAmount(maxAmount)}>MAX</button></div></label><FlowFacts action={action} asset={asset} approval={requiresApproval} minimumBorrowUsd={data.position.minimumBorrowUsd} /><button className={styles.primary} onClick={() => setStep("review")}>{actionCopy.button} <b>→</b></button></>}
      {step === "review" && <><p>Review the operation. Your wallet will be asked to sign only after you confirm.</p><div className={flow.review}><span>Action</span><b>{actionCopy.title}</b><span>Amount</span><b>{amount || "0.00"} {asset}</b><span>Network</span><b>Ethereum Sepolia</b><span>Approval</span><b>{requiresApproval ? "Required before protocol call" : "Not required"}</b></div>{requiresApproval && <div className={flow.approval}>The dApp will submit an ERC-20 approval, wait for its confirmation, then request the protocol transaction.</div>}{tx.error && <div className={flow.error}>{tx.error}</div>}<button className={styles.primary} disabled={Boolean(tx.pendingLabel)} onClick={() => void confirmTransaction()}>{tx.pendingLabel ?? (requiresApproval ? "Approve + confirm" : "Confirm transaction")} <b>→</b></button><button className={flow.back} disabled={Boolean(tx.pendingLabel)} onClick={() => setStep("entry")}>← Edit details</button></>}
      {step === "complete" && <div className={flow.complete}><i>✓</i><h3>Transaction confirmed.</h3><p>The transaction receipt was confirmed on Ethereum Sepolia. Live balances and protocol values will refresh automatically.</p>{tx.txHash && <a className={flow.txLink} href={`https://sepolia.etherscan.io/tx/${tx.txHash}`} target="_blank" rel="noreferrer">View on Etherscan ↗</a>}<button className={styles.primary} onClick={closeAction}>Done <b>→</b></button></div>}
      <small className={styles.modalFoot}>Testnet only. Verify the asset, amount and connected network before approving any wallet request.</small></section></div>}
  </>;
}

function FlowFacts({ action, asset, approval, minimumBorrowUsd }: { action: Action; asset: string; approval: boolean; minimumBorrowUsd: bigint }) { return <div className={flow.facts}><span>{action === "Borrow" ? "Minimum borrow" : action === "Redeem" ? "Available LP shares" : "Wallet balance"}</span><b>{action === "Borrow" ? usd(minimumBorrowUsd) : "Connect wallet to load"}</b><span>{action === "Withdraw" ? "Safety check" : "Approval"}</span><b>{action === "Withdraw" ? "LTV preview before confirmation" : approval ? `${asset} approval required` : "Not required"}</b></div>; }
function FlowIndicator({ step }: { step: FlowStep }) { const active = step === "entry" ? 1 : step === "review" ? 2 : 3; return <div className={flow.steps}>{["Details", "Review", "Result"].map((label, index) => <span className={index + 1 <= active ? flow.active : ""} key={label}><i>{index + 1}</i>{label}</span>)}</div>; }
function Metric({ label, value, foot }: { label: string; value: string; foot: string }) { return <div className={styles.metric}><span>{label}</span><strong>{value}</strong><small>{foot}</small></div>; }
function ActionButton({ icon, title, text, onClick }: { icon: string; title: string; text: string; onClick: () => void }) { return <button className={styles.action} onClick={onClick}><i>{icon}</i><strong>{title}<small>{text}</small></strong><b>→</b></button>; }
function token(value: bigint, fraction = 2, symbol = "ICFT", decimals = 18) { return `${formatAmount(value, fraction, decimals)} ${symbol}`; }
function usd(value: bigint, fraction = 2) { return `$${formatAmount(value, fraction)}`; }
function bps(value: bigint) { return `${(Number(value) / 100).toFixed(1)}%`; }
function formatAmount(value: bigint, fraction = 2, decimals = 18) { const number = Number(formatUnits(value, decimals)); return new Intl.NumberFormat("en-US", { maximumFractionDigits: fraction, minimumFractionDigits: 0 }).format(number); }
function inputAmount(value: bigint, decimals = 18) { return formatUnits(value, decimals); }
function compactAddress(address?: string) { return address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Not connected"; }
