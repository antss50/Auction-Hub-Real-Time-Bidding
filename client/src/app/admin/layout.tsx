"use client";

import { useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import Header from '../../components/admin/Header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Nội dung thay đổi (Page Content) */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
            {children}
        </main>
      </div>
    </div>
  );
}