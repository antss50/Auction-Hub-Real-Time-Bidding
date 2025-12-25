"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { io, Socket } from 'socket.io-client';
import Topbar from "../../../components/Topbar";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { placeManualBid, denyBid } from '../../../services/auctionsService';
import { CountdownTimer } from '../../../components/CountdownTimer';
import { toast } from "sonner";
import Cookies from 'js-cookie';
import { useAuth } from '../../../contexts/AuthContext';

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
        bidId: string;
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
    const { user } = useAuth();

    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
    // [1] Biến check role Bidder để hiển thị thông báo
    const isBidder = user?.role === 'bidder';

    // --- STATE ---
    const [socket, setSocket] = useState<Socket | null>(null);
    const [auctionState, setAuctionState] = useState<AuctionState | null>(null);
    const [bidAmount, setBidAmount] = useState<number>(0);
    const [isAutoMode, setIsAutoMode] = useState(true);
    const [isBidding, setIsBidding] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [localHasEnded, setLocalHasEnded] = useState(false);

    // --- SOCKET CONNECTION ---
    useEffect(() => {
        const token = Cookies.get('access_token');

        if (!token) {
            toast.error("Bạn chưa đăng nhập!");
            router.push('/login');
            return;
        }

        const newSocket = io('https://auction-hub-kc24.onrender.com/bidding', {
            auth: { token: token },
            transports: ['websocket', 'polling'],
            reconnection: true,
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

        // 1. Nhận trạng thái ban đầu (hoặc khi reload data)
        newSocket.on('auctionState', (data: AuctionState) => {
            setAuctionState(data);
            setTimeLeft(data.timeRemaining);
            setLocalHasEnded(data.hasEnded);

            // Cập nhật input bidAmount ngay lập tức nếu đang Auto
            if (isAutoMode) {
                setBidAmount(data.nextMinimumBid);
            }
        });

        // 2. Time Update
        newSocket.on('timeUpdate', (wrapper: { data: any }) => {
            const data = wrapper.data;
            if (data.hasEnded) {
                setLocalHasEnded(true);
            } else {
                if (Math.abs(data.timeRemaining - timeLeft) > 2000) {
                    setTimeLeft(data.timeRemaining);
                }
            }
            setAuctionState((prev) => prev ? { ...prev, ...data } : null);
        });

        // 3. New Bid
        newSocket.on('newBid', (data: AuctionState) => {
            setAuctionState(data);
            if (data.currentWinningBid) {
                toast.success(`💰 Giá mới: ${new Intl.NumberFormat('vi-VN').format(data.currentWinningBid.amount)} đ - Bởi: ${data.currentWinningBid.bidderName}`);
            }
        });

        // 4. [UPDATED] Lắng nghe sự kiện TỪ CHỐI GIÁ (bidDenied)
        newSocket.on('bidDenied', (data: any) => {
            // [LOGIC 1] Chỉ hiện thông báo cho Bidder (Admin tự biết vì họ là người bấm)
            if (isBidder) {
                toast.error(`🚫 QUẢN TRỊ VIÊN ĐÃ TỪ CHỐI GIÁ ĐẤU!`, {
                    description: `Lý do: ${data.deniedReason || 'Vi phạm quy chế'}`,
                    duration: 5000,
                    style: { border: '2px solid red', backgroundColor: '#fff5f5', color: '#c53030', fontWeight: 'bold' }
                });
            }

            // [LOGIC 2] Tự động tải lại dữ liệu (Manual Reload State)
            // Gọi 'joinAuction' để server gửi lại 'auctionState' mới nhất
            console.log("Bid denied, reloading auction state...");
            newSocket.emit('joinAuction', { auctionId: id });

            // [LOGIC 3] Reset input về giá trị hợp lệ mới
            setIsAutoMode(true);
        });

        // 5. Auction Ended
        newSocket.on('auctionUpdate', (data: any) => {
            if (data.type === 'AUCTION_ENDED') {
                toast.info("Phiên đấu giá đã kết thúc!");
                setTimeout(() => window.location.reload(), 2000);
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.emit('leaveAuction', id);
            newSocket.disconnect();
        };
    }, [id, isBidder]); // Thêm isBidder vào deps để logic check role hoạt động đúng

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
        if (isAutoMode && auctionState && !isAdmin) {
            setBidAmount(auctionState.nextMinimumBid);
        }
    }, [auctionState?.nextMinimumBid, isAutoMode, isAdmin]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleIncreaseBid = () => {
        if (!auctionState) return;
        setBidAmount(prev => prev + auctionState.bidIncrement);
        setIsAutoMode(false);
    };

    const handleDecreaseBid = () => {
        if (!auctionState) return;
        if (bidAmount - auctionState.bidIncrement >= auctionState.nextMinimumBid) {
            setBidAmount(prev => prev - auctionState.bidIncrement);
            setIsAutoMode(false);
        }
    };

    const handlePlaceBid = async () => {
        if (!auctionState) return;
        if (bidAmount < auctionState.nextMinimumBid) {
            toast.warning(`Giá đấu phải lớn hơn hoặc bằng ${formatCurrency(auctionState.nextMinimumBid)}`);
            return;
        }
        setIsBidding(true);
        try {
            const res = await placeManualBid({ auctionId: id, amount: bidAmount });
            if (res && res.success) setIsAutoMode(true);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsBidding(false);
        }
    };

    const handleRejectBid = async () => {
        // 1. Kiểm tra xem có giá thắng hiện tại để từ chối không
        if (!auctionState?.currentWinningBid?.bidId) {
            toast.error("Chưa có lượt đấu giá nào để từ chối.");
            return;
        }

        // 2. Dùng prompt để Admin nhập lý do (vừa là xác nhận, vừa lấy dữ liệu)
        const reason = window.prompt(
            `⛔ TỪ CHỐI GIÁ: ${formatCurrency(auctionState.currentWinningBid.amount)}\nCủa: ${auctionState.currentWinningBid.bidderName}\n\n👇 Nhập lý do từ chối (bắt buộc):`,
            "Nghi vấn gian lận / Vi phạm quy chế" // Giá trị mặc định gợi ý
        );

        // 3. Nếu Admin bấm "Cancel" -> Dừng lại
        if (reason === null) return;

        // 4. Validate: Bắt buộc phải có lý do
        if (!reason.trim()) {
            toast.warning("⚠️ Vui lòng nhập lý do để tiếp tục!");
            return;
        }

        setIsBidding(true);
        try {
            // 5. Gọi API với lý do Admin vừa nhập
            await denyBid(auctionState.currentWinningBid.bidId, reason.trim());
            toast.success("Đã gửi yêu cầu từ chối giá.");
        } catch (error: any) {
            toast.error(error.message || "Lỗi khi từ chối giá.");
        } finally {
            setIsBidding(false);
        }
    };

    if (!auctionState) {
        return <div className="min-h-screen flex items-center justify-center text-xl">Đang kết nối vào phòng đấu giá...</div>;
    }

    return (
        <main className="min-h-screen font-sans bg-gray-50">
            <Topbar />
            <Navbar />

            <section className="mx-auto max-w-7xl px-4 py-8">
                <div className="flex items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold text-rose-800">((●)) Đấu giá trực tuyến</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${localHasEnded ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-600'}`}>
                        {localHasEnded ? '⛔ Đã kết thúc' : '🟢 Đang diễn ra'}
                    </span>
                    <h2 className="text-xl text-gray-600 ml-auto font-semibold">{auctionState.name} - {auctionState.code}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <span className="text-gray-500 text-sm mb-1">Bước giá</span>
                        <span className="text-xl font-bold text-gray-800">{formatCurrency(auctionState.bidIncrement)}</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                        <span className="text-gray-500 text-sm mb-1">Thời gian còn lại</span>
                        <CountdownTimer timeRemaining={timeLeft} />
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <span className="text-gray-500 text-sm mb-1">Giá khởi điểm</span>
                        <span className="text-xl font-bold text-gray-800">{formatCurrency(auctionState.startingPrice)}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7 space-y-6">
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
                        <div className="relative w-full h-[500px] bg-gray-200 rounded-xl overflow-hidden shadow-inner">
                            <Image src="/placeholder-image.jpg" alt="Auction Item" fill className="object-contain" />
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 text-center shadow-sm relative overflow-hidden">
                            <p className="text-rose-800 mb-2 font-medium">Giá trả hiện tại</p>
                            <p className="text-4xl lg:text-4xl font-extrabold text-rose-600">
                                {formatCurrency(auctionState.currentWinningBid?.amount || auctionState.startingPrice)}
                            </p>
                            <div className="absolute top-4 right-4 opacity-10 text-6xl">🏷️</div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                            {isAdmin ? (
                                <div className="text-center">
                                    <p className="mb-4 text-gray-600 font-medium">Quyền Quản Trị Viên (Admin)</p>
                                    <button
                                        onClick={handleRejectBid}
                                        disabled={isBidding || !auctionState.currentWinningBid || localHasEnded}
                                        className={`w-full py-4 rounded-xl text-xl font-bold text-white shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2
                                            ${isBidding || !auctionState.currentWinningBid || localHasEnded
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-red-600 hover:bg-red-700 shadow-red-200'}`}
                                    >
                                        {isBidding ? 'Đang xử lý...' : <><span>🚫</span> TỪ CHỐI GIÁ</>}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-gray-700 font-bold">Số tiền đấu giá</label>
                                        <button onClick={() => setIsAutoMode(!isAutoMode)} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${isAutoMode ? 'bg-green-100 text-green-700 ring-2 ring-green-400' : 'bg-gray-100 text-gray-500'}`}>
                                            {isAutoMode ? '⚡ Auto' : '🔧 Manual'}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <button onClick={handleDecreaseBid} className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-bold text-gray-600 transition">-</button>
                                        <div className="flex-1 relative">
                                            <input type="text" value={formatCurrency(bidAmount).replace(/[^0-9,.]/g, '')} disabled className="w-full h-12 text-center text-xl font-bold border border-gray-300 rounded-lg bg-white text-gray-800" />
                                            <div className="absolute right-0 top-0 h-full flex items-center pr-3 pointer-events-none text-gray-400 text-sm">VND</div>
                                        </div>
                                        <button onClick={handleIncreaseBid} className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-xl font-bold text-gray-600 transition">+</button>
                                    </div>
                                    <button onClick={handlePlaceBid} disabled={isBidding || localHasEnded || !isConnected} className={`w-full py-4 rounded-xl text-xl font-bold text-white shadow-lg transition transform active:scale-95 ${isBidding || localHasEnded ? 'bg-gray-400 cursor-not-allowed' : 'bg-rose-800 hover:bg-rose-900 shadow-rose-200'}`}>
                                        {localHasEnded ? '⛔ ĐÃ KẾT THÚC' : (isBidding ? 'Đang xử lý...' : '📢 ĐẤU GIÁ')}
                                    </button>
                                    <div className="flex justify-between mt-3 text-xs text-gray-500">
                                        <span>Giá gợi ý tiếp theo: {formatCurrency(auctionState.nextMinimumBid)}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                                <h3 className="font-bold text-gray-700">📜 Lịch sử trả giá</h3>
                                <span className="text-xs text-gray-500">{auctionState.bidHistory.length} lượt</span>
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
                                                    <td className="px-4 py-3 font-medium text-gray-900">{index === 0 && "👑 "} {bid.bidderName}</td>
                                                    <td className="px-4 py-3 text-gray-500">{new Date(bid.bidAt).toLocaleTimeString('vi-VN')}</td>
                                                    <td className={`px-4 py-3 text-right font-bold ${index === 0 ? 'text-rose-600' : 'text-gray-700'}`}>{formatCurrency(bid.amount)}</td>
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