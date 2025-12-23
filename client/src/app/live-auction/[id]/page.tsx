"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, notFound } from "next/navigation";
import Image from "next/image";
import { io, Socket } from 'socket.io-client';
import Topbar from "../../../components/Topbar";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { placeManualBid } from '../../../services/auctionsService';
import { CountdownTimer } from '../../../components/CountdownTimer';
import { toast } from "sonner";
import Cookies from 'js-cookie';
import {
    getAuctionById,
} from '../../../services/auctionsService';
import { AuctionDetail } from '../../../types/auction';

interface BidHistoryItem {
    bidId: string;
    amount: number;
    bidAt: string;
    bidderName: string;
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
    const [isAutoMode, setIsAutoMode] = useState(true); // Chế độ tự động tăng giá
    const [isBidding, setIsBidding] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
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

    // --- SOCKET CONNECTION ---
    useEffect(() => {
        loadData();
        const token = Cookies.get('access_token');

        if (!token) {
            toast.error("Bạn chưa đăng nhập!");
            router.push('/login');
            return;
        }

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
            // Gửi event joinAuction
            newSocket.emit('joinAuction', { auctionId: id });
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected');
            setIsConnected(false);
        });

        // 1. Nhận trạng thái ban đầu (auctionState)
        newSocket.on('auctionState', (data: AuctionState) => {
            setAuctionState(data);

            // KHỞI TẠO LOCAL TIMER TỪ DỮ LIỆU SERVER
            setTimeLeft(data.timeRemaining);
            setLocalHasEnded(data.hasEnded);

            // Khởi tạo giá bid bằng giá tối thiểu tiếp theo
            setBidAmount(data.nextMinimumBid);
        });

        // 2. Nhận cập nhật thời gian & giá hiện tại (timeUpdate)
        newSocket.on('timeUpdate', (wrapper: { data: any }) => {
            const data = wrapper.data;

            // KIỂM TRA KẾT THÚC
            // Nếu server bảo kết thúc -> set kết thúc ngay
            if (data.hasEnded) {
                setLocalHasEnded(true);
            } else {
                // Logic Drift Correction: Chỉ cập nhật lại nếu lệch quá 2 giây so với server
                // Giúp UI không bị giật nếu mạng lag
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

        // 3. Nhận thông tin Bid mới (newBid) - Cập nhật lịch sử và giá
        newSocket.on('newBid', (data: AuctionState) => {
            // Khi có người bid, server trả về full state mới
            setAuctionState(data);
            console.log("New bid placed!", data.currentWinningBid);
        });

        // 4. Sự kiện kết thúc chính thức từ Server (Ưu tiên dùng cái này)
        newSocket.on('auctionUpdate', (data: any) => {
            if (data.type === 'AUCTION_ENDED') {
                alert("Phiên đấu giá đã kết thúc! Trang sẽ được tải lại.");
                window.location.reload(); // Reload trang
            }
        });

        setSocket(newSocket);

        // Cleanup khi thoát trang
        return () => {
            newSocket.emit('leaveAuction', id);
            newSocket.disconnect();
        };
    }, [id]);

    // Thêm state riêng cho timer để render UI mượt mà độc lập với socket state
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [localHasEnded, setLocalHasEnded] = useState(false);

    // --- LOGIC ĐẾM NGƯỢC LOCAL ---
    useEffect(() => {
        // Nếu đã kết thúc hoặc chưa có thời gian thì dừng
        if (localHasEnded || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                const newValue = prev - 1000;
                // Nếu hết giờ -> Tự động set hasEnded = true
                if (newValue <= 0) {
                    setLocalHasEnded(true);
                    return 0;
                }
                return newValue;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [localHasEnded, timeLeft]); // Chạy lại khi timeLeft thay đổi (đếm mỗi giây)

    // Khi nextMinimumBid thay đổi (do có người bid), nếu đang bật Auto -> cập nhật input
    useEffect(() => {
        if (isAutoMode && auctionState) {
            setBidAmount(auctionState.nextMinimumBid);
        }
    }, [auctionState?.nextMinimumBid, isAutoMode]);


    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatTime = (ms: number) => {
        if (ms <= 0) return "00:00:00";
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleIncreaseBid = () => {
        if (!auctionState) return;
        setBidAmount(prev => prev + auctionState.bidIncrement);
        setIsAutoMode(false);
    };

    const handleDecreaseBid = () => {
        if (!auctionState) return;
        const nextMin = auctionState.nextMinimumBid;
        // Không cho giảm thấp hơn mức tối thiểu hiện tại
        if (bidAmount - auctionState.bidIncrement >= nextMin) {
            setBidAmount(prev => prev - auctionState.bidIncrement);
            setIsAutoMode(false);
        }
    };

    const handlePlaceBid = async () => {
        if (!auctionState) return;

        // Validation Client
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
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsBidding(false);
        }
    };

    if (!auctionState) {
        return <div className="min-h-screen flex items-center justify-center text-xl">Đang kết nối vào phòng đấu giá...</div>;
    }

    if (isLoading) return <div className="min-h-screen pt-20 text-center">Đang tải...</div>;
    if (!auction) return notFound();

    return (
        <main className="min-h-screen font-sans bg-gray-50">
            <Topbar />
            <Navbar />

            <section className="mx-auto max-w-7xl px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-rose-800">((●)) Đấu giá trực tuyến</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${localHasEnded ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-600'}`}>
                        {localHasEnded ? '⛔ Đã kết thúc' : '🟢 Đang diễn ra'}
                    </span>
                    <h2 className="text-xl text-gray-600 ml-auto font-semibold">{auctionState.name} - {auctionState.code}</h2>
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
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Số tiền đặt tối đa:</span>
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
                        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 text-center shadow-sm">
                            <p className="text-rose-800 mb-2 font-medium">Giá trả hiện tại</p>
                            <p className="text-4xl lg:text-4xl font-extrabold text-rose-600">
                                {formatCurrency(auctionState.currentWinningBid?.amount || auctionState.startingPrice)}
                            </p>
                            <div className="absolute top-4 right-4 opacity-10">
                                <span className="text-6xl">🏷️</span>
                            </div>
                        </div>

                        {/* Bidding Input Area */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-gray-700 font-bold">Số tiền đấu giá <span className="text-gray-400 font-normal text-xs">(? help)</span></label>

                                {/* Toggle Auto Mode */}
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
                                        value={formatCurrency(bidAmount).replace(/[^0-9,.]/g, '')} // Chỉ hiển thị số formatted
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
                                // Dùng localHasEnded để disable nút ngay lập tức khi về 00:00:00
                                disabled={isBidding || localHasEnded || !isConnected}
                                className={`w-full py-4 rounded-xl text-xl font-bold text-white shadow-lg transition transform active:scale-95 ${isBidding || localHasEnded ? 'bg-gray-400 cursor-not-allowed' : 'bg-rose-800 hover:bg-rose-900 shadow-rose-200'}`}
                            >
                                {localHasEnded ? '⛔ ĐÃ KẾT THÚC' : (isBidding ? 'Đang xử lý...' : '📢 ĐẤU GIÁ')}
                            </button>

                            <div className="flex justify-between mt-3 text-xs text-gray-500">
                                <span>Giá gợi ý tiếp theo: {formatCurrency(auctionState.nextMinimumBid)}</span>
                            </div>
                        </div>

                        {/* Bid History */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                                <h3 className="font-bold text-gray-700">📜 Lịch sử trả giá</h3>
                                <span className="text-xs text-gray-500">{auctionState.bidHistory.length} lượt đấu giá</span>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {auctionState.bidHistory.length === 0 ? (
                                    <div className="p-4 text-center text-gray-400 italic">Chưa có lượt trả giá nào</div>
                                ) : (
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-500 bg-gray-50 uppercase sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2">Người đấu giá</th>
                                                <th className="px-4 py-2">Thời gian</th>
                                                <th className="px-4 py-2 text-right">Giá tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {auctionState.bidHistory.map((bid, index) => (
                                                <tr key={bid.bidId} className={`border-b hover:bg-gray-50 ${index === 0 ? 'bg-yellow-50' : ''}`}>
                                                    <td className="px-4 py-3 font-medium text-gray-900">
                                                        {index === 0 && "👑 "} {bid.bidderName}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500">
                                                        {new Date(bid.bidAt).toLocaleTimeString('vi-VN')}
                                                    </td>
                                                    <td className={`px-4 py-3 text-right font-bold ${index === 0 ? 'text-rose-600' : 'text-gray-700'}`}>
                                                        {formatCurrency(bid.amount)}
                                                    </td>
                                                </tr>
                                            ))}
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