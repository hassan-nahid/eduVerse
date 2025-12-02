'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, GraduationCap, LogOut, BookOpen, Trophy, Bell, Users, Zap, Star, UserCircle, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuth } from '@/context/AuthContext'

const PublicNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/feed', label: 'Feed' },
    { href: '/challenges', label: 'Challenges' },
    { href: '/rewards', label: 'Rewards', icon: Users },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ]

  const isActive = (path: string) => pathname === path

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      router.push('/')
      setIsMobileMenuOpen(false)
    } catch {
      toast.error('Failed to logout')
    }
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.name) return 'U'
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const dashboardLink = user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm'
          : 'bg-background'
      }`}
    >
      <nav className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1.5 sm:space-x-2 group shrink-0">
            <div className="relative">
              <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary transition-transform group-hover:scale-110" />
              <div className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 bg-primary rounded-full animate-pulse" />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent hidden xs:inline">
              eduVerse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative group ${
                  isActive(link.href)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transition-transform ${
                    isActive(link.href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3 shrink-0">
            {isAuthenticated ? (
              <>
                {/* Gamification Stats */}
                <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1.5 bg-muted/50 rounded-full border">
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="flex items-center space-x-1 cursor-help">
                        <Zap className="h-3.5 w-3.5 text-yellow-500" />
                        <span className="text-xs font-semibold">{user?.points?.toLocaleString() || 0}</span>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2 text-xs">
                      Points
                    </PopoverContent>
                  </Popover>
                  <div className="h-3.5 w-px bg-border" />
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="flex items-center space-x-1 cursor-help">
                        <Star className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-semibold">{user?.scores || 0}</span>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2 text-xs">
                      Scores
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Notifications - Desktop */}
                <Button variant="ghost" size="icon" className="relative h-9 w-9 hidden lg:flex">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
                    3
                  </Badge>
                </Button>

                {/* User Menu - Desktop (lg and up) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hidden lg:flex">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 sm:w-72" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12 border-2 border-primary">
                            <AvatarImage src={user?.avatar} alt={user?.name} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{user?.name}</p>
                          <p className="text-xs text-muted-foreground mb-1">{user?.role === 'ADMIN' ? 'Admin' : 'Student'}</p>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="flex items-center">
                              <Zap className="h-3 w-3 text-yellow-500 mr-0.5" />
                              {user?.points?.toLocaleString() || 0}
                            </span>
                            <span>•</span>
                            <span className="flex items-center">
                              <Star className="h-3 w-3 text-primary mr-0.5" />
                              {user?.scores || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={dashboardLink} className="cursor-pointer">
                        <BookOpen className="mr-2 h-4 w-4" />
                        <span>My Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild className="shadow-lg shadow-primary/20">
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Section */}
          <div className="flex lg:hidden items-center gap-1">
            {isAuthenticated && (
              <>
                {/* Notification Bell - Mobile/Tablet (md to lg) */}
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
                    3
                  </Badge>
                </Button>

                {/* User Menu - Tablet (md to lg) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hidden md:flex lg:hidden">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 sm:w-72" align="end">
                    <DropdownMenuLabel>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user?.avatar} alt={user?.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold">{user?.name}</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push(user?.role === 'ADMIN' ? '/admin' : '/dashboard')}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] overflow-y-auto">
              <div className="flex flex-col space-y-6 mt-6">
                {/* Mobile Logo */}
                <Link href="/" className="flex items-center space-x-2 px-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <GraduationCap className="h-6 w-6 text-primary" />
                  <span className="text-lg font-bold">eduVerse</span>
                </Link>

                {/* Mobile User Info */}
                {isAuthenticated && (
                  <div className="space-y-3 px-2">
                    <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                      <Avatar className="h-14 w-14 border-2 border-primary">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.role === 'ADMIN' ? 'Admin' : 'Student'}</p>
                      </div>
                    </div>
                    {/* Mobile Gamification Stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <Zap className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                        <p className="text-xs font-semibold">{user?.points?.toLocaleString() || 0}</p>
                        <p className="text-xs text-muted-foreground">Points</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <Star className="h-5 w-5 text-primary mx-auto mb-1" />
                        <p className="text-xs font-semibold">{user?.scores || 0}</p>
                        <p className="text-xs text-muted-foreground">Scores</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile Navigation Links */}
                <nav className="flex flex-col space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                        isActive(link.href)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {/* Mobile Auth Buttons */}
                {isAuthenticated ? (
                  <div className="flex flex-col space-y-2 pt-4 border-t">
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link href={dashboardLink} onClick={() => setIsMobileMenuOpen(false)}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        My Dashboard
                      </Link>
                    </Button>
                    <Button onClick={handleLogout} variant="destructive" className="w-full justify-start">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2 pt-4 border-t">
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default PublicNavbar