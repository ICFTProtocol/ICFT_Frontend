"use client";

import { useRef, useState } from "react";
import { parseUnits } from "viem";
import { sepolia } from "wagmi/chains";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { erc20Abi, lendingPoolAbi, oracleAbi, protocol } from "../../lib/protocol";

export type ProtocolAction = "Deposit" | "Borrow" | "Repay" | "Withdraw";
type ContractRequest = { address: `0x${string}`; abi: readonly unknown[]; functionName: string; args?: readonly unknown[]; value?: bigint };
type SubmittedTransaction = { hash: `0x${string}`; label: string };

function assetConfig(asset: string) {
  if (asset === "wBTC") return { address: protocol.wbtc, decimals: 8 };
  return { address: protocol.icft, decimals: 18 };
}

export function useProtocolActions() {
  const { address, chainId } = useAccount();
  const publicClient = usePublicClient({ chainId: sepolia.id });
  const { writeContractAsync } = useWriteContract();
  const submittingRef = useRef(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [transactions, setTransactions] = useState<SubmittedTransaction[]>([]);
  const [pendingLabel, setPendingLabel] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  async function sendAndWait(request: ContractRequest, label: string) {
    if (!publicClient) throw new Error("Sepolia public client is unavailable.");
    if (!address) throw new Error("Connect a wallet before submitting a transaction.");

    setPendingLabel(label);
    // Some injected wallets default to a 21M gas limit, which Infura rejects on Sepolia.
    // Estimate against the connected account, then add a modest buffer below the RPC cap.
    const estimate = await publicClient.estimateContractGas({ ...request, account: address } as never);
    const bufferedGas = estimate + (estimate / 5n);
    const gas = bufferedGas > 15_000_000n ? 15_000_000n : bufferedGas;
    const hash = await writeContractAsync({ ...request, gas } as never);
    setTxHash(hash);
    setTransactions((current) => [...current, { hash, label }]);
    setPendingLabel("Confirming on Ethereum Sepolia");

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") {
      throw new Error(`Transaction reverted on Ethereum Sepolia: ${hash}`);
    }
  }

  async function approveIfNeeded(token: `0x${string}`, spender: `0x${string}`, amount: bigint, label: string) {
    if (!publicClient || !address) throw new Error("Connect a wallet before submitting a transaction.");
    const allowance = await publicClient.readContract({
      address: token,
      abi: erc20Abi,
      functionName: "allowance",
      args: [address, spender]
    });
    if (allowance >= amount) return false;

    await sendAndWait({ address: token, abi: erc20Abi, functionName: "approve", args: [spender, amount] }, label);
    return true;
  }

  async function submit(action: ProtocolAction, asset: string, rawAmount: string, repayAll = false) {
    // A ref changes synchronously, so a second click cannot pass before the first RPC read completes.
    if (submittingRef.current) {
      return false;
    }

    submittingRef.current = true;
    let approvalConfirmed = false;
    setError(undefined);
    setTxHash(undefined);
    setTransactions([]);
    setPendingLabel("Preparing transaction");

    try {
      if (!address) throw new Error("Connect a wallet before submitting a transaction.");
      if (chainId !== sepolia.id) throw new Error("Switch the connected wallet to Ethereum Sepolia.");
      if (!publicClient) throw new Error("Sepolia public client is unavailable.");

      const paused = await publicClient.readContract({ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "paused" });
      if (paused && action !== "Repay") throw new Error("Protocol maintenance is active. Deposits, borrowing and withdrawals are temporarily disabled; repayment remains available.");
      if (!rawAmount || Number(rawAmount) <= 0) throw new Error("Enter an amount greater than zero.");

      const config = assetConfig(asset);
      let amount = parseUnits(rawAmount, config.decimals);

      if (action === "Repay" && repayAll) {
        // Interest continues accruing between a displayed quote, approval and repayment.
        // The contract caps an overpayment at the current full debt, so this tiny allowance
        // buffer cannot transfer more ICFT than is owed.
        const debt = await publicClient.readContract({ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "getDebt", args: [address] });
        const freshQuote = await publicClient.readContract({ address: protocol.oracle, abi: oracleAbi, functionName: "convertUSDToICFT", args: [debt, true] });
        amount = freshQuote + 10n ** 15n; // 0.001 ICFT
      }

      if (action === "Deposit") {
        if (asset === "ETH") {
          await sendAndWait({ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "depositCollateral", value: amount }, "Confirm ETH deposit");
        } else {
          approvalConfirmed = await approveIfNeeded(config.address, protocol.lendingPool, amount, "Confirm collateral approval");
          await sendAndWait({ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "depositCollateral", args: [config.address, amount] }, "Confirm collateral deposit");
        }
      } else if (action === "Borrow") {
        await sendAndWait({ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "borrow", args: [amount] }, "Confirm ICFT borrow");
      } else if (action === "Repay") {
        approvalConfirmed = await approveIfNeeded(protocol.icft, protocol.lendingPool, amount, "Confirm ICFT approval");
        await sendAndWait({ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "repay", args: [amount] }, "Confirm ICFT repayment");
      } else if (asset === "ETH") {
        await sendAndWait({ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "withdrawCollateral", args: [amount] }, "Confirm ETH withdrawal");
      } else {
        await sendAndWait({ address: protocol.lendingPool, abi: lendingPoolAbi, functionName: "withdrawCollateral", args: [config.address, amount] }, "Confirm collateral withdrawal");
      }
      return true;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Transaction could not be completed.";
      if (message.includes("User rejected") || message.includes("User denied")) {
        setError(approvalConfirmed
          ? "The token approval was confirmed, but the protocol transaction was cancelled in your wallet. No protocol action was sent; the approval and its gas cost remain on-chain."
          : "The transaction was cancelled in your wallet. No transaction from this flow was sent.");
      } else if (message.includes("Transaction reverted on Ethereum Sepolia")) {
        setError("Ethereum Sepolia mined this transaction but the contract reverted it. No protocol state changed. Review the Etherscan transaction before retrying.");
      } else if (message.includes("ERC20InsufficientAllowance")) {
        setError("ICFT approval is lower than the repayment amount. Confirm a new approval, then retry the repayment.");
      } else if (message.includes("ERC20InsufficientBalance")) {
        setError("Your ICFT balance is lower than the requested repayment amount.");
      } else if (message.includes("BorrowBelowMinimum")) {
        setError("Minimum borrow is $100 worth of ICFT. Increase collateral and borrow at least the configured minimum.");
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
      submittingRef.current = false;
      setPendingLabel(undefined);
    }
  }

  function clearTransaction() {
    setTxHash(undefined);
    setTransactions([]);
  }

  return { submit, txHash, transactions, pendingLabel, error, clearError: () => setError(undefined), clearTransaction };
}
