import Link from "next/link";
import styles from "./legal.module.css";

export function LegalShell({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: React.ReactNode }) {
  return <main className={styles.page}>
    <nav className={`${styles.nav} shell`}><Link href="/" className="brand"><span>ICFT</span><i>+</i></Link><div className={styles.links}><Link href="/start">Get started</Link><Link href="/risk">Risk</Link><Link href="/status">Status</Link></div><Link className={styles.return} href="/">Back to site ↖</Link></nav>
    <section className={`${styles.hero} shell`}><span className="kicker">ICFT / LEGAL</span><h1>{title}</h1><p>{intro}</p><small>Last updated: September 17, 2026 · Early-stage Ethereum Sepolia baseline</small></section>
    <div className={`${styles.layout} shell`}><aside><span>ON THIS PAGE</span><Link href="/legal/terms">Terms of use</Link><Link href="/legal/privacy">Privacy notice</Link><Link href="/legal/testnet">Testnet notice</Link><Link href="/risk">Risk & security</Link></aside><article className={styles.content}>{children}</article></div>
  </main>;
}
