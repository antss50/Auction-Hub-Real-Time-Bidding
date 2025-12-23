import React, { useState, useEffect } from 'react';
import { X, Upload, Save, Loader2, Trash2 } from 'lucide-react';
import { UploadService } from '../../services/upload.service'; 
import RichTextEditor from '../admin/editor/RichTextEditor';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<boolean>;
  initialData?: any;
}

// Định nghĩa kiểu dữ liệu ảnh cho Tin tức

export const NewsFormModal = ({ isOpen, onClose, onSubmit, initialData }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // State Form chuẩn
  const [formData, setFormData] = useState({
    title: '',
    description: '', 
    content: '',     // Nội dung chi tiết (HTML)
    author: '',
    type: 'news',
    image: [] as { publicId:string | null; url: string }[], 
  });

  // --- 1. INITIALIZE DATA  ---
  useEffect(() => {
    if (isOpen && initialData) {

      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        content: initialData.content || '', 
        author: initialData.author || '',
        type: initialData.type || 'news',
        image: initialData.image || []
      });
    } else if (isOpen && !initialData) {
      // Reset form khi Tạo mới
      resetForm();
    }
  }, [isOpen, initialData]);

  const resetForm = () => {
    setFormData(prev => ({ ...prev, images: [] }));
  };

  // --- 2. HANDLERS ---

  // Xử lý upload ảnh (Chỉ cho phép 1 ảnh)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setIsUploading(true);

    try {
      // Upload lên server
      const uploadedFiles = await UploadService.uploadFiles([file]);
      
      const newImages = uploadedFiles.map((file: any) => ({
        publicId: file.publicId || file.url || "temp-id-" + Date.now(), 
        url: file.url 
      }));

      console.log("Uploaded images:", newImages);
      setFormData(prev => ({
        ...prev,
        images: [...prev.image, ...newImages]
      }));
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Lỗi tải ảnh lên!");
    } finally {
      setIsUploading(false);
      e.target.value = ''; 
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.image.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Xử lý Submit Form
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!formData.title.trim()) return alert("Vui lòng nhập tiêu đề bài viết!");
    
    setIsSubmitting(true);

    const payload = {
      title: formData.title,
      description: formData.description,
      content: formData.content,
      author: formData.author,
      type: formData.type,
      image: formData.image, // Gửi object image lên server
    };

    const success = await onSubmit(payload);
    setIsSubmitting(false);
    
    if (success) {
        resetForm();
        onClose();
    }
  };

  // --- 3. RENDER ---
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-xl text-gray-800">
                {initialData ? 'Cập nhật bài viết' : 'Soạn thảo bài viết mới'}
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-black hover:bg-gray-200 p-2 rounded-full transition">
                <X size={20} />
            </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                
                {/* CỘT TRÁI: Soạn thảo nội dung (Chiếm 2/3) */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div>
                        <label className="block font-semibold text-gray-700 mb-2">Tiêu đề bài viết <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent font-bold text-lg outline-none placeholder-gray-400" 
                            placeholder="Nhập tiêu đề hấp dẫn..." 
                            value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})} 
                        />
                    </div>
                    
                    <div>
                        <label className="block font-semibold text-gray-700 mb-2">Mô tả ngắn (Sapo)</label>
                        <textarea 
                            rows={3} 
                            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none resize-none" 
                            placeholder="Tóm tắt nội dung chính của bài viết..."
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})} 
                        />
                    </div>

                    <div className="flex-1 flex flex-col min-h-[400px]">
                        <label className="block font-semibold text-gray-700 mb-2">Nội dung chi tiết</label>
                        <div className="flex-1 border rounded-lg overflow-hidden flex flex-col">
                            {/* Truyền content vào RichTextEditor */}
                            <RichTextEditor 
                                value={formData.content} 
                                onChange={(html) => setFormData(prev => ({ ...prev, content: html }))} 
                                className="h-full"
                            />
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: Cấu hình & Ảnh (Chiếm 1/3) */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    
                    {/* Ảnh đại diện */}
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                        <label className="block font-bold text-gray-700 mb-3">Ảnh đại diện (Cover)</label>
                        
                        {!formData.image ? (
                            <div className="aspect-video bg-white border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-yellow-500 hover:bg-yellow-50 transition-all relative group">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                    disabled={isUploading}
                                />
                                {isUploading ? (
                                    <div className="flex flex-col items-center text-blue-600">
                                        <Loader2 className="animate-spin mb-2" />
                                        <span className="text-sm font-medium">Đang tải lên...</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-gray-400 group-hover:text-yellow-600">
                                        <Upload size={32} className="mb-2" />
                                        <span className="text-sm font-medium">Nhấn để tải ảnh</span>
                                        <span className="text-xs mt-1">JPG, PNG (Max 5MB)</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-sm group bg-white">
                                {/* Hiển thị ảnh cover */}
                                <img 
                                    src={formData.images.url} 
                                    alt="cover" 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Error+Loading+Image';
                                    }}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button 
                                        onClick={() => removeImage()}
                                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-transform hover:scale-110"
                                        title="Xóa ảnh"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Thông tin bổ sung */}
                    <div className="space-y-4">
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">Tác giả</label>
                            <input 
                                type="text" 
                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none" 
                                value={formData.author} 
                                onChange={e => setFormData({...formData, author: e.target.value})} 
                                placeholder="VD: Ban biên tập"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">Phân loại</label>
                            <select 
                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none bg-white" 
                                value={formData.type} 
                                onChange={e => setFormData({...formData, type: e.target.value})}
                            >
                                <option value="news">Tin tức</option>
                                <option value="announcement">Thông báo đấu giá</option>
                                <option value="legal">Văn bản pháp luật</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
            <button 
                onClick={onClose} 
                disabled={isSubmitting}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-white hover:shadow-sm transition-all font-medium"
            >
                Hủy bỏ
            </button>
            <button 
                onClick={() => handleSubmit()} 
                disabled={isSubmitting || isUploading} 
                className="flex items-center gap-2 px-6 py-2.5 bg-[#FFC107] text-black font-bold rounded-lg hover:bg-yellow-500 shadow-sm hover:shadow transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isSubmitting ? <><Loader2 className="animate-spin" size={20}/> Đang lưu...</> : <><Save size={20}/> Lưu thay đổi</>}
            </button>
        </div>

      </div>
    </div>
  );
};