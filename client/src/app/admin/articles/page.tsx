"use client";

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useAdminNews } from '../../../hooks/useAdminArticle'; 
import { NewsTable } from '../../../components/admin/NewsTable';
import { NewsFormModal } from '../../../components/admin/NewsFormModal';
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';
import Sidebar from '../../../components/admin/Sidebar';

export default function NewsManagementPage() {
  const { newsList, loading, pagination, createNews, filters, setFilters, updateNews, deleteNews } = useAdminNews();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreate = () => { setEditingItem(null); setIsModalOpen(true); };
  const handleEdit = (item: any) => { setEditingItem(item); setIsModalOpen(true); };

  const handleFormSubmit = async (formData: any) => {
    if (editingItem) {
        return await updateNews(editingItem.id, formData);
    } else {
        return await createNews(formData);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Xác nhận xóa
  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    const success = await deleteNews(deleteId);
    setIsDeleting(false);
    if (success) {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
    }
  };

  // Xử lý tìm kiếm (Debounce đơn giản)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Reset về trang 1 khi tìm kiếm
    pagination.setPage(1); 
    setFilters((prev: any) => ({ ...prev, search: e.target.value }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    pagination.setPage(1);
    setFilters((prev: any) => ({ ...prev, type: e.target.value }));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar & Header */}
      <Sidebar sidebarOpen={sidebarOpen} />

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Tin tức</h1>
            <p className="text-sm text-gray-500">Đăng tải và cập nhật các bản tin, thông báo đấu giá</p>
          </div>
          <button onClick={handleCreate} className="flex gap-2 bg-[#FFC107] hover:bg-yellow-500 text-black px-4 py-2 rounded font-medium shadow-sm">
            <Plus size={18} /> Viết bài mới
          </button>
        </div>

        {/* --- FILTERS --- */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Tìm kiếm tiêu đề bài viết..." className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-yellow-500 focus:border-yellow-500" />
            </div>
            <select className="border rounded-md px-4 py-2 focus:ring-yellow-500">
                <option value="all">Tất cả thể loại</option>
                <option value="news">Tin tức</option>
                <option value="announcement">Thông báo</option>
            </select>
        </div>

        {/* --- TABLE --- */}
        <NewsTable 
            data={newsList} 
            loading={loading} 
            pagination={pagination}
            onEdit={handleEdit} 
            onDelete={deleteNews} 
        />

        {/* --- MODAL --- */}
        <NewsFormModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSubmit={handleFormSubmit} 
            initialData={editingItem}
        />
      </main>
    </div>
  );
}