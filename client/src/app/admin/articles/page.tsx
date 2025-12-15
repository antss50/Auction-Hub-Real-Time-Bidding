"use client";

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useAdminNews } from '../../../hooks/useAdminArticle'; 
import { NewsTable } from '../../../components/admin/NewsTable';
import { NewsFormModal } from '../../../components/admin/NewsFormModal';
import { ConfirmDeleteModal } from '../../../components/ConfirmDeleteModal';
import Sidebar from '../../../components/admin/Sidebar';

export default function NewsManagementPage() {
  const { 
    newsList, 
    loading, 
    pagination, 
    createNews, 
    filters,
    isModalOpen,
    setIsModalOpen,
    sidebarOpen,
    editingItem,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isDeleting,
    setFilters, 
    updateNews, 
    handleCreateClick,
    handleEditClick,
    // handleSearchChange,
    // handleTypeChange,
    handleDeleteClick,
    handleConfirmDelete
  } = useAdminNews();

  const handleFormSubmit = async (formData: any) => {
    if (editingItem) {
        return await updateNews(editingItem.id, formData);
    } else {
        return await createNews(formData);
    }
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
          <button onClick={handleCreateClick} className="flex gap-2 bg-[#FFC107] hover:bg-yellow-500 text-black px-4 py-2 rounded font-medium shadow-sm">
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
            onEdit={handleEditClick} 
            onDelete={handleDeleteClick} 
        />

        {/* --- MODAL --- */}
        <NewsFormModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSubmit={handleFormSubmit} 
            initialData={editingItem}
        />

        <ConfirmDeleteModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
                title="Xóa bài viết?"
                message="Bạn có chắc chắn muốn xóa bài viết này không? Dữ liệu sẽ không thể khôi phục."
            />
      </main>
    </div>
  );
}