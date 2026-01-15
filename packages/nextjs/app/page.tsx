// packages/nextjs/app/page.tsx
"use client";

import Link from "next/link";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useRouter } from "next/navigation";

export default function Home() {
  // 1. 自动读取 Factory 合约里的 auctions 数组
  const { data: auctionAddresses } = useScaffoldReadContract({
    contractName: "AuctionFactory",
    functionName: "getAuctions",
  });
  const router = useRouter();

  return (
    <div className="flex flex-col items-center py-10">
      <h1 className="text-4xl font-bold mb-8">All Auctions</h1>
      <div className="grid gap-4">
        {auctionAddresses?.map((addr: string) => (
          <Link key={addr} href={`/auction/${addr}`}>
            <div className="block p-6 bg-base-100 border border-base-300 rounded-xl hover:border-primary transition cursor-pointer">
              <p className="text-primary font-mono">{addr}</p>
              <span className="text-xs text-gray-500">Click to see detail →</span>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-4">
        <button
          className={`btn btn-primary btn-wide text-lg`}
          onClick={() => (router.push("/create"))}
        >
          {"New Auction"}
        </button>
      </div>
    </div>
  );
}
