# ICFT Frontend Smoke Test

Use a dedicated Ethereum Sepolia wallet. Never use a wallet containing mainnet funds.

## Preconditions

- `npm run build` succeeds.
- `NEXT_PUBLIC_RPC_URL` responds to Sepolia requests.
- The connected wallet is on chain ID `11155111` and has Sepolia ETH for gas.
- Confirm `/status` loads non-zero oracle prices and the expected proxy addresses.

## Public Interface

1. Open `/`, `/start`, `/how-it-works`, `/tokenomics`, `/risk`, `/roadmap`, `/about`, `/faq`, and `/status` on desktop and a narrow mobile viewport.
2. Confirm all public pages show the shared footer; `/dapp` must not.
3. On `/status`, copy each proxy address and compare it with the linked Sepolia Etherscan page.
4. Temporarily use an invalid `NEXT_PUBLIC_RPC_URL`, reload `/dapp`, and confirm the `SEPOLIA READ FAILED` state and retry button appear. Restore the valid RPC afterward.
5. Open a nonexistent route and confirm the ICFT `404` screen appears.

## Wallet and Transaction Flow

1. Connect: choose MetaMask, Rabby, Coinbase Wallet, or WalletConnect. Reject the request once and confirm the UI remains usable; then connect successfully on Sepolia.
2. Deposit ETH: open `Deposit`, select `ETH`, enter a small amount, review, sign, wait for confirmation, and open the Etherscan transaction link.
3. Borrow: after collateral is confirmed, borrow an amount below displayed capacity. Confirm ICFT balance, debt, LTV and Activity update.
4. Repay: select `Repay`, use a partial amount or `MAX`, approve ICFT, then confirm repayment. Verify the approval and repayment hashes in Etherscan.
5. Withdraw ETH: withdraw a small safe amount. Verify the wallet balance and collateral balance change. Attempting an unsafe withdrawal must revert rather than bypass LTV checks.
6. Deposit ERC-20 collateral: for wBTC and wstETH, approve then deposit a small test amount. Confirm both the approval and deposit transactions.
7. Supply liquidity: approve ICFT for the vault, supply a small amount, and verify minted `icftLP` shares.
8. Redeem liquidity: redeem a small share amount under available pool liquidity. Verify ICFT returned and `icftLP` burned. If the RPC proposes gas above its cap, confirm the frontend transaction estimate remains below the Sepolia limit.

## Expected UX

- During signing or mining, the persistent transaction bar says `TRANSACTION IN PROGRESS`.
- After confirmation it contains an Etherscan link.
- A rejected wallet request or reverted contract call appears as `TRANSACTION NEEDS ATTENTION` and does not claim success.
- No flow asks for a seed phrase or private key.
- Before a production release, record the wallet address, transaction hash, result, browser, viewport and any unexpected behavior for every case above.
