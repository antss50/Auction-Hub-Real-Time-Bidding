import React from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Eye,
  FileText,
} from 'lucide-react';
import { Registration } from '../../types/registration';

interface Props {
  registrations: Registration[];
  loading: boolean;
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
  };
  onVerify: (registration: Registration) => void;
  onReject: (registration: Registration) => void;
  onFinalApprove: (registration: Registration) => void;
  onViewDetail: (registration: Registration) => void;
  getStatusBadgeColor: (state: Registration['currentState']) => string;
  getStatusLabel: (state: Registration['currentState']) => string;
}

export const RegistrationTable = ({
  registrations,
  loading,
  pagination,
  onVerify,
  onReject,
  onFinalApprove,
  onViewDetail,
  getStatusBadgeColor,
  getStatusLabel,
}: Props) => {
  const { page, totalPages, totalItems, pageSize, setPage, setPageSize } =
    pagination;

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const canVerify = (registration: Registration) => {
    return registration.currentState === 'PENDING_DOCUMENT_REVIEW';
  };

  const canReject = (registration: Registration) => {
    return registration.currentState === 'PENDING_DOCUMENT_REVIEW';
  };

  const canFinalApprove = (registration: Registration) => {
    return registration.currentState === 'DOCUMENTS_VERIFIED' ||
    registration.currentState === 'DEPOSIT_PENDING' ||
    registration.currentState === 'DEPOSIT_PAID'
  };

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">
          Danh sách đơn đăng ký ({totalItems})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* --- HEADER --- */}
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-semibold">Người dùng</th>
              <th className="px-6 py-4 font-semibold">Phiên đấu giá</th>
              <th className="px-6 py-4 font-semibold">Ngày đăng ký</th>
              <th className="px-6 py-4 font-semibold">Trạng thái</th>
              <th className="px-6 py-4 font-semibold">Tài liệu</th>
              <th className="px-6 py-4 font-semibold text-right">Hành động</th>
            </tr>
          </thead>

          {/* --- BODY --- */}
          <tbody className="divide-y divide-gray-100">
            {/* Loading state */}
            {loading ? (
              <tr>
                <td colSpan={6} className="p-10 text-center">
                  <div className="flex justify-center items-center gap-2 text-gray-500">
                    <Loader2 className="animate-spin" size={20} />
                    <span>Đang tải dữ liệu...</span>
                  </div>
                </td>
              </tr>
            ) : (registrations || []).length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center">
                  <div className="text-gray-500">Không có đơn đăng ký nào</div>
                </td>
              </tr>
            ) : (
              registrations.map((registration) => (
                <tr
                  key={registration.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {registration.user.fullName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {registration.user.email}
                    </div>
                    <div className="text-xs text-gray-400">
                      {registration.user.phoneNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {registration.auction.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {registration.auction.code}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {formatDate(registration.registeredAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                          registration.currentState
                        )}`}
                      >
                        {getStatusLabel(registration.currentState)}
                        
                      </span>
                      {registration.documentsRejectedReason && (
                        <div className="text-xs text-red-700 bg-red-50 p-2 rounded border border-red-200 mt-2">
                          <strong>Lý do từ chối:</strong> {registration.documentsRejectedReason}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {registration.documents && registration.documents.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-blue-600" />
                        <span className="text-sm font-medium">
                          {registration.documents.length} tài liệu
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Không có</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => onViewDetail(registration)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>

                      {canVerify(registration) && (
                        <button
                          onClick={() => onVerify(registration)}
                          className="p-2 hover:bg-green-100 rounded-lg text-green-600 transition-colors"
                          title="Xác minh tài liệu (Tier 1)"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}

                      {canReject(registration) && (
                        <button
                          onClick={() => onReject(registration)}
                          className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                          title="Từ chối tài liệu"
                        >
                          <XCircle size={18} />
                        </button>
                      )}

                      {canFinalApprove(registration) && (
                        <button
                          onClick={() => onFinalApprove(registration)}
                          className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                          title="Phê duyệt cuối cùng (Tier 2)"
                        >
                          <Clock size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- PAGINATION --- */}
      {!loading && registrations.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Trang {page} / {totalPages} ({totalItems} tổng cộng)
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={handleNextPage}
              disabled={page >= totalPages}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value));
                setPage(1);
              }}
              className="border rounded-md px-3 py-1 text-sm focus:ring-yellow-500 outline-none"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
