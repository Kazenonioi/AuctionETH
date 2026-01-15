"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function CreateAuction() {
  const router = useRouter();
  const { address: connectedAddress } = useAccount();
  const { writeContractAsync, isPending } = useScaffoldWriteContract("AuctionFactory");

  // 表单状态
  const [form, setForm] = useState({
    description: "",
    beneficiary: "",
    serviceChargeRatio: "500", // 默认 5% (500/10000)
    biddingTime: "3600", // 默认 1 小时
  });

  const handleCreate = async () => {
    try {
      await writeContractAsync({
        functionName: "createAuction",
        args: [form.description, BigInt(100), BigInt(form.biddingTime), form.beneficiary],
      });
      // 成功后跳转回首页查看列表
      router.push("/");
    } catch (e) {
      console.error("Failed to create:", e);
    }
  };

  return (
    <div className="flex justify-center items-center py-12 px-4">
      <div className="card w-full max-w-lg bg-base-100 shadow-2xl border border-base-300">
        <div className="card-body">
          <h2 className="card-title text-3xl font-bold justify-center text-primary mb-6">New Auction</h2>

          <div className="space-y-4">
            {/* 描述 */}
            <div className="form-control">
              <label className="label font-bold">Description</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Such as: NFT"
                  className="input input-bordered flex-1 focus:input-primary"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>

            {/* 受益人地址 */}
            <div className="form-control">
              <label className="label font-bold">Beneficiary Address</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="0x..."
                  className="input input-bordered flex-1 font-mono text-sm"
                  value={form.beneficiary}
                  onChange={e => setForm({ ...form, beneficiary: e.target.value })}
                />
                <button
                  className="btn btn-outline btn-sm h-auto"
                  onClick={() => setForm({ ...form, beneficiary: connectedAddress || "" })}
                >
                  Use My Address
                </button>
              </div>
            </div>

            {/* 持续时间 */}
            <div className="form-control">
              <label className="label font-bold">Duration</label>
              <div className="flex gap-2">
                <select
                  className="select select-bordered flex-1"
                  value={form.biddingTime}
                  onChange={e => setForm({ ...form, biddingTime: e.target.value })}
                >
                  <option value="600">10 Minutes</option>
                  <option value="3600">1 Hour</option>
                  <option value="86400">24 Hours</option>
                  <option value="604800">7 Days</option>
                </select>
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="card-actions justify-center mt-8">
              <button
                className={`btn btn-primary btn-wide text-lg ${isPending ? "loading" : ""}`}
                onClick={handleCreate}
                disabled={isPending || !form.description || !form.beneficiary}
              >
                {isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs opacity-40">* A confirmation might be needed when creating.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
