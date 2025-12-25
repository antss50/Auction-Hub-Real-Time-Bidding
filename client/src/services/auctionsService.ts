import apiClient from '@auction-hub/axios';
import { AuctionDetail, ApiResponse, PaymentInitiationData, PaymentVerificationResult } from '../types/auction';

export const getAuctionById = async (id: string): Promise<AuctionDetail | null> => {
    try {
        const response = await apiClient.get<ApiResponse<AuctionDetail>>(`/auctions/${id}`);
        return response.data.data;
    } catch (error) {
        return null;
    }
};

export const getAuctionRegistration = async (auctionId: string): Promise<ApiResponse<any> | null> => {
    try {
        const response = await apiClient.get<ApiResponse<any>>(`/register-to-bid/auctions/${auctionId}/registration`);
        return response.data; 
    } catch (error) {
        return null;
    }
};

// API Đăng ký tham gia (Upload file)
export const registerToBid = async (formData: FormData): Promise<ApiResponse<any> | null> => {
    try {
        const response = await apiClient.post<ApiResponse<any>>('/register-to-bid', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error: any) {
        console.error("Lỗi đăng ký:", error.response?.data || error.message);
        throw error;
    }
};

// Submit Deposit
export const submitDeposit = async (data: { registrationId: string; auctionId: string; amount: number }) => {
    const response = await apiClient.post<ApiResponse<PaymentInitiationData>>('/register-to-bid/submit-deposit', data);
    return response.data.data; 
};

// Verify Payment
export const verifyDepositPayment = async (data: { sessionId: string; registrationId: string }): Promise<PaymentVerificationResult | null> => {
    try {
        const response = await apiClient.post<ApiResponse<PaymentVerificationResult>>('/register-to-bid/verify-deposit-payment', data);
        return response.data.data;
    } catch (error: any) {
        const message =
            error.response?.data?.error?.message ||
            "Lỗi xác nhận thanh toán không xác định";
        throw new Error(message);
    }
};

// API Check-in (Điểm danh)
export const checkInAuction = async (auctionId: string): Promise<ApiResponse<any> | null> => {
    try {
        const response = await apiClient.post<ApiResponse<any>>('/register-to-bid/check-in', { auctionId });
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.error?.message || "Lỗi điểm danh không xác định";
        throw new Error(message);
    }
};

// API Đặt giá (Manual Bid)
export const placeManualBid = async (data: { auctionId: string; amount: number }): Promise<ApiResponse<any> | null> => {
    try {
        const response = await apiClient.post<ApiResponse<any>>('/manual-bid', data);
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.error?.message || "Lỗi điểm danh không xác định";
        throw new Error(message);
    }
};

// Lấy kết quả đấu giá
export const getAuctionResult = async (auctionId: string) => {
    try {
        const response = await apiClient.get(`/auction-finalization/results/${auctionId}`);
        return response.data;
    } catch (error) {
        return null;
    }
};

// Lấy thông tin yêu cầu thanh toán cho winner
export const getWinnerPaymentRequirements = async (auctionId: string) => {
    try {
        const response = await apiClient.get(`/auction-finalization/winner-payment-requirements/${auctionId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Khởi tạo thanh toán cho winner (Winner Payment)
export const submitWinnerPayment = async (auctionId: string) => {
    try {
        const response = await apiClient.post('/auction-finalization/submit-winner-payment', { auctionId });
        return response.data.data; // Trả về paymentUrl, qrCode, bankInfo...
    } catch (error) {
        throw error;
    }
};

// Xác nhận thanh toán winner
export const verifyWinnerPayment = async (data: { sessionId: string; auctionId: string }) => {
    try {
        const response = await apiClient.post('/auction-finalization/verify-winner-payment', data);
        return response.data;
    } catch (error: any) {
        const message =
            error.response?.data?.error?.message ||
            "Lỗi xác nhận thanh toán không xác định";
        throw new Error(message);
    }
};

// Export PDF Hợp đồng (Tiếng Việt)
// Lưu ý: Hàm này trả về blob để tải file
export const exportContractPdfVi = async (contractId: string) => {
    try {
        const response = await apiClient.get(`/contracts/${contractId}/pdf/vi`, {
            responseType: 'blob' // Quan trọng để tải file
        });
        return response.data;
    } catch (error) {
        console.error("Error downloading contract:", error);
        throw error;
    }
};

// Admin từ chối giá đấu gần nhất
export const denyBid = async (bidId: string, reason: string) => {
    try {
        const response = await apiClient.post('/manual-bid/deny', {
            bidId,
            reason
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};