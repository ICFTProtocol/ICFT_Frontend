import Link from "next/link";
import styles from "./system.module.css";

export default function NotFound() {
  return <main className={styles.page}>
    <section className={`${styles.card} shell`}><span>ICFT / 404</span><div className={styles.mark}>+</div><h1>This route is<br /><em>not on the map.</em></h1><p>The address may be outdated, mistyped, or not part of the public ICFT interface.</p><div className={styles.actions}><Link className="button primary" href="/">Back to site <b>↗</b></Link><Link className={styles.secondary} href="/status">Check protocol status</Link></div></section>
  </main>;
}
