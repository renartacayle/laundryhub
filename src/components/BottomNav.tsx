import React from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  Users,
  WashingMachine,
  ShoppingCart,
  Settings,
} from 'lucide-react';

export type MobileTab = 'stats' | 'staff' | 'progress' | 'kasir' | 'settings';

interface BottomNavProps {
  activeMobileTab: MobileTab;
  setActiveMobileTab: (tab: MobileTab) => void;
  // Backward compatibility
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeMobileTab,
  setActiveMobileTab,
}) => {
  const { orders, currentUser } = useApp();

  const activeOrdersCount = orders.filter((o) => o.currentStatus !== 'selesai').length;

  const allTabs: {
    id: MobileTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
    ownerOnly?: boolean;
    requiredRole?: 'kasir' | 'produksi';
  }[] = [
    {
      id: 'stats',
      label: 'Statistik',
      icon: <BarChart3 className="w-5 h-5" />,
      ownerOnly: true,
    },
    {
      id: 'staff',
      label: 'Karyawan',
      icon: <Users className="w-5 h-5" />,
      ownerOnly: true,
    },
    {
      id: 'progress',
      label: 'Workshop',
      icon: <WashingMachine className="w-5 h-5" />,
      badge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
      badgeColor: 'bg-orange-500 text-white',
      requiredRole: 'produksi',
    },
    {
      id: 'kasir',
      label: 'Kasir POS',
      icon: <ShoppingCart className="w-5 h-5" />,
      requiredRole: 'kasir',
    },
    {
      id: 'settings',
      label: 'Setting',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const userAllowed = currentUser.allowedRoles || [currentUser.role];
  const tabs = allTabs.filter((t) => {
    if (currentUser.role === 'owner') return true;
    if (t.ownerOnly) return false;
    if (t.requiredRole && !userAllowed.includes(t.requiredRole)) return false;
    return true;
  });

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800/90 backdrop-blur-xl px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeMobileTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMobileTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 relative select-none active:scale-95 ${
                isActive
                  ? 'text-cyan-400 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              {/* Icon Container with Badge */}
              <div className="relative">
                <div
                  className={`transition-all duration-200 ${
                    isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : ''
                  }`}
                >
                  {tab.icon}
                </div>

                {/* Badge if available */}
                {tab.badge !== undefined && (
                  <span
                    className={`absolute -top-1.5 -right-2 px-1.5 py-0.2 min-w-[16px] text-[9px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse ${
                      tab.badgeColor || 'bg-cyan-500 text-slate-950'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={`text-[10px] mt-1 leading-tight tracking-tight ${isActive ? 'text-cyan-300' : 'text-slate-400'}`}>
                {tab.label}
              </span>

              {/* Active Indicator bar */}
              {isActive && (
                <div className="w-4 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full mt-0.5 shadow-glow-cyan animate-in fade-in zoom-in-50 duration-200" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
