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
    checkInAuction
} from '../../../services/auctionsService';
import { AuctionDetail } from '../../../types/auction';
import { toast } from "sonner";

function BackgroundIcon() {
    return (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-6xl text-rose-200 opacity-50 font-bold rounded-full w-16 h-16 flex items-center justify-center border-2 border-rose-200"
            style={{ color: 'rgba(230, 180, 180, 0.4)', borderColor: 'rgba(230, 180, 180, 0.4)', transform: 'translateY(-50%) rotate(-15deg)' }}>
            <span className="text-4xl">1</span>
        </div>
    );
}

function InfoCard({ label, text }: { label: string; text?: string; }) {
    return (
        <div className="relative p-4 rounded-xl shadow-md" style={{ backgroundColor: '#fef7f7' }}>
            <p className="text-lg mb-1" style={{ color: '#6e4747', fontWeight: 500 }}>{label}</p>
            <p className="text-lg font-bold" style={{ color: '#9e2b2b' }}>{text}</p>
            <BackgroundIcon />
        </div>
    );
}

export default function AuctionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [auction, setAuction] = useState<AuctionDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRegistrationEnded, setIsRegistrationEnded] = useState(false);
    const [registrationResponse, setRegistrationResponse] = useState<any>(null);

    // --- STATE CHO MODALS ---
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showDepositModal, setShowDepositModal] = useState(false);

    // State dữ liệu form đăng ký
    const [docFiles, setDocFiles] = useState<FileList | null>(null);
    const [mediaFiles, setMediaFiles] = useState<FileList | null>(null);

    // State dữ liệu thanh toán
    const [depositData, setDepositData] = useState<any>(null);

    // Hàm load dữ liệu
    const loadData = async () => {
        if (!id) return;
        try {
            const auctionData = await getAuctionById(id);
            setAuction(auctionData);
            if (auctionData) {
                setIsRegistrationEnded(new Date(auctionData.saleEndAt).getTime() < Date.now());
                const regData = await getAuctionRegistration(id);
                setRegistrationResponse(regData);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

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
                amount: Number(auction.depositAmountRequired) + Number(auction.saleFee) // Lấy amount từ auction
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

    // Thêm hàm xử lý Check-in (đặt gần các hàm handle khác)
    const handleCheckIn = async () => {
        try {
            const res = await checkInAuction(id);
            if (res) {
                // Hiển thị message thành công từ server
                alert(res.message);
                loadData(); // Reload lại để nút chuyển sang trạng thái "CHECKED_IN"
            }
        } catch (error: any) {
            // Hiển thị message lỗi từ server (Ví dụ: Chưa đến giờ check-in)
            toast.error(error.message);
        }
    };

    // --- RENDER NÚT BẤM ---
    const renderActionButton = () => {
        if (!auction) return null;
        const now = new Date();
        const isSuccess = registrationResponse?.success;
        const currentState = registrationResponse?.data?.currentState;

        // 1. Chưa đăng ký / Bị từ chối
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

        // 2. Chờ duyệt
        if (currentState === "PENDING_DOCUMENT_REVIEW") {
            return <button disabled className="w-full py-3 rounded-lg bg-yellow-100 text-yellow-700 font-bold border border-yellow-300 mb-3 cursor-wait">⏳ Chờ phê duyệt</button>;
        }

        // 3. Đã duyệt hồ sơ -> Nộp cọc
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

        // 4. Đã nộp cọc -> Chờ duyệt cấp 2
        if (currentState === "DEPOSIT_PAID") {
            return <button disabled className="w-full py-3 rounded-lg bg-yellow-100 text-yellow-700 font-bold border border-yellow-300 mb-3">⏳ Chờ phê duyệt</button>;
        }

        // 5. Confirmed -> Điểm danh
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

        // 6 & 7. Checked In
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
                            <InfoCard label="Thời gian bắt đầu tiếp nhận hồ sơ" text={new Date(auction.saleStartAt).toLocaleString('vi-VN')} />
                            <InfoCard label="Thời gian kết thúc tiếp nhận hồ sơ" text={new Date(auction.saleEndAt).toLocaleString('vi-VN')} />
                            <InfoCard label="Thời gian bắt đầu đấu giá" text={new Date(auction.auctionStartAt).toLocaleString('vi-VN')} />
                            <InfoCard label="Thời gian kết thúc đấu giá" text={new Date(auction.auctionEndAt).toLocaleString('vi-VN')} />
                            <InfoCard label="Địa điểm" text={auction.assetAddress} />
                            <InfoCard label="Loại tài sản" text={auction.assetType} />
                        </div>
                    </div>

                    <aside className="bg-white border border-gray-200 rounded-lg p-5 h-fit sticky top-5">
                        <h3 className="font-semibold text-xl mb-5 text-center text-gray-800">Thời gian bắt đầu đấu giá</h3>
                        <TimeBox startTime={auction.auctionStartAt} />

                        <p className="text-left mt-10 text-sm text-gray-600 mb-2">
                            Thời gian nộp tiền đặt trước: <br />
                            <span className="font-medium">{new Date(auction.depositEndAt).toLocaleString('vi-VN')}</span>
                        </p>

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
                                <div className="text-center mt-2">
                                    <a href={depositData.paymentUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">Hoặc thanh toán qua cổng Stripe tại đây</a>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowDepositModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Đóng</button>
                            <button
                                onClick={handleVerifyPayment}
                                className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-lg shadow-green-200"
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