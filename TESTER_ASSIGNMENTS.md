# ICFT Sepolia Tester Assignments

## Shared Rules

- Test only on Ethereum Sepolia, chain ID `11155111`.
- Use a dedicated test wallet. Never use a seed phrase, private key, or mainnet funds.
- Record browser, wallet, address, timestamp, transaction hash, expected result, actual result, and screenshots for every defect.
- Do not attempt to use the legacy `ICFTLiquidityVault`. It is not part of the public product flow.
- ICFT repayment is live. USDT repayment, DEX purchases, market buy/sell routes, Fund B activation, and automatic market execution are not live Sepolia functions.

## Tester A: Product and Wallet Flows

Goal: validate that a normal first-time user can understand the current Fund A credit-reserve model and complete valid actions through the public website and dApp.

### Public Site

1. Check `/`, `/start`, `/how-it-works`, `/tokenomics`, `/risk`, `/roadmap`, `/about`, `/faq`, and `/status` on desktop and mobile.
2. Confirm links are not underlined by default, public pages include the footer, and dApp pages do not include it.
3. On `/status`, copy every displayed proxy address and compare the copied value with its Sepolia Etherscan page.
4. Confirm the site describes Fund A as protocol-owned credit inventory, not a public supply/redeem product.
5. Confirm the UI says USDT settlement is planned, not live, and does not offer a USDT-repay button.

### Wallet and Borrower Flow

1. Connect MetaMask and one alternative wallet through WalletConnect/Reown; reject one connection request first, then connect successfully.
2. Verify wrong-network messaging, then switch to Sepolia.
3. Deposit a small amount of ETH collateral.
4. Borrow at least the displayed minimum and below the shown borrowing limit.
5. Confirm wallet ICFT balance, outstanding USD debt, LTV, position page, activity record, and transaction link update after confirmation.
6. Make a partial ICFT repayment. Confirm debt and activity update.
7. Use `MAX` to close the remaining debt, then withdraw collateral.
8. Deposit small amounts of the configured wBTC and wstETH only if the project supplied the exact registered Sepolia assets.

### Expected Negative UX

1. Try borrowing below the minimum.
2. Try borrowing above displayed capacity.
3. Try withdrawing collateral while this would violate max LTV.
4. Reject an approval and reject a transaction in the wallet.
5. Temporarily use an invalid RPC URL in a local build and confirm the failed-read state is understandable.

## Tester B: Protocol Boundaries and Adversarial Behaviour

Goal: find incorrect assumptions at risk, state, permission, and transaction boundaries. Direct contract calls using Foundry or `cast` are encouraged.

### Risk and Liquidation

1. Test positions below 80%, between 80% and 90%, at/above 90%, and after partial liquidation.
2. Confirm borrowing and withdrawals cannot create LTV above the max configured value.
3. Confirm a healthy position cannot be liquidated.
4. Confirm an unauthorized account cannot call liquidation paths.
5. Confirm a liquidator using a `maxICFTToRepay` below the calculated requirement reverts.
6. Test ETH, wBTC, and wstETH collateral rounding around minimal token units where practical.

### Accounting and Time

1. Open two positions at different utilization levels, advance time, and verify interest uses the pre-change utilization interval.
2. Test partial repayment, full repayment, and repayment after price changes.
3. Confirm a lower ICFT/USD price requires more ICFT to settle the same remaining USD debt, while a higher price requires fewer ICFT.
4. Confirm pause blocks new risk-increasing actions but keeps repayment available.
5. Confirm Fund A cannot be borrowed past its configured utilization cap. There is no Fund B transition in this testnet release.

### Roles, Upgradeability, and Inputs

1. Attempt admin-only configuration, pause, collateral configuration, and liquidation calls from unauthorized wallets.
2. Verify proxy addresses, implementation upgrades only in a local fork rehearsal, and initializer calls cannot be repeated.
3. Test zero amounts, zero recipients, unsupported collateral, stale/invalid oracle data in a local fork or mock environment, and fee-on-transfer collateral behavior.
4. Do not execute an upgrade or change production-like Sepolia permissions without written team authorization.

## Reporting Format

Use one issue per defect:

```text
Title:
Severity: Blocker / High / Medium / Low / UX
Environment: URL, commit, browser/wallet, Sepolia RPC
Wallet and network:
Steps to reproduce:
Expected result:
Actual result:
Transaction hash or call data:
Screenshot / video:
Suggested impact:
```

For a passing case, report the tested flow, wallet, transaction hash, and the observed before/after values. Do not report private keys or seed phrases.
