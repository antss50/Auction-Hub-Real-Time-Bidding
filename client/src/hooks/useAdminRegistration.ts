import { useState, useEffect, useCallback } from 'react';
import { RegistrationService } from '../services/registration.service';
import { Registration, RegistrationStatus } from '../types/registration';
import { useToast } from '@auction-hub/shacdn-ui/hooks/use-toast';

export const useAdminRegistration = () => {
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [status, setStatus] = useState<RegistrationStatus>('all');
  const [auctionId, setAuctionId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isFinalApprovalModalOpen, setIsFinalApprovalModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(
    null
  );
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processMessage, setProcessMessage] = useState('');

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await RegistrationService.getAll({
        page,
        limit: pageSize,
        status: status !== 'all' ? status : undefined,
        auctionId: auctionId || undefined,
      });

      console.log("API Response:",  data); 

    if (data && data.data) {
        setRegistrations(data.data);

        const meta = data.meta; 
        if (meta) {
            setTotalPages(meta.totalPages);
            setTotalItems(meta.totalItems);
        }
    } 
    else if (Array.isArray(data)) {
        setRegistrations(data);
    }
    } catch (error: any) {
      console.error('Lỗi tải danh sách đăng ký:', error);
      const errorMessage = error?.response?.data?.message || 'Lỗi tải dữ liệu';
      toast({
        title: 'Lỗi',
        description: errorMessage,
        className: 'bg-red-500 text-white',
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, status, auctionId, refreshKey, toast]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  // Filter registrations by search term
  const filteredRegistrations = searchTerm.trim()
    ? registrations.filter(
        (reg) =>
          reg.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.user.phoneNumber?.includes(searchTerm)
      )
    : registrations;

  const handleVerifyDocuments = async (registration: Registration) => {
    setSelectedRegistration(registration);
    setIsVerifyModalOpen(true);
  };

  const confirmVerifyDocuments = async () => {
    if (!selectedRegistration) return;

    try {
      setIsProcessing(true);
      await RegistrationService.verifyDocuments(selectedRegistration.id);
      toast({
        title: 'Thành công',
        description: 'Xác minh tài liệu thành công',
        className: 'bg-green-500 text-white',
      });
      setRefreshKey((prev) => prev + 1);
      setIsVerifyModalOpen(false);
      setSelectedRegistration(null);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Lỗi xác minh tài liệu';
      toast({
        title: 'Lỗi',
        description: errorMessage,
        className: 'bg-red-500 text-white',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectDocuments = async (registration: Registration) => {
    setSelectedRegistration(registration);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const confirmRejectDocuments = async () => {
    if (!selectedRegistration || !rejectReason.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập lý do từ chối',
        className: 'bg-red-500 text-white',
      });
      return;
    }

    setIsProcessing(true);
    try {
      await RegistrationService.rejectDocuments(selectedRegistration.id, rejectReason);
      toast({
        title: 'Thành công',
        description: 'Từ chối tài liệu thành công',
        className: 'bg-green-500 text-white',
      });
      setRefreshKey((prev) => prev + 1);
      setIsRejectModalOpen(false);
      setSelectedRegistration(null);
      setRejectReason('');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Lỗi từ chối tài liệu';
      toast({
        title: 'Lỗi',
        description: errorMessage,
        className: 'bg-red-500 text-white',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalApproval = async (registration: Registration) => {
    setSelectedRegistration(registration);
    setIsFinalApprovalModalOpen(true);
  };

  const confirmFinalApproval = async () => {
    if (!selectedRegistration) return;

    setIsProcessing(true);
    try {
      await RegistrationService.finalApproval(selectedRegistration.id);
      toast({
        title: 'Thành công',
        description: 'Phê duyệt cuối cùng thành công',
        className: 'bg-green-500 text-white',
      });
      setRefreshKey((prev) => prev + 1);
      setIsFinalApprovalModalOpen(false);
      setSelectedRegistration(null);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Lỗi phê duyệt cuối cùng';
      toast({
        title: 'Lỗi',
        description: errorMessage,
        className: 'bg-red-500 text-white',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewDetail = (registration: Registration) => {
    setSelectedRegistration(registration);
    setIsDetailModalOpen(true);
  };

  const getStatusBadgeColor = (
    state: Registration['currentState']
  ): string => {
    switch (state) {
      case 'PENDING_DOCUMENT_REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'DOCUMENTS_VERIFIED':
        return 'bg-blue-100 text-blue-800';
      case 'DOCUMENTS_REJECTED':
        return 'bg-red-100 text-red-800';
      case 'DEPOSIT_PENDING':
        return 'bg-orange-100 text-orange-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'CHECKED_IN':
        return 'bg-emerald-100 text-emerald-800';
      case 'WITHDRAWN':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (state: Registration['currentState']): string => {
    switch (state) {
      case 'PENDING_DOCUMENT_REVIEW':
        return 'Chờ xét duyệt tài liệu';
      case 'DOCUMENTS_VERIFIED':
        return 'Tài liệu đã xác minh';
      case 'DOCUMENTS_REJECTED':
        return 'Tài liệu bị từ chối';
      case 'DEPOSIT_PENDING':
        return 'Chờ thanh toán đặt cọc';
      case 'CONFIRMED':
        return 'Đã phê duyệt';
      case 'CHECKED_IN':
        return 'Đã check-in';
      case 'WITHDRAWN':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  return {
    registrations: filteredRegistrations,
    loading,
    pagination: { page, totalPages, totalItems, pageSize, setPage, setPageSize },
    filters: { status, auctionId, searchTerm, setStatus, setAuctionId, setSearchTerm },
    isVerifyModalOpen,
    setIsVerifyModalOpen,
    isRejectModalOpen,
    setIsRejectModalOpen,
    isFinalApprovalModalOpen,
    setIsFinalApprovalModalOpen,
    isDetailModalOpen,
    setIsDetailModalOpen,
    selectedRegistration,
    setSelectedRegistration,
    rejectReason,
    setRejectReason,
    isProcessing,
    handleVerifyDocuments,
    confirmVerifyDocuments,
    handleRejectDocuments,
    confirmRejectDocuments,
    handleFinalApproval,
    confirmFinalApproval,
    handleViewDetail,
    getStatusBadgeColor,
    getStatusLabel,
  };
};
