import { useState } from 'react';
import { type ReactNode } from 'react';
import { Sidebar, MobileMenuButton } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <MobileMenuButton onClick={() => setSidebarOpen(true)} />
      <main className="min-h-screen lg:ml-64">
        <div className="p-8 pt-20 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
