'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';

export function NavbarWrapper() {
  const pathname = usePathname();
  
  // Cacher la navbar sur les pages d'émargement
  if (pathname?.startsWith('/emargement')) {
    return null;
  }
  
  return <Navbar />;
}
