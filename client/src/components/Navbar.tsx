'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@auction-hub/shacdn-ui/button";
import CurrentTime from "../components/CurrentTime";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@auction-hub/shacdn-ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@auction-hub/shacdn-ui/avatar";

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout(); // Xóa cookie, reset state
    router.push("/"); // Redirect về trang chủ
  };

  return (
    <nav className="bg-white shadow flex items-center justify-between px-6 py-3 sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Image src="/images/auction-logo.jpg" alt="Logo" width={60} height={60} />
        <span className="font-bold text-lg">Thanh Cong Auction</span>
      </div>

      {/* Menu */}
      <ul className="flex gap-16 text-sm font-medium">
        <li><Link href="/" className="hover:text-yellow-600">Trang chủ</Link></li>
        <li><Link href="/auctions" className="hover:text-yellow-600">Tài sản đấu giá</Link></li>
        {/* <li><Link href="/guide" className="hover:text-yellow-600">Hướng dẫn</Link></li> */}
        <li><Link href="/articles" className="hover:text-yellow-600">Tin tức</Link></li>
        <li><Link href="/contacts" className="hover:text-yellow-600">Liên hệ</Link></li>
      </ul>

      {/* Auth + Time */}
      <div className="flex items-center gap-4">
        <CurrentTime />
        {isAuthenticated ? (
          // 1. Nếu đã đăng nhập (Authenticated)
          <DropdownMenu>
            {<DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage src={user?.avatarUrl || ""} alt={user?.fullName || "User"} />
                <AvatarFallback>
                  {user?.fullName.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>}
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                Chào, {user?.fullName || "Người dùng"}
                <p className="text-xs font-normal text-gray-500">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/dashboard/profile">Quản lý tài khoản</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/dashboard/my-auctions">Phiên đấu giá của tôi</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // 2. Nếu chưa đăng nhập (Original Code)
          <>
            <Button asChild variant="outline" className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 cursor-pointer">
              <Link href="/auth/login">Đăng nhập</Link>
            </Button>
            <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-white cursor-pointer">
              <Link href="/auth/register">Đăng ký</Link>
            </Button>
          </>
        )}
      </div>
    </nav >
  );
}
