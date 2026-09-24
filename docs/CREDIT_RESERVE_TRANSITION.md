# Protocol Credit Reserve Transition

## Product Decision

ICFT will not operate a public, user-supplied credit-liquidity product. Borrowable ICFT is supplied from protocol-owned inventory, beginning with the Fund A allocation. The public interface therefore does not offer `Supply`, `Redeem`, `icftLP`, or an LP yield claim.

## Separate Concepts

- **Protocol credit reserve** is ICFT held for lending through the protocol. It defines borrowable inventory and is not exchange liquidity.
- **Market liquidity** is the depth of an approved ICFT trading pair on a DEX or CEX. The whitepaper model uses protocol-provided ICFT and external LP-provided USDT for an ICFT/USDT pool. It enables buying and selling, including obtaining ICFT for repayment.
- **Market capitalization** is a valuation metric derived from a credible market price and an approved circulating-supply methodology. It is not liquidity.

## Current Sepolia Behavior

The Sepolia deployment retains a legacy `ICFTLiquidityVault` because it was previously deployed and used in testing. The public UI no longer exposes supply or redemption actions. This is a product deprecation, not a claim that the legacy contract has been removed or disabled.

Do not disable, upgrade, drain, or otherwise alter the legacy vault until the team has reviewed its holders, withdrawal rights, LendingPool coupling, storage layout, and migration procedure.

## Credit Amounts and Market Price

If ICFT has a credible $2 market price, a new $100 loan should issue 50 ICFT instead of 100 ICFT. The protocol has not created more ICFT; the same token inventory simply has a different USD value. This must not be confused with market liquidity.

The current Sepolia ICFT price is manually configured for controlled testing. No public market-cap, market-price, TVL, or buy/sell route should be presented until an official venue and price methodology are approved. Existing USD-denominated debt also needs a separate price-movement review before the protocol adopts a market-derived ICFT oracle.

## Required Contract Work Before Production

1. Define a `ProtocolCreditReserve` administration model with least-privilege roles and an on-chain event trail for reserve funding and withdrawals.
2. Remove public LP entry points from the intended production architecture, while preserving an audited migration path for legacy shares if applicable.
3. Define the approved allocation of borrower interest among insurance, treasury, buyback reserve, and other destinations.
4. Define ICFT market-price and oracle policy. A manual price is acceptable only for controlled testnet demonstrations.
5. Publish verified market venues, pair addresses, liquidity/depth methodology, and repayment acquisition guidance only when they actually exist.
