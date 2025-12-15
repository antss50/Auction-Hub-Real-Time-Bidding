import React from 'react';
import { Edit, Trash2, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { AuctionItem } from '../../types/auction'; 
import { formatCurrency, getImageUrl } from '../../app/utils/format'; 
import Image from 'next/image';

interface Props {
  auctions: AuctionItem[];
  loading: boolean;
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
    setPage: (page: number) => void;
  };
  onEdit: (item: AuctionItem) => void;
  onDelete: (id: string) => void;
}

export const AuctionsTable = ({ auctions, loading, onEdit, onDelete, pagination }: Props) => {
  const { page, totalPages, totalItems, setPage } = pagination;
  console.log ('AuctionsTable render with auctions:', auctions.map(a => a.image));
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Phiên đấu giá gần đây</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* --- HEADER --- */}
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-semibold">Tên tài sản</th>
              <th className="px-6 py-4 font-semibold">Giá khởi điểm</th>
              <th className="px-6 py-4 font-semibold">Người đặt cao nhất</th>
              <th className="px-6 py-4 font-semibold">Trạng thái</th>
              <th className="px-6 py-4 font-semibold text-right">Hành động</th>
            </tr>
          </thead>

          {/* --- BODY --- */}
          <tbody className="divide-y divide-gray-100">
            {/* 1. Trạng thái Loading */}
            {loading ? (
              <tr>
                <td colSpan={5} className="p-10 text-center">
                  <div className="flex justify-center items-center gap-2 text-gray-500">
                    <Loader2 className="animate-spin" size={20} />
                    <span>Đang tải dữ liệu...</span>
                  </div>
                </td>
              </tr>
            ) : auctions.length === 0 ? (
              /* 2. Trạng thái Trống (Không có dữ liệu) */
              <tr>
                <td colSpan={5} className="p-10 text-center text-gray-500 italic">
                  Chưa có phiên đấu giá nào.
                </td>
              </tr>
            ) : (
              /* 3. Hiển thị dữ liệu */
              auctions.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                  {/* Cột Tên */}
                  <td className="px-6 py-4">
                    <div className="flex gap-3 items-center">
                      <div className="relative w-16 h-12 rounded overflow-hidden flex-shrink-0 bg-gray-100 border">
                       <Image src={getImageUrl(item.image) || '/placeholder.jpg'} alt="" fill className="object-cover" />
                      </div>                                                    
                      <div className="font-medium text-gray-800 line-clamp-1" title={item.name}>
                        {item.name}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{item.id}</div>
                  </td>

                  {/* Cột Giá */}
                  <td className="px-6 py-4 font-bold text-[#990000]">
                    {formatCurrency(item.startingPrice)}
                  </td>

                  {/* Cột Người đặt cao nhất (Logic hiển thị tạm thời) */}
                  {/* <td className="px-6 py-4 text-gray-600 text-sm">
                    {item.status === 'upcoming' ? (
                        <span className="text-gray-400 italic">-- Sắp diễn ra --</span>
                    ) : item.highestBid ? (
                        <span className="font-medium text-black">{formatCurrency(item.highestBid)}</span>
                    ) : (
                        <span className="text-gray-400">-</span>
                    )}
                  </td> */}

                  {/* Cột Trạng thái */}
                  <td className="px-6 py-4">
                    <StatusBadge status={item.status || ''} />
                  </td>

                  {/* Cột Hành động */}
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50 rounded-b-lg">
          <span className="text-sm text-gray-500">
            Hiển thị trang <span className="font-medium">{page}</span> / <span className="font-medium">{totalPages}</span> ({totalItems} kết quả)
          </span>
          
          <div className="flex items-center gap-1">
            <button 
                onClick={() => setPage(page - 1)} 
                disabled={page === 1}
                className="p-2 border rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
            >
                <ChevronLeft size={16} />
            </button>
            <button 
                onClick={() => setPage(page + 1)} 
                disabled={page === totalPages}
                className="p-2 border rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
            >
                <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB COMPONENT: Status Badge ---
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'active':
    case 'happening': // Backend có thể trả về 'happening' hoặc 'active'
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <span className="w-2 h-2 mr-1 bg-green-500 rounded-full animate-pulse"></span>
          Đang diễn ra
        </span>
      );
    case 'scheduled':
    case 'upcoming':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <span className="w-2 h-2 mr-1 bg-yellow-500 rounded-full"></span>
          Sắp diễn ra
        </span>
      );
    case 'ended':
    case 'completed':
    case 'past':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Đã kết thúc
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
          {status}
        </span>
      );
  }
};