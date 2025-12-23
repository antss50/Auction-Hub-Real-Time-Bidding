'use client';

import { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { useAdminRegistration } from '../../../hooks/useAdminRegistration';
import { RegistrationTable } from '../../../components/admin/RegistrationTable';
import {
  VerifyDocumentsModal,
  RejectDocumentsModal,
  FinalApprovalModal,
  RegistrationDetailModal,
} from '../../../components/admin/RegistrationModals';

export default function AdminRegistrationPage() {
  const {
    registrations,
    loading,
    pagination,
    filters,
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
  } = useAdminRegistration();

  const { status, auctionId, searchTerm, setStatus, setAuctionId, setSearchTerm } = filters;

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý Đơn đăng ký
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Xét duyệt tài liệu (Tier 1) và phê duyệt cuối cùng (Tier 2) cho đơn đăng ký của người dùng
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm theo tên, email, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-yellow-500 focus:border-yellow-500 outline-none"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="border rounded-md px-4 py-2 focus:ring-yellow-500 outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending_review">Chờ xét duyệt tài liệu</option>
            <option value="deposit_pending">Chờ thanh toán đặt cọc</option>
            <option value="confirmed">Đã phê duyệt</option>
            <option value="rejected">Bị từ chối</option>
            <option value="withdrawn">Đã hủy</option>
          </select>

          <input
            type="text"
            placeholder="Lọc theo ID phiên..."
            value={auctionId}
            onChange={(e) => setAuctionId(e.target.value)}
            className="border rounded-md px-4 py-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
          />
        </div>
      </div>

      {/* Registration Table */}
      <RegistrationTable
        registrations={registrations}
        loading={loading}
        pagination={pagination}
        onVerify={handleVerifyDocuments}
        onReject={handleRejectDocuments}
        onFinalApprove={handleFinalApproval}
        onViewDetail={handleViewDetail}
        getStatusBadgeColor={getStatusBadgeColor}
        getStatusLabel={getStatusLabel}
      />

      {/* Modals */}
      <VerifyDocumentsModal
        isOpen={isVerifyModalOpen}
        onClose={() => {
          setIsVerifyModalOpen(false);
        }}
        onConfirm={confirmVerifyDocuments}
        registration={selectedRegistration}
        isProcessing={isProcessing}
      />

      <RejectDocumentsModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setRejectReason('');
        }}
        onConfirm={confirmRejectDocuments}
        registration={selectedRegistration}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        isProcessing={isProcessing}
      />

      <FinalApprovalModal
        isOpen={isFinalApprovalModalOpen}
        onClose={() => {
          setIsFinalApprovalModalOpen(false);
        }}
        onConfirm={confirmFinalApproval}
        registration={selectedRegistration}
        isProcessing={isProcessing}
      />

      <RegistrationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedRegistration(null);
        }}
        registration={selectedRegistration}
      />
    </div>
  );
}