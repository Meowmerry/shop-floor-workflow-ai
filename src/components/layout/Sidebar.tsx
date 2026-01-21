import {
  Factory,
  ShieldCheck,
  Truck,
  BarChart,
  type LucideIcon,
} from 'lucide-react';
import type { NavTab } from '../../types';
import type { FactoryUser } from '../../types/auth';

interface NavItem {
  readonly id: NavTab;
  readonly label: string;
  readonly icon: LucideIcon;
}

const navItems: readonly NavItem[] = [
  { id: 'Operator', label: 'Operator', icon: Factory },
  { id: 'QC', label: 'QC Lead', icon: ShieldCheck },
  { id: 'Shipping', label: 'Shipping', icon: Truck },
  { id: 'Supervisor', label: 'Supervisor', icon: BarChart },
] as const;

interface SidebarProps {
  readonly activeTab: NavTab;
  readonly onTabChange: (tab: NavTab) => void;
  readonly currentUser?: FactoryUser;
}

export function Sidebar({ activeTab, onTabChange, currentUser }: SidebarProps) {
  // Supervisor can see all tabs, others only see their own role
  const visibleItems = currentUser && currentUser.role !== 'Supervisor'
    ? navItems.filter(item => item.id === currentUser.role)
    : navItems;

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col min-h-screen">
      {/* Logo / Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div>
            <img width="447" height="155" src="https://www.cyclonebolt.com/wp-content/uploads/2025/06/cylone-bolt-logo.png" className="attachment-large size-large wp-image-53" alt="" srcSet="https://www.cyclonebolt.com/wp-content/uploads/2025/06/cylone-bolt-logo.png 447w, https://www.cyclonebolt.com/wp-content/uploads/2025/06/cylone-bolt-logo-300x104.png 300w" sizes="(max-width: 447px) 100vw, 447px"/>
            <p className="text-m text-gray-400">Workflow Control</p>
          </div>
        </div>
      </div>

      {/* User Info Section (if user is logged in) */}
      {currentUser && (
        <div className="px-4 py-4 border-b border-gray-700 bg-gray-800/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-400">{currentUser.role}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 px-1">Station: {currentUser.department}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <ul className="space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    text-left font-medium transition-all duration-150
                    min-h-[48px] touch-target
                    ${isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-base">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer / Status */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">System Online</span>
        </div>
      </div>
    </aside>
  );
}
