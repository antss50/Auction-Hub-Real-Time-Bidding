/* eslint-disable @nx/enforce-module-boundaries */
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { ApiAuctionItem, AuctionItem } from "../../types/auction";
import Topbar from "../../components/Topbar";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SectionGrid from "../../components/SectionGrid";
import Link from "next/link";
import { Home } from "lucide-react";
import AuctionFilter from "../../components/AuctionFilter";
import apiClient from "@auction-hub/axios";
import { getImageUrl } from "../utils/format";
import { Button } from "@auction-hub/shacdn-ui/button";

const PAGE_SIZE = 12;
const DOTS = "...";

const range = (start: number, end: number) =>
  Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);

function getPaginationItems({
  page,
  totalPages,
  siblingCount = 1,
  boundaryCount = 1,
}: {
  page: number;
  totalPages: number;
  siblingCount?: number;
  boundaryCount?: number;
}) {
  if (totalPages <= 1) return [1];

  const totalNumbersToShow = boundaryCount * 2 + siblingCount * 2 + 3;
  if (totalPages <= totalNumbersToShow) return range(1, totalPages);

  const leftSibling = Math.max(page - siblingCount, boundaryCount + 1);
  const rightSibling = Math.min(page + siblingCount, totalPages - boundaryCount);

  const showLeftDots = leftSibling > boundaryCount + 2;
  const showRightDots = rightSibling < totalPages - boundaryCount - 1;

  const items: (number | string)[] = [];

  // Start pages
  items.push(...range(1, boundaryCount));

  // Left gap
  if (showLeftDots) items.push(DOTS);
  else items.push(...range(boundaryCount + 1, leftSibling - 1));

  // Middle pages
  items.push(...range(leftSibling, rightSibling));

  // Right gap
  if (showRightDots) items.push(DOTS);
  else items.push(...range(rightSibling + 1, totalPages - boundaryCount));

  // End pages
  items.push(...range(totalPages - boundaryCount + 1, totalPages));

  // Remove duplicates do overlap
  return items.filter((v, i, arr) => i === 0 || v !== arr[i - 1]);
}


function AuctionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const statusParam = searchParams.get("type") as "now" | "upcoming" | "completed" | null;

  const pageParam = Number(searchParams.get("page") || 1);

  const [page, setPage] = useState(pageParam);
  const [totalPages, setTotalPages] = useState(1);

  const [auctions, setAuctions] = useState<AuctionItem[]>([]);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 9999999999999]);

  const mapAuction = (item: ApiAuctionItem): AuctionItem => ({
    id: item.id,
    name: item.name,
    startingPrice: Number(item.startingPrice),
    deposit: Number(item.depositAmountRequired),
    time: new Date(item.auctionStartAt).toLocaleString("vi-VN", {
      hour12: false,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    image: getImageUrl(item.images),
    location: "TP Hồ Chí Minh",
    status: statusParam!,
  });

  const fetchAuctions = async () => {
    try {
      const params: any = {
        page,
        limit: PAGE_SIZE,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (statusParam) params.status = statusParam;

      const res = await apiClient.get("/auctions", { params });

      if (res.data?.success) {
        setTotalPages(res.data.meta?.totalPages || 1);
        const raw: ApiAuctionItem[] = res.data.data || [];

        setAuctions(raw.map(mapAuction));


      }
    } catch (err) {
      console.error("Fetch auctions error:", err);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [statusParam, page]);

  const filteredAuctions = auctions.filter(
    (a) => a.startingPrice >= priceRange[0] && a.startingPrice <= priceRange[1]
  );

  const handleFilterChange = (newFilters: any) => {
    if (newFilters.type) {
      router.push(`/auctions?type=${newFilters.type}&page=1`);
      setPage(1);
    }

    if (newFilters.priceRange) {
      setPriceRange(newFilters.priceRange);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);

    const query = statusParam
      ? `?type=${statusParam}&page=${newPage}`
      : `?page=${newPage}`;

    router.push("/auctions" + query);
  };

  return (
    <main className="w-full min-h-screen font-sans">
      <Topbar />
      <Navbar />

      {/* Breadcrumb */}
      <div className="flex px-6 md:px-20 py-6 gap-6 bg-zinc-50 items-center">
        <Link href="/" className="flex items-center hover:text-red-600">
          <Home className="w-5 mx-2" />
          <span>Trang chủ</span>
        </Link>
        <span className="text-gray-400">{">"}</span>
        <span className="font-semibold">Tài sản đấu giá</span>
      </div>

      {/* FILTER */}
      <AuctionFilter
        onFilterChange={handleFilterChange}
        currentType={statusParam!}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h3 className="text-3xl font-semibold mb-8">
          {statusParam === "now"
            ? "Đang diễn ra"
            : statusParam === "upcoming"
              ? "Sắp diễn ra"
              : statusParam === "completed"
                ? "Đã kết thúc"
                : "Tất cả tài sản đấu giá"}
        </h3>

        {filteredAuctions.length > 0 ? (
          <>
            <SectionGrid items={filteredAuctions} />

            {/* Pagination (UI giống #1, logic giữ nguyên) */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12 mb-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                >
                  &lt;
                </Button>

                {getPaginationItems({ page, totalPages, siblingCount: 1, boundaryCount: 1 }).map(
                  (item, idx) =>
                    item === DOTS ? (
                      <span
                        key={`dots-${idx}`}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 select-none"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => handlePageChange(item as number)}
                        className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${page === item
                          ? "bg-[#8B1E1E] text-white"
                          : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                      >
                        {item}
                      </button>
                    )
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                >
                  &gt;
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl">Không tìm thấy tài sản nào phù hợp.</p>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}

export default function AuctionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuctionsContent />
    </Suspense>
  );
}
