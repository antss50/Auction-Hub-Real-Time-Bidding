"use client";

import { useState, useEffect } from 'react';
import { AdminActionService } from '../../services/admin-action.service';
import { Loader2, Gavel, CheckCircle, RefreshCcw, History, Crown, FileSignature, Users } from 'lucide-react';
import { formatCurrency } from '../../app/utils/format';

interface Props {
  auctionId: string;
  status: string;
}

export const AuctionFinalizationPanel = ({ auctionId, status }: Props) => {
  // Cập nhật các Tab mới: Evaluate, History, Contract
  const [activeTab, setActiveTab] = useState<'evaluate' | 'history' | 'contract'>('evaluate');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [isFinalized, setIsFinalized] = useState(false);
  const processAndFetch = async () => {
    setLoading(true);
    setData(null);

    try {
        // --- BƯỚC 1: FINALIZE (Nếu cần) ---
        let finalizeSuccess = isFinalized; 
        const isAuctionActive = ['scheduled', 'live'].includes(status);
        if (!finalizeSuccess && !isAuctionActive) {
            try {
                const finalizePayload = {
                    auctionId: auctionId,
                    notes: "Finalized after successful bidding session",
                    skipAutoEvaluation: false
                };

                const finalizeRes = await AdminActionService.finalizeAuction(finalizePayload);
                if (finalizeRes) {
                    finalizeSuccess = true;
                    setIsFinalized(true); 
                }
            } catch (err) {
                console.warn("Finalize warning:", err);
                finalizeSuccess = true; 
            }
        } else {
            finalizeSuccess = true;
        }

        // --- BƯỚC 2: FETCH DATA THEO TAB ---
        if (finalizeSuccess) {
            let res;
            if (activeTab === 'evaluate') {
                res = await AdminActionService.evaluateAuction(auctionId);
            } else if (activeTab === 'history') {
                // Tab Lịch sử dùng API Results để lấy thông tin đấu giá chi tiết
                res = await AdminActionService.getResults(auctionId);
            } else if (activeTab === 'contract') {
                // Tab Hợp đồng tạm thời chưa xử lý (có thể gọi results để check status hợp đồng sau này)
                 res = await AdminActionService.getContract(auctionId);
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
                    <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in">
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                            <FileSignature size={40} className="text-gray-400" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-800">Thông tin Hợp đồng</h4>
                        <p className="text-gray-500 max-w-sm mt-2">
                            Tính năng quản lý và xuất hợp đồng điện tử đang được phát triển. Vui lòng quay lại sau.
                        </p>
                        {/* Hiển thị raw data contract nếu có để debug tạm */}
                        {data.contract && (
                             <div className="mt-6 text-left bg-gray-50 p-4 rounded border text-xs text-gray-500 w-full max-w-md">
                                <p>Status: {data.contract.status}</p>
                                <p>Created At: {new Date(data.contract.createdAt).toLocaleString()}</p>
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