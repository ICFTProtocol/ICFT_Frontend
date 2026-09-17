"use client";

import Link from "next/link";
import { useEffect } from "react";
import styles from "../system.module.css";

export default function DappError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("ICFT dApp error", error); }, [error]);
  return <main className={styles.dappPage}>
    <section className={styles.dappCard}><span>ICFT / DAPP UNAVAILABLE</span><h1>Connection needs<br /><em>another try.</em></h1><p>No transaction has been sent. Check your network and RPC connection, then reload the workspace.</p><div className={styles.actions}><button className="button primary" onClick={reset}>Reload workspace <b>↗</b></button><Link className={styles.secondary} href="/status">Check protocol status</Link></div></section>
  </main>;
}
