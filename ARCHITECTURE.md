# Frontend Architecture

## Runtime Layers

1. `app/layout.tsx` provides styles, metadata, providers, and the public footer gate.
2. `app/providers.tsx` configures Sepolia Wagmi transport and wallet connectors.
3. `lib/protocol.ts` is the source of browser-visible contract addresses and minimal ABIs.
4. `app/dapp/useProtocolData.ts` reads live protocol and wallet state every 15 seconds.
5. `app/dapp/useProtocolActions.ts` estimates gas, handles approvals, waits for receipts, and exposes transaction state.

## Routing

- Public pages live in `app/<route>/page.tsx` and receive `FooterGate`.
- `/dapp` routes intentionally omit the public footer.
- `app/dapp/[view]/page.tsx` reuses `WorkspaceView` for positions, markets, liquidity, activity, and profile.
- `app/legal/` contains testnet notices only; it is not the future standalone developer documentation site.

## Contract Configuration

All browser-visible addresses are read from `NEXT_PUBLIC_*` values. They are public configuration, never secrets. When contracts change, update `.env.example`, deployment-host variables, status information, and run `TESTING.md`.

## Transaction Lifecycle

1. User enters action details and reviews the request.
2. ERC-20 flows submit approval, wait for its receipt, then send the protocol transaction.
3. The frontend estimates gas, adds a 20% buffer, and caps it at 15,000,000.
4. The workspace reports pending, error, or confirmed status with an Etherscan link.

The contracts, not the interface, remain the authority for risk limits and transaction success.
