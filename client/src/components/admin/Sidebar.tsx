import {Gavel, LayoutDashboard, LogOut, Settings, Users } from 'lucide-react';
import { usePathname } from "next/navigation";

export default function Sidebar({ sidebarOpen }: { sidebarOpen: boolean }) {
    return (
<aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#1a1a1a] text-white transition-all duration-300 flex flex-col shadow-xl z-20`}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-4 bg-[#FFC107] text-black font-bold text-sm tracking-wide">
             {sidebarOpen ? "THANH CONG ADMIN" : "TC"}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 space-y-1 px-3">
            <NavItem href = "/dashboard" icon={<LayoutDashboard size={20} />} label="Trang chủ" isOpen={sidebarOpen}  className = "active:bg-[#FFC107]" />
            <NavItem href = "/admin/auctions" icon={<Gavel size={20} />} label="Quản lý Tài sản" isOpen={sidebarOpen} className = "active:bg-[#FFC107]" />
            <NavItem href = "/admin/articles" icon={<Users size={20} />} label="Tin tức" isOpen={sidebarOpen} className = "active:bg-[#FFC107]" />
            <NavItem icon={<Settings size={20} />} label="Cài đặt hệ thống" isOpen={sidebarOpen} className = "active:bg-[#FFC107]" />
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

const NavItem = ({ href, icon, label, isOpen } : any) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <a
      href={href}
      className={`
        flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors
        ${isActive ? "bg-[#FFC107] text-black" : "text-gray-400 hover:bg-gray-800 hover:text-white"}
      `}
    >
      {icon}
      {isOpen && <span className="text-sm">{label}</span>}
    </a>
  );
};