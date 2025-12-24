'use client'
import { Loader2, Save, Upload, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@auction-hub/shacdn-ui/hooks/use-toast';
import { UploadService } from '../../services/upload.service';
import { LocationService } from '../../services/location.service';
import { getImageUrl } from '../../app/utils/format';
import RichTextEditor  from '../admin/editor/RichTextEditor';

import Image from 'next/image';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<boolean>; 
  initialData?: any; 
}

export const AuctionFormModal = ({ isOpen, onClose, onSubmit, initialData }: Props) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    assetType: 'secured_asset', 
    assetAddress: '',
    assetDescription: '',
    saleStartAt: '',
    saleEndAt: '',
    auctionStartAt: '',
    auctionEndAt: '',
    depositEndAt: '',
    startingPrice: 0,
    bidIncrement: 0,
    depositAmountRequired: 0,
    saleFee: 0,
    viewTime: '',
    validCheckInBeforeStartMinutes: 30, 
    validCheckInAfterStartMinutes: 15,  
    assetWardId: 0, 
    assetProvinceId: 0, 
    // Nested Object: Property Owner
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerOrg: '',
    images: [] as { publicId:string | null; url: string }[]
  });


  const [locations, setLocations] = useState<any[]>([]); 
  const [availableWards, setAvailableWards] = useState<any[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (isOpen) {
        const fetchLocations = async () => {
            try {
                const data = await LocationService.getAll();
                if (Array.isArray(data)) {
                    setLocations(data);
                } else {
                    console.error("Dữ liệu locations không phải là mảng:", data);
                    setLocations([]);
                }
                
                // Nếu đang Edit và đã có ProvinceId -> Fill lại danh sách Ward tương ứng
                if (initialData && initialData.assetProvinceId) {
                    const selectedProvince = data.find((p: any) => p.id === initialData.assetProvinceId);
                    if (selectedProvince) {
                        setAvailableWards(selectedProvince.ward || []);
                    }
                }
            } catch (error) {
                console.error("Lỗi tải địa điểm:", error);
            }
        };
        fetchLocations();
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        code: initialData.code || '',
        name: initialData.name || '',
        assetType: initialData.assetType || 'secured_asset',
        assetAddress: initialData.assetAddress || '',
        assetDescription: initialData.assetDescription || '',
        
        // Convert ISO date sang format input datetime-local (YYYY-MM-DDTHH:mm)
        saleStartAt: formatDateForInput(initialData.saleStartAt),
        saleEndAt: formatDateForInput(initialData.saleEndAt),
        auctionStartAt: formatDateForInput(initialData.auctionStartAt),
        auctionEndAt: formatDateForInput(initialData.auctionEndAt),
        depositEndAt: formatDateForInput(initialData.depositEndAt),

        startingPrice: initialData.startingPrice || 0,
        bidIncrement: initialData.bidIncrement || 0,
        depositAmountRequired: initialData.depositAmountRequired || 0,
        saleFee: initialData.saleFee || 0,
        viewTime: initialData.viewTime || Date.now().toString(),
        validCheckInBeforeStartMinutes: initialData.validCheckInBeforeStartMinutes || 30,
        validCheckInAfterStartMinutes: initialData.validCheckInAfterStartMinutes || 15,
        assetWardId: initialData.assetWardId || 0,
        assetProvinceId: initialData.assetProvinceId || 0,

        // Flatten propertyOwner để dễ bind vào input
        ownerName: initialData.propertyOwner?.name || '',
        ownerEmail: initialData.propertyOwner?.email || '',
        ownerPhone: initialData.propertyOwner?.phone || '',
        ownerOrg: initialData.propertyOwner?.organization || '',

        images: initialData.images?.map((img: any) => ({
          publicId: img.publicId || img.url, 
          url: img.url
        })) || []
      });
    } else if (isOpen && !initialData) {
       // Reset form nếu là tạo mới
        resetForm();   
    } 
  }, [initialData, isOpen]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = Number(e.target.value);
    
    const selectedProvince = locations.find(p => p.id === provinceId);
    setAvailableWards(selectedProvince ? selectedProvince.ward : []);
    // Cập nhật State Form
    setFormData(prev => ({
        ...prev,
        assetProvinceId: provinceId,
        assetWardId: 0 
    }));
  };

  // --- XỬ LÝ CHỌN PHƯỜNG/XÃ ---
  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wardId = Number(e.target.value);
    setFormData(prev => ({ ...prev, assetWardId: wardId }));
  };

  const resetForm = () => {
    setFormData(prev => ({ ...prev, images: [] }));
  };

  const formatDateForInput = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localDate.toISOString().slice(0, 16);
  };

  // Helper: Convert input date sang ISO string cho API
  const toISO = (dateString: string) => {
    if (!dateString) return new Date().toISOString();
    return new Date(dateString).toISOString();
  };


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    setIsUploading(true);

    try {
      const uploadedFiles = await UploadService.uploadFiles(files);
      
      const newImages = uploadedFiles.map((file: any) => ({
        publicId: file.publicId || file.url || "temp-id-" + Date.now(), 
        url: file.url 
      }));

      console.log("Uploaded images:", newImages);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));

    } catch (error) {
      toast({ title: 'Lỗi tải ảnh', description: 'Lỗi tải ảnh lên! Vui lòng thử lại.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
      
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      code: formData.code,
      name: formData.name,
      assetType: formData.assetType,
      assetAddress: formData.assetAddress,
      assetDescription: formData.assetDescription,
      
      // Date Fields (Convert to ISO)
      saleStartAt: toISO(formData.saleStartAt),
      saleEndAt: toISO(formData.saleEndAt),
      auctionStartAt: toISO(formData.auctionStartAt),
      auctionEndAt: toISO(formData.auctionEndAt),
      depositEndAt: toISO(formData.depositEndAt),

      // Number Fields
      startingPrice: Number(formData.startingPrice),
      bidIncrement: Number(formData.bidIncrement),
      depositAmountRequired: Number(formData.depositAmountRequired),
      saleFee: Number(formData.saleFee),
      viewTime: Date.now().toString(),
      validCheckInBeforeStartMinutes: Number(formData.validCheckInBeforeStartMinutes),
      validCheckInAfterStartMinutes: Number(formData.validCheckInAfterStartMinutes),
      assetWardId: Number(formData.assetWardId),
      assetProvinceId: Number(formData.assetProvinceId),
      
      images: formData.images.length > 0 ? formData.images : [],
      attachments: [],

      // Nested Object: Property Owner
      propertyOwner: {
        name: formData.ownerName,
        email: formData.ownerEmail,
        phone: formData.ownerPhone,
        organization: formData.ownerOrg
      },
      // status: computedStatus
    };

    const success = await onSubmit(payload);
    console.log("Submit result:", payload);
    setIsSubmitting(false);
    if (success) {
        resetForm();
        onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">
            {initialData ? 'Cập nhật phiên đấu giá' : 'Tạo phiên đấu giá mới'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Hình ảnh tài sản</label>
                
                {/* Area Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors relative">
                    <input 
                        type="file" 
                        multiple 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                    />
                    {isUploading ? (
                        <div className="flex flex-col items-center text-blue-600">
                            <Loader2 className="animate-spin mb-2" />
                            <span className="text-sm font-medium">Đang tải ảnh lên...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-gray-500 pointer-events-none">
                            <Upload size={32} className="mb-2 text-gray-400" />
                            <span className="text-sm font-medium">Kéo thả hoặc click để tải ảnh</span>
                            <span className="text-xs text-gray-400 mt-1">Hỗ trợ JPG, PNG (Tối đa 5MB)</span>
                        </div>
                    )}
                </div>

                {/* Danh sách ảnh Preview */}
                {formData.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 gap-4">
                        {formData.images.map((img, idx) => (
                            <div key={idx} className="relative group aspect-square rounded-md overflow-hidden border bg-gray-100">
                                <Image src={getImageUrl(img.url)} alt="preview" width={100} height={100} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* === NHÓM 1: THÔNG TIN CHUNG === */}
            <div className="md:col-span-2 border-b pb-2 mb-2 font-bold text-gray-700">1. Thông tin tài sản</div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã tài sản</label>
              <input type="text" required className="w-full border p-2 rounded"
                value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại tài sản</label>
              <select className="w-full border p-2 rounded"
                value={formData.assetType} onChange={e => setFormData({...formData, assetType: e.target.value})}>
                <option value="secured_asset">Tài sản đảm bảo</option>
                <option value="state_asset">Tài sản công</option>
                <option value="civil_judgment">Thi hành án</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên tài sản</label>
              <input type="text" required className="w-full border p-2 rounded"
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả tài sản</label>
              <RichTextEditor
                value={formData.assetDescription}
                onChange={(html) => setFormData({ ...formData, assetDescription: html })}
                className="h-[300px]" // Custom height for this modal
              />
            </div>

            {/* === NHÓM 2: TÀI CHÍNH === */}
            <div className="md:col-span-2 border-b pb-2 mb-2 mt-4 font-bold text-gray-700">2. Thông tin tài chính</div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá khởi điểm (VNĐ)</label>
              <input type="number" required min="0" className="w-full border p-2 rounded"
                value={formData.startingPrice} onChange={e => setFormData({...formData, startingPrice: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiền đặt trước (VNĐ)</label>
              <input type="number" required min="0" className="w-full border p-2 rounded"
                value={formData.depositAmountRequired} onChange={e => setFormData({...formData, depositAmountRequired: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bước giá (VNĐ)</label>
              <input type="number" required min="0" className="w-full border p-2 rounded"
                value={formData.bidIncrement} onChange={e => setFormData({...formData, bidIncrement: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phí tham gia (VNĐ)</label>
              <input type="number" required min="0" className="w-full border p-2 rounded"
                value={formData.saleFee} onChange={e => setFormData({...formData, saleFee: Number(e.target.value)})} />
            </div>

            {/* === NHÓM 3: THỜI GIAN === */}
            <div className="md:col-span-2 border-b pb-2 mb-2 mt-4 font-bold text-gray-700">3. Mốc thời gian</div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bắt đầu đăng ký (Sale Start)</label>
              <input type="datetime-local" required className="w-full border p-2 rounded"
                value={formData.saleStartAt} onChange={e => setFormData({...formData, saleStartAt: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kết thúc đăng ký (Sale End)</label>
              <input type="datetime-local" required className="w-full border p-2 rounded"
                value={formData.saleEndAt} onChange={e => setFormData({...formData, saleEndAt: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bắt đầu đấu giá</label>
              <input type="datetime-local" required className="w-full border p-2 rounded"
                value={formData.auctionStartAt} onChange={e => setFormData({...formData, auctionStartAt: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kết thúc đấu giá</label>
              <input type="datetime-local" required className="w-full border p-2 rounded"
                value={formData.auctionEndAt} onChange={e => setFormData({...formData, auctionEndAt: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hạn nộp tiền cọc</label>
              <input type="datetime-local" required className="w-full border p-2 rounded"
                value={formData.depositEndAt} onChange={e => setFormData({...formData, depositEndAt: e.target.value})} />
            </div>

             {/* === NHÓM 4: CHỦ SỞ HỮU (PROPERTY OWNER) === */}
             <div className="md:col-span-2 border-b pb-2 mb-2 mt-4 font-bold text-gray-700">4. Chủ sở hữu tài sản</div>

             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên chủ sở hữu</label>
              <input type="text" className="w-full border p-2 rounded"
                value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="w-full border p-2 rounded"
                value={formData.ownerEmail} onChange={e => setFormData({...formData, ownerEmail: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input type="text" className="w-full border p-2 rounded"
                value={formData.ownerPhone} onChange={e => setFormData({...formData, ownerPhone: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tổ chức</label>
              <input type="text" className="w-full border p-2 rounded"
                value={formData.ownerOrg} onChange={e => setFormData({...formData, ownerOrg: e.target.value})} />
            </div>

            <div className="md:col-span-2 border-b pb-2 mb-2 font-bold text-gray-700 mt-4">Thông tin địa điểm</div>

                {/* 1. Chọn Tỉnh/Thành phố */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh / Thành phố <span className="text-red-500">*</span></label>
                    <select 
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-yellow-500 focus:border-yellow-500"
                        value={formData.assetProvinceId}
                        onChange={handleProvinceChange}
                    >
                        <option value={0}>-- Chọn Tỉnh/Thành --</option>
                        {Array.isArray(locations) && locations.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                             {loc.name}
                          </option>
                        ))}
                    </select>
                </div>

                {/* 2. Chọn Phường/Xã */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phường / Xã <span className="text-red-500">*</span></label>
                    <select 
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:bg-gray-100"
                        value={formData.assetWardId}
                        onChange={handleWardChange}
                        disabled={formData.assetProvinceId === 0} // Chỉ cho chọn khi đã chọn Tỉnh
                    >
                        <option value={0}>-- Chọn Phường/Xã --</option>
                        {availableWards.map((ward) => (
                            <option key={ward.id} value={ward.id}>
                                {ward.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 3. Địa chỉ chi tiết (Input text cũ) */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết (Số nhà, đường...)</label>
                    <input 
                        type="text" 
                        required 
                        className="w-full border p-2 rounded"
                        value={formData.assetAddress} 
                        onChange={e => setFormData({...formData, assetAddress: e.target.value})} 
                        placeholder="VD: 123 Đường Nguyễn Huệ..."
                    />
                </div>

          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
            <button onClick={onClose} disabled={isSubmitting} className="px-4 py-2 border rounded hover:bg-white">Hủy bỏ</button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-[#FFC107] text-black font-medium rounded hover:bg-yellow-500">
                {isSubmitting ? 'Đang xử lý...' : <><Save size={18}/> {initialData ? 'Lưu thay đổi' : 'Tạo mới'}</>}
            </button>
        </div>
      </div>
    </div>
  );
};