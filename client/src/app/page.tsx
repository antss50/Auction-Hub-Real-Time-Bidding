/* eslint-disable @nx/enforce-module-boundaries */
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@auction-hub/shacdn-ui/button";
import SectionGrid from "../components/SectionGrid";
import Topbar from "../components/Topbar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuctionItem, ApiAuctionItem, AuctionResponse } from "../types/auction";
import apiClient from "@auction-hub/axios";
import { Article } from "../types/article";
import { getImageUrl } from "./utils/format";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState("");
  const [auctions, setAuctions] = useState<AuctionResponse>({
    ongoing: [],
    upcoming: [],
    past: [],
  });
  const [articles, setArticles] = useState<Article[]>([]);

  const mapAuction = (item: ApiAuctionItem): AuctionItem => {
    const start = new Date(item.auctionStartAt);

    return {
      id: item.id,
      name: item.name,
      startingPrice: Number(item.startingPrice),
      deposit: Number(item.depositAmountRequired),
      time: start.toLocaleString("vi-VN", {
        hour12: false,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      image: getImageUrl(item.images),
      location: ""
    };
  };

  const fetchByStatus = async (status: "now" | "upcoming" | "completed") => {
    const res = await apiClient.get("/auctions", {
      params: { status, limit: 8, page: 1 },
    });

    return (res.data.data || []).map(mapAuction);
  };

  const fetchArticles = async () => {
    try {
      const res = await apiClient.get("/articles", {
        params: { 
            limit: 4, 
            page: 1, 
            sortBy: 'createdAt', 
            sortOrder: 'desc' 
        },
      });
      console.log("Url of image:", res.data.data.map((item: any) => getImageUrl(item.image)));
      if (res.data.success && res.data.data) {
        return res.data.data.map((article: any) => ({
            ...article,
            image: getImageUrl(article.image)
        }));
      }
    } catch (error) {
      console.error("Lỗi tải tin tức:", error);
    }
    return [];
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const [ongoing, upcoming, past, fetchedArticles] = await Promise.all([
          fetchByStatus("now"),
          fetchByStatus("upcoming"),
          fetchByStatus("completed"),
          fetchArticles()
        ]);

        setAuctions({ ongoing, upcoming, past });
        setArticles(fetchedArticles || []);
      } catch (err) {
        console.error("Error fetching auctions:", err);
      }

      setLoading(false);
    };

    load();
  }, []);

  // Real-time clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("vi-VN", { hour12: false }) +
        " | " +
        now.toLocaleDateString("vi-VN")
      );
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <main className="w-full min-h-screen font-sans">
      {/* Topbar */}
      <Topbar />
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center text-center text-white">
        {/* Background */}
        <Image
          src="/images/auction-background.jpg"
          alt="Auction background"
          fill
          className="object-cover -z-10"
          priority
        />
        <div className="absolute inset-0 bg-black/50 -z-10" />

        {/* Content */}
        <div className="max-w-6xl px-6 py-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-snug drop-shadow-lg text-start">
            CÔNG TY ĐẤU GIÁ HỢP DANH THÀNH CÔNG
            <br />
            TRANG THÔNG TIN ĐẤU GIÁ TRỰC TUYẾN
          </h1>
          <p className="mb-6 text-xl drop-shadow text-start">
            Tham gia đấu giá trực tuyến với quy trình minh bạch, an toàn và hiệu
            quả. Chúng tôi kết nối người mua và người bán thông qua nền tảng
            công nghệ hiện đại.
          </p>
          <div className="flex justify-start gap-4">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-8 py-6 rounded-lg shadow-lg cursor-pointer">
              Đăng ký ngay
            </Button>
            <Button
              variant="outline"
              className="bg-gray-200 hover:bg-gray-300 text-black font-semibold px-8 py-6 rounded-lg cursor-pointer"
            >
              Tìm hiểu thêm
            </Button>
          </div>
        </div>
      </section>

      {/* Auction Sections */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        {auctions.ongoing.length > 0 && (
          <SectionBlock
            title="⚖️ Đấu giá đang diễn ra"
            type="now"
            items={auctions.ongoing}
            linkPrefix="/auctions?type="
          />
        )}

        {auctions.upcoming.length > 0 && (
          <SectionBlock
            title="⚖️ Đấu giá sắp diễn ra"
            type="upcoming"
            items={auctions.upcoming}
            linkPrefix="/auctions?type="
          />
        )}

        {auctions.past.length > 0 && (
          <SectionBlock
            title="⚖️ Đấu giá đã diễn ra"
            type="completed"
            items={auctions.past}
            linkPrefix="/auctions?type="
          />
        )}

        {articles.length > 0 && (
          <SectionBlock
            title="📰 Tin tức mới nhất"
            type="" 
            items={articles}
            linkPrefix="/articles" 
            isArticle={true}
          />
        )}
      </div>

      <Footer />
    </main>
  );
}

const SectionBlock = ({ title, type, items, linkPrefix, isArticle = false }: any) => {
  const seeAllLink = isArticle ? linkPrefix : `${linkPrefix}${type}`;
  return (
  <>
    <div className="flex items-center justify-between mt-10">
      <h2 className="text-2xl font-bold">{title}</h2>
      <a href={seeAllLink} className="text-lg">
        <i>
          <u>Xem tất cả</u>
        </i>
      </a>
    </div>

    <SectionGrid items={items} />
  </>
  )
};
