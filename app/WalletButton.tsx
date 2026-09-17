"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function WalletButton({className}:{className:string}){return <ConnectButton.Custom>{({account,chain,mounted,openAccountModal,openChainModal,openConnectModal})=>{if(!mounted||!account||!chain)return <button type="button" className={className} onClick={openConnectModal}>Connect wallet <b>↗</b></button>;if(chain.unsupported)return <button type="button" className={className} onClick={openChainModal}>Switch to Sepolia</button>;return <button type="button" className={className} onClick={openAccountModal}><span className="pulse" />{account.displayName}</button>}}</ConnectButton.Custom>}
