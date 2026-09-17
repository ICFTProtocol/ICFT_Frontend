# Contributing

## Local Workflow

```bash
cp .env.example .env.local
npm install
npm run dev
npm run build
```

Use a separate Sepolia-only wallet for manual transaction tests. Never use mainnet funds.

## Pull Requests

- Keep the change focused and describe the user-facing outcome.
- Include `npm run build` output or explain why it could not run.
- Complete the relevant cases in `TESTING.md` for transaction-flow changes.
- Update `.env.example` and status references when contract addresses change.
- Do not commit `.env.local`, `node_modules`, `.next`, secrets, private keys, or seed phrases.

## Security

Do not publish exploitable vulnerability details in a public issue. Use an official maintainer channel when one is available, and never send a seed phrase or private key.
