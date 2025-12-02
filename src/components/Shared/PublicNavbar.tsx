'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, GraduationCap, LogOut, Settings, BookOpen, Trophy, Bell, Users, Zap, Star, Target, Award } from 'lucide-react'
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

const PublicNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  
  // Mock authentication state - replace with your actual auth logic
  const isAuthenticated = false // TODO: Connect to your auth system
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '',
    role: 'student', // or 'admin'
    points: 2850,
    level: 12,
    rank: 'Gold Scholar',
    streak: 7
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/posts', label: 'Posts' },
    { href: '/challenges', label: 'Challenges' },
    { href: '/rewards', label: 'Rewards', icon: Users },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ]

  const isActive = (path: string) => pathname === path

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm'
          : 'bg-background'
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <GraduationCap className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full animate-pulse" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              eduVerse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative group ${
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
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Gamification Stats */}
                <div className="flex items-center space-x-3 px-3 py-1.5 bg-muted/50 rounded-full border">
                  <div className="flex items-center space-x-1.5">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-semibold">{user.points.toLocaleString()}</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center space-x-1.5">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Lvl {user.level}</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center space-x-1.5">
                    <Target className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-semibold">{user.streak} 🔥</span>
                  </div>
                </div>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    3
                  </Badge>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12 border-2 border-primary">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-background">
                            {user.level}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{user.name}</p>
                          <p className="text-xs text-muted-foreground mb-1">{user.rank}</p>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="flex items-center">
                              <Zap className="h-3 w-3 text-yellow-500 mr-0.5" />
                              {user.points.toLocaleString()}
                            </span>
                            <span>•</span>
                            <span className="flex items-center">
                              <Target className="h-3 w-3 text-orange-500 mr-0.5" />
                              {user.streak} day streak
                            </span>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <BookOpen className="mr-2 h-4 w-4" />
                        <span>My Learning</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <Users className="mr-2 h-4 w-4" />
                        <span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/achievements" className="cursor-pointer">
                        <Trophy className="mr-2 h-4 w-4" />
                        <span>Achievements</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/rewards" className="cursor-pointer">
                        <Award className="mr-2 h-4 w-4" />
                        <span>My Rewards</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
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

          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-6 mt-6">
                {/* Mobile Logo */}
                <Link href="/" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <GraduationCap className="h-6 w-6 text-primary" />
                  <span className="text-lg font-bold">eduVerse</span>
                </Link>

                {/* Mobile User Info */}
                {isAuthenticated && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                      <div className="relative">
                        <Avatar className="h-14 w-14 border-2 border-primary">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-background">
                          {user.level}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.rank}</p>
                      </div>
                    </div>
                    {/* Mobile Gamification Stats */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <Zap className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                        <p className="text-xs font-semibold">{user.points.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Points</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <Star className="h-5 w-5 text-primary mx-auto mb-1" />
                        <p className="text-xs font-semibold">Level {user.level}</p>
                        <p className="text-xs text-muted-foreground">Progress</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <Target className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                        <p className="text-xs font-semibold">{user.streak} 🔥</p>
                        <p className="text-xs text-muted-foreground">Streak</p>
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
                      className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
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
                      <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        My Learning
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link href="/achievements" onClick={() => setIsMobileMenuOpen(false)}>
                        <Trophy className="mr-2 h-4 w-4" />
                        Achievements
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                        <Users className="mr-2 h-4 w-4" />
                        My Profile
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </Button>
                    <Button variant="destructive" className="w-full justify-start">
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
      </nav>
    </header>
  )
}

export default PublicNavbar