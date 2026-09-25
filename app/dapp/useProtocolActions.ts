"use client";

import { useState } from "react";
import { parseUnits } from "viem";
import { sepolia } from "wagmi/chains";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { erc20Abi, lendingPoolAbi, protocol } from "../../lib/protocol";

export type ProtocolAction = "Deposit" | "Borrow" | "Repay" | "Withdraw";
type ContractRequest = { address: `0x${string}`; abi: readonly unknown[]; functionName: string; args?: readonly unknown[]; value?: bigint };

function assetConfig(asset: string) {
  if (asset === "wBTC") return { address: protocol.wbtc, decimals: 8 };
  if (asset === "wstETH") return { address: protocol.wsteth, decimals: 18 };
  return { address: protocol.icft, decimals: 18 };
}

export function useProtocolActions() {
  const { address, chainId } = useAccount();
  const publicClient = usePublicClient({ chainId: sepolia.id });
  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [pendingLabel, setPendingLabel] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  async function sendAndWait(request: ContractRequest, label: string) {
    setPendingLabel(label);
    if (!publicClient) throw new Error("Sepolia public client is unavailable.");
    if (!address) throw new Error("Connect a wallet before submitting a transaction.");

    // Some injected wallets default to a 21M gas limit, which Infura rejects on Sepolia.
    // Estimate against the connected account, then add a modest buffer below the RPC cap.
    const estimate = await publicClient.estimateContractGas({ ...request, account: address } as never);
    const bufferedGas = estimate + (estimate / 5n);
    const gas = bufferedGas > 15_000_000n ? 15_000_000n : bufferedGas;
    const hash = await writeContractAsync({ ...request, gas } as never);
    setTxHash(hash);
    setPendingLabel("Confirming on Ethereum Sepolia");
    await publicClient.waitForTransactionReceipt({ hash });
  }

  async function approve(token: `0x${string}`, spender: `0x${string}`, amount: bigint) {
    await sendAndWait({ address: token, abi: erc20Abi, functionName: "approve", args: [spender, amount] }, "Confirm token approval");
  }

  async function submit(action: ProtocolAction, asset: string, rawAmount: string) {
    setError(undefined); setTxHash(undefined);
    try {
      if (!address) throw new Error("Connect a wallet before submitting a transaction.");
      if (chainId !== sepolia.id) throw new Error("Switch the connected wallet to Ethereum Sepolia.");
      if (!publicClient) throw new Error("Sepolia public client is unavailable.");
      const paused = await publicClient.readContract({ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "paused" });
      if (paused && action !== "Repay") throw new Error("Protocol maintenance is active. Deposits, borrowing and withdrawals are temporarily disabled; repayment remains available.");
      if (!rawAmount || Number(rawAmount) <= 0) throw new Error("Enter an amount greater than zero.");
      const config = assetConfig(asset);
      const amount = parseUnits(rawAmount, config.decimals);

      if (action === "Deposit") {
        if (asset === "ETH") await sendAndWait({ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "depositCollateral", value: amount }, "Confirm ETH deposit");
        else { await approve(config.address, protocol.lendingPool, amount); await sendAndWait({ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "depositCollateral", args: [config.address, amount] }, "Confirm collateral deposit"); }
      } else if (action === "Borrow") {
        await sendAndWait({ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "borrow", args: [amount] }, "Confirm ICFT borrow");
      } else if (action === "Repay") {
        await approve(protocol.icft, protocol.lendingPool, amount); await sendAndWait({ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "repay", args: [amount] }, "Confirm ICFT repayment");
      } else if (asset === "ETH") {
        await sendAndWait({ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "withdrawCollateral", args: [amount] }, "Confirm ETH withdrawal");
      } else {
        await sendAndWait({ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "withdrawCollateral", args: [config.address, amount] }, "Confirm collateral withdrawal");
      }
      return true;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Transaction could not be completed.";
      if (message.includes("BorrowBelowMinimum")) {
        setError("Minimum borrow is $100 worth of ICFT. Increase collateral and borrow at least 100 ICFT.");
      } else if (message.includes("BorrowExceedsLTV")) {
        setError(action === "Withdraw"
          ? "This withdrawal would push your position above the maximum LTV. Repay debt or withdraw less collateral."
          : "This borrow amount would exceed the maximum LTV for your collateral.");
      } else if (message.includes("InsufficientLiquidity")) {
        setError("The pool does not currently have enough ICFT liquidity for this borrow.");
      } else {
        setError(message);
      }
      return false;
    } finally {
      setPendingLabel(undefined);
    }
  }

  return { submit, txHash, pendingLabel, error, clearError: () => setError(undefined), clearTransaction: () => setTxHash(undefined) };
}
