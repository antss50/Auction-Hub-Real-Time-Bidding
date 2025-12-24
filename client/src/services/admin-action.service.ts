import apiClient from '@auction-hub/axios'; 

export const AdminActionService = {
  // Deny Bid
  denyBid: async (bidId: string, reason: string) => {
    const res = await apiClient.post('/manual-bid/deny', { bidId, reason });
    return res.data;
  },

  // Finalize Auction
  finalizeAuction: async (payload: {auctionId: string, notes?: string}) => {
    const res = await apiClient.post(`/auction-finalization/finalize`, payload);
    return res.data;
  },

  // Evaluate Auction
  evaluateAuction: async (auctionId: string) => {
    const res = await apiClient.get(`/auction-finalization/evaluate/${auctionId}`);
    return res.data;
  },

  // Get Audit Logs
  getAuditLogs: async (auctionId: string) => {
    const res = await apiClient.get(`/auction-finalization/audit-logs/${auctionId}`);
    return res.data;
  },
  
  // Get Results (Public/Admin)
  getResults: async (auctionId: string) => {
    const res = await apiClient.get(`/auction-finalization/results/${auctionId}`);
    return res.data;
  },

  // Get contract 
  getContract: async (contractId: string) => {
    const res = await apiClient.get(`/contracts/${contractId}?t=${new Date().getTime()}`);
    return res.data;
  },

  // Download contract
  downloadContract : async (contractId: string) => {
    const res =await apiClient.get(`/contracts/${contractId}/pdf/vi`, {
      responseType: 'blob'
    })
    return res.data;
  }
};