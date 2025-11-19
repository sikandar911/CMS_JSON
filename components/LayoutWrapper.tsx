"use client";

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't show header/footer for admin pages or API routes
  const isAdminPage = pathname?.startsWith('/admin');
  const isApiRoute = pathname?.startsWith('/api');
  
  const showHeaderFooter = !isAdminPage && !isApiRoute;
  
  return (
    <>
      {showHeaderFooter && <Header />}
      {children}
      {showHeaderFooter && <Footer />}
    </>
  );
}
