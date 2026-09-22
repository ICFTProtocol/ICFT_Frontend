# ICFT Frontend

Public website and Ethereum Sepolia dApp for the ICFT collateralized lending protocol.

> **Testnet only.** Do not use mainnet funds, a production wallet, a seed phrase, or a private key with this interface.

## Included

- Public product pages: onboarding, protocol, tokenomics, risk, roadmap, FAQ, status, and legal notices.
- Wallet connection through RainbowKit, Wagmi, and WalletConnect/Reown.
- Live Sepolia reads and dApp flows for collateral, borrowing, repayment, and ICFT liquidity.
- Transaction feedback, Etherscan links, RPC failure states, sitemap, and metadata.

## Quick Start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

Every `NEXT_PUBLIC_*` value is exposed to the browser. Never put a private key, seed phrase, or API secret in this project.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Run the production build and type validation. |
| `npm run start` | Serve a completed production build. |
| `npm run lint` | Run the configured Next.js lint command. |

## Project Map

| Path | Purpose |
| --- | --- |
| `app/page.tsx` | Public lending landing page. |
| `app/dapp/` | Wallet-connected Sepolia workspace and transaction flows. |
| `app/status/` | Live protocol metrics and configured proxy addresses. |
| `app/faq/`, `app/how-it-works/`, `app/start/` | User education and onboarding. |
| `app/tokenomics/`, `app/risk/`, `app/roadmap/`, `app/about/` | Product and protocol context. |
| `app/legal/` | Testnet terms, privacy notice, and testnet notice. |
| `app/sitemap.ts`, `app/robots.ts` | Search-engine metadata routes. |
| `lib/protocol.ts` | Browser-visible Sepolia addresses and minimal ABIs. |
| `TESTING.md` | Manual smoke-test matrix. |

Read [ARCHITECTURE.md](ARCHITECTURE.md) before changing dApp behavior and [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.
For a public testnet release, follow [DEPLOYMENT.md](DEPLOYMENT.md). Give non-technical testers [INVESTOR_TEST_GUIDE.md](INVESTOR_TEST_GUIDE.md).

## Environment

Start from `.env.example`.

- `NEXT_PUBLIC_SITE_URL`: local, preview, or production frontend URL.
- `NEXT_PUBLIC_RPC_URL`: Ethereum Sepolia JSON-RPC endpoint.
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: WalletConnect/Reown project ID.
- `NEXT_PUBLIC_*_ADDRESS`: deployed Sepolia contract and collateral addresses.

After a public deployment, add the domain to the WalletConnect/Reown project configuration. Otherwise wallet connection can fail on the deployed site.

## Deployment Scope

This frontend may be deployed as a **public testnet MVP** after `npm run build` passes and public environment values are configured. It is not a mainnet or production financial application.

## License

GPL-3.0-only. Add the repository `LICENSE` file before the initial frontend push.
