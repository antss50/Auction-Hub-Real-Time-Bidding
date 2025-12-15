"use client";

import Image from "next/image";
import Link from "next/link";
import { 
    Home, 
    Wifi, 
    Clock, 
    CheckCircle2, 
    Coins, 
    Minus, 
    Plus, 
    Gavel, 
    RotateCcw, 
    List 
} from "lucide-react";
import { Button } from "@auction-hub/shacdn-ui/button"; 
import Topbar from "../../components/Topbar"; 
import Navbar from "../../components/Navbar"; 

export default function AuctionDetail() {
    return (
        <main className="w-full min-h-screen font-sans bg-white text-slate-800">
            {/* --- Header Sections --- */}
            <Topbar />
            <Navbar />

            {/* --- Breadcrumb --- */}
            <div className="bg-zinc-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/" className="flex items-center hover:text-[#8B1E1E] transition-colors">
                        <Home className="w-4 h-4 mr-1" />
                        <span>Trang chủ</span>
                    </Link>
                    <span>{">"}</span>
                    <span>Tài sản đấu giá</span>
                    <span>{">"}</span>
                    <span className="text-[#8B1E1E] font-semibold">Đấu giá trực tuyến</span>
                </div>
            </div>

            {/* --- Main Content --- */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* === LEFT COLUMN (Thông tin tài sản) === */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Title Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h1 className="text-3xl font-bold text-[#8B1E1E] flex items-center gap-2">
                                <Wifi className="w-8 h-8 rotate-45" /> 
                                Đấu giá trực tuyến
                            </h1>
                            <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <span className="text-green-700 font-medium text-sm">Đang diễn ra</span>
                            </div>
                        </div>

                        {/* Info Card */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                <span className="text-gray-500">Bước giá</span>
                                <span className="font-bold text-gray-900">1.000.000đ</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                <span className="text-gray-500">Số bước giá tối đa</span>
                                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm">∞ Không giới hạn</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Số tiền đặt tối đa</span>
                                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm">∞ Không giới hạn</span>
                            </div>
                        </div>

                        {/* Main Image */}
                        <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                            <Image
                                src="/khudatA1.jpg"
                                alt="Auction Item"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* === RIGHT COLUMN (Khu vực đấu giá) === */}
                    <div className="lg:col-span-5 space-y-6">
                        
                        {/* Top 3 Stat Boxes */}
                        <div className="grid grid-cols-3 gap-3">
                            {/* Mã Đấu Giá */}
                            <div className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col items-center justify-center relative overflow-hidden">
                                <CheckCircle2 className="absolute -right-2 -bottom-2 w-10 h-10 text-gray-100" />
                                <span className="text-xs text-gray-500 mb-1">Mã đấu giá của bạn</span>
                                <span className="font-bold text-[#8B1E1E] text-sm md:text-base truncate w-full text-center">VND1095971</span>
                            </div>
                            {/* Thời gian */}
                            <div className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col items-center justify-center relative overflow-hidden">
                                <Clock className="absolute -right-2 -bottom-2 w-10 h-10 text-gray-100" />
                                <span className="text-xs text-gray-500 mb-1">Thời gian còn lại</span>
                                <span className="font-bold text-gray-900 text-lg">00:19:22</span>
                            </div>
                            {/* Giá khởi điểm */}
                            <div className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col items-center justify-center relative overflow-hidden">
                                <Coins className="absolute -right-2 -bottom-2 w-10 h-10 text-gray-100" />
                                <span className="text-xs text-gray-500 mb-1">Giá khởi điểm</span>
                                <span className="font-bold text-gray-900 text-sm md:text-base">10.000.000 đ</span>
                            </div>
                        </div>

                        {/* Current Price Box */}
                        <div className="bg-[#FFF5F5] border border-red-100 rounded-xl p-6 text-center space-y-2 relative overflow-hidden">
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10">
                                <Gavel className="w-24 h-24 text-[#8B1E1E]" />
                            </div>
                            <p className="text-gray-500 font-medium">Giá trả hiện tại</p>
                            <h2 className="text-4xl font-extrabold text-[#8B1E1E]">10.000.000 đ</h2>
                        </div>

                        {/* Bidding Controls */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                    Số tiền đấu giá <span className="text-gray-400 font-normal">(?)</span>
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button variant="outline" className="h-12 w-12 rounded-lg border-gray-300 hover:bg-gray-50">
                                    <Minus className="w-5 h-5 text-gray-600" />
                                </Button>
                                
                                <div className="flex-1 relative">
                                    <input 
                                        type="text" 
                                        value="11.000.000 đ" 
                                        readOnly
                                        className="w-full h-12 border border-gray-300 rounded-lg text-center font-bold text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                        Auto
                                    </span>
                                </div>

                                <Button variant="outline" className="h-12 w-12 rounded-lg border-gray-300 hover:bg-gray-50">
                                    <Plus className="w-5 h-5 text-gray-600" />
                                </Button>
                            </div>

                            <Button className="w-full h-12 bg-[#8B1E1E] hover:bg-[#701818] text-white font-bold text-lg rounded-lg shadow-md transition-all flex items-center justify-center gap-2">
                                <Gavel className="w-5 h-5" />
                                Đấu giá
                            </Button>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Giá gợi ý: 11.000.000đ</span>
                                <button className="text-[#8B1E1E] hover:underline flex items-center gap-1 font-medium">
                                    <RotateCcw className="w-4 h-4" />
                                    Rút lại giá đã trả
                                </button>
                            </div>
                        </div>

                        {/* History Section */}
                        <div className="border-t border-gray-100 pt-6">
                            <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold">
                                <List className="w-5 h-5" />
                                Lịch sử trả giá
                            </div>
                            <div className="bg- rounded-lg p-8 text-center border border-gray-100 border-dashed">
                                <p className="text-gray-400 text-sm">0 lượt đấu giá</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}