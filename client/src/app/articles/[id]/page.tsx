"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Calendar, User, ChevronRight } from "lucide-react";
import DOMPurify from "isomorphic-dompurify"; 

import apiClient from "axios";
import Topbar from "../../../components/Topbar";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { getImageUrl, formatDate } from "../../utils/format";
import { Article } from "../../../types/article";

interface ArticleDetail extends Article {
  content: string;
  relatedArticles: Article[];
}

export default function ArticleDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticleDetail = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/api/articles/${id}`);
        if (res.data.success && res.data.data) {
          setArticle(res.data.data);
        }
      } catch (error) {
        console.error("Lỗi tải chi tiết bài viết:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchArticleDetail();
  }, [id]);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!article) return <div className="flex h-screen items-center justify-center">Bài viết không tồn tại.</div>;

  const imageUrl = getImageUrl(article.image);

  return (
    <main className="w-full min-h-screen font-sans bg-gray-50">
      <Topbar />
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b py-4">
        <div className="max-w-7xl mx-auto px-6 md:px-20 flex items-center text-sm text-gray-500 gap-2 overflow-hidden whitespace-nowrap">
          <Link href="/" className="hover:text-[#8B1E1E]">Trang chủ</Link>
          <ChevronRight size={14} />
          <Link href="/articles" className="hover:text-[#8B1E1E]">Tin tức</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium truncate">{article.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-20 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* === LEFT COLUMN: ARTICLE CONTENT === */}
        <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            {/* Meta Info */}
            <div className="flex items-center gap-4 mb-4">
                <span className="bg-[#FFE5E5] text-[#8B1E1E] text-xs font-bold px-2 py-1 rounded uppercase">
                    {article.type === 'news' ? 'Tin tức' : 'Thông báo'}
                </span>
                <span className="text-gray-500 text-sm flex items-center gap-1">
                    <Calendar size={14} /> {formatDate(article.createdAt)}
                </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
                {article.title}
            </h1>

            {/* Author */}
            <div className="flex items-center gap-2 mb-8 pb-8 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <User size={20} />
                </div>
                <div>
                    <p className="text-sm text-gray-500">Tác giả</p>
                    <p className="font-bold text-gray-900">{article.author}</p>
                </div>
            </div>
            
            {/* Main Image (Nếu muốn hiển thị cover ở đầu bài) */}
            <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
                <Image src={imageUrl} alt={article.title} fill className="object-cover" />
            </div> 
           

            {/* Content (HTML Render) */}
            <div 
                className="prose prose-lg max-w-none text-gray-800 
                prose-headings:font-bold prose-headings:text-gray-900
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto prose-img:w-full"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
            />
            
            {/* Source / Footer of Article */}
            <div className="mt-10 pt-6 border-t border-gray-100 text-right">
                <p className="text-gray-500 italic text-sm">Nguồn: Theo báo cáo</p>
            </div>
        </div>

        {/* === RIGHT COLUMN: RELATED ARTICLES === */}
        <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                <h3 className="font-bold text-xl text-gray-900 mb-6 border-l-4 border-[#8B1E1E] pl-3">
                    Bài viết liên quan
                </h3>

                <div className="space-y-6">
                    {article.relatedArticles && article.relatedArticles.length > 0 ? (
                        article.relatedArticles.map((related) => (
                            <Link 
                                key={related.id} 
                                href={`/articles/${related.id}`}
                                className="group flex gap-4 items-start"
                            >
                                <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                                    <Image 
                                        src={getImageUrl(related.image)} 
                                        alt={related.title} 
                                        fill 
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800 text-sm line-clamp-2 group-hover:text-[#8B1E1E] transition-colors mb-2">
                                        {related.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[#8B1E1E] font-medium">
                                            {related.type === 'news' ? 'Tin tức' : 'Thông báo'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar size={10} /> {formatDate(related.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm italic">Không có bài viết liên quan.</p>
                    )}
                </div>
            </div>
        </div>

      </div>

      <Footer />
    </main>
  );
}