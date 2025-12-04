'use client';

import { useState } from 'react';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { AdminSidebar } from '@/components/Admin/AdminSidebar';
import { AdminHeader } from '@/components/Admin/AdminHeader';
import { cn } from '@/lib/utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="relative min-h-screen">
        {/* Sidebar */}
        <AdminSidebar 
          isCollapsed={isCollapsed} 
          onToggle={() => setIsCollapsed(!isCollapsed)}
          isMobileOpen={isMobileOpen}
          onMobileClose={() => setIsMobileOpen(false)}
        />

        {/* Main Content */}
        <div
          className={cn(
            'transition-all duration-300',
            'lg:ml-64',
            isCollapsed && 'lg:ml-16'
          )}
        >
          <AdminHeader onMobileMenuOpen={() => setIsMobileOpen(true)} />
          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
