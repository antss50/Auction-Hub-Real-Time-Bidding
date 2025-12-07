import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import RichTextEditor from '../admin/editor/RichTextEditor'; 
import { UploadService } from '../../services/upload.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<boolean>; 
  initialData?: any;
}

export const NewsFormModal = ({ isOpen, onClose, onSubmit, initialData }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '', 
    content: '',     
    author: '',
    type: 'news',
    image: null as { url: string; publicId: string | null } | null,    
  });

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        content: initialData.content || '',
        author: initialData.author || '',
        type: initialData.type || 'news',
        image: initialData.image || null
      });
    } else if (isOpen && !initialData) {
      // Reset form khi tạo mới
      setFormData({
        title: '', description: '', content: '', author: '', type: 'news', image: null
      });
    }
  }, [isOpen, initialData]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0]; // Chỉ lấy 1 ảnh cover
    setIsUploading(true);

    try {
      // Gọi Service upload (Giả sử service nhận mảng file)
      const uploadedFiles = await UploadService.uploadFiles([file]);
      
      if (uploadedFiles && uploadedFiles.length > 0) {
        const fileData = uploadedFiles[0];
        // Lưu object ảnh vào state
        setFormData(prev => ({
            ...prev,
            image: { url: fileData.url, publicId: fileData.publicId || null }
        }));
      }
    } catch (error) {
      alert("Lỗi tải ảnh!");
      console.error(error);
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
  };

  // 3. Xử lý Submit
  const handleSubmit = async () => {
    if (!formData.title) return alert("Vui lòng nhập tiêu đề");
    
    setIsSubmitting(true);
    
    // Gọi hàm onSubmit từ trang cha truyền vào
    const success = await onSubmit(formData);
    
    setIsSubmitting(false);
    if (success) {
        onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-bold text-lg">Soạn thảo bài viết</h3>
            <button onClick={onClose}><X /></button>
        </div>

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-3 gap-6">
            
            {/* Cột trái: Nội dung chính */}
            <div className="col-span-2 space-y-4">
                <div>
                    <label className="block font-medium mb-1">Tiêu đề bài viết</label>
                    <input type="text" className="w-full border p-2 rounded font-bold text-lg" placeholder="Nhập tiêu đề..." 
                        value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                
                <div>
                    <label className="block font-medium mb-1">Mô tả ngắn (Sapo)</label>
                    <textarea rows={3} className="w-full border p-2 rounded" placeholder="Tóm tắt nội dung..."
                        value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>

                <div>
                    <label className="block font-medium mb-1">Nội dung chi tiết</label>
    
                    <div className="h-96"> {/* Set chiều cao cố định cho vùng soạn thảo */}
                        <RichTextEditor 
                            value={formData.content} 
                            onChange={(html: any) => setFormData({ ...formData, content: html })} 
                        />
                    </div>
                </div>
            </div>

            {/* Cột phải: Cấu hình & Ảnh */}
            <div className="col-span-1 space-y-4">
                <div className="bg-gray-50 p-4 rounded border">
                    <label className="block font-medium mb-1">Ảnh đại diện (Cover)</label>
                    <div className="aspect-video bg-white border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100">
                        <Upload className="text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Tải ảnh lên</span>
                    </div>
                </div>

                <div>
                    <label className="block font-medium mb-1">Tác giả</label>
                    <input type="text" className="w-full border p-2 rounded" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                </div>

                <div>
                    <label className="block font-medium mb-1">Phân loại</label>
                    <select className="w-full border p-2 rounded" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                        <option value="news">Tin tức</option>
                        <option value="announcement">Thông báo đấu giá</option>
                        <option value="legal">Văn bản pháp luật</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 border rounded">Hủy</button>
            <button className="px-4 py-2 bg-[#FFC107] font-medium rounded">Đăng bài</button>
        </div>
      </div>
    </div>
  );
};