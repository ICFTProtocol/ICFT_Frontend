# ICFT Frontend Deployment

This guide deploys the ICFT frontend as an Ethereum Sepolia testnet demo. It is not a mainnet release procedure.

## Vercel

1. Import `ICFTProtocol/ICFT_Frontend` in Vercel.
2. Select `icft_front` as the project root only if deploying from a monorepo. For the standalone frontend repository, keep the repository root.
3. Let Vercel detect Next.js. The build command is `npm run build`.
4. Add the variables from `.env.example` to both Preview and Production. Every `NEXT_PUBLIC_*` value is browser-visible, so never add a private key, treasury secret, Etherscan secret, or backend operator key.
5. Set `NEXT_PUBLIC_SITE_URL` to the actual deployed URL, redeploy, then add that URL to the WalletConnect/Reown allowlist.
6. Open the Vercel URL with a clean Sepolia wallet. Confirm `/status`, wallet connection, deposit, borrow, repayment, and Etherscan links before sharing it.

## Required Environment Values

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_RPC_URL` | A reliable Ethereum Sepolia JSON-RPC URL. |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Public WalletConnect/Reown project ID for the ICFT frontend domain. |
| `NEXT_PUBLIC_CHAIN_ID` | `11155111` |
| `NEXT_PUBLIC_SITE_URL` | The Vercel production URL or custom demo domain. |
| `NEXT_PUBLIC_*_ADDRESS` | The deployed Sepolia addresses already listed in `.env.example`. |

## Release Gate

- `npm run build` passes.
- The current browser smoke-test record in `TESTING.md` is complete.
- The deployed Vercel URL is tested, not only `localhost`.
- The landing page and dApp visibly state that the system is testnet-only.
- No private key appears in Vercel environment variables, Git history, screenshots, or public documentation.

Vercel supports Git-connected preview deployments and production deployments from the configured production branch. See the official [Git deployment guide](https://vercel.com/docs/git) and [environment variable guide](https://vercel.com/docs/environment-variables).
