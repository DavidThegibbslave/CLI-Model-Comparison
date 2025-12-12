import { useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export function LayoutShell({ children }: PropsWithChildren) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-main">
      <Header onMenuToggle={() => setSidebarOpen((open) => !open)} />
      <div className="layout-grid">
        <Sidebar open={sidebarOpen} />
        <main className="page-container">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
