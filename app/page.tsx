"use client";

import { useEffect, useState } from "react";
import { createWalletClient, custom, formatUnits, parseEther, type Address } from "viem";
import { publicClient, protocol, erc20Abi, lendingPoolAbi, oracleAbi } from "../lib/protocol";
import { copyText } from "../lib/copy";
import { WalletButton } from "./WalletButton";
import { useProtocolData } from "./dapp/useProtocolData";

type WalletState = { address?: Address; connected: boolean };
type Metrics = { liquidity: bigint; utilization: bigint; ethPrice: bigint };
type Position = { debt: bigint; ltv: bigint; collateral: bigint; availableBorrow: bigint; icft: bigint };

const zeroMetrics: Metrics = { liquidity: 0n, utilization: 0n, ethPrice: 0n };
const zeroPosition: Position = { debt: 0n, ltv: 0n, collateral: 0n, availableBorrow: 0n, icft: 0n };
const short = (value?: string) => value ? `${value.slice(0, 6)}...${value.slice(-4)}` : "Connect wallet";
const compact = (value: bigint, digits = 2) => Number(formatUnits(value, 18)).toLocaleString("en-US", { maximumFractionDigits: digits });
const usd = (value: bigint) => `$${compact(value)}`;

function Glyph({ children }: { children: React.ReactNode }) { return <span className="glyph">{children}</span>; }

export default function Home() {
  const live = useProtocolData();
  const [wallet, setWallet] = useState<WalletState>({ connected: false });
  const [metrics, setMetrics] = useState<Metrics>(zeroMetrics);
  const [position, setPosition] = useState<Position>(zeroPosition);
  const [tab, setTab] = useState<"borrow" | "repay">("borrow");
  const [amount, setAmount] = useState("");
  const [notice, setNotice] = useState("Sepolia testnet. Never use mainnet funds here.");
  const [busy, setBusy] = useState(false);

  const refresh = async (account = wallet.address) => {
    try {
      const [liquidity, utilization, ethPrice] = await Promise.all([
        publicClient.readContract({ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "getAvailableLiquidity" }),
        publicClient.readContract({ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "getUtilization" }),
        publicClient.readContract({ address: protocol.oracle, abi: oracleAbi, functionName: "getETHUSDPrice" })
      ]);
      setMetrics({ liquidity, utilization, ethPrice });
      if (!account) return;
      const [debt, ltv, collateral, availableBorrow, icft] = await Promise.all([
        publicClient.readContract({ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "getDebt", args: [account] }),
        publicClient.readContract({ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "getLTV", args: [account] }),
        publicClient.readContract({ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "getCollateralValueUSD", args: [account] }),
        publicClient.readContract({ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "getAvailableBorrow", args: [account] }),
        publicClient.readContract({ address: protocol.icft, abi: erc20Abi, functionName: "balanceOf", args: [account] })
      ]);
      setPosition({ debt, ltv, collateral, availableBorrow, icft });
    } catch {
      setNotice("RPC is temporarily unavailable. Your wallet can still be connected; try Refresh shortly.");
    }
  };

  useEffect(() => { refresh(); const timer = window.setInterval(() => refresh(), 20_000); return () => window.clearInterval(timer); }, []);

  const connect = async () => {
    const ethereum = window.ethereum;
    if (!ethereum) { setNotice("Install MetaMask, Rabby, or another EIP-1193 wallet to continue."); return; }
    try {
      const walletClient = createWalletClient({ chain: protocol.chain, transport: custom(ethereum) });
      const [address] = await walletClient.requestAddresses();
      await walletClient.switchChain({ id: protocol.chain.id });
      setWallet({ address, connected: true });
      setNotice(`Connected ${short(address)} on Sepolia.`);
      refresh(address);
    } catch { setNotice("Wallet connection was cancelled or Sepolia was not approved."); }
  };

  const transact = async () => {
    if (!wallet.address || !window.ethereum) { await connect(); return; }
    if (!amount || Number(amount) <= 0) { setNotice("Enter an amount greater than zero."); return; }
    setBusy(true);
    try {
      const walletClient = createWalletClient({ account: wallet.address, chain: protocol.chain, transport: custom(window.ethereum) });
      const value = parseEther(amount);
      let hash: `0x${string}`;
      if (tab === "borrow") {
        hash = await walletClient.writeContract({ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "borrow", args: [value] });
      } else {
        setNotice("Approve ICFT in your wallet, then confirm repayment.");
        const approval = await walletClient.writeContract({ address: protocol.icft, abi: erc20Abi, functionName: "approve", args: [protocol.lendingPool, value] });
        await publicClient.waitForTransactionReceipt({ hash: approval });
        hash = await walletClient.writeContract({ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "repay", args: [value] });
      }
      setNotice("Transaction submitted. Waiting for Sepolia confirmation...");
      await publicClient.waitForTransactionReceipt({ hash });
      setAmount("");
      setNotice("Confirmed on Sepolia. Balances are refreshed.");
      refresh();
    } catch (error) {
      const message = error instanceof Error
        ? ((error as Error & { shortMessage?: string }).shortMessage ?? error.message)
        : "Transaction was rejected.";
      setNotice(message.slice(0, 180));
    } finally { setBusy(false); }
  };

  const depositEth = async () => {
    if (!wallet.address || !window.ethereum) { await connect(); return; }
    if (!amount || Number(amount) <= 0) { setNotice("Enter ETH collateral amount first."); return; }
    setBusy(true);
    try {
      const client = createWalletClient({ account: wallet.address, chain: protocol.chain, transport: custom(window.ethereum) });
      const hash = await client.writeContract({ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "depositCollateral", value: parseEther(amount) });
      await publicClient.waitForTransactionReceipt({ hash });
      setAmount(""); setNotice("ETH collateral deposited and position refreshed."); refresh();
    } catch { setNotice("Collateral deposit was rejected or failed."); } finally { setBusy(false); }
  };

  return <main>
    <nav className="nav shell">
      <a className="brand" href="#top"><span>ICFT</span><i>+</i></a>
      <div className="navlinks"><a href="/dapp">dApp</a><a href="#lending">Lending</a><a href="/how-it-works">Protocol</a><a href="/tokenomics">Token</a><a href="/faq">FAQ</a></div>
      <a className="wallet" href="/dapp">Open dApp ↗</a>
    </nav>

    <section className="hero shell" id="top">
      <div className="eyebrow"><span /> SEPOLIA / EARLY ACCESS</div>
      <h1>Credit should feel<br /><em>inevitable.</em></h1>
      <p className="heroCopy">Borrow ICFT against on-chain collateral from a protocol-owned credit reserve. Transparent math. No black box.</p>
      <div className="heroActions"><a className="button primary" href="/dapp">Open dApp <b>↗</b></a><a className="button ghost" href="/how-it-works">How it works</a></div>
      <div className="logoSatellite" aria-hidden="true"><span>+</span><i>ICFT</i><b>SEP<br />26</b></div>
      <div className="orb orbOne" /><div className="orb orbTwo" />
      <div className="marketTape"><span>ICFT / USD <strong>{usd(live.prices.icft)}</strong></span><span>ETH / USD <strong>{usd(live.prices.eth)}</strong></span><span>NETWORK <strong>SEPOLIA</strong></span></div>
    </section>

    <section className="stats shell" aria-label="Pool metrics">
      <Metric label="Credit reserve" value={`${compact(live.pool.availableLiquidity, 0)} ICFT`} foot="Available to borrow" />
      <Metric label="Reserve utilization" value={`${Number(live.pool.utilizationBps) / 100}%`} foot="Borrowed inventory" />
      <Metric label="Market venue" value="Not live" foot="No official Sepolia pair" />
      <Metric label="Network" value="Sepolia" foot="Early testnet baseline" />
    </section>

    <section className="assets shell" id="assets"><div className="sectionTitle"><div><span className="kicker">00 / COLLATERAL MATRIX</span><h2>Choose your backing.</h2></div><a className="textLink" href="#lending">Open position ↓</a></div><div className="assetTable"><div className="assetHead"><span>Asset</span><span>Price source</span><span>Max LTV</span><span>State</span><span /></div><Asset symbol="ETH" name="Native Ether" source="PriceOracle / Chainlink" ltv={`${Number(live.risk.maxLtvBps) / 100}%`} state={live.prices.eth > 0n ? "Live" : "Syncing"} /><Asset symbol="wBTC" name="Wrapped Bitcoin" source="PriceOracle / Chainlink" ltv={`${Number(live.risk.maxLtvBps) / 100}%`} state={live.prices.wbtc > 0n ? "Live" : "Syncing"} /><Asset symbol="wstETH" name="Wrapped staked Ether" source="PriceOracle / Chainlink" ltv={`${Number(live.risk.maxLtvBps) / 100}%`} state={live.prices.wsteth > 0n ? "Live" : "Syncing"} /></div></section>

    <section className="workspace shell" id="lending">
      <div className="sectionTitle"><div><span className="kicker">01 / LENDING</span><h2>Build your position.</h2></div><button className="refresh" onClick={() => refresh()}>Refresh data ↻</button></div>
      <div className="grid">
        <article className="positionCard" id="positions">
          <div className="cardTop"><span>YOUR POSITION</span><span className={position.debt > 0n ? "status active" : "status"}>{position.debt > 0n ? "ACTIVE" : "READY"}</span></div>
          <div className="health"><div><small>Health status</small><strong>{position.debt === 0n ? "No debt" : `${(100 - Number(position.ltv) / 100).toFixed(1)}% headroom`}</strong></div><div className="ring"><b>{Number(position.ltv) / 100}%</b><span>LTV</span></div></div>
          <div className="positionRows"><Row label="Collateral value" value={usd(position.collateral)} /><Row label="Outstanding debt" value={usd(position.debt)} /><Row label="Available to borrow" value={`${compact(position.availableBorrow)} ICFT`} /><Row label="ICFT wallet balance" value={`${compact(position.icft)} ICFT`} /></div>
          <p className="riskNote"><Glyph>!</Glyph> Borrowing is limited to 80% LTV. Liquidation threshold is 90%. Testnet parameters may change.</p>
        </article>

        <article className="actionCard">
          <div className="tabs">{(["borrow", "repay"] as const).map((item) => <button key={item} className={tab === item ? "selected" : ""} onClick={() => { setTab(item); setAmount(""); }}>{item}</button>)}</div>
          <div className="actionBody">
            <p className="actionTitle">{tab === "borrow" ? "Borrow against collateral" : "Close debt, restore headroom"}</p>
            <div className="amountField"><input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" placeholder="0.00" /><span>ICFT</span></div>
            <button className="max" onClick={() => setAmount(tab === "borrow" ? compact(position.availableBorrow, 6) : compact(position.icft, 6))}>Use available balance</button>
            <div className="preview"><Row label="Credit reserve" value={`${compact(live.pool.availableLiquidity, 0)} ICFT`} /><Row label="Minimum borrow" value="100 ICFT" /></div>
            <a className="button primary wide landingDapp" href="/dapp">Open dApp to continue <b>↗</b></a>
          </div>
          <div className="collateralBar"><div><span>Collateral</span><strong>ETH</strong></div><a href="/dapp">Deposit in dApp <b>+</b></a></div>
        </article>
      </div>
      <p className="notice"><Glyph>i</Glyph>{notice}</p>
    </section>

    <section className="protocol shell" id="protocol"><div className="protocolHeading"><span className="kicker">02 / THE SYSTEM</span><h2>One reserve.<br />Clear incentives.</h2></div><div className="flow"><Flow number="01" title="Deposit collateral" body="ETH, wBTC and wstETH form a single collateral basket." /><Flow number="02" title="Borrow ICFT" body="Debt is USD-denominated and interest accrues through a global index." /><Flow number="03" title="Repay ICFT" body="Repaid principal returns to protocol credit inventory; interest follows the protocol reserve policy." /><Flow number="04" title="Keep the system whole" body="Liquidations protect the protocol reserve; insurance absorbs bad debt under the configured rules." /></div></section>

    <section className="control shell"><div className="controlIntro"><span className="kicker">PROTOCOL CONTROL ROOM</span><h2>Verify before<br />you sign.</h2><p>Every address below belongs to the active Sepolia baseline. Inspect contracts, validate your network, then interact in the dedicated dApp.</p><a className="button primary" href="/dapp">Open dApp <b>↗</b></a></div><div className="addressList"><AddressRow label="Lending Pool" value={protocol.lendingPool} /><AddressRow label="ICFT token" value={protocol.icft} /><AddressRow label="Price Oracle" value={protocol.oracle} /><div className="checklist"><span>BEFORE YOU START</span><label><input type="checkbox" /> I am using a testnet-only wallet</label><label><input type="checkbox" /> I understand this is not mainnet</label><label><input type="checkbox" /> I will not share a seed phrase</label></div></div></section>

    <section className="ctaBand shell"><span>READY TO TEST THE PROTOCOL?</span><h2>Collateral in.<br /><em>Credit out.</em></h2><div><p>Start with a small Sepolia ETH collateral deposit. The interface will guide every wallet confirmation.</p><a className="button primary" href="#lending">Start lending <b>↗</b></a></div></section>

    <section className="faq shell" id="faq"><div><span className="kicker">03 / FIELD NOTES</span><h2>Questions, answered.</h2><a className="textLink" href="/faq">Browse all FAQ ↗</a></div><div className="faqList"><Faq q="Is this mainnet?" a="No. This interface points to Ethereum Sepolia. It is an engineering baseline for testing only." /><Faq q="Which collateral is supported?" a="The current testnet pool supports native ETH, wBTC and wstETH through the configured collateral registry." /><Faq q="How is borrowing interest calculated?" a="Debt is denominated in USD and accrues through the LendingPool global borrow index. The rate model responds to pool utilization, so the rate is not fixed when a loan is opened." /><Faq q="Can I withdraw collateral at any time?" a="Yes, only when the withdrawal keeps your position below the configured maximum LTV. Repay debt or add collateral first if the requested withdrawal would make the position unsafe." /><Faq q="Can I buy or sell ICFT here?" a="No official exchange route is configured in this testnet interface. Market data and verified buy or sell links will only be shown after an official trading venue is published." /><Faq q="What should I do before testing?" a="Use a Sepolia-only wallet. Never enter a seed phrase and never send mainnet assets to testnet contracts." /></div></section>

  </main>;
}

function Metric({ label, value, foot }: { label: string; value: string; foot: string }) { return <article><span>{label}</span><strong>{value}</strong><small>{foot}</small></article>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="row"><span>{label}</span><b>{value}</b></div>; }
function Flow({ number, title, body }: { number: string; title: string; body: string }) { return <article><span>{number}</span><h3>{title}</h3><p>{body}</p></article>; }
function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return <div className={`faqItem ${open ? "open" : ""}`}><button onClick={() => setOpen(!open)} aria-expanded={open}>{q}<b>+</b></button><div className="faqAnswer"><p>{a}</p></div></div>;
}
function Asset({ symbol, name, source, ltv, state }: { symbol:string;name:string;source:string;ltv:string;state:string }) { return <div className="assetRow"><div><b className="coin">{symbol.slice(0,1)}</b><span><strong>{symbol}</strong><small>{name}</small></span></div><span>{source}</span><b>{ltv}</b><em>{state}</em><a href="#lending">Deposit ↗</a></div>; }
function AddressRow({ label, value }: { label:string;value:string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { if (await copyText(value)) { setCopied(true); window.setTimeout(() => setCopied(false), 1_500); } };
  return <div className="addressRow"><span>{label}</span><code>{short(value)}</code><button onClick={copy}>{copied ? "Copied" : "Copy"}</button></div>;
}
