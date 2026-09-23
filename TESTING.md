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
7. Open Market status and verify it does not display an unverified market cap, TVL, price, or buy/sell route while no official venue exists.

## Expected UX

- During signing or mining, the persistent transaction bar says `TRANSACTION IN PROGRESS`.
- After confirmation it contains an Etherscan link.
- A rejected wallet request or reverted contract call appears as `TRANSACTION NEEDS ATTENTION` and does not claim success.
- No flow asks for a seed phrase or private key.
- Before a production release, record the wallet address, transaction hash, result, browser, viewport and any unexpected behavior for every case above.

## Recorded Sepolia Baseline - 2026-09-22

The following manual smoke-test passed against the deployed Ethereum Sepolia proxies. It used dedicated testnet accounts only; private keys are intentionally not recorded.

| Scenario | Result |
| --- | --- |
| Legacy LP-vault test | Passed before deprecation; removed from the public UI pending safe migration |
| Deposit `0.05 ETH` as collateral | Passed |
| Borrow `100 ICFT` | Passed |
| Attempt an unsafe full collateral withdrawal with active debt | Reverted as expected by the LTV check |
| Partial ICFT repayment and full repayment with `MAX` | Passed |
| Withdraw ETH after debt reached zero | Passed |
| Keeper indexed the existing test borrowers | Passed |

The live protocol has a `$100` minimum borrow. The dApp reads this value from `LendingPool.minimumBorrowUSD()` and shows it in the borrow flow.

`wBTC` and `wstETH` deposit flows remain pending a team-controlled source of those currently configured Sepolia test assets. Do not deploy replacement token mocks for this check: the active LendingPool only accepts its registered collateral addresses.

Before publishing a demo, add the Etherscan transaction hashes, browser/version, viewport and tester initials to the release record maintained by the team.
