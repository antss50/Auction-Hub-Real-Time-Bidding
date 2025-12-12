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
import apiClient from '@auction-hub/axios';

const PAGE_SIZE = 12;

function AuctionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const statusParam = searchParams.get("type") as "now" | "upcoming" | "completed" | null;

  const pageParam = Number(searchParams.get("page") || 1);

  const [page, setPage] = useState(pageParam);
  const [totalPages, setTotalPages] = useState(1);

  const [auctions, setAuctions] = useState<AuctionItem[]>([]);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 9999999999999]);

  const getRandomImage = (id: string) => {
    const images = ["/images/auction-logo.jpg", "/images/auction-logo.jpg"];
    return images[id.charCodeAt(id.length - 1) % images.length];
  };

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
    image: getRandomImage(item.id),
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
        const raw: ApiAuctionItem[] = res.data.data || [];

        setAuctions(raw.map(mapAuction));
        setTotalPages(res.data.meta?.totalPages || 1);
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

            {/* Pagination */}
            <div className="flex justify-center gap-4 mt-10">
              <button
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100"
              >
                Trang trước
              </button>

              <span className="px-4 py-2">
                {page} / {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100"
              >
                Trang sau
              </button>
            </div>
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
