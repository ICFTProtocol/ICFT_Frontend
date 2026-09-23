"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./dapp.module.css";

const nav = [["Overview", "/dapp", "grid"], ["Positions", "/dapp/positions", "layers"], ["Markets", "/dapp/markets", "chart"], ["Market status", "/dapp/liquidity", "vault"], ["Activity", "/dapp/activity", "pulse"], ["Profile", "/dapp/profile", "user"]] as const;

export function DappNav() {
  const pathname = usePathname();
  return <nav>{nav.map(([name, href, icon]) => <Link aria-current={pathname === href ? "page" : undefined} className={pathname === href ? styles.current : ""} href={href} key={href}><Icon name={icon} /><span>{name}</span></Link>)}</nav>;
}

function Icon({ name }: { name: (typeof nav)[number][2] }) {
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "grid") return <svg {...common}><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="6" height="6" /></svg>;
  if (name === "layers") return <svg {...common}><path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" /><path d="m4 12 8 4.5 8-4.5" /><path d="m4 16.5 8 4.5 8-4.5" /></svg>;
  if (name === "chart") return <svg {...common}><path d="M4 19V5" /><path d="M4 19h16" /><path d="m7 15 4-4 3 2 5-6" /></svg>;
  if (name === "vault") return <svg {...common}><path d="M4 8h16v12H4z" /><path d="M7 8V5h10v3" /><path d="M9 13h6" /></svg>;
  if (name === "pulse") return <svg {...common}><path d="M3 12h4l2-5 4 10 2-5h6" /></svg>;
  return <svg {...common}><circle cx="12" cy="8" r="3.5" /><path d="M4.5 21c.7-4 3.1-6 7.5-6s6.8 2 7.5 6" /></svg>;
}
