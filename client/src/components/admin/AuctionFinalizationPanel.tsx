"use client";

import { useState, useEffect } from 'react';
import { AdminActionService } from '../../services/admin-action.service';
import { Loader2, Gavel, CheckCircle, RefreshCcw, History, Crown, FileSignature, Users, Download } from 'lucide-react';
import { formatCurrency } from '../../app/utils/format';
import { toast } from 'sonner';

interface Props {
  auctionId: string;
  propertyOwner: {
    fullName: string;
    email: string;
    identityNumber: string;
    phone: string;
  }
  status: string;
}

export const AuctionFinalizationPanel = ({ auctionId, status, propertyOwner }: Props) => {
  // Cập nhật các Tab mới: Evaluate, History, Contract
  const [activeTab, setActiveTab] = useState<'evaluate' | 'history' | 'contract'>('evaluate');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [isFinalized, setIsFinalized] = useState(false);
  const processAndFetch = async () => {
    setLoading(true);
    // setData(null);

    try {
        // --- BƯỚC 1: FINALIZE (Nếu cần) ---
        let currentFinalizedState = isFinalized; 
        const isAuctionActive = ['scheduled', 'live'].includes(status);
        if (!currentFinalizedState && !isAuctionActive) {
            try {
                const finalizePayload = {
                    auctionId: auctionId,
                    notes: "Finalized after successful bidding session",
                    skipAutoEvaluation: false
                };

                const finalizeRes = await AdminActionService.finalizeAuction(finalizePayload);
                if (finalizeRes) {
                    currentFinalizedState = true;
                    setIsFinalized(true); 
                }
            } catch (err) {
                console.warn("Finalize warning:", err);
                currentFinalizedState = true; 
            }
        } else {
            currentFinalizedState = true;
        }

        // --- BƯỚC 2: FETCH DATA THEO TAB ---
        if (currentFinalizedState) {
            let res;
            if (activeTab === 'evaluate') {
                res = await AdminActionService.evaluateAuction(auctionId);
            } else if (activeTab === 'history') {
                // Tab Lịch sử dùng API Results để lấy thông tin đấu giá chi tiết
                res = await AdminActionService.getResults(auctionId);
            } else if (activeTab === 'contract') {
                // 1. Lấy thông tin kết quả để có ContractID
                const resultRes = await AdminActionService.getResults(auctionId);
                
                // 2. Kiểm tra xem đã có ContractID chưa
                if (resultRes?.data?.contract?.contractId) {
                    const contractId = resultRes.data.contract.contractId;
                    console.log("Fetching contract ID:", contractId); // Debug 1
                    
                    // 3. Gọi lấy chi tiết hợp đồng
                    res = await AdminActionService.getContract(contractId);
                    console.log("Contract Data:", res.data); 
                } else {
                    console.log("Chưa tìm thấy contractId trong kết quả");
                    setData(null); // Không có hợp đồng
                    return;
                }
            }

            if (res && res.success) {
                setData(res.data);
            }
        }

    } catch (error) {
        console.error("Error in admin panel:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (auctionId) processAndFetch();
  }, [auctionId, activeTab]);

   const handleDownloadPdf = async () => {
    if (!data || !data.id) return;
    
    setLoading(true);
    try {
      // 1. Gọi API lấy Blob
      const blob = await AdminActionService.downloadContract(data.id);
      
      // 2. Tạo URL ảo từ Blob
      const url = window.URL.createObjectURL(new Blob([blob]));
      
      // 3. Tạo thẻ <a> ẩn để kích hoạt tải xuống
      const link = document.createElement('a');
      link.href = url;
      // Đặt tên file khi tải về
      link.setAttribute('download', `Hop-dong-${data.auctionCode || 'mua-ban'}.pdf`);
      
      // 4. Append vào body, click và dọn dẹp
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url); // Xóa URL ảo để giải phóng bộ nhớ
      
      toast.success("Tải hợp đồng thành công!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Không thể tải hợp đồng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* --- HEADER TABS --- */}
      <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between flex-wrap gap-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Gavel className="text-rose-600" size={20}/>
            Trung tâm kiểm soát
        </h3>
        <div className="flex bg-white rounded-lg p-1 border shadow-sm">
            <button 
                onClick={() => setActiveTab('evaluate')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'evaluate' ? 'bg-rose-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                1. Đánh giá
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'history' ? 'bg-rose-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                2. Lịch sử & Kết quả
            </button>
            <button 
                onClick={() => setActiveTab('contract')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'contract' ? 'bg-rose-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                3. Hợp đồng
            </button>
        </div>
        <button onClick={processAndFetch} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full" title="Tải lại">
            <RefreshCcw size={18} />
        </button>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="p-6 min-h-[300px]">
        {loading ? (
            <div className="flex h-40 items-center justify-center text-gray-500 gap-2">
                <Loader2 className="animate-spin" /> Đang xử lý dữ liệu...
            </div>
        ) : !data ? (
            <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-xl">
                Không có dữ liệu hiển thị.
            </div>
        ) : (
            <>
                {/* === TAB 1: EVALUATE (ĐÁNH GIÁ) === */}
                {activeTab === 'evaluate' && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {/* Box 1: Trạng thái */}
                             <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                <p className="text-xs text-blue-600 uppercase font-bold mb-1">Trạng thái hiện tại</p>
                                <p className="text-xl font-bold uppercase text-blue-800">
                                    {data.currentStatus || 'N/A'}
                                </p>
                             </div>
                             
                             {/* Box 2: Số lượng người tham gia */}
                             <div className={`p-4 border rounded-lg ${data.hasMinimumParticipants ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                                <p className={`text-xs uppercase font-bold mb-1 ${data.hasMinimumParticipants ? 'text-green-600' : 'text-orange-600'}`}>
                                    Số lượng người tham gia
                                </p>
                                <div className="flex items-center gap-2">
                                    {data.hasMinimumParticipants ? (
                                        <>
                                            <CheckCircle size={20} className="text-green-600"/>
                                            <span className="text-lg font-bold text-green-800">Đạt yêu cầu</span>
                                        </>
                                    ) : (
                                        <>
                                            <Users size={20} className="text-orange-600"/>
                                            <span className="text-lg font-bold text-orange-800">Không đủ số lượng tối thiểu</span>
                                        </>
                                    )}
                                </div>
                             </div>
                        </div>

                        {/* Phần hiển thị Winner dự kiến (nếu có) từ API Evaluate */}
                        {data.hasWinner && (
                            <div className="border border-gray-200 bg-gray-50 p-4 rounded-lg opacity-75">
                                <p className="text-sm font-medium text-gray-500 mb-1">Ghi chú hệ thống:</p>
                                <p className="text-gray-700 text-sm">
                                    Hệ thống đề xuất trạng thái: <strong className="uppercase">{data.recommendedStatus}</strong> với giá thắng: <strong>{formatCurrency(Number(data.winningAmount))}</strong>
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* === TAB 2: HISTORY (LỊCH SỬ & KẾT QUẢ) === */}
                {activeTab === 'history' && (
                    <div className="space-y-6 animate-in fade-in">
                        
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Card: Tổng số lượt */}
                            <div className="bg-white border rounded-xl p-5 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm font-medium">Tổng số lượt đặt giá</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{data.totalBids || 0}</p>
                                </div>
                                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                                    <History size={20} />
                                </div>
                            </div>

                            {/* Card: Người chiến thắng */}
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-100 rounded-xl p-5 shadow-sm relative overflow-hidden">
                                {data.winningBid?.winner ? (
                                    <div className="relative z-10">
                                        <p className="text-yellow-800 text-sm font-bold flex items-center gap-1">
                                            <Crown size={16} /> NGƯỜI CHIẾN THẮNG
                                        </p>
                                        <div className="mt-2">
                                            <p className="text-lg font-bold text-gray-900">
                                                {data.winningBid.winner.fullName}
                                            </p>
                                            <p className="text-2xl font-bold text-rose-600 mt-1">
                                                {formatCurrency(Number(data.winningBid.amount))}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative z-10 flex flex-col justify-center h-full">
                                        <p className="text-gray-500 italic">Chưa có người chiến thắng</p>
                                    </div>
                                )}
                                <Crown className="absolute -bottom-4 -right-4 text-yellow-200 opacity-50" size={80} />
                            </div>
                        </div>

                        {/* Table: Danh sách lệnh đặt giá */}
                        <div className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b">
                                <h4 className="font-bold text-gray-700 text-sm">Danh sách chi tiết lệnh đặt giá</h4>
                            </div>
                            <div className="max-h-[400px] overflow-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-white text-gray-500 uppercase text-xs sticky top-0 shadow-sm z-10">
                                        <tr>
                                            <th className="px-4 py-3 bg-gray-50">Thời gian</th>
                                            <th className="px-4 py-3 bg-gray-50">Người đặt giá</th>
                                            <th className="px-4 py-3 bg-gray-50 text-right">Số tiền</th>
                                            <th className="px-4 py-3 bg-gray-50 text-center">Loại lệnh</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.allBids && data.allBids.length > 0 ? (
                                            data.allBids.map((bid: any) => (
                                                <tr 
                                                    key={bid.bidId} 
                                                    className={`transition-colors ${
                                                        bid.isWinningBid 
                                                        ? 'bg-yellow-50 hover:bg-yellow-100' // Highlight winner row
                                                        : 'hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                                        {new Date(bid.bidAt).toLocaleString('vi-VN')}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-gray-800">
                                                        <div className="flex items-center gap-2">
                                                            {bid.isWinningBid && <Crown size={14} className="text-yellow-600" />}
                                                            {bid.bidderName}
                                                        </div>
                                                    </td>
                                                    <td className={`px-4 py-3 text-right font-bold ${bid.isWinningBid ? 'text-rose-600' : 'text-gray-700'}`}>
                                                        {formatCurrency(Number(bid.amount))}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                                                            {bid.bidType}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={4} className="p-8 text-center text-gray-400">Không có dữ liệu.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* === TAB 3: CONTRACT (HỢP ĐỒNG) === */}
                {activeTab === 'contract' && (
    <div className="animate-in fade-in space-y-6">
        {data && data.id ? (
            <div className="max-w-3xl mx-auto">
                {/* Contract Card Container */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    
                    {/* 1. Header Card: ID & Trạng thái */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                <FileSignature size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Hợp đồng Mua bán Tài sản</h4>
                                <p className="text-xs text-gray-500 font-mono">ID: {data.id}</p>
                            </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div className={`px-4 py-1.5 rounded-full text-sm font-bold border flex items-center gap-2 ${
                            data.status === 'signed' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                            <span className={`w-2 h-2 rounded-full ${data.status === 'signed' ? 'bg-green-600' : 'bg-yellow-600'}`}></span>
                            {data.status === 'signed' ? "Đã kí kết" : "Chờ thanh toán"}
                        </div>
                    </div>

                    {/* 2. Body Card: Thông tin chi tiết */}
                    <div className="p-8">
                        
                        {/* Tên cuộc đấu giá & Giá trị */}
                        <div className="mb-8 text-center pb-8 border-b border-dashed border-gray-200">
                            <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Tài sản đấu giá</p>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">{data.auctionName}</h3>
                            
                            <div className="inline-block bg-rose-50 px-6 py-3 rounded-xl border border-rose-100">
                                <p className="text-xs text-rose-600 font-bold uppercase mb-1">Giá trị hợp đồng</p>
                                <p className="text-3xl font-bold text-rose-700">
                                    {formatCurrency(Number(data.price))}
                                </p>
                            </div>
                        </div>

                        {/* Thông tin 2 bên: Bán & Mua */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* Bên A: Người Bán */}
                            <div className="space-y-3">
                                <h5 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                                    <span className="bg-gray-200 text-xs px-2 py-0.5 rounded text-gray-700">Bên A</span>
                                    Chủ sở hữu tài sản
                                </h5>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <p className="text-gray-500 text-xs">Họ và tên</p>
                                        <p className="font-medium text-gray-900">{propertyOwner?.fullName || "Chưa cập nhật"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">Số CCCD</p>
                                        <p className="font-mono text-xs text-gray-600 truncate bg-gray-50 p-1 rounded">
                                            {data.sellerIdentityNumber || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Bên B: Người Mua */}
                            <div className="space-y-3">
                                <h5 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                                    <span className="bg-gray-200 text-xs px-2 py-0.5 rounded text-gray-700">Bên B</span>
                                    Người trúng đấu giá
                                </h5>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <p className="text-gray-500 text-xs">Họ và tên</p>
                                        <p className="font-medium text-gray-900">{data.buyerName || data.buyerFullName || "Chưa cập nhật"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs">Mã định danh</p>
                                        <p className="font-mono text-xs text-gray-600 truncate bg-gray-50 p-1 rounded">
                                            {data.buyerIdentityNumber || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Footer Card: Metadata & Action */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
                        <div className="flex gap-4">
                            <span>Ngày tạo: <span className="font-medium text-gray-700">{new Date(data.createdAt).toLocaleString('vi-VN')}</span></span>
                            {data.updatedAt && (
                                <span>Cập nhật lần cuối: <span className="font-medium text-gray-700">{new Date(data.updatedAt).toLocaleString('vi-VN')}</span></span>
                            )}
                        </div>
                        {/* Nút hành động giả lập (ví dụ tải PDF) */}
                        <button
                          onClick={handleDownloadPdf}
                          disabled={loading}
                         className="text-blue-600 hover:underline font-medium hover:text-blue-800 transition-colors">
                            {loading ? (
            <Loader2 size={16} className="animate-spin" />
        ) : (
            <Download size={16} />
        )}
        {loading ? "Đang tải..." : "Tải về bản PDF"}
                        </button>
                    </div>
                </div>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <FileSignature size={48} className="text-gray-300" />
                </div>
                <h4 className="text-lg font-bold text-gray-800">Hợp đồng chưa được khởi tạo</h4>
                <p className="text-gray-500 max-w-sm mt-2">
                    Hệ thống chưa tìm thấy dữ liệu hợp đồng cho phiên đấu giá này. Vui lòng kiểm tra lại trạng thái kết thúc phiên.
                </p>
            </div>
        )}
    </div>
)}
            </>
        )}
      </div>
    </div>
  );
};