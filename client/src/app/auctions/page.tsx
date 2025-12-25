/* eslint-disable @nx/enforce-module-boundaries */
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { AuctionItem } from "../../types/auction";
import Topbar from "../../components/Topbar";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SectionGrid from "../../components/SectionGrid";
import Link from "next/link";
import { Home, Loader2 } from "lucide-react";
import AuctionFilter, { FilterOptions } from "../../components/AuctionFilter";
import apiClient from "@auction-hub/axios";
import { Button } from "@auction-hub/shacdn-ui/button";

const PAGE_SIZE = 12;
const DOTS = "...";

// --- Helper Functions (Giữ nguyên) ---
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

  // 1. Lấy tất cả params từ URL
  const statusParam = (searchParams.get("type") as "now" | "upcoming" | "completed") || "now";
  const pageParam = Number(searchParams.get("page") || 1);
  const nameParam = searchParams.get("name") || "";
  const locationParam = searchParams.get("location") || "";
  const categoryParam = searchParams.get("category") || "";
  
  // Params giá (để lọc client-side)
  const minPriceParam = Number(searchParams.get("minPrice") || 0);
  const maxPriceParam = Number(searchParams.get("maxPrice") || 9999999999999);

  const [page, setPage] = useState(pageParam);
  const [totalPages, setTotalPages] = useState(1);
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(false);

  // State khoảng giá để lọc ở Client
  const [priceRange, setPriceRange] = useState<[number, number]>([minPriceParam, maxPriceParam]);

  const mapAuction = (item: AuctionItem): AuctionItem => ({
    id: item.id,
    name: item.name,
    startingPrice: Number(item.startingPrice),
    depositAmountRequired: Number(item.depositAmountRequired),
    auctionStartAt: new Date(item.auctionStartAt).toLocaleString("vi-VN", {
      hour12: false,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    images: item.images,
  });

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      // 2. Cấu hình params gửi API (chỉ gửi những gì Backend hỗ trợ)
      const params: any = {
        page: pageParam,
        limit: PAGE_SIZE,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (statusParam) params.status = statusParam;
      if (nameParam) params.name = nameParam;
      
      // Backend dùng 'auctionType' thay vì 'assetType'
      if (categoryParam && categoryParam !== 'all') {
          params.auctionType = categoryParam; 
      }

      // Lưu ý: Location tạm thời chưa gửi vì Backend cần ID (int) nhưng Filter gửi String
      // Lưu ý: MinPrice/MaxPrice chưa gửi vì Backend chưa hỗ trợ

      const res = await apiClient.get("/auctions", { params });

      if (res.data?.success) {
        setTotalPages(res.data.meta?.totalPages || 1);
        const raw: AuctionItem[] = res.data.data || [];
        setAuctions(raw.map(mapAuction));
      } else {
        setAuctions([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Fetch auctions error:", err);
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Sync state từ URL khi URL thay đổi (F5 hoặc Back/Forward)
    setPage(pageParam);
    if (searchParams.has("minPrice")) {
        setPriceRange([minPriceParam, maxPriceParam]);
    }
    fetchAuctions();
  }, [searchParams]); // Dependency là searchParams để bắt mọi thay đổi trên URL

  // 3. Lọc giá ở Client (Workaround)
  const filteredAuctions = auctions.filter(
    (a) => a.startingPrice >= priceRange[0] && a.startingPrice <= priceRange[1]
  );

  // 4. Update URL khi bấm "Tìm kiếm"
  const handleFilterChange = (newFilters: FilterOptions) => {
    const params = new URLSearchParams();

    if (newFilters.type) params.set("type", newFilters.type);
    if (newFilters.name) params.set("name", newFilters.name);
    if (newFilters.location && newFilters.location !== "all") params.set("location", newFilters.location);
    if (newFilters.category && newFilters.category !== "all") params.set("category", newFilters.category);
    
    // Lưu giá lên URL
    params.set("minPrice", newFilters.priceRange[0].toString());
    params.set("maxPrice", newFilters.priceRange[1].toString());

    // Reset về trang 1
    params.set("page", "1");

    router.push(`/auctions?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    // Giữ nguyên các params hiện tại, chỉ đổi page
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("page", newPage.toString());
    router.push(`/auctions?${currentParams.toString()}`);
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
        
        {/* Hiển thị Loading hoặc Dữ liệu */}
        {loading ? (
             <div className="flex justify-center py-20">
                <Loader2 className="animate-spin w-10 h-10 text-gray-400" />
             </div>
        ) : filteredAuctions.length > 0 ? (
          <>
            <SectionGrid items={filteredAuctions} />

            {/* Pagination */}
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