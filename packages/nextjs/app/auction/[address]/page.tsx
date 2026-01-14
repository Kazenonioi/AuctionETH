"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { formatEther, parseEther } from "viem";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function AuctionPage() {
  const { address } = useParams() as { address: string };
  const [bidAmount, setBidAmount] = useState<string>("");
  const { writeContractAsync, isPending } = useScaffoldWriteContract("Auction");

  // 1. 读取拍卖描述
  const { data: description } = useScaffoldReadContract({
    contractName: "Auction",
    address: address,
    functionName: "description",
  });

  // 2. 读取最高出价
  const { data: highestBid } = useScaffoldReadContract({
    contractName: "Auction",
    address: address,
    functionName: "highestBid",
  });

  // 3. 读取拍卖结束时间 (Unix 时间戳)
  const { data: auctionEndTime } = useScaffoldReadContract({
    contractName: "Auction",
    address: address,
    functionName: "auctionEndTime",
  });

  // 逻辑处理：格式化时间
  const endTimeDate = auctionEndTime ? new Date(Number(auctionEndTime) * 1000) : null;
  const isExpired = endTimeDate ? endTimeDate < new Date() : false;

  return (
    <div className="flex justify-center mt-10 px-4 pb-20">
      <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          {/* 状态标签 */}
          <div className="flex justify-center mb-2">
            {isExpired ? (
              <div className="badge badge-error gap-2 text-white">● 已结束</div>
            ) : (
              <div className="badge badge-success gap-2 text-white font-bold animate-pulse">● 进行中</div>
            )}
          </div>

          <h2 className="card-title justify-center text-2xl font-bold text-primary">{description || "加载中..."}</h2>
          <p className="text-center text-xs opacity-50 font-mono break-all">{address}</p>

          {/* 结束时间显示 */}
          <div className="bg-base-200 rounded-xl p-3 my-4 flex flex-col items-center">
            <span className="text-xs opacity-60 uppercase font-bold">结束时间</span>
            <span className={`text-sm font-semibold ${isExpired ? "text-error" : "text-base-content"}`}>
              {endTimeDate ? endTimeDate.toLocaleString() : "正在获取..."}
            </span>
          </div>

          <div className="stats shadow bg-base-200 mb-6">
            <div className="stat text-center">
              <div className="stat-title">当前最高出价</div>
              <div className="stat-value text-blue-600 text-3xl">
                {highestBid ? formatEther(highestBid) : "0"} <span className="text-sm">ETH</span>
              </div>
            </div>
          </div>

          {/* 如果没结束，显示出价表单 */}
          {!isExpired ? (
            <div className="form-control w-full space-y-4">
              <div className="join w-full">
                <input
                  type="number"
                  step="0.01"
                  placeholder="出价金额"
                  className="input input-bordered join-item w-full"
                  value={bidAmount}
                  onChange={e => setBidAmount(e.target.value)}
                />
                <div className="btn btn-disabled join-item">ETH</div>
              </div>

              <div className="card-actions justify-center mt-2">
                <button
                  className={`btn btn-primary px-12 ${isPending ? "loading" : ""}`}
                  disabled={isPending || !bidAmount}
                  onClick={async () => {
                    try {
                      await writeContractAsync({
                        functionName: "bid",
                        value: parseEther(bidAmount),
                        address: address,
                      });
                      setBidAmount("");
                    } catch (e) {
                      console.error("出价失败:", e);
                    }
                  }}
                >
                  {isPending ? "提交中..." : "提交出价"}
                </button>
              </div>
            </div>
          ) : (
            <div className="alert alert-warning text-sm py-2">
              <span>拍卖已到达设定时间。</span>
            </div>
          )}

          <p></p>
          <div className="flex justify-around">
            <button
              className="btn btn-ghost btn-xs underline"
              onClick={() => writeContractAsync({ functionName: "claimReturns", address: address })}
            >
              撤回资金
            </button>
            {/* 只有时间到了，结束拍卖按钮才显得重要 */}
            <button
              className={`btn btn-ghost btn-xs underline ${isExpired ? "text-error font-bold" : "text-gray-400"}`}
              onClick={() => writeContractAsync({ functionName: "auctionEnd", address: address })}
            >
              结算拍卖
            </button>
            <button
              className={`btn btn-ghost btn-xs underline text-red-400`}
              onClick={() => writeContractAsync({ functionName: "forceEndAuction", address: address })}
            >
              强制结束
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
