"use client";
import { WalletButton as SharedWalletButton } from "../WalletButton";
import styles from "./dapp.module.css";
export function WalletButton(){return <SharedWalletButton className={styles.connect} />}
