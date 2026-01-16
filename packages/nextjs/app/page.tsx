// packages/nextjs/app/page.tsx
"use client";

import { useState, useEffect, useRef } from "react"; 
import Link from "next/link";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useRouter } from "next/navigation";

const AuctionCard = ({ addr }: { addr: string }) => {
  const { data: description, isLoading: isDescLoading } = useScaffoldReadContract({
    contractName: "Auction",
    address: addr,
    functionName: "description",
  });

  const isCardLoading = isDescLoading || description === undefined;

  return (
    <Link href={`/auction/${addr}`}>
      <div className="block p-6 bg-base-100 border border-base-300 rounded-xl hover:border-primary transition cursor-pointer">
        
        <div className="mb-2 min-h-[1.75rem] flex items-center">
          {isCardLoading ? (
            <div className="w-full max-w-[200px] animate-pulse">
              <div className="h-6 bg-base-300 rounded"></div>
            </div>
          ) : (
            <h2 className="text-xl font-bold truncate text-base-content">
              {description || "No Description"}
            </h2>
          )}
        </div>

        <p className="text-primary font-mono text-sm truncate">{addr}</p>
        <span className="text-xs text-gray-500 mt-2 block">Click to see detail →</span>
      </div>
    </Link>
  );
};

// --- Home Page ---
export default function Home() {
  const PAGE_SIZE = 5; 

  const { data: auctionAddresses, isLoading } = useScaffoldReadContract({
    contractName: "AuctionFactory",
    functionName: "getAuctions",
  });

  const [fullList, setFullList] = useState<string[] | undefined>(undefined);
  const [displayList, setDisplayList] = useState<string[]>([]);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (auctionAddresses) {
      const reversed = [...auctionAddresses].reverse();
      setFullList(reversed);
      setDisplayList(reversed.slice(0, PAGE_SIZE));
    }
  }, [auctionAddresses]);

  useEffect(() => {
    if (fullList) {
      setDisplayList(fullList.slice(0, displayCount));
    }
  }, [displayCount, fullList]);

  const hasMore = fullList ? displayList.length < fullList.length : false;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setTimeout(() => {
             setDisplayCount((prev) => prev + PAGE_SIZE);
          }, 500); 
        }
      },
      { threshold: 1.0 } 
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget, hasMore]);

  const isPageLoading = isLoading || fullList === undefined;

  return (
    <div className="flex flex-col items-center py-10">
      <h1 className="text-4xl font-bold mb-8">All Auctions</h1>

      {isPageLoading ? (
        <div className="flex justify-center items-center mt-10">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="w-full max-w-2xl px-4 flex flex-col gap-4">
          
          {displayList.map((addr: string) => (
            <AuctionCard key={addr} addr={addr} />
          ))}

          {fullList?.length === 0 && (
            <p className="text-gray-500 text-center">No auctions found.</p>
          )}

          {fullList && fullList.length > 0 && (
            <div ref={observerTarget} className="h-10 flex justify-center items-center mt-4">
              {hasMore ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="loading loading-dots loading-md"></span>
                  <span>Loading more...</span>
                </div>
              ) : (
                <div className="divider text-gray-400 text-sm">End of Auctions</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}