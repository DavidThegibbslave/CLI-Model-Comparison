import React, { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { SkipToContent } from '../accessibility';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <SkipToContent />
      <Header />
      <main id="main-content" className="flex-1 container mx-auto px-4 py-8" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
};
