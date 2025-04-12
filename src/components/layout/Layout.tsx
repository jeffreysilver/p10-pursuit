
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Toaster } from '@/components/ui/sonner';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Toaster />
      <Header />
      <main className="flex-1 container py-6">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
