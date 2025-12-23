import apiClient from '@auction-hub/axios';
import {
  RegistrationListResponse,
  Registration,
  VerifyDocumentsResponse,
  RejectDocumentsResponse,
  FinalApprovalResponse,
  RegistrationListParams,
} from '../types/registration';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const RegistrationService = {
  // Get all registrations (admin only)
  getAll: async (params: RegistrationListParams): Promise<RegistrationListResponse> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    // if (params.auctionId) queryParams.append('auctionId', params.auctionId);

    const response = await apiClient.get<ApiResponse<RegistrationListResponse>>(
      `/register-to-bid/admin/registrations?${queryParams.toString()}`
    );
    return response.data.data;
  },

  // Verify documents (admin only)
  verifyDocuments: async (
    registrationId: string
  ): Promise<VerifyDocumentsResponse> => {
    const response = await apiClient.post<ApiResponse<VerifyDocumentsResponse>>(
      '/register-to-bid/admin/verify-documents',
      { registrationId }
    );
    return response.data.data;
  },

  // Reject documents (admin only)
  rejectDocuments: async (
    registrationId: string,
    reason: string
  ): Promise<RejectDocumentsResponse> => {
    const response = await apiClient.post<ApiResponse<RejectDocumentsResponse>>(
      '/register-to-bid/admin/reject-documents',
      { registrationId, reason }
    );
    return response.data.data;
  },

  // Final approval (admin only)
  finalApproval: async (
    registrationId: string
  ): Promise<FinalApprovalResponse> => {
    const response = await apiClient.post<ApiResponse<FinalApprovalResponse>>(
      '/register-to-bid/admin/final-approval',
      { registrationId }
    );
    return response.data.data;
  },

  // Get user registrations
  getUserRegistrations: async (userId: string) => {
    const response = await apiClient.get<ApiResponse<Registration[]>>(
      `/register-to-bid/users/${userId}/registrations`
    );
    return response.data.data;
  },

  // Get registration for auction
  getAuctionRegistration: async (auctionId: string) => {
    const response = await apiClient.get<ApiResponse<Registration>>(
      `/register-to-bid/auctions/${auctionId}/registration`
    );
    return response.data.data;
  },
};
