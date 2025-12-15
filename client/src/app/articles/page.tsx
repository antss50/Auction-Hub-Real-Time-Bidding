"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import apiClient from "axios"; // Import axios instance của bạn
import { Article } from "../../types/article";
import Topbar from "../../components/Topbar";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SectionGrid from "../../components/SectionGrid";
import { Button } from "@auction-hub/shacdn-ui/button";
import { Input } from "@auction-hub/shacdn-ui/input";

function ArticlesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  
  // Params từ URL (để giữ trạng thái khi reload)
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "all";

  const getImageUrl = (imgData: any): string => {
    if (!imgData) return "/images/auction-logo.jpg";
    if (typeof imgData === 'object' && imgData.url) return imgData.url; 
    if (Array.isArray(imgData)) return imgData.length > 0 ? imgData[0].url : "/images/auction-logo.jpg";
    
    return "/images/auction-logo.jpg";
  };

  // Fetch dữ liệu
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const params = {
          page: page,
          limit:9, 
          sortBy: 'createdAt',
          sortOrder: 'desc',
          type: type === 'all' ? undefined : type
        };

        const res = await apiClient.get("/api/articles", { params });

        if (res.data.success) {
          const rawData = res.data.data || [];
          const mappedData = rawData.map((item: any) => ({
            ...item,
            image: getImageUrl(item.image) 
          }));
          
          setArticles(mappedData);
          setTotalPages(res.data.meta?.totalPages || 1);
        }
      } catch (error) {
        console.error("Lỗi tải tin tức:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [searchParams]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.push(`/articles?${params.toString()}`);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchTerm = formData.get("search") as string;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", searchTerm);
    params.set("page", "1"); 
    console.log("Search params:", params.toString());
    router.push(`/articles?${params.toString()}`);
  };

  // Xử lý Filter Type
  const handleTypeChange = (newType: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", newType);
    params.set("page", "1");
    console.log("Filter params:", params.toString());
    router.push(`/articles?${params.toString()}`);
  };

  return (
    <main className="w-full min-h-screen font-sans bg-gray-50">
      <Topbar />
      <Navbar />

      {/* Header & Breadcrumb */}
      <div className="bg-white border-b py-8 px-6 md:px-20">
        <div className="max-w-7xl mx-auto">
           <p className="text-sm text-gray-500 mb-2">Trang chủ {">"} <span className="text-black font-semibold">Tin tức</span></p>
        </div>
      </div>

      {/* Toolbar: Search & Filter */}
      <div className="max-w-7xl mx-auto px-6 md:px-20 py-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
                {['all', 'news', 'auction_notice', 'auction_report', 'legal_document'].map((t) => (
                    <button
                        key={t}
                        onClick={() => handleTypeChange(t)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            type === t 
                            ? "bg-[#980000] text-white" 
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        {t === 'all' ? 'Tất cả' : 
                         t === 'news' ? 'Tin tức' : 
                         t === 'auction_notice' ? 'Thông báo đấu giá' : 
                         t === 'auction_report' ? 'Điểm tin đấu giá' : 'Văn bản pháp luật'}
                    </button>
                ))}
            </div>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="relative w-full md:w-96">
                <Input 
                    name="search" 
                    defaultValue={search} 
                    placeholder="Tìm kiếm tin tức..." 
                    className="pl-10 pr-4 py-2 rounded-full border-gray-200 bg-gray-50 focus:bg-white transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </form>
        </div>

        {/* Content Grid */}
        <div className="mt-8">
            <h1 className="text-3xl font-bold text-gray-900">Tin tức & Thông báo mới nhất</h1>
            {loading ? (
                <div className="text-center py-20 text-gray-500">Đang tải dữ liệu...</div>
            ) : articles.length > 0 ? (
                <SectionGrid items={articles} />
            ) : (
                <div className="text-center py-20 text-gray-500">Không tìm thấy bài viết nào.</div>
            )}
        </div>

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
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                            page === p 
                            ? "bg-[#8B1E1E] text-white" 
                            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        {p}
                    </button>
                ))}

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
      </div>

      <Footer />
    </main>
  );
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ArticlesContent />
    </Suspense>
  );
}