'use client';

import { useState } from 'react';
import { UserGuard } from '@/components/guards/UserGuard';
import { UserSidebar } from '@/components/User/UserSidebar';
import { UserHeader } from '@/components/User/UserHeader';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <UserGuard>
      <div className="relative min-h-screen">
        {/* Sidebar */}
        <UserSidebar 
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
          <UserHeader onMobileMenuOpen={() => setIsMobileOpen(true)} />
          <main className="p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </UserGuard>
  );
}
