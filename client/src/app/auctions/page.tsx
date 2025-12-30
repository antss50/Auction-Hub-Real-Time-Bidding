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
import { Home, Search, Filter } from "lucide-react";
import AuctionFilter, { FilterOptions } from "../../components/AuctionFilter";
import apiClient from "@auction-hub/axios";
import { Button } from "@auction-hub/shacdn-ui/button";
import { Input } from "@auction-hub/shacdn-ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@auction-hub/shacdn-ui/select";

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

  // --- 1. Lấy Params từ URL ---
  const statusParam = searchParams.get("type") as "now" | "upcoming" | "completed" | null;
  const pageParam = Number(searchParams.get("page") || 1);
  const nameParam = searchParams.get("name") || "";
  const typeParam = searchParams.get("category") || "";
  const sortParam = searchParams.get("sort") || "newest"; // Mặc định là mới nhất

  // --- State ---
  const [page, setPage] = useState(pageParam);
  const [totalPages, setTotalPages] = useState(1);
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000000]);

  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState(nameParam);

  // Map dữ liệu (Giữ nguyên)
  const mapAuction = (item: AuctionItem): AuctionItem => ({
    id: item.id,
    name: item.name,
    startingPrice: Number(item.startingPrice),
    depositAmountRequired: Number(item.depositAmountRequired),
    auctionStartAt: item.auctionStartAt,
    images: item.images,
  });

  // --- 2. Xử lý Logic Sắp xếp ---
  const getSortConfig = (sortKey: string) => {
    switch (sortKey) {
      case "price_asc":
        return { sortBy: "startingPrice", sortOrder: "asc" };
      case "price_desc":
        return { sortBy: "startingPrice", sortOrder: "desc" };
      case "oldest":
        return { sortBy: "createdAt", sortOrder: "asc" };
      case "newest":
      default:
        return { sortBy: "createdAt", sortOrder: "desc" };
    }
  };

  const fetchAuctions = async () => {
    try {
      const { sortBy, sortOrder } = getSortConfig(sortParam);

      const params: any = {
        page,
        limit: PAGE_SIZE,
        sortBy: sortBy,     // Dynamic sort field
        sortOrder: sortOrder, // Dynamic sort order
        name: nameParam,
      };

      if (statusParam) params.status = statusParam;
      if (typeParam) params.auctionType = typeParam;

      const res = await apiClient.get("/auctions", { params });

      if (res.data?.success) {
        setTotalPages(res.data.meta?.totalPages || 1);
        const raw: AuctionItem[] = res.data.data || [];
        setAuctions(raw.map(mapAuction));
      } else {
        setAuctions([]);
      }
    } catch (err) {
      console.error("Fetch auctions error:", err);
      setAuctions([]);
    }
  };

  useEffect(() => {
    fetchAuctions();
    setSearchTerm(nameParam);
  }, [statusParam, pageParam, nameParam, typeParam, sortParam]); // Thêm sortParam vào dependency

  // --- Handlers ---

  // Xử lý khi chọn sort
  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // Reset về trang 1 khi đổi cách sắp xếp
    params.set("sort", value);
    router.push(`/auctions?${params.toString()}`);
  };

  // (Giữ nguyên các handler cũ: handleFilterChange, handleNameSearch, handlePageChange...)
  const handleFilterChange = (newFilters: FilterOptions) => {
    // ... (Code cũ của bạn)
    setPriceRange([newFilters.priceRange[0], newFilters.priceRange[1]]);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (newFilters.type && newFilters.type !== ("all" as any)) params.set("type", newFilters.type);
    else params.delete("type");
    if (newFilters.category && newFilters.category !== "all") params.set("category", newFilters.category);
    else params.delete("category");
    if (searchTerm) params.set("name", searchTerm);

    // Giữ nguyên sort khi filter thay đổi
    if (sortParam) params.set("sort", sortParam);

    router.push(`/auctions?${params.toString()}`);
    setPage(1);
  };

  const handleNameSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (searchTerm.trim()) params.set("name", searchTerm.trim());
    else params.delete("name");
    router.push(`/auctions?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/auctions?${params.toString()}`);
  };

  const filteredAuctions = auctions.filter(
    (a) => a.startingPrice >= priceRange[0] && a.startingPrice <= priceRange[1]
  );

  return (
    <main className="w-full min-h-screen font-sans bg-zinc-50">
      <Topbar />
      <Navbar />

      <div className="flex px-6 md:px-20 py-6 gap-2 items-center text-sm">
        <Link href="/" className="flex items-center hover:text-red-600 transition-colors">
          <Home className="w-4 h-4 mx-1" />
          <span>Trang chủ</span>
        </Link>
        <span className="text-gray-400">/</span>
        <span className="font-semibold text-gray-800">Tài sản đấu giá</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* --- KHU VỰC TOOLBAR: TÌM KIẾM - SẮP XẾP - BỘ LỌC --- */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">

          {/* 1. Thanh tìm kiếm */}
          <div className="relative flex-1">
            <Input
              placeholder="Tìm kiếm theo tên tài sản..."
              className="pl-10 h-12 text-base shadow-sm border-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNameSearch()}
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 cursor-pointer hover:text-gray-600"
              onClick={handleNameSearch}
            />
          </div>

          {/* 2. Nút Sắp xếp (Mới thêm vào) */}
          <div className="w-full md:w-[200px]">
            <Select value={sortParam} onValueChange={handleSortChange}>
              <SelectTrigger className="h-12 bg-white border-gray-300 text-gray-700 shadow-sm">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
                <SelectItem value="price_asc">Giá thấp đến cao</SelectItem>
                <SelectItem value="price_desc">Giá cao đến thấp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 3. Nút Bộ lọc */}
          <Button
            variant={showFilter ? "default" : "outline"}
            className={`h-12 px-6 gap-2 font-medium transition-all shadow-sm ${showFilter ? "bg-[#8B1E1E] text-white hover:bg-[#7a1a1a]" : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"}`}
            onClick={() => setShowFilter(!showFilter)}
          >
            <Filter className="w-4 h-4" />
            Bộ lọc
          </Button>
        </div>

        {/* --- PANEL BỘ LỌC --- */}
        {showFilter && (
          <AuctionFilter
            onFilterChange={handleFilterChange}
            currentType={statusParam || "all" as any}
            currentCategory={typeParam}
          />
        )}

        <h3 className="text-2xl font-bold mt-10 mb-6 text-gray-800 border-l-4 border-[#8B1E1E] pl-4">
          {statusParam === "now"
            ? "Đấu giá đang diễn ra"
            : statusParam === "upcoming"
              ? "Đấu giá sắp diễn ra"
              : statusParam === "completed"
                ? "Đấu giá đã kết thúc"
                : "Tất cả tài sản đấu giá"}
          {nameParam && <span className="text-gray-500 font-normal text-lg ml-2">- Tìm kiếm: "{nameParam}"</span>}
        </h3>

        {filteredAuctions.length > 0 ? (
          <>
            <SectionGrid items={filteredAuctions} />
            {/* Pagination Logic Giữ nguyên */}
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

                {getPaginationItems({ page, totalPages }).map(
                  (item, idx) =>
                    item === DOTS ? (
                      <span key={`dots-${idx}`} className="px-2">...</span>
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
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-100 mt-4">
            <Search className="w-16 h-16 text-gray-200 mb-4" />
            <p className="text-xl font-medium">Không tìm thấy tài sản nào phù hợp.</p>
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