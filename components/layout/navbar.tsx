/**
 * Navbar - Barre de navigation principale
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Users, LayoutDashboard, FileText, GraduationCap, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'Accueil',
    href: '/',
    icon: GraduationCap,
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Cours',
    href: '/cours',
    icon: BookOpen,
  },
  {
    label: 'Sessions',
    href: '/sessions',
    icon: Calendar,
  },
  {
    label: 'Inscriptions',
    href: '/inscriptions',
    icon: FileText,
  },
  {
    label: 'Étudiants',
    href: '/etudiants',
    icon: Users,
  },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-4">
        <div className="container mx-auto flex h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 mr-8">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Design.academy</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6 text-sm font-medium flex-1">
            {navItems.slice(1).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 transition-colors hover:text-foreground/80',
                    isActive ? 'text-foreground' : 'text-foreground/60'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User section (placeholder) */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
