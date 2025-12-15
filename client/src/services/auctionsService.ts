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

// 1. API Đăng ký tham gia (Upload file)
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

// 2. Submit Deposit
export const submitDeposit = async (data: { registrationId: string; auctionId: string; amount: number }) => {
    const response = await apiClient.post<ApiResponse<PaymentInitiationData>>('/register-to-bid/submit-deposit', data);
    return response.data.data; 
};

// 3. Verify Payment
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

// 4. API Check-in (Điểm danh)
export const checkInAuction = async (auctionId: string): Promise<ApiResponse<any> | null> => {
    try {
        const response = await apiClient.post<ApiResponse<any>>('/register-to-bid/check-in', { auctionId });
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.error?.message || "Lỗi điểm danh không xác định";
        throw new Error(message);
    }
};

// 5. API Đặt giá (Manual Bid)
export const placeManualBid = async (data: { auctionId: string; amount: number }): Promise<ApiResponse<any> | null> => {
    try {
        const response = await apiClient.post<ApiResponse<any>>('/manual-bid', data);
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.error?.message || "Lỗi điểm danh không xác định";
        throw new Error(message);
    }
};