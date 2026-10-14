"use client";

import { useAccount, useBalance, useReadContracts } from "wagmi";
import { zeroAddress } from "viem";
import { erc20Abi, interestRateModelAbi, lendingPoolAbi, oracleAbi, protocol, riskEngineAbi } from "../../lib/protocol";

type ReadResult = { result?: unknown; status?: "success" | "failure" };

const valueAt = (data: readonly ReadResult[] | undefined, index: number) => {
  const value = data?.[index]?.result;
  return typeof value === "bigint" ? value : 0n;
};

const hasFailedRead = (data: readonly ReadResult[] | undefined) => data?.some((result) => result.status === "failure") ?? false;

export function useProtocolData() {
  const { address, isConnected } = useAccount();
  const user = address ?? zeroAddress;
  const pool = useReadContracts({
    contracts: [
      { address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "getAvailableLiquidity" },
      { address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "getUtilization" },
      { address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "minimumBorrowUSD" }
    ],
    query: { refetchInterval: 15_000 }
  });
  // Keep account-specific reads out of the mandatory startup batch. A failed position read
  // must not turn the entire public workspace into a false "read failed" state.
  const position = useReadContracts({
    contracts: isConnected && address ? [
      { address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "getDebt", args: [address] },
      { address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "getLTV", args: [address] },
      { address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "getCollateralValueUSD", args: [address] },
      { address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "getAvailableBorrow", args: [address] },
      { address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "getCurrentInterest", args: [address] },
      { address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "isLiquidatable", args: [address] },
      { address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "getCollateralBalance", args: [address, zeroAddress] },
      { address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "getCollateralBalance", args: [address, protocol.wbtc] }
    ] : [],
    query: { enabled: isConnected, refetchInterval: 15_000 }
  });
  const state = useReadContracts({
    contracts: [{ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "paused" }],
    query: { refetchInterval: 15_000 }
  });
  const oracle = useReadContracts({
    contracts: [
      { address: protocol.oracle, abi: oracleAbi, functionName: "getETHUSDPrice" },
      { address: protocol.oracle, abi: oracleAbi, functionName: "getICFTUSDPrice" },
      { address: protocol.oracle, abi: oracleAbi, functionName: "getAssetUSDPrice", args: [protocol.wbtc] }
    ],
    query: { refetchInterval: 15_000 }
  });
  const balances = useReadContracts({
    contracts: [
      { address: protocol.icft, abi: erc20Abi, functionName: "balanceOf", args: [user] },
      { address: protocol.wbtc, abi: erc20Abi, functionName: "balanceOf", args: [user] },
    ],
    query: { enabled: isConnected, refetchInterval: 15_000 }
  });
  const native = useBalance({ address, query: { enabled: isConnected, refetchInterval: 15_000 } });
  const fullRepay = useReadContracts({
    contracts: [{ address: protocol.oracle, abi: oracleAbi, functionName: "convertUSDToICFT", args: [valueAt(position.data, 0), true] }],
    query: { enabled: isConnected && valueAt(position.data, 0) > 0n, refetchInterval: 15_000 }
  });
  const risk = useReadContracts({
    contracts: [
      { address: protocol.riskEngine, abi: riskEngineAbi, functionName: "getMaxLTVBps" },
      { address: protocol.riskEngine, abi: riskEngineAbi, functionName: "getLiquidationThresholdBps" },
      { address: protocol.riskEngine, abi: riskEngineAbi, functionName: "getTargetLTVBps" },
      { address: protocol.riskEngine, abi: riskEngineAbi, functionName: "getLiquidationBonusBps" },
      { address: protocol.interestRateModel, abi: interestRateModelAbi, functionName: "getBorrowRateBps", args: [valueAt(pool.data, 1)] }
    ],
    query: { refetchInterval: 15_000 }
  });

  return {
    address,
    isConnected,
    isLoading: pool.isLoading || state.isLoading || oracle.isLoading || risk.isLoading
      || (isConnected && (position.isLoading || balances.isLoading || native.isLoading)),
    // useReadContracts allows individual calls to fail, so a failed mandatory read must not
    // silently become a trustworthy zero-valued position in the UI.
    isError: pool.isError || state.isError || oracle.isError || risk.isError
      || hasFailedRead(pool.data) || hasFailedRead(state.data) || hasFailedRead(oracle.data) || hasFailedRead(risk.data)
      || (isConnected && (position.isError || balances.isError || native.isError || hasFailedRead(position.data)))
      || (isConnected && valueAt(position.data, 0) > 0n && hasFailedRead(fullRepay.data)),
    refresh: async () => { await Promise.all([pool.refetch(), position.refetch(), state.refetch(), oracle.refetch(), balances.refetch(), native.refetch(), fullRepay.refetch(), risk.refetch()]); },
    pool: { paused: state.data?.[0]?.result === true, availableLiquidity: valueAt(pool.data, 0), utilizationBps: valueAt(pool.data, 1) },
    position: { debtUsd: valueAt(position.data, 0), ltvBps: valueAt(position.data, 1), collateralUsd: valueAt(position.data, 2), availableBorrow: valueAt(position.data, 3), accruedInterestUsd: valueAt(position.data, 4), minimumBorrowUsd: valueAt(pool.data, 2), liquidatable: position.data?.[5]?.result === true, collateralNative: valueAt(position.data, 6), collateralWbtc: valueAt(position.data, 7), fullRepayIcft: valueAt(fullRepay.data, 0) },
    prices: { eth: valueAt(oracle.data, 0), icft: valueAt(oracle.data, 1), wbtc: valueAt(oracle.data, 2) },
    risk: { maxLtvBps: valueAt(risk.data, 0), liquidationThresholdBps: valueAt(risk.data, 1), targetLtvBps: valueAt(risk.data, 2), liquidationBonusBps: valueAt(risk.data, 3), borrowRateBps: valueAt(risk.data, 4) },
    balances: { native: native.data?.value ?? 0n, icft: valueAt(balances.data, 0), wbtc: valueAt(balances.data, 1) }
  };
}
