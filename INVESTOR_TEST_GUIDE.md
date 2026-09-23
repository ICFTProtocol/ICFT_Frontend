# ICFT Sepolia Demo Guide

## Scope

ICFT is an early Ethereum Sepolia testnet lending demo. Use only a new test wallet and free Sepolia ETH. Do not use mainnet funds, seed phrases, or a wallet holding valuable assets.

The demo lets a user deposit supported collateral, borrow ICFT, repay debt, and withdraw collateral. It uses protocol-owned credit inventory; it does not offer a public LP product.

## Before You Start

1. Install or open MetaMask, Rabby, Coinbase Wallet, or a WalletConnect-compatible wallet.
2. Create a dedicated Sepolia account and switch it to Ethereum Sepolia, chain ID `11155111`.
3. Fund it with Sepolia ETH for gas and collateral.
4. Open the supplied demo URL and connect the wallet. The interface never needs a seed phrase or private key.

## Borrower Walkthrough

1. In the dApp, choose `Deposit`, select `ETH`, enter a small amount, review, and confirm.
2. Wait for the transaction confirmation and verify that collateral value and available credit update.
3. Open `Borrow`. The current contract enforces a `$100` minimum borrow and an 80% maximum LTV. Enter an amount at or above the displayed minimum and below available credit.
4. Confirm the borrow and verify that ICFT balance, debt, and LTV update.
5. Try to withdraw all collateral with an active debt. A risk revert is expected if the withdrawal would exceed max LTV.
6. Open `Repay`, approve ICFT if asked, repay a partial amount, then use `MAX` to close the remaining debt.
7. After debt is zero, withdraw the collateral.

## Market Status Walkthrough

1. Open the Market status page.
2. Confirm that it separates the protocol credit reserve from exchange liquidity.
3. Confirm that market cap, TVL, price, and buy/sell routes are unavailable until an official venue is published.

## Expected and Useful Failures

- Borrowing below `$100` reverts with the displayed minimum-borrow explanation.
- Borrowing above capacity reverts due to LTV or protocol-credit-reserve protection.
- Withdrawing collateral that would break the LTV limit reverts.
- A wrong network is rejected before transaction submission.

## What to Report

For each issue, send the page URL, connected network, action, amount, wallet public address, browser, screenshot, and transaction hash if one exists. Never send a private key or seed phrase.

## Current Limits

- Testnet only; balances and assets have no monetary value.
- The public demo focuses on ETH collateral. wBTC and wstETH require team-provided test assets because the currently registered Sepolia assets do not expose a public faucet.
- This is not a promise of mainnet availability, yield, price stability, or liquidation profitability.
