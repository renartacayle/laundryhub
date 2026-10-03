import React from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  ShoppingCart,
  LayoutDashboard,
  Bike,
  Sparkles,
  Package,
  FileText,
  WashingMachine,
  MapPin,
  Wallet,
  BarChart3,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { currentRole } = useApp();

  const getMobileTabs = () => {
    switch (currentRole) {
      case 'owner':
        return [
          { id: 'owner-overview', label: 'Overview', icon: <TrendingUp className="w-5 h-5" /> },
          { id: 'owner-stats', label: 'Statistik', icon: <BarChart3 className="w-5 h-5" /> },
          { id: 'owner-branches', label: 'Cabang', icon: <FileText className="w-5 h-5" /> },
          { id: 'owner-inventory', label: 'Stok', icon: <Package className="w-5 h-5" /> },
        ];
      case 'agen':
        return [
          { id: 'agen-pos', label: 'POS Agen', icon: <ShoppingCart className="w-5 h-5" /> },
          { id: 'agen-manifest', label: 'Manifest', icon: <Package className="w-5 h-5" /> },
          { id: 'agen-wallet', label: 'Komisi', icon: <Wallet className="w-5 h-5" /> },
        ];
      case 'kasir':
        return [
          { id: 'kasir-pos', label: 'POS Kasir', icon: <ShoppingCart className="w-5 h-5" /> },
          { id: 'kasir-orders', label: 'Transaksi', icon: <FileText className="w-5 h-5" /> },
          { id: 'kasir-customers', label: 'Member', icon: <Wallet className="w-5 h-5" /> },
        ];
      case 'produksi':
        return [
          { id: 'prod-kanban', label: 'Kanban', icon: <LayoutDashboard className="w-5 h-5" /> },
          { id: 'prod-iot', label: 'Mesin IoT', icon: <WashingMachine className="w-5 h-5" /> },
          { id: 'prod-productivity', label: 'Produktivitas', icon: <TrendingUp className="w-5 h-5" /> },
        ];
      case 'kurir':
        return [
          { id: 'kurir-tasks', label: 'Tugas', icon: <Bike className="w-5 h-5" /> },
          { id: 'kurir-map', label: 'Rute', icon: <MapPin className="w-5 h-5" /> },
          { id: 'kurir-history', label: 'Riwayat', icon: <FileText className="w-5 h-5" /> },
        ];
      case 'pelanggan':
        return [
          { id: 'cust-tracking', label: 'Lacak', icon: <Sparkles className="w-5 h-5" /> },
          { id: 'cust-wallet', label: 'Dompet', icon: <Wallet className="w-5 h-5" /> },
          { id: 'cust-history', label: 'Nota', icon: <FileText className="w-5 h-5" /> },
          { id: 'cust-pickup-request', label: 'Jemput', icon: <Bike className="w-5 h-5" /> },
        ];
      default:
        return [];
    }
  };

  const tabs = getMobileTabs();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 backdrop-blur-lg px-2 py-2">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-cyan-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
