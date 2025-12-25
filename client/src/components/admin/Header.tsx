import { Menu, Bell, ArrowLeft } from 'lucide-react';
import Link from "next/link";

interface Props {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    title?: string;
}

export default function Header({ sidebarOpen, setSidebarOpen, title }: Props) {
    return (
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                >
                    <Menu size={20} />
                </button>

                <h1 className="text-lg font-bold text-gray-800 hidden md:block">
                    {title || "Hệ thống quản trị"}
                </h1>
            </div>

            <div className="flex items-center gap-4">
                {/* Nút Trở về */}
                <Link
                    href="/"
                    className="hidden md:flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm transition-colors"
                >
                    <ArrowLeft size={16} />
                    Trở về
                </Link>

                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>

                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-lg pr-3 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[#FFC107] flex items-center justify-center font-bold text-xs text-black border border-yellow-600">
                        AD
                    </div>
                    <div className="hidden md:block text-sm text-left">
                        <p className="font-medium text-gray-700 leading-none">Admin</p>
                        <p className="text-xs text-gray-500">Quản trị viên</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
