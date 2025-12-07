import {Gavel, LayoutDashboard, LogOut, Settings, Users } from 'lucide-react';


export default function Sidebar({ sidebarOpen }: { sidebarOpen: boolean }) {
    return (
<aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#1a1a1a] text-white transition-all duration-300 flex flex-col shadow-xl z-20`}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-4 bg-[#FFC107] text-black font-bold text-sm tracking-wide">
             {sidebarOpen ? "THANH CONG ADMIN" : "TC"}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 space-y-1 px-3">
            <NavItem icon={<LayoutDashboard size={20} />} label="Trang chủ" isOpen={sidebarOpen} />
            <NavItem icon={<Gavel size={20} />} label="Quản lý Đấu giá" isOpen={sidebarOpen} active />
            <NavItem icon={<Users size={20} />} label="Tin tức" isOpen={sidebarOpen} />
            <NavItem icon={<Settings size={20} />} label="Cài đặt hệ thống" isOpen={sidebarOpen} />
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-gray-800">
            <button className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors w-full">
                <LogOut size={20} /> {sidebarOpen && <span>Đăng xuất</span>}
            </button>
        </div>
</aside>
    );
}
const NavItem = ({ icon, label, isOpen, active }: any) => (
    <div className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors ${active ? 'bg-[#FFC107] text-black font-semibold' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
        {icon}
        {isOpen && <span className="text-sm">{label}</span>}
    </div>
);