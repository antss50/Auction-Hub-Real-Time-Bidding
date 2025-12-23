export default function StatusBadge({ status }: { status: string }) {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      // 1. TRẠNG THÁI: ĐANG DIỄN RA
      case 'now':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <span className="w-2 h-2 mr-1 bg-green-500 rounded-full animate-pulse"></span>
            Đang diễn ra
          </span>
        );
        // 2. TRẠNG THÁI: SẮP DIỄN RA
        case 'upcoming':
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <span className="w-2 h-2 mr-1 bg-yellow-500 rounded-full"></span>
                    Sắp diễn ra
                </span>
            );
        // 3. TRẠNG THÁI: ĐÃ KẾT THÚC
        case 'completed':
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <span className="w-2 h-2 mr-1 bg-gray-500 rounded-full"></span>
                    Đã kết thúc
                </span>
            );
        // 4. TRẠNG THÁI: KHÔNG XÁC ĐỊNH
        default:
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <span className="w-2 h-2 mr-1 bg-red-500 rounded-full"></span>
                    Không xác định
                </span>
            );
    }
}