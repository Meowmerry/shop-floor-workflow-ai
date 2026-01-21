import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { NavTab, WorkItem } from '../../types';
import type { FactoryUser } from '../../types/auth';

interface MainLayoutProps {
  readonly children: ReactNode;
  readonly activeTab: NavTab;
  readonly onTabChange: (tab: NavTab) => void;
  readonly onItemScanned?: (item: WorkItem) => void;
  readonly currentUser?: FactoryUser;
}

export function MainLayout({
  children,
  activeTab,
  onTabChange,
  onItemScanned,
  currentUser,
}: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} currentUser={currentUser} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <Header activeTab={activeTab} onItemScanned={onItemScanned} currentUser={currentUser} />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
