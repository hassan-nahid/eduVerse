import Link from 'next/link'
import { GraduationCap, Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const PublicFooter = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    learn: [
      { label: 'Browse Courses', href: '/courses' },
      { label: 'Live Classes', href: '/live-classes' },
      { label: 'Study Groups', href: '/study-groups' },
      { label: 'Quizzes & Tests', href: '/quizzes' },
      { label: 'Learning Paths', href: '/paths' },
    ],
    compete: [
      { label: 'Challenges', href: '/challenges' },
      { label: 'Leaderboard', href: '/leaderboard' },
      { label: 'Tournaments', href: '/tournaments' },
      { label: 'Achievements', href: '/achievements' },
      { label: 'Rewards Shop', href: '/rewards' },
    ],
    community: [
      { label: 'Feed & Posts', href: '/feed' },
      { label: 'Find Friends', href: '/community' },
      { label: 'Discussion Forums', href: '/forums' },
      { label: 'Study Buddies', href: '/study-buddies' },
      { label: 'Events & Meetups', href: '/events' },
    ],
    company: [
      { label: 'About eduVerse', href: '/about' },
      { label: 'Our Mission', href: '/mission' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: '/blog' },
      { label: 'Become an Instructor', href: '/teach' },
    ],

  }

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
  ]

  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center space-x-2 group mb-4">
                <GraduationCap className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                <span className="text-xl font-bold bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  eduVerse
                </span>
              </Link>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Join the ultimate educational social platform where learning meets community. Compete in challenges, earn rewards, connect with fellow learners, and level up your knowledge in a gamified learning experience.
              </p>
              
              {/* Newsletter */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Stay Updated</h4>
                <div className="flex space-x-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="max-w-60"
                  />
                  <Button size="sm">Subscribe</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get the latest courses and updates.
                </p>
              </div>
            </div>

            {/* Learn Links */}
            <div>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Learn</h3>
              <ul className="space-y-3">
                {footerLinks.learn.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Compete Links */}
            <div>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Compete</h3>
              <ul className="space-y-3">
                {footerLinks.compete.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community Links */}
            <div>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Community</h3>
              <ul className="space-y-3">
                {footerLinks.community.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Contact Info */}
          <div className="mt-12 pt-8 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold mb-1">Email</h4>
                  <a href="mailto:support@eduverse.com" className="text-sm text-muted-foreground hover:text-primary">
                    support@eduverse.com
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold mb-1">Phone</h4>
                  <a href="tel:+1234567890" className="text-sm text-muted-foreground hover:text-primary">
                    +1 (234) 567-890
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold mb-1">Address</h4>
                  <p className="text-sm text-muted-foreground">
                    123 Education St, Learning City, ED 12345
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Bottom Bar */}
        <div className="py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>© {currentYear} eduVerse. All rights reserved.</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline-flex items-center">
                Made with <Heart className="h-3 w-3 mx-1 text-red-500 fill-current" /> for the learning community
              </span>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-2">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Button
                    key={social.label}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full hover:bg-primary/10"
                    asChild
                  >
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter