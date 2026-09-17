"use client";
import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, connectorsForWallets } from "@rainbow-me/rainbowkit";
import { coinbaseWallet, injectedWallet, metaMaskWallet, rabbyWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
const projectId=process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID??"REPLACE_WITH_WALLETCONNECT_PROJECT_ID";
const connectors=connectorsForWallets([{groupName:"Recommended",wallets:[metaMaskWallet,rabbyWallet,coinbaseWallet,walletConnectWallet,injectedWallet]}],{appName:"ICFT",projectId});
const config=createConfig({chains:[sepolia],connectors,transports:{[sepolia.id]:http(process.env.NEXT_PUBLIC_RPC_URL??"https://ethereum-sepolia-rpc.publicnode.com")},ssr:false});
const queryClient=new QueryClient();
export function Providers({children}:{children:React.ReactNode}){return <WagmiProvider config={config}><QueryClientProvider client={queryClient}><RainbowKitProvider>{children}</RainbowKitProvider></QueryClientProvider></WagmiProvider>}
