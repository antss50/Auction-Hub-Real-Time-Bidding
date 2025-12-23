"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, notFound } from "next/navigation";
import Image from "next/image";
import { io, Socket } from 'socket.io-client';
import Topbar from "../../../components/Topbar";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { placeManualBid } from '../../../services/auctionsService';
import { AdminActionService } from '../../../services/admin-action.service'; // Đảm bảo bạn đã tạo file này theo hướng dẫn trước
import { CountdownTimer } from '../../../components/CountdownTimer';
import { toast } from "sonner";
import Cookies from 'js-cookie';
import { AlertTriangle, XCircle, Gavel } from 'lucide-react';
import {
    getAuctionById,
} from '../../../services/auctionsService';
import { AuctionDetail } from '../../../types/auction';

// Cập nhật interface cho Bid
interface BidHistoryItem {
    bidId: string;
    amount: number;
    bidAt: string;
    bidderName: string;
    isDenied?: boolean;       
    deniedReason?: string;   
}

interface AuctionState {
    auctionEndAt: string;
    auctionId: string;
    name: string;
    code: string;
    status: string;
    startingPrice: number;
    bidIncrement: number;
    timeRemaining: number;
    currentWinningBid: {
        amount: number;
        bidderName: string;
    } | null;
    nextMinimumBid: number;
    bidHistory: BidHistoryItem[];
    hasEnded: boolean;
}

export default function LiveAuctionPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    // --- STATE ---
    const [socket, setSocket] = useState<Socket | null>(null);
    const [auctionState, setAuctionState] = useState<AuctionState | null>(null);
    const [bidAmount, setBidAmount] = useState<number>(0);
    const [isAutoMode, setIsAutoMode] = useState(true);
    const [isBidding, setIsBidding] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    // State cho Admin
    const [isAdmin, setIsAdmin] = useState(false);
    const [isDenying, setIsDenying] = useState<string | null>(null); // Lưu ID của bid đang bị xử lý

    const [auction, setAuction] = useState<AuctionDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        if (!id) return;
        try {
            const auctionData = await getAuctionById(id);
            setAuction(auctionData);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- AUTH & SOCKET CONNECTION ---
    useEffect(() => {
        loadData();
        const token = Cookies.get('access_token');

        if (!token) {
            toast.error("Bạn chưa đăng nhập!");
            router.push('/login');
            return;
        }
      
        // 1. Check quyền Admin từ Token
        try {
            // Decode đơn giản phần payload của JWT để check role
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const payload = JSON.parse(jsonPayload);
            
            if (payload.role === 'admin' || payload.role === 'auctioneer' || payload.role === 'super_admin') {
                setIsAdmin(true);
            }
        } catch (e) {
            console.error("Lỗi parse token:", e);
        }

        // 2. Kết nối Socket
        const newSocket = io('https://auction-hub-kc24.onrender.com/bidding', {
            auth: {
                token: token // <--- BẮT BUỘC THEO GUIDE
            },
            transports: ['websocket', 'polling'], // Guide khuyên nên có cả polling để fallback
            reconnection: true,             // Tự động kết nối lại
            reconnectionAttempts: 5,
        });

        newSocket.on('connect', () => {
            console.log('Connected to WebSocket');
            setIsConnected(true);
            newSocket.emit('joinAuction', { auctionId: id });
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected');
            setIsConnected(false);
        });

        // Nhận state ban đầu
        newSocket.on('auctionState', (data: AuctionState) => {
            setAuctionState(data);
            setTimeLeft(data.timeRemaining);
            setLocalHasEnded(data.hasEnded);
            setBidAmount(data.nextMinimumBid);
        });

        // Update thời gian
        newSocket.on('timeUpdate', (wrapper: { data: any }) => {
            const data = wrapper.data;
            if (data.hasEnded) {
                setLocalHasEnded(true);
            } else {
                if (Math.abs(data.timeRemaining - timeLeft) > 2000) {
                    setTimeLeft(data.timeRemaining);
                }
            }
            setAuctionState((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    timeRemaining: data.timeRemaining,
                    hasEnded: data.hasEnded,
                    currentWinningBid: data.currentWinningBid,
                    nextMinimumBid: data.nextMinimumBid,
                };
            });
        });

        // Nhận bid mới (hoặc update bid history khi có bid bị deny)
        newSocket.on('newBid', (data: AuctionState) => {
            setAuctionState(data);
            // Nếu có bid mới, cập nhật lại giá gợi ý nếu đang ở chế độ auto
            if (isAutoMode) {
                 setBidAmount(data.nextMinimumBid);
            }
        });
        
        // Lắng nghe sự kiện update lịch sử (nếu backend bắn event riêng cho deny)
        newSocket.on('bidHistoryUpdate', (data: AuctionState) => {
            setAuctionState(data);
        });

        newSocket.on('auctionUpdate', (data: any) => {
            if (data.type === 'AUCTION_ENDED') {
                toast.info("Phiên đấu giá đã kết thúc!");
                window.location.reload();
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.emit('leaveAuction', id);
            newSocket.disconnect();
        };
    }, [id]);

    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [localHasEnded, setLocalHasEnded] = useState(false);

    useEffect(() => {
        if (localHasEnded || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                const newValue = prev - 1000;
                if (newValue <= 0) {
                    setLocalHasEnded(true);
                    return 0;
                }
                return newValue;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [localHasEnded, timeLeft]);

    useEffect(() => {
        if (isAutoMode && auctionState) {
            setBidAmount(auctionState.nextMinimumBid);
        }
    }, [auctionState?.nextMinimumBid, isAutoMode]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // --- ADMIN ACTIONS ---
    const handleDenyBid = async (bidId: string) => {
        const reason = prompt("Vui lòng nhập lý do hủy lượt trả giá này (VD: Gian lận, spam):");
        if (!reason) return;

        setIsDenying(bidId);
        try {
            await AdminActionService.denyBid(bidId, reason);
            toast.success("Đã hủy lượt trả giá thành công");
            // Sau khi gọi API thành công, socket thường sẽ emit lại state mới
            // Nhưng ta có thể update optimistic UI nếu cần thiết
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Lỗi khi hủy lượt trả giá");
        } finally {
            setIsDenying(null);
        }
    };

    // --- BIDDING ACTIONS ---
    const handleIncreaseBid = () => {
        if (!auctionState) return;
        setBidAmount(prev => prev + auctionState.bidIncrement);
        setIsAutoMode(false);
    };

    const handleDecreaseBid = () => {
        if (!auctionState) return;
        const nextMin = auctionState.nextMinimumBid;
        if (bidAmount - auctionState.bidIncrement >= nextMin) {
            setBidAmount(prev => prev - auctionState.bidIncrement);
            setIsAutoMode(false);
        }
    };

    const handlePlaceBid = async () => {
        if (!auctionState) return;
        if (bidAmount < auctionState.nextMinimumBid) {
            alert(`Giá đấu phải lớn hơn hoặc bằng ${formatCurrency(auctionState.nextMinimumBid)}`);
            return;
        }

        setIsBidding(true);
        try {
            const res = await placeManualBid({
                auctionId: id,
                amount: bidAmount
            });
            if (res && res.success) {
                setIsAutoMode(true);
                toast.success("Đặt giá thành công!");
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsBidding(false);
        }
    };

    if (!auctionState) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-800 mb-4"></div>
                <p className="text-xl text-gray-600">Đang kết nối vào phòng đấu giá...</p>
            </div>
        );
    }

    if (isLoading) return <div className="min-h-screen pt-20 text-center">Đang tải...</div>;
    if (!auction) return notFound();

    return (
        <main className="min-h-screen font-sans bg-gray-50">
            <Topbar />
            <Navbar />

            <section className="mx-auto max-w-7xl px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold text-rose-800">((●)) Đấu giá trực tuyến</h1>
                        {isAdmin && (
                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-200 flex items-center gap-1">
                                <Gavel size={14}/> ADMIN VIEW
                            </span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-auto">
                         <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${localHasEnded ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-600'}`}>
                            {localHasEnded ? '⛔ Đã kết thúc' : <><span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span> Đang diễn ra</>}
                        </span>
                        <h2 className="text-lg text-gray-600 font-semibold border-l pl-3 ml-2">{auctionState.name} - {auctionState.code}</h2>
                    </div>
                </div>

                {/* Top Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <span className="text-gray-500 text-sm mb-1">Bước giá</span>
                        <span className="text-xl font-bold text-gray-800">{formatCurrency(auctionState.bidIncrement)}</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                        <span className="text-gray-500 text-sm mb-1">Thời gian còn lại</span>
                        <CountdownTimer timeRemaining={auctionState.timeRemaining} />
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <span className="text-gray-500 text-sm mb-1">Giá khởi điểm</span>
                        <span className="text-xl font-bold text-gray-800">{formatCurrency(auctionState.startingPrice)}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: INFO & IMAGE */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Config Info */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <div className="grid grid-cols-1 gap-3 text-sm">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">Người đang trả giá cao nhất:</span>
                                    <span className="font-bold text-blue-600">
                                        {auctionState.currentWinningBid ? auctionState.currentWinningBid.bidderName : "Chưa có"}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500">Số bước giá tối đa:</span>
                                    <span className="bg-blue-100 text-blue-700 px-2 rounded text-xs font-bold py-1">∞ Không giới hạn</span>
                                </div>
                            </div>
                        </div>

                        {/* Product Image */}
                        <div className="relative w-full h-[500px] bg-gray-200 rounded-xl overflow-hidden shadow-inner">
                            {/* Bạn có thể lấy ảnh từ API detail nếu muốn, ở đây tôi dùng placeholder hoặc ảnh mặc định */}
                            <Image src={auction.images[0]?.url || '/placeholder.jpg'} alt={auction.name} fill className="object-contain bg-gray-100" />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: BIDDING CONTROL */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* Current Price Box */}
                        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 text-center shadow-sm relative overflow-hidden">
                            <p className="text-rose-800 mb-2 font-medium">Giá trả hiện tại</p>
                            <p className="text-4xl lg:text-4xl font-extrabold text-rose-600">
                                {formatCurrency(auctionState.currentWinningBid?.amount || auctionState.startingPrice)}
                            </p>
                            <div className="absolute -top-4 -right-4 opacity-5 rotate-12">
                                <span className="text-9xl">🏷️</span>
                            </div>
                        </div>

                        {/* Bidding Input Area */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-gray-700 font-bold">Số tiền đấu giá</label>
                                <button
                                    onClick={() => setIsAutoMode(!isAutoMode)}
                                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${isAutoMode ? 'bg-green-100 text-green-700 ring-2 ring-green-400' : 'bg-gray-100 text-gray-500'}`}
                                >
                                    {isAutoMode ? '⚡ Auto Update' : '🔧 Manual'}
                                </button>
                            </div>

                            {/* Input Group */}
                            <div className="flex items-center gap-2 mb-4">
                                <button
                                    onClick={handleDecreaseBid}
                                    className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-bold text-gray-600 transition"
                                >-</button>

                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={formatCurrency(bidAmount).replace(/[^0-9,.]/g, '')}
                                        disabled
                                        className="w-full h-12 text-center text-xl font-bold border border-gray-300 rounded-lg bg-white text-gray-800"
                                    />
                                    <div className="absolute right-0 top-0 h-full flex items-center pr-3 pointer-events-none">
                                        <span className="text-gray-400 text-sm">VND</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleIncreaseBid}
                                    className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-bold text-gray-600 transition"
                                >+</button>
                            </div>

                            {/* Place Bid Button */}
                            <button
                                onClick={handlePlaceBid}
                                disabled={isBidding || localHasEnded || !isConnected}
                                className={`w-full py-4 rounded-xl text-xl font-bold text-white shadow-lg transition transform active:scale-95 ${isBidding || localHasEnded ? 'bg-gray-400 cursor-not-allowed' : 'bg-rose-800 hover:bg-rose-900 shadow-rose-200'}`}
                            >
                                {localHasEnded ? '⛔ ĐÃ KẾT THÚC' : (isBidding ? 'Đang xử lý...' : '📢 ĐẶT GIÁ NGAY')}
                            </button>

                            <div className="flex justify-between mt-3 text-xs text-gray-500">
                                <span>Giá hợp lệ tối thiểu: {formatCurrency(auctionState.nextMinimumBid)}</span>
                            </div>
                        </div>

                        {/* Bid History */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                                <h3 className="font-bold text-gray-700">📜 Lịch sử trả giá</h3>
                                <span className="text-xs text-gray-500">{auctionState.bidHistory.length} lệnh</span>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {auctionState.bidHistory.length === 0 ? (
                                    <div className="p-4 text-center text-gray-400 italic">Chưa có lượt trả giá nào</div>
                                ) : (
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-500 bg-gray-50 uppercase sticky top-0 z-10">
                                            <tr>
                                                <th className="px-4 py-2">Người đấu giá</th>
                                                <th className="px-4 py-2">Thời gian</th>
                                                <th className="px-4 py-2 text-right">Giá tiền</th>
                                                {isAdmin && <th className="px-2 py-2"></th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {auctionState.bidHistory.map((bid, index) => {
                                                const isTopBid = index === 0 && !bid.isDenied;
                                                return (
                                                    <tr key={bid.bidId} className={`border-b hover:bg-gray-50 transition-colors ${bid.isDenied ? 'bg-gray-100 opacity-70' : (isTopBid ? 'bg-yellow-50' : '')}`}>
                                                        <td className="px-4 py-3">
                                                            <div className="flex flex-col">
                                                                <span className={`font-medium ${bid.isDenied ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                                                    {isTopBid && "👑 "} {bid.bidderName}
                                                                </span>
                                                                {bid.isDenied && (
                                                                    <span className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                                                        <AlertTriangle size={10} /> {bid.deniedReason}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className={`px-4 py-3 text-gray-500 ${bid.isDenied ? 'line-through' : ''}`}>
                                                            {new Date(bid.bidAt).toLocaleTimeString('vi-VN')}
                                                        </td>
                                                        <td className={`px-4 py-3 text-right font-bold ${bid.isDenied ? 'line-through text-gray-400' : (isTopBid ? 'text-rose-600' : 'text-gray-700')}`}>
                                                            {formatCurrency(bid.amount)}
                                                        </td>
                                                        
                                                        {/* ADMIN ACTION: DENY BUTTON */}
                                                        {isAdmin && (
                                                            <td className="px-2 py-3 text-center">
                                                                {!bid.isDenied && (
                                                                    <button 
                                                                        onClick={() => handleDenyBid(bid.bidId)}
                                                                        disabled={isDenying === bid.bidId}
                                                                        title="Hủy bỏ lượt đấu giá này"
                                                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                                                                    >
                                                                        <XCircle size={18} />
                                                                    </button>
                                                                )}
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}