// Hàm format tiền tệ VNĐ
export const formatCurrency = (value: number | string) => {
  const numberValue = Number(value);
  if (isNaN(numberValue)) return "0₫";
  return numberValue.toLocaleString("vi-VN") + "₫";
};
// Hàm format ngày tháng
export const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("vi-VN");
};

// Hàm xử lý ảnh URL
export const getImageUrl = (imgData: any): string => {
  if (!imgData) return "/images/auction-logo.jpg";

  if (Array.isArray(imgData) && imgData.length > 0) {
      if (imgData[0]?.url) {
        return imgData[0].url;
      }
      if (typeof imgData[0] === 'string') {
        return imgData[0];
      }
    
    return "/images/auction-logo.jpg";
  }

  if (typeof imgData === 'object' && imgData.url) {
    return imgData.url;
  }

  if (typeof imgData === 'string') {
    if (imgData.startsWith('http')) return imgData;
    return `http://localhost:3000/${imgData.startsWith('/') ? imgData.substring(1) : imgData}`;
  }

  return "/images/auction-logo.jpg";
};

export const getComputedStatus = (startAt: string, endAt: string, originalStatus?: string) => {
  if (!startAt || !endAt) return originalStatus || 'unknown';

  const now = new Date().getTime();
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();

  if (now < start) {
    return 'upcoming'; // Sắp diễn ra
  } else if (now >= start && now <= end) {
    return 'now'; // Đang diễn ra
  } else {
    return 'completed'; // Đã kết thúc
  }
};