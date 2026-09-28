import { createPublicClient, http, type Address } from "viem";
import { sepolia } from "viem/chains";

const address = (value: string): Address => value as Address;

export const protocol = {
  chain: sepolia,
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com",
  icft: address(process.env.NEXT_PUBLIC_ICFT_ADDRESS ?? "0xd3607F62dE598546e11f2C7bA8f3fDE042F652fa"),
  oracle: address(process.env.NEXT_PUBLIC_PRICE_ORACLE_ADDRESS ?? "0x59DD43D580A4aeBE84FdE44E748DB7F9CdA905a4"),
  riskEngine: address(process.env.NEXT_PUBLIC_RISK_ENGINE_ADDRESS ?? "0x5165b90893fAa2647cA29DbE46c4969780cA0bcC"),
  interestRateModel: address(process.env.NEXT_PUBLIC_INTEREST_RATE_MODEL_ADDRESS ?? "0xFe6DcaE198d0E66eC32A6d8Cac36a4f232d35feC"),
  lendingPool: address(process.env.NEXT_PUBLIC_LENDING_POOL_ADDRESS ?? "0xAA34c13F7932eBb77dA286F35Dc95aA13CD7626A"),
  wbtc: address(process.env.NEXT_PUBLIC_WBTC_ADDRESS ?? "0x29f2D40B0605204364af54EC677bD022dA425d03"),
  wsteth: address(process.env.NEXT_PUBLIC_WSTETH_ADDRESS ?? "0xB82381A3fBD3FaFA77B3a7bE693342618240067b")
} as const;

export const publicClient = createPublicClient({ chain: protocol.chain, transport: http(protocol.rpcUrl) });

export const erc20Abi = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "allowance", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] }
] as const;

export const lendingPoolAbi = [
  { type: "function", name: "paused", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { type: "function", name: "getAvailableLiquidity", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getUtilization", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getDebt", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getLTV", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getCollateralValueUSD", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getCollateralBalance", stateMutability: "view", inputs: [{ name: "user", type: "address" }, { name: "asset", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getAvailableBorrow", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getCurrentInterest", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "minimumBorrowUSD", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "isLiquidatable", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "depositCollateral", stateMutability: "payable", inputs: [], outputs: [] },
  { type: "function", name: "depositCollateral", stateMutability: "nonpayable", inputs: [{ name: "asset", type: "address" }, { name: "amount", type: "uint256" }], outputs: [] },
  { type: "function", name: "withdrawCollateral", stateMutability: "nonpayable", inputs: [{ name: "amountETH", type: "uint256" }], outputs: [] },
  { type: "function", name: "withdrawCollateral", stateMutability: "nonpayable", inputs: [{ name: "asset", type: "address" }, { name: "amount", type: "uint256" }], outputs: [] },
  { type: "function", name: "borrow", stateMutability: "nonpayable", inputs: [{ name: "amountICFT", type: "uint256" }], outputs: [] },
  { type: "function", name: "repay", stateMutability: "nonpayable", inputs: [{ name: "amountICFT", type: "uint256" }], outputs: [] }
  ,{ type: "error", name: "BorrowBelowMinimum", inputs: [] }
  ,{ type: "error", name: "BorrowExceedsLTV", inputs: [] }
  ,{ type: "error", name: "InsufficientLiquidity", inputs: [] }
  ,{ type: "error", name: "InsufficientCollateral", inputs: [] }
  ,{ type: "error", name: "NoDebt", inputs: [] }
  ,{ type: "error", name: "NothingToRepay", inputs: [] }
  ,{ type: "error", name: "ZeroAmount", inputs: [] }
] as const;

export const oracleAbi = [
  { type: "function", name: "getETHUSDPrice", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getICFTUSDPrice", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getAssetUSDPrice", stateMutability: "view", inputs: [{ name: "asset", type: "address" }], outputs: [{ type: "uint256" }] }
  ,{ type: "function", name: "convertUSDToICFT", stateMutability: "view", inputs: [{ name: "usdAmount", type: "uint256" }, { name: "roundUp", type: "bool" }], outputs: [{ type: "uint256" }] }
] as const;

export const riskEngineAbi = [
  { type: "function", name: "getMaxLTVBps", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getLiquidationThresholdBps", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getTargetLTVBps", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getLiquidationBonusBps", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] }
] as const;

export const interestRateModelAbi = [
  { type: "function", name: "getBorrowRateBps", stateMutability: "view", inputs: [{ name: "utilizationBps", type: "uint256" }], outputs: [{ type: "uint256" }] }
] as const;

export const protocolEventsAbi = [
  { type: "event", name: "DepositCollateral", anonymous: false, inputs: [{ name: "user", type: "address", indexed: true }, { name: "asset", type: "address", indexed: true }, { name: "amount", type: "uint256", indexed: false }, { name: "totalCollateral", type: "uint256", indexed: false }] },
  { type: "event", name: "WithdrawCollateral", anonymous: false, inputs: [{ name: "user", type: "address", indexed: true }, { name: "asset", type: "address", indexed: true }, { name: "amount", type: "uint256", indexed: false }, { name: "remainingCollateral", type: "uint256", indexed: false }] },
  { type: "event", name: "Borrow", anonymous: false, inputs: [{ name: "user", type: "address", indexed: true }, { name: "amountICFT", type: "uint256", indexed: false }, { name: "addedDebtUSD", type: "uint256", indexed: false }, { name: "totalDebtUSD", type: "uint256", indexed: false }] },
  { type: "event", name: "Repay", anonymous: false, inputs: [{ name: "user", type: "address", indexed: true }, { name: "amountICFT", type: "uint256", indexed: false }, { name: "repaidDebtUSD", type: "uint256", indexed: false }, { name: "remainingDebtUSD", type: "uint256", indexed: false }] }
] as const;
