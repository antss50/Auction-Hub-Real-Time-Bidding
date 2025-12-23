"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AuctionService } from '../../../../services/auction.service'; 
import { AuctionFinalizationPanel } from '../../../../components/admin/AuctionFinalizationPanel'; 
import { ArrowLeft, Loader2, DollarSign, MapPin, PlayCircle, Clock, CheckCircle2 } from 'lucide-react';
import { formatCurrency, getImageUrl } from '../../../utils/format'; 

export default function AdminAuctionDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [auction, setAuction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await AuctionService.getOne(id);
        setAuction(res.success ? res.data : res);
      } catch (error) {
        console.error("Lỗi tải chi tiết:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-rose-600" size={32} /></div>;
  if (!auction) return <div className="p-8 text-center text-gray-500">Không tìm thấy phiên đấu giá.</div>;

  const isLive = auction.status === 'happening' || auction.status === 'live' || auction.status === 'now';

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4">
      
      {/* --- HEADER --- */}
      <div className="flex items-center gap-3">
        <Link href="/admin/auctions" className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <ArrowLeft size={24} />
        </Link>
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết phiên đấu giá</h1>
            <p className="text-sm text-gray-500">Quản lý, giám sát và kết thúc phiên</p>
        </div>
      </div>

      {/* --- MAIN CONTENT (Layout giống User Detail) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: IMAGE GALLERY */}
          <div className="lg:col-span-7 space-y-4">
              <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden border">
                  <Image 
                    src={getImageUrl(auction.images && auction.images[0] ? auction.images[0] : "")} 
                    alt={auction.name} 
                    fill 
                    className="object-contain" 
                  />
                  <div className="absolute top-4 left-4 bg-yellow-400 text-black font-bold px-3 py-1 rounded text-sm shadow-sm">
                    {auction.assetType === 'secured_asset' ? 'Tài sản đảm bảo' : 'Tài sản công'}
                  </div>
              </div>
              {/* Thumbnails (nếu có nhiều ảnh) */}
              {auction.images && auction.images.length > 1 && (
                 <div className="flex gap-2 overflow-x-auto pb-2">
                    {auction.images.map((img: any, idx: number) => (
                        <div key={idx} className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border flex-shrink-0">
                             <Image src={getImageUrl(img)} alt="" fill className="object-cover" />
                        </div>
                    ))}
                 </div>
              )}
          </div>

          {/* RIGHT: INFO & ACTIONS */}
          <div className="lg:col-span-5 space-y-6">
              
              {/* Title & Status */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{auction.name}</h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
                      <span className="bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">{auction.code}</span>
                      <span className="flex items-center gap-1"><MapPin size={16}/> {auction.assetProvince?.name || 'Toàn quốc'}</span>
                  </div>
                  
                  {/* Status Badge Big */}
                  <div className={`text-center py-3 rounded-lg font-bold uppercase tracking-wide mb-4 ${
                      isLive ? 'bg-green-100 text-green-700 animate-pulse' : 
                      auction.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-gray-100 text-gray-600'
                  }`}>
                      {isLive ? '● Đang diễn ra' : auction.status === 'scheduled' ? 'Sắp diễn ra' : 'Đã kết thúc'}
                  </div>

                  {/* Nút vào phòng Live (Chỉ hiện khi đang Live) */}
                  {isLive && (
                    <Link 
                        href={`/live-auction/${auction.id}`} 
                        className="block w-full text-center bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-rose-200 transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <PlayCircle size={20} />
                        Vào phòng giám sát ngay
                    </Link>
                  )}
              </div>

              {/* Price Grid */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-blue-50 px-6 py-3 border-b border-rose-100 flex items-center gap-2">
                      <DollarSign className="text-blue-600" size={20}/>
                      <span className="font-bold text-blue-800">Thông tin tài chính</span>
                  </div>
                  <div className="p-6 grid grid-cols-2 gap-y-4 gap-x-2">
                      <div>
                          <p className="text-xs text-gray-500">Giá khởi điểm</p>
                          <p className="font-bold text-lg">{formatCurrency(auction.startingPrice)}</p>
                      </div>
                      <div>
                          <p className="text-xs text-gray-500">Bước giá</p>
                          <p className="font-bold text-lg">{formatCurrency(auction.bidIncrement)}</p>
                      </div>
                      <div className="pt-4 border-t col-span-2 grid grid-cols-2">
                        <div>
                            <p className="text-xs text-gray-500">Tiền đặt trước</p>
                            <p className="font-medium">{formatCurrency(auction.depositAmountRequired)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Phí tham gia</p>
                            <p className="font-medium">{formatCurrency(auction.saleFee)}</p>
                        </div>
                      </div>
                  </div>
              </div>

              {/* Time Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                   <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex items-center gap-2">
                      <Clock className="text-blue-600" size={20}/>
                      <span className="font-bold text-blue-800">Mốc thời gian</span>
                  </div>
                  <div className="p-6 space-y-4">
                      <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Đăng ký tham gia</span>
                          <div className="text-right">
                              <p className="text-sm font-medium">{new Date(auction.saleStartAt).toLocaleDateString('vi-VN')}</p>
                              <p className="text-xs text-gray-400">đến {new Date(auction.saleEndAt).toLocaleDateString('vi-VN')}</p>
                          </div>
                      </div>
                      <div className="flex justify-between items-center border-t pt-3">
                          <span className="text-sm text-gray-600 font-bold">Thời gian đấu giá</span>
                          <div className="text-right">
                              <p className="text-sm font-bold text-rose-600">
                                {new Date(auction.auctionStartAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} 
                                <span className="mx-1">-</span>
                                {new Date(auction.auctionStartAt).toLocaleDateString('vi-VN')}
                              </p>
                              <p className="text-xs text-gray-500">
                                Kết thúc dự kiến: {new Date(auction.auctionEndAt).toLocaleString('vi-VN')}
                              </p>
                          </div>
                      </div>
                  </div>
              </div>

          </div>
      </div>

      {/* --- ADMIN CONTROL: FINALIZATION PANEL --- */}
      {/* Component này sẽ nằm dưới cùng, phục vụ việc kết thúc phiên */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-green-600" />
            Khu vực xử lý kết thúc phiên
        </h3>
        <AuctionFinalizationPanel auctionId={id} status={auction.status} />
      </div>

    </div>
  );
}