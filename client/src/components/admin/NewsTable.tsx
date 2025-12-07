import { Edit, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '../../app/utils/format'; 

interface Props {
  data: any[];
  loading: boolean;
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
    setPage: (page: number) => void;
  };
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
}

export const NewsTable = ({ data, loading, pagination, onEdit, onDelete }: Props) => {
  const { page, totalPages, totalItems, setPage } = pagination;
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="flex-1 overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
          <tr>
            <th className="px-6 py-4">Bài viết</th>
            <th className="px-6 py-4">Danh mục</th>
            <th className="px-6 py-4">Tác giả</th>
            <th className="px-6 py-4">Ngày đăng</th>
            <th className="px-6 py-4 text-right">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
                <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-500"/></td></tr>
            ) : data.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Không tìm thấy bài viết nào.</td></tr>
            ) : (
                data.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                        <div className="flex gap-3 items-center">
                            <div className="relative w-16 h-12 rounded overflow-hidden flex-shrink-0 bg-gray-100 border">
                                <Image src={item.image?.url || '/placeholder.jpg'} alt="" fill className="object-cover" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 line-clamp-1 max-w-[200px]" title={item.title}>{item.title}</p>
                                <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">{item.description}</p>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.type === 'news' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                            {item.type === 'news' ? 'Tin tức' : item.type === 'announcement' ? 'Thông báo' : 'Pháp luật'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{item.author}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(item.createdAt)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => onEdit(item)} className="p-2 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition"><Edit size={18} /></button>
                        <button onClick={() => onDelete(item.id)} className="p-2 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition"><Trash2 size={18} /></button>
                    </td>
                    </tr>
                ))
            )}
        </tbody>
      </table>
    </div>
    {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <span className="text-sm text-gray-500">
            Trang <span className="font-medium">{page}</span> / {totalPages} ({totalItems} bài viết)
          </span>
          <div className="flex gap-2">
            <button 
                onClick={() => setPage(page - 1)} disabled={page === 1}
                className="p-2 border rounded hover:bg-white disabled:opacity-50 text-gray-600"
            >
                <ChevronLeft size={16} />
            </button>
            <button 
                onClick={() => setPage(page + 1)} disabled={page === totalPages}
                className="p-2 border rounded hover:bg-white disabled:opacity-50 text-gray-600"
            >
                <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};