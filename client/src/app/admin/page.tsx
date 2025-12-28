"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
    getDashboardAnalytics,
    refreshAnalyticsView,
} from "../../services/admin-action.service";
import { DashboardAnalyticsData } from "../../types/admin-dashboard";
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const StatCard = ({ title, value, colorClass, subValue }: { title: string, value: string | number, colorClass: string, subValue?: string }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${colorClass} flex flex-col justify-between`}>
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
        </div>
        <div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            {subValue && <p className="text-sm text-gray-500 mt-1">{subValue}</p>}
        </div>
    </div>
);

// Custom Tooltip cho biểu đồ
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-lg text-sm">
                <p className="font-bold text-gray-700 mb-2">{new Date(label).toLocaleDateString('vi-VN')}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} style={{ color: entry.color }} className="mb-1">
                        {entry.name}: {
                            entry.name === 'Số phiên'
                                ? entry.value
                                : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(entry.value)
                        }
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardAnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filter states
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Hàm gọi API
    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            const params: any = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const res = await getDashboardAnalytics(params);

            if (res.success) {
                // Sắp xếp lại timeSeries theo ngày tăng dần để biểu đồ hiển thị đúng chiều
                const sortedTimeSeries = res.data.timeSeries.sort((a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                );

                setData({
                    ...res.data,
                    timeSeries: sortedTimeSeries
                });
            } else {
                toast.error("Không tải được dữ liệu dashboard");
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi kết nối server");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefreshData = async () => {
        setIsRefreshing(true);
        try {
            await refreshAnalyticsView();
            toast.success("Đã làm mới dữ liệu thống kê!");
            await fetchAnalytics();
        } catch (error) {
            toast.error("Lỗi khi làm mới dữ liệu.");
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    return (
        <main className="min-h-screen bg-gray-50 font-sans">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-1">Tổng quan hoạt động và hiệu suất sàn đấu giá</p>
                    </div>

                    <button
                        onClick={handleRefreshData}
                        disabled={isRefreshing}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition shadow-sm
                            ${isRefreshing ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        <span className={isRefreshing ? "animate-spin" : ""}>🔄</span>
                        {isRefreshing ? 'Đang cập nhật...' : 'Cập nhật dữ liệu'}
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full md:w-auto">
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Từ ngày</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            />
                        </div>
                        <div className="w-full md:w-auto">
                            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Đến ngày</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            />
                        </div>
                        <button
                            onClick={fetchAnalytics}
                            className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition shadow-sm"
                        >
                            Lọc dữ liệu
                        </button>
                        {(startDate || endDate) && (
                            <button
                                onClick={() => { setStartDate(""); setEndDate(""); setTimeout(fetchAnalytics, 0); }}
                                className="px-4 py-2 text-gray-700 hover:text-red-600 bg-white hover:bg-red-50 text-sm font-semibold transition-all duration-300 border-2 border-gray-100 hover:border-red-200 shadow-sm hover:shadow-mdrounded-lg text-sm font-medium transition"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                </div>

                {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                            <span className="text-gray-500 text-sm">Đang tải dữ liệu...</span>
                        </div>
                    </div>
                ) : data ? (
                    <div className="space-y-8">
                        {/* Summary Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <StatCard title="Tổng giá trị giao dịch (GMV)" value={formatCurrency(data.summary.totalGmv)} colorClass="border-green-500" />
                            <StatCard title="Tổng doanh thu" value={formatCurrency(data.summary.totalRevenue)} colorClass="border-blue-500" />
                            <StatCard title="Tổng số phiên" value={data.summary.totalAuctions} subValue={`${data.summary.successfulAuctions} phiên thành công`} colorClass="border-purple-500" />
                            <StatCard title="Tỷ lệ thành công" value={`${data.summary.successRatePercentage}%`} colorClass="border-orange-500" />
                            <StatCard title="Trung bình lượt đấu giá" value={data.summary.avgBids} subValue="lượt / phiên" colorClass="border-rose-500" />
                            <StatCard title="Phiên thành công" value={data.summary.successfulAuctions} colorClass="border-teal-500"/>
                        </div>

                        {/* BIỂU ĐỒ */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Biểu đồ 1: Tài chính (Doanh thu & GMV) */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-6">Biểu đồ Doanh thu & GMV</h3>
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={data.timeSeries}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(str) => new Date(str).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                                fontSize={12}
                                                tickMargin={10}
                                            />
                                            {/* Trục Y trái cho GMV */}
                                            <YAxis
                                                yAxisId="left"
                                                orientation="left"
                                                stroke="#10b981"
                                                fontSize={12}
                                                tickFormatter={(val) => val >= 1000000000 ? `${(val / 1000000000).toFixed(0)}B` : `${(val / 1000000).toFixed(0)}M`}
                                            />
                                            {/* Trục Y phải cho Doanh thu (vì scale khác nhau) */}
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                                stroke="#3b82f6"
                                                fontSize={12}
                                                tickFormatter={(val) => val >= 1000000000 ? `${(val / 1000000000).toFixed(0)}B` : `${(val / 1000000).toFixed(0)}M`}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            {/* GMV dạng Cột */}
                                            <Bar yAxisId="left" dataKey="gmv" name="Tổng GMV" fill="#10b981" barSize={20} radius={[4, 4, 0, 0]} />
                                            {/* Doanh thu dạng Đường */}
                                            <Line yAxisId="right" type="monotone" dataKey="revenue" name="Doanh thu" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Biểu đồ 2: Số lượng phiên đấu giá */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-6">Số lượng phiên đấu giá</h3>
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={data.timeSeries}>
                                            <defs>
                                                <linearGradient id="colorAuctions" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(str) => new Date(str).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                                fontSize={12}
                                                tickMargin={10}
                                            />
                                            <YAxis fontSize={12} allowDecimals={false} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Area
                                                type="monotone"
                                                dataKey="auctionCount"
                                                name="Số phiên"
                                                stroke="#8b5cf6"
                                                fillOpacity={1}
                                                fill="url(#colorAuctions)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500 text-lg">Không có dữ liệu hiển thị.</p>
                        <button onClick={handleRefreshData} className="mt-4 text-indigo-600 hover:underline">
                            Thử làm mới dữ liệu
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}