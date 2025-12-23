import React from 'react';
import { X, AlertCircle, Loader2, FileText, Calendar } from 'lucide-react';
import { Registration } from '../../types/registration';

interface VerifyDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  registration: Registration | null;
  isProcessing: boolean;
}

export const VerifyDocumentsModal: React.FC<VerifyDocumentsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  registration,
  isProcessing,
}) => {
  if (!isOpen || !registration) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Xác minh tài liệu (Tier 1)
          </h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Bạn có chắc chắn muốn xác minh tài liệu của người dùng này không?
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div>
              <p className="font-medium text-gray-900">
                {registration.user.fullName}
              </p>
              <p className="text-sm text-gray-600">{registration.user.email}</p>
            </div>
            <div className="pt-2 border-t border-blue-200">
              <p className="text-sm text-gray-600">
                Phiên đấu giá: <strong>{registration.auction.name}</strong>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {registration.auction.code}
              </p>
            </div>
            {registration.documents && registration.documents.length > 0 && (
              <div className="pt-2 border-t border-blue-200">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Tài liệu được gửi: {registration.documents.length}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing && <Loader2 className="animate-spin" size={16} />}
            {isProcessing ? 'Đang xử lý...' : 'Xác minh'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface RejectDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  registration: Registration | null;
  reason: string;
  onReasonChange: (reason: string) => void;
  isProcessing: boolean;
}

export const RejectDocumentsModal: React.FC<RejectDocumentsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  registration,
  reason,
  onReasonChange,
  isProcessing,
}) => {
  if (!isOpen || !registration) return null;

  const isValid = reason.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Từ chối tài liệu
          </h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-4">
            Vui lòng nhập lý do từ chối:
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="text-sm">
              <p className="font-medium text-gray-900">
                {registration.user.fullName}
              </p>
              <p className="text-gray-600">{registration.user.email}</p>
              <p className="text-xs text-gray-500 mt-1">
                {registration.auction.name}
              </p>
            </div>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lý do từ chối
          </label>
          <textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Ví dụ: Tài liệu không rõ, hãy cung cấp ảnh CMND rõ ràng, sao kê ngân hàng 3 tháng..."
            disabled={isProcessing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 outline-none text-sm resize-none"
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-2">
            Người dùng sẽ nhận được email với lý do từ chối và có thể gửi lại tài liệu
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing || !isValid}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing && <Loader2 className="animate-spin" size={16} />}
            {isProcessing ? 'Đang xử lý...' : 'Từ chối'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface FinalApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  registration: Registration | null;
  isProcessing: boolean;
}

export const FinalApprovalModal: React.FC<FinalApprovalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  registration,
  isProcessing,
}) => {
  if (!isOpen || !registration) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Phê duyệt cuối cùng (Tier 2)
          </h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0" size={18} />
            <div className="text-sm text-blue-900">
              Phê duyệt cuối cùng là bước Tier 2. Sau đó, người dùng sẽ được phép tham gia đấu giá (sau khi check-in).
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Bạn có chắc chắn muốn phê duyệt cuối cùng cho người dùng này không?
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
            <div>
              <p className="font-medium text-gray-900">
                {registration.user.fullName}
              </p>
              <p className="text-sm text-gray-600">{registration.user.email}</p>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Phiên đấu giá: <strong>{registration.auction.name}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing && <Loader2 className="animate-spin" size={16} />}
            {isProcessing ? 'Đang xử lý...' : 'Phê duyệt'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface RegistrationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration | null;
}

export const RegistrationDetailModal: React.FC<RegistrationDetailModalProps> = ({
  isOpen,
  onClose,
  registration,
}) => {
  if (!isOpen || !registration) return null;

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">
            Chi tiết đơn đăng ký
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Người dùng */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Thông tin người dùng</h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Họ và tên</p>
                <p className="font-medium">{registration.user.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium">{registration.user.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Số điện thoại</p>
                <p className="font-medium">{registration.user.phoneNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">ID người dùng</p>
                <p className="font-mono text-sm">{registration.userId}</p>
              </div>
            </div>
          </div>

          {/* Phiên đấu giá */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Thông tin phiên đấu giá</h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Tên phiên</p>
                <p className="font-medium">{registration.auction.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Mã phiên</p>
                <p className="font-medium">{registration.auction.code}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">ID phiên</p>
                <p className="font-mono text-sm">{registration.auctionId}</p>
              </div>
            </div>
          </div>

          {/* Trạng thái đăng ký */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Trạng thái đăng ký</h3>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ngày đăng ký</span>
                <span className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  {formatDate(registration.registeredAt)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm text-gray-600">Ngày nộp tài liệu</span>
                <span>{formatDate(registration.submittedAt)}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm text-gray-600">Tài liệu xác minh</span>
                <span>{formatDate(registration.documentsVerifiedAt)}</span>
              </div>
              {registration.documentsRejectedAt && (
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-sm text-gray-600">Tài liệu bị từ chối</span>
                  <span>{formatDate(registration.documentsRejectedAt)}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm text-gray-600">Thanh toán đặt cọc</span>
                <span>{formatDate(registration.depositPaidAt)}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm text-gray-600">Phê duyệt cuối cùng</span>
                <span>{formatDate(registration.confirmedAt)}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-sm text-gray-600">Check-in</span>
                <span>{formatDate(registration.checkedInAt)}</span>
              </div>
            </div>
          </div>

          {/* Lý do từ chối nếu có */}
          {registration.documentsRejectedReason && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Lý do từ chối</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  {registration.documentsRejectedReason}
                </p>
              </div>
            </div>
          )}

          {/* Tài liệu */}
          {registration.documents && registration.documents.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Tài liệu được gửi ({registration.documents.length})
              </h3>
              <div className="space-y-2">
                {registration.documents.map((doc, idx) => (
                  <a
                    key={idx}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                  >
                    <FileText size={18} className="text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        Tài liệu {idx + 1}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{doc.url}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
