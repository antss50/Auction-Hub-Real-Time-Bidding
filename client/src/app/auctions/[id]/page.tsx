"use client";

import { useState, useEffect } from 'react';
import { notFound, useParams, useRouter } from "next/navigation";
import Image from "next/image";
import TimeBox from "../../../components/TimeBox";
import Topbar from "../../../components/Topbar";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import AuctionTabs from "../../../components/AuctionTabs";
import {
    getAuctionById,
    getAuctionRegistration,
    registerToBid,
    submitDeposit,
    verifyDepositPayment,
    checkInAuction,
    getAuctionResult,
    getWinnerPaymentRequirements,
    submitWinnerPayment,
    verifyWinnerPayment,
    exportContractPdfVi,
    withdrawRegistration
} from '../../../services/auctionsService';
import { AuctionDetail } from '../../../types/auction';
import { toast } from "sonner";
import { useAuth } from "../../../contexts/AuthContext";

import React from 'react';

function BackgroundIcon() {
    return (
        <div className="absolute bottom-2 right-2 opacity-10">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
        </div>
    );
}

function InfoCard({
    label,
    text,
    whiteBg = false,
}: {
    label: string;
    text?: string;
    whiteBg?: boolean;
}) {
    return (
        <div
            className="relative p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200/50"
            style={{
                background: whiteBg
                    ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                    : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'
            }}
        >
            <p
                className="text-sm font-medium mb-2 uppercase tracking-wide"
                style={{ color: whiteBg ? '#64748b' : '#475569' }}
            >
                {label}
            </p>
            <p
                className="text-xl font-semibold"
                style={{ color: whiteBg ? '#334155' : '#1e293b' }}
            >
                {text}
            </p>
            <div style={{ color: whiteBg ? '#cbd5e1' : '#94a3b8' }}>
                <BackgroundIcon />
            </div>
        </div>
    );
}


export default function AuctionDetailPage() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    // State xác định có phải winner không
    const [isWinner, setIsWinner] = useState(false);

    const [auction, setAuction] = useState<AuctionDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRegistrationEnded, setIsRegistrationEnded] = useState(false);
    const [registrationResponse, setRegistrationResponse] = useState<any>(null);

    // State cho kết quả đấu giá (API 23)
    const [auctionResult, setAuctionResult] = useState<any>(null);

    // --- STATE CHO MODALS ---
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showDepositModal, setShowDepositModal] = useState(false);

    // State cho Winner Flow
    const [showWinnerReqModal, setShowWinnerReqModal] = useState(false); // Modal API 18
    const [showWinnerPayModal, setShowWinnerPayModal] = useState(false); // Modal API 19
    const [winnerReqData, setWinnerReqData] = useState<any>(null); // Data API 18
    const [winnerPayData, setWinnerPayData] = useState<any>(null); // Data API 19

    // State dữ liệu form đăng ký
    const [docFiles, setDocFiles] = useState<FileList | null>(null);
    const [mediaFiles, setMediaFiles] = useState<FileList | null>(null);

    // State dữ liệu thanh toán cọc
    const [depositData, setDepositData] = useState<any>(null);

    // Hàm load dữ liệu
    const loadData = async () => {
        if (!id) return;
        try {
            // 1. Load chi tiết đấu giá
            const auctionData = await getAuctionById(id);
            setAuction(auctionData);

            if (auctionData) {
                setIsRegistrationEnded(new Date(auctionData.saleEndAt).getTime() < Date.now());

                // 2. Load đăng ký của user (nếu đã login)
                if (user) {
                    const regData = await getAuctionRegistration(id);
                    setRegistrationResponse(regData);
                }

                // 3. Logic khi phiên đấu giá kết thúc
                const now = Date.now();
                const isEnded = now > new Date(auctionData.auctionEndAt).getTime() ||
                    auctionData.status === 'success' ||
                    auctionData.status === 'awaiting_result';

                if (isEnded) {
                    // Gọi API 23 để lấy thông tin chung (Status hợp đồng...)
                    const resultRes = await getAuctionResult(id);
                    if (resultRes?.success) {
                        setAuctionResult(resultRes.data);
                    }

                    // Gọi API 18 để lấy thông tin thanh toán & check Winner
                    try {
                        const paymentReq = await getWinnerPaymentRequirements(id);
                        if (paymentReq?.success) {
                            setWinnerReqData(paymentReq.data); // Lưu data API 18

                            // SO SÁNH ID ĐỂ XÁC ĐỊNH WINNER
                            if (user && paymentReq.data?.winner?.userId === user.id) {
                                setIsWinner(true);
                            } else {
                                setIsWinner(false);
                            }
                        }
                    } catch (err) {
                        // Lỗi này có thể do chưa có winner hoặc lỗi mạng, bỏ qua
                        console.log("Không lấy được thông tin thanh toán winner hoặc không phải winner");
                        setIsWinner(false);
                    }
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id, user]); // Thêm user vào deps để reload khi login

    // --- 1. XỬ LÝ ĐĂNG KÝ (Nộp hồ sơ) ---
    const handleRegisterSubmit = async () => {
        if (!docFiles || docFiles.length === 0) {
            alert("Vui lòng chọn ít nhất 1 tài liệu!");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('auctionId', id);

            // Append documents (có thể nhiều file)
            for (let i = 0; i < docFiles.length; i++) {
                formData.append('documents', docFiles[i]);
            }
            // Append media (nếu có)
            if (mediaFiles) {
                for (let i = 0; i < mediaFiles.length; i++) {
                    formData.append('media', mediaFiles[i]);
                }
            }

            const res = await registerToBid(formData);

            if (res && res.success) {
                alert("Nộp hồ sơ thành công! Vui lòng chờ duyệt.");
                // Lưu ý: res.data.id chính là participant-uuid
                console.log("Participant ID:", res.data.id);
                setShowRegisterModal(false);
                loadData(); // Reload để cập nhật trạng thái nút bấm
            }
        } catch (error) {
            alert("Đăng ký thất bại. Vui lòng thử lại.");
        }
    };

    // --- 2. XỬ LÝ NỘP CỌC (Tạo Payment) ---
    const handleInitDeposit = async () => {
        // Lấy registrationId từ state đã load (do user đã đăng ký và đc duyệt)
        const registrationId = registrationResponse?.data?.id;

        if (!registrationId || !auction) {
            alert("Không tìm thấy thông tin đăng ký!");
            return;
        }

        try {
            // Gọi API tạo thanh toán
            const res = await submitDeposit({
                registrationId: registrationId,
                auctionId: id,
                amount: Number(auction.depositAmountRequired) + Number(auction.saleFee)
            });

            if (res) {
                setDepositData(res);
                setShowDepositModal(true); // Mở modal hiển thị thông tin thanh toán
            }
        } catch (error) {
            alert("Không thể tạo yêu cầu thanh toán.");
        }
    };

    // --- 3. XỬ LÝ XÁC NHẬN THANH TOÁN ---
    const handleVerifyPayment = async () => {
        const registrationId = registrationResponse?.data?.id;
        const sessionId = depositData?.paymentId || depositData?.sessionId; // Lấy từ kết quả bước trước

        if (!sessionId || !registrationId) return;

        try {
            // Gọi API xác nhận
            const res = await verifyDepositPayment({
                sessionId: sessionId,
                registrationId: registrationId
            });

            if (res && (res.verified)) {
                alert("Thanh toán thành công! Hồ sơ đã chuyển sang trạng thái chờ duyệt cuối cùng.");
                setShowDepositModal(false);
                loadData(); // Reload để cập nhật trạng thái nút
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // --- 4. XỬ LÝ ĐIỂM DANH ---
    const handleCheckIn = async () => {
        try {
            const res = await checkInAuction(id);
            if (res) {
                // Hiển thị message thành công từ server
                alert("Điểm danh thành công! Vui lòng chờ đến khi phiên đấu giá bắt đầu.");
                loadData(); // Reload lại để nút chuyển sang trạng thái "CHECKED_IN"
            }
        } catch (error: any) {
            // Hiển thị message lỗi từ server (Ví dụ: Chưa đến giờ check-in)
            toast.error(error.message);
        }
    };

    // --- CÁC HÀM XỬ LÝ WINNER ---

    // 1. Gọi API 18: Xem chi tiết thanh toán winner
    const handleShowWinnerPaymentReq = async () => {
        try {
            const res = await getWinnerPaymentRequirements(id);
            if (res?.success) {
                setWinnerReqData(res.data);
                setShowWinnerReqModal(true);
            }
        } catch (error: any) {
            toast.error(error.message || "Không thể lấy thông tin thanh toán");
        }
    };

    // 2. Gọi API 19: Khởi tạo thanh toán winner
    const handleInitWinnerPayment = async () => {
        try {
            const res = await submitWinnerPayment(id);
            if (res) {
                setWinnerPayData(res);
                setShowWinnerReqModal(false); // Đóng modal chi tiết
                setShowWinnerPayModal(true);  // Mở modal thanh toán (QR/Stripe)
            }
        } catch (error: any) {
            toast.error(error.message || "Không thể khởi tạo thanh toán");
        }
    };

    // 3. Gọi API 20: Xác nhận thanh toán winner
    const handleVerifyWinnerPayment = async () => {
        const sessionId = winnerPayData?.paymentId || winnerPayData?.sessionId;
        if (!sessionId) return;

        try {
            const res = await verifyWinnerPayment({ sessionId, auctionId: id });
            if (res && res.success) {
                alert("Thanh toán thành công! Bạn đã hoàn tất thủ tục.");
                setShowWinnerPayModal(false);
                loadData(); // Reload để cập nhật trạng thái hợp đồng thành signed
            }
        } catch (error: any) {
            toast.error(error.message || "Xác thực thanh toán thất bại");
        }
    };

    // 4. Gọi API 28: Tải hợp đồng
    const handleDownloadContract = async () => {
        const contractId = auctionResult?.contract?.contractId;
        if (!contractId) {
            toast.error("Chưa có hợp đồng");
            return;
        }
        try {
            const blob = await exportContractPdfVi(contractId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Hop_dong_${auction?.code || 'auciton'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            toast.error("Lỗi khi tải hợp đồng");
        }
    };

    // XỬ LÝ HỦY ĐĂNG KÝ (API 6) ---
    const handleWithdraw = async () => {
        // 1. Hỏi lý do hủy
        const reason = window.prompt("⚠️ Bạn có chắc chắn muốn hủy đăng ký tham gia đấu giá này không?\n\nVui lòng nhập lý do hủy hồ sơ:", "Thay đổi kế hoạch cá nhân");

        // Nếu user bấm Cancel hoặc không nhập gì
        if (reason === null) return;
        if (!reason.trim()) {
            toast.warning("Vui lòng nhập lý do để hủy đăng ký.");
            return;
        }

        try {
            // 2. Gọi API
            const res = await withdrawRegistration({
                auctionId: id,
                withdrawalReason: reason
            });

            // 3. Xử lý thành công
            if (res && res.success) {
                toast.success("Đã hủy hồ sơ đăng ký thành công.");
                loadData(); // Reload lại để cập nhật giao diện
            }
        } catch (error: any) {
            toast.error(error.message || "Lỗi khi hủy hồ sơ");
        }
    };

    // --- RENDER ACTION BUTTON ---
    const renderActionButton = () => {
        if (!auction) return null;

        // 1. LOGIC WINNER (Dùng biến isWinner đã tính toán từ API 18)
        if (isWinner && auctionResult) {
            const contractStatus = auctionResult.contract?.status;

            // Nếu đã ký (signed) hoặc hoàn tất (completed) -> Hiện nút tải hợp đồng
            if (contractStatus === 'signed' || contractStatus === 'completed') {
                return (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-5 text-center">
                        <strong className="font-bold text-xl block mb-1">CHÚC MỪNG!</strong>
                        <span className="block sm:inline text-lg">Bạn đã sở hữu tài sản này.</span>
                        <div className="mt-3 flex gap-2 justify-center">
                            <button
                                onClick={handleDownloadContract}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow transition"
                            >
                                Tải Hợp Đồng
                            </button>
                        </div>
                    </div>
                );
            }

            // Nếu mới thắng (draft) hoặc chưa có status -> Hiện nút thanh toán
            if (contractStatus === 'draft' || !contractStatus) {
                return (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-5 shadow-sm">
                        <p className="text-blue-800 font-bold text-lg mb-2 text-center">🏆 Bạn là người thắng cuộc!</p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => setShowWinnerReqModal(true)}
                                className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-lg animate-pulse"
                            >
                                💰 Chi tiết thanh toán & Hoàn tất
                            </button>

                            {/* Nút xem hợp đồng nháp */}
                            <button
                                onClick={handleDownloadContract}
                                className="w-full py-2 rounded-lg border border-gray-400 text-gray-700 font-semibold hover:bg-gray-100 transition"
                            >
                                Xem hợp đồng nháp
                            </button>
                        </div>
                    </div>
                );
            }
        }

        const now = new Date();
        const isSuccess = registrationResponse?.success;
        const currentState = registrationResponse?.data?.currentState;

        if (!isSuccess || currentState === "DOCUMENTS_REJECTED" || currentState === "WITHDRAWN") {
            if (isRegistrationEnded) return <button disabled className="w-full py-2 bg-gray-200 text-gray-600 font-semibold rounded-lg mb-5">Hết thời gian nộp hồ sơ</button>;

            return (
                <button
                    onClick={() => setShowRegisterModal(true)} // Mở modal đăng ký
                    className="w-full py-3 rounded-lg bg-rose-700 text-white font-bold hover:bg-rose-800 transition mb-3 text-lg shadow-lg"
                >
                    Đăng ký tham gia
                </button>
            );
        }

        if (currentState === "PENDING_DOCUMENT_REVIEW") {
            return (
                <div className="flex flex-col gap-2 mb-3">
                    <button disabled className="w-full py-3 rounded-lg bg-yellow-100 text-yellow-700 font-bold border border-yellow-300 cursor-wait">
                        ⏳ Chờ phê duyệt hồ sơ
                    </button>

                    <button
                        onClick={handleWithdraw}
                        className="w-full py-3 px-4 rounded-xl text-gray-700 hover:text-red-600 bg-white hover:bg-red-50 text-sm font-semibold transition-all duration-300 border-2 border-gray-100 hover:border-red-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 group"
                    >
                        <span className="text-base group-hover:rotate-12 transition-transform duration-300">🚫</span>
                        <span>Hủy đăng ký</span>
                    </button>
                </div>
            );
        }

        if (currentState === "DOCUMENTS_VERIFIED") {
            return (
                <button
                    onClick={handleInitDeposit} // Gọi hàm tạo thanh toán
                    className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition mb-3 text-lg animate-pulse"
                >
                    💳 Nộp phí đặt cọc
                </button>
            );
        }

        if (currentState === "DEPOSIT_PAID") {
            return <button disabled className="w-full py-3 rounded-lg bg-yellow-100 text-yellow-700 font-bold border border-yellow-300 mb-3">⏳ Chờ phê duyệt</button>;
        }

        if (currentState === "CONFIRMED") {
            return <button onClick={handleCheckIn} className="w-full py-3 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition mb-3 text-lg">📍 Điểm danh</button>;
        }

        if (now > new Date(auction.auctionEndAt) && currentState === "CHECKED_IN") {
            return (
                <button disabled className="w-full py-3 rounded-lg bg-gray-200 text-gray-600 font-semibold cursor-not-allowed mb-5">
                    Phiên đấu giá đã kết thúc
                </button>
            );
        };

        if (currentState === "CHECKED_IN") {
            if (now >= new Date(auction.auctionStartAt) && now <= new Date(auction.auctionEndAt)) {
                return <button onClick={() => router.push(`/live-auction/${id}`)} className="w-full py-4 rounded-lg bg-red-600 text-white font-bold text-xl hover:bg-red-700 transition mb-3 animate-bounce">🔨 VÀO PHÒNG ĐẤU GIÁ</button>;
            }
            return <button disabled className="w-full py-3 rounded-lg bg-green-100 text-green-700 font-bold border border-green-300 mb-3 cursor-default">✅ Bạn đã điểm danh</button>;
        }
        return null;
    };

    if (isLoading) return <div className="min-h-screen pt-20 text-center">Đang tải...</div>;
    if (!auction) return notFound();

    return (
        <main className="min-h-screen font-sans bg-gray-50 relative">
            <Topbar />
            <Navbar />

            {/* Nội dung chính */}
            <section className="mx-auto px-60 pt-10 pb-5">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <div className="w-full h-[680px] relative rounded-lg overflow-hidden mb-6">
                            <Image src={auction.images[0]?.url || '/placeholder.jpg'} alt={auction.name} fill className="object-contain bg-gray-100" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">{auction.name}</h2>
                        <div className="grid sm:grid-cols-2 gap-4 text-sm mt-4">
                            <InfoCard label="Giá khởi điểm" text={`${parseInt(auction.startingPrice).toLocaleString('vi-VN')} đ`} />
                            <InfoCard label="Bước giá" text={`${parseInt(auction.bidIncrement).toLocaleString('vi-VN')} đ`} />
                            <InfoCard label="Tiền đặt trước" text={`${parseInt(auction.depositAmountRequired).toLocaleString('vi-VN')} đ`} />
                            <InfoCard label="Phí tham gia" text={`${parseInt(auction.saleFee).toLocaleString('vi-VN')} đ`} />

                            <InfoCard
                                label="Thời gian bắt đầu tiếp nhận hồ sơ"
                                text={new Date(auction.saleStartAt).toLocaleString('vi-VN')}
                                whiteBg
                            />
                            <InfoCard
                                label="Thời gian kết thúc tiếp nhận hồ sơ"
                                text={new Date(auction.saleEndAt).toLocaleString('vi-VN')}
                                whiteBg
                            />
                            <InfoCard
                                label="Thời gian bắt đầu đấu giá"
                                text={new Date(auction.auctionStartAt).toLocaleString('vi-VN')}
                                whiteBg
                            />
                            <InfoCard
                                label="Thời gian kết thúc đấu giá"
                                text={new Date(auction.auctionEndAt).toLocaleString('vi-VN')}
                                whiteBg
                            />
                            <InfoCard label="Địa điểm" text={auction.assetAddress} whiteBg />
                            <InfoCard label="Loại tài sản" text={auction.assetType} whiteBg />
                        </div>
                    </div>

                    <aside className="bg-white border border-gray-200 rounded-lg p-5 h-fit sticky top-5">
                        <h3 className="font-semibold text-xl mb-5 text-center text-gray-800">Thời gian bắt đầu đấu giá</h3>
                        <TimeBox startTime={auction.auctionStartAt} />

                        <div className="mt-5">
                            {renderActionButton()}
                        </div>
                        <hr className="my-5" />

                        <h4 className="font-semibold mb-2 text-gray-800">Chia sẻ thông tin</h4>
                        <div className="flex gap-4 mb-6">
                            <a href="#" className="text-blue-600 font-semibold">Facebook</a>
                            <a href="#" className="text-pink-600 font-semibold">Zalo</a>
                        </div>

                        <h4 className="font-semibold mb-2 text-gray-800">Bạn cần hỗ trợ?</h4>
                        <p className="text-sm text-gray-700">📞 0976448446</p>
                        <button className="mt-2 text-sm text-blue-600 underline">
                            👉 Hướng dẫn
                        </button>
                    </aside>
                </div>
                <div className="bg-white border border-gray-200 my-5 rounded-xl p-5">
                    <AuctionTabs description={auction.assetDescription} owner={auction.propertyOwner} attachments={auction.attachments} />
                </div>
            </section>
            <Footer />

            {/* MODAL 1: ĐĂNG KÝ THAM GIA */}
            {showRegisterModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 w-[500px] max-w-full shadow-2xl">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Nộp hồ sơ đăng ký</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tài liệu (CCCD, Giấy phép KD...) *</label>
                            <input
                                type="file" multiple accept=".pdf,.doc,.docx,.jpg,.png"
                                onChange={(e) => setDocFiles(e.target.files)}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh/Video bổ sung (Không bắt buộc)</label>
                            <input
                                type="file" multiple accept="image/*,video/*"
                                onChange={(e) => setMediaFiles(e.target.files)}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowRegisterModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</button>
                            <button onClick={handleRegisterSubmit} className="px-4 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700">Nộp hồ sơ</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: THANH TOÁN ĐẶT CỌC */}
            {showDepositModal && depositData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 w-[600px] max-w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4 text-blue-800 border-b pb-2">Thông tin thanh toán cọc</h3>

                        {/* Hiển thị QR Code */}
                        {depositData.qrCode && (
                            <div className="flex justify-center mb-4">
                                <img src={depositData.qrCode} alt="QR Code Payment" className="w-48 h-48 object-contain border p-2 rounded" />
                            </div>
                        )}

                        <div className="space-y-3 text-sm mb-6 bg-gray-50 p-4 rounded-lg border">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Ngân hàng:</span>
                                <span className="font-bold">{depositData.bankInfo?.bank_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Số tài khoản:</span>
                                <span className="font-bold text-lg text-blue-600">{depositData.bankInfo?.account_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Chủ tài khoản:</span>
                                <span className="font-bold">{depositData.bankInfo?.account_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Số tiền:</span>
                                <span className="font-bold text-red-600 text-lg">{parseInt(depositData.amount).toLocaleString('vi-VN')} đ</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Nội dung CK:</span>
                                <span className="font-mono font-bold bg-yellow-100 px-2 py-1 rounded select-all">{depositData.bankInfo?.transfer_content}</span>
                            </div>
                            <div className="mt-2 text-xs text-gray-500 italic text-center">
                                * Vui lòng chuyển khoản chính xác nội dung trên hoặc quét mã QR.
                            </div>
                            {/* Link Stripe nếu có */}
                            {depositData.paymentUrl && (
                                <div className="text-center mt-6 pt-4 border-t border-gray-200">
                                    <a
                                        href={depositData.paymentUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg font-medium transition"
                                    >
                                        💳 Thanh toán qua thẻ (Stripe)
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowDepositModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Đóng</button>
                            <button
                                onClick={handleVerifyPayment}
                                className="px-6 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-lg shadow-lg shadow-green-200"
                            >
                                Xác nhận thanh toán
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 3: CHI TIẾT THANH TOÁN WINNER (API 18) */}
            {showWinnerReqModal && winnerReqData && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-[500px] shadow-2xl border-t-8 border-blue-600 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">Chi tiết thanh toán tài sản</h3>

                        <div className="space-y-4 text-gray-700">
                            <div className="flex justify-between items-center py-2 border-b border-dashed">
                                <span className="text-gray-600">Giá trúng đấu giá:</span>
                                <span className="font-bold text-lg">{parseInt(winnerReqData.paymentBreakdown?.winningAmount).toLocaleString()} đ</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-dashed">
                                <span className="text-gray-600">Tiền đặt trước (Đã trừ):</span>
                                <span className="font-semibold text-green-600">- {parseInt(winnerReqData.paymentBreakdown?.depositAlreadyPaid).toLocaleString()} đ</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-dashed">
                                <span className="text-gray-600">Phí hồ sơ:</span>
                                <span className="font-semibold text-orange-600">+ {parseInt(winnerReqData.paymentBreakdown?.dossierFee).toLocaleString()} đ</span>
                            </div>
                            <div className="flex justify-between items-center py-4 bg-orange-50 px-3 rounded-lg mt-2">
                                <span className="font-bold text-lg text-gray-800">Tổng tiền phải nộp:</span>
                                <span className="font-bold text-2xl text-red-600">{parseInt(winnerReqData.paymentBreakdown?.totalDue).toLocaleString()} đ</span>
                            </div>
                        </div>

                        <div className="mt-4 text-sm text-red-500 italic text-center bg-red-50 p-2 rounded">
                            ⚠️ Hạn chót thanh toán: {new Date(winnerReqData.paymentBreakdown.paymentDeadline).toLocaleString('vi-VN')}
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setShowWinnerReqModal(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Đóng</button>
                            <button
                                onClick={handleInitWinnerPayment}
                                className="px-6 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-lg shadow-lg"
                            >
                                Thanh toán ngay
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 4: THANH TOÁN WINNER - QR/STRIPE (API 19) */}
            {showWinnerPayModal && winnerPayData && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 w-[600px] max-w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4 text-blue-800 border-b pb-2 flex items-center gap-2">
                            <span>🔐</span> Cổng thanh toán
                        </h3>

                        {/* QR Code */}
                        {winnerPayData.qrCode && (
                            <div className="flex justify-center mb-6 bg-white p-4 rounded-xl border shadow-sm">
                                <img src={winnerPayData.qrCode} alt="QR Payment" className="w-56 h-56 object-contain" />
                            </div>
                        )}

                        <div className="space-y-3 text-sm mb-6 bg-gray-50 p-5 rounded-lg border border-gray-200">
                            <div className="grid grid-cols-3 gap-2">
                                <span className="text-gray-500">Ngân hàng:</span>
                                <span className="font-bold col-span-2">{winnerPayData.bankInfo?.bank_name}</span>

                                <span className="text-gray-500">Số tài khoản:</span>
                                <span className="font-bold text-lg text-blue-600 col-span-2 tracking-wider">{winnerPayData.bankInfo?.account_number}</span>

                                <span className="text-gray-500">Chủ tài khoản:</span>
                                <span className="font-bold col-span-2">{winnerPayData.bankInfo?.account_name}</span>

                                <span className="text-gray-500">Số tiền:</span>
                                <span className="font-bold text-red-600 text-lg col-span-2">{parseInt(winnerPayData.amount).toLocaleString()} đ</span>

                                <span className="text-gray-500 mt-1">Nội dung:</span>
                                <div className="col-span-2">
                                    <span className="font-mono font-bold bg-yellow-200 px-3 py-1 rounded text-black select-all border border-yellow-300">
                                        {winnerPayData.bankInfo?.transfer_content}
                                    </span>
                                </div>
                            </div>

                            {/* Link Stripe */}
                            {winnerPayData.paymentUrl && (
                                <div className="text-center mt-6 pt-4 border-t border-gray-200">
                                    <a
                                        href={winnerPayData.paymentUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg font-medium transition"
                                    >
                                        💳 Thanh toán qua thẻ (Stripe)
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowWinnerPayModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Quay lại</button>
                            <button
                                onClick={handleVerifyWinnerPayment}
                                className="px-6 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-lg shadow-lg shadow-green-200"
                            >
                                Xác nhận thanh toán
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}