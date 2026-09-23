"use client";

import { useEffect, useState } from "react";
import { formatUnits, type Address } from "viem";
import { usePublicClient } from "wagmi";
import { protocol, protocolEventsAbi } from "../../lib/protocol";

export type ActivityItem = { id: string; title: string; amount: string; detail: string; block: bigint; ok: boolean };
const FROM_BLOCK = 11_600_000n;

export function useWalletActivity(address?: Address) {
  const client = usePublicClient();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!client || !address) { setItems([]); return; }
    const publicClient = client;
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [deposits, withdrawals, borrows, repays] = await Promise.all([
          publicClient.getContractEvents({ address: protocol.lendingPool, abi: protocolEventsAbi, eventName: "DepositCollateral", args: { user: address }, fromBlock: FROM_BLOCK } as never),
          publicClient.getContractEvents({ address: protocol.lendingPool, abi: protocolEventsAbi, eventName: "WithdrawCollateral", args: { user: address }, fromBlock: FROM_BLOCK } as never),
          publicClient.getContractEvents({ address: protocol.lendingPool, abi: protocolEventsAbi, eventName: "Borrow", args: { user: address }, fromBlock: FROM_BLOCK } as never),
          publicClient.getContractEvents({ address: protocol.lendingPool, abi: protocolEventsAbi, eventName: "Repay", args: { user: address }, fromBlock: FROM_BLOCK } as never)
        ]);
        const render = (logs: readonly unknown[], title: string, key: string, suffix: string, detail: string) => logs.map((log, index) => {
          const entry = log as { args?: Record<string, unknown>; blockNumber?: bigint; transactionHash?: string };
          const raw = entry.args?.[key];
          const value = typeof raw === "bigint" ? formatUnits(raw, 18) : "0";
          return { id: `${entry.transactionHash ?? title}-${index}`, title, amount: `${value} ${suffix}`, detail, block: entry.blockNumber ?? 0n, ok: true };
        });
        const next = [
          ...render(deposits, "Collateral deposited", "amount", "asset", "LendingPool event"),
          ...render(withdrawals, "Collateral withdrawn", "amount", "asset", "LendingPool event"),
          ...render(borrows, "ICFT borrowed", "amountICFT", "ICFT", "LendingPool event"),
          ...render(repays, "ICFT repaid", "amountICFT", "ICFT", "LendingPool event")
        ].sort((a, b) => Number(b.block - a.block));
        if (active) setItems(next);
      } finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [address, client]);

  return { items, loading };
}
