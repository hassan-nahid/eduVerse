'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Trophy,
  Award,
  Gift,
  BookOpen,
  Settings,
  ChevronLeft,
  Menu,
  User,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Profile',
    href: '/dashboard/profile',
    icon: User,
  },
  {
    title: 'Challenges',
    href: '/dashboard/challenges',
    icon: Award,
  },
  {
    title: 'Quizzes',
    href: '/dashboard/quizzes',
    icon: Trophy,
  },
  {
    title: 'My Posts',
    href: '/dashboard/posts',
    icon: BookOpen,
  },
  {
    title: 'Rewards',
    href: '/dashboard/rewards',
    icon: Gift,
  },
  {
    title: 'Subscription',
    href: '/dashboard/subscription',
    icon: Crown,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

interface UserSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function UserSidebar({ isCollapsed, onToggle, isMobileOpen, onMobileClose }: UserSidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between border-b gap-6 px-4">
        <Link href="/" className="flex items-center gap-2" onClick={onMobileClose}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <span className={cn('text-lg font-bold', isCollapsed && 'lg:hidden')}>Dashboard</span>
        </Link>
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 hidden lg:flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 hidden lg:flex mx-auto"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-4rem)] py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  isCollapsed && 'lg:justify-center'
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className={cn(isCollapsed && 'lg:hidden')}>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </>
  );

  return (
    <>
      {/* Mobile Sheet */}
      <Sheet open={isMobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="w-64 p-0 lg:hidden">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:fixed lg:left-0 lg:top-0 lg:z-40 lg:h-screen lg:border-r lg:bg-background lg:transition-all lg:duration-300 lg:flex lg:flex-col',
          isCollapsed ? 'lg:w-16' : 'lg:w-64'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
