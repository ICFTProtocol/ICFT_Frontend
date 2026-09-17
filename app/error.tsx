"use client";

import Link from "next/link";
import { useEffect } from "react";
import styles from "./system.module.css";

export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Public ICFT route error", error); }, [error]);
  return <main className={styles.page}>
    <section className={`${styles.card} shell`}><span>ICFT / CONNECTION STATE</span><div className={styles.mark}>!</div><h1>That page could not<br /><em>finish loading.</em></h1><p>This can happen when an RPC provider, wallet dependency or network request is temporarily unavailable. No transaction was sent by this page.</p><div className={styles.actions}><button className="button primary" onClick={reset}>Try again <b>↗</b></button><Link className={styles.secondary} href="/status">View protocol status</Link></div></section>
  </main>;
}
