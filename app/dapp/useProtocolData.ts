"use client";

import { useAccount, useBalance, useReadContracts } from "wagmi";
import { zeroAddress } from "viem";
import { erc20Abi, interestRateModelAbi, lendingPoolAbi, oracleAbi, protocol, riskEngineAbi } from "../../lib/protocol";

const valueAt = (data: readonly { result?: unknown }[] | undefined, index: number) => {
  const value = data?.[index]?.result;
  return typeof value === "bigint" ? value : 0n;
};

export function useProtocolData() {
  const { address, isConnected } = useAccount();
  const user = address ?? zeroAddress;
  const pool = useReadContracts({
    contracts: [
      { address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "getAvailableLiquidity" },
      { address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "getUtilization" },
      { address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "getDebt", args: [user] },
      { address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "getLTV", args: [user] },
      { address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "getCollateralValueUSD", args: [user] },
      { address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "getAvailableBorrow", args: [user] },
      { address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "getCurrentInterest", args: [user] },
      { address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "minimumBorrowUSD" },
      { address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "isLiquidatable", args: [user] }
      ,{ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "getCollateralBalance", args: [user, zeroAddress] }
      ,{ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "getCollateralBalance", args: [user, protocol.wbtc] }
    ],
    query: { refetchInterval: 15_000 }
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
    contracts: [{ address: protocol.oracle, abi: oracleAbi, functionName: "convertUSDToICFT", args: [valueAt(pool.data, 2), true] }],
    query: { enabled: isConnected && valueAt(pool.data, 2) > 0n, refetchInterval: 15_000 }
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
    isLoading: pool.isLoading || state.isLoading || oracle.isLoading || balances.isLoading || native.isLoading,
    isError: pool.isError || state.isError || oracle.isError || risk.isError,
    refresh: async () => { await Promise.all([pool.refetch(), state.refetch(), oracle.refetch(), balances.refetch(), native.refetch(), fullRepay.refetch(), risk.refetch()]); },
    pool: { paused: state.data?.[0]?.result === true, availableLiquidity: valueAt(pool.data, 0), utilizationBps: valueAt(pool.data, 1) },
    position: { debtUsd: valueAt(pool.data, 2), ltvBps: valueAt(pool.data, 3), collateralUsd: valueAt(pool.data, 4), availableBorrow: valueAt(pool.data, 5), accruedInterestUsd: valueAt(pool.data, 6), minimumBorrowUsd: valueAt(pool.data, 7), liquidatable: pool.data?.[8]?.result === true, collateralNative: valueAt(pool.data, 9), collateralWbtc: valueAt(pool.data, 10), fullRepayIcft: valueAt(fullRepay.data, 0) },
    prices: { eth: valueAt(oracle.data, 0), icft: valueAt(oracle.data, 1), wbtc: valueAt(oracle.data, 2) },
    risk: { maxLtvBps: valueAt(risk.data, 0), liquidationThresholdBps: valueAt(risk.data, 1), targetLtvBps: valueAt(risk.data, 2), liquidationBonusBps: valueAt(risk.data, 3), borrowRateBps: valueAt(risk.data, 4) },
    balances: { native: native.data?.value ?? 0n, icft: valueAt(balances.data, 0), wbtc: valueAt(balances.data, 1) }
  };
}
