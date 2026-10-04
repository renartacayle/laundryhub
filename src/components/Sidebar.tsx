import React from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import {
  LayoutDashboard,
  ShoppingCart,
  WashingMachine,
  Bike,
  UserCheck,
  TrendingUp,
  Package,
  Users,
  FileText,
  Clock,
  Sparkles,
  Layers,
  MapPin,
  Flame,
  Award,
  Wallet,
  BarChart3,
  Store,
  Truck,
  Megaphone,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentRole, orders, machines, inventory, courierTasks, dropshipAgents, withdrawalRequests } = useApp();

  const activeOrdersCount = orders.filter(
    (o) => o.currentStatus !== 'selesai'
  ).length;
  const runningMachinesCount = machines.filter((m) => m.status === 'running').length;
  const lowStockCount = inventory.filter((i) => i.stock <= i.minStockWarning).length;
  const pendingCourierCount = courierTasks.filter((t) => t.status !== 'completed').length;
  const pendingWithdrawalCount = withdrawalRequests.filter((w) => w.status === 'pending').length;

  // Nav menus per role
  const getNavItems = () => {
    switch (currentRole) {
      case 'owner':
        return [
          { id: 'owner-overview', label: 'Ringkasan Eksekutif', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'owner-stats', label: 'Statistik Bulanan & Tahunan', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'owner-branches', label: 'Performa Multi-Cabang', icon: <Layers className="w-4 h-4" /> },
          {
            id: 'owner-dropship',
            label: 'Jaringan Kemitraan Dropship',
            icon: <Store className="w-4 h-4" />,
            badge: pendingWithdrawalCount > 0 ? `${pendingWithdrawalCount} Payout` : `${dropshipAgents.length} Mitra`,
            badgeColor: pendingWithdrawalCount > 0 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-teal-500/20 text-teal-300 border-teal-500/40',
          },
          { id: 'owner-supplies', label: 'Pasokan Dropship B2B', icon: <Truck className="w-4 h-4" /> },
          {
            id: 'owner-inventory',
            label: 'Monitoring Stok',
            icon: <Package className="w-4 h-4" />,
            badge: lowStockCount > 0 ? `${lowStockCount} Menipis` : undefined,
            badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          },
          { id: 'owner-staff', label: 'Karyawan & Komisi', icon: <Users className="w-4 h-4" /> },
          {
            id: 'owner-marketing',
            label: 'Pusat Marketing & Cuan',
            icon: <Megaphone className="w-4 h-4" />,
            badge: 'HOT 🔥',
            badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          },
          { id: 'owner-audit', label: 'Riwayat Audit Log', icon: <FileText className="w-4 h-4" /> },
        ];
      case 'agen':
        return [
          { id: 'agen-pos', label: 'POS Mitra Drop Point', icon: <ShoppingCart className="w-4 h-4" /> },
          { id: 'agen-manifest', label: 'Manifest & Kurir Jemput', icon: <Truck className="w-4 h-4" /> },
          { id: 'agen-wallet', label: 'Dompet Komisi & Payout', icon: <Wallet className="w-4 h-4" /> },
        ];
      case 'operator':
        return [
          { id: 'kasir-pos', label: 'Kasir POS Baru', icon: <ShoppingCart className="w-4 h-4" /> },
          {
            id: 'kasir-orders',
            label: 'Daftar Transaksi',
            icon: <FileText className="w-4 h-4" />,
            badge: `${activeOrdersCount} Aktif`,
            badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          },
          {
            id: 'prod-kanban',
            label: 'Kanban Alur Workshop',
            icon: <LayoutDashboard className="w-4 h-4" />,
            badge: `${activeOrdersCount}`,
            badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          },
          {
            id: 'prod-iot',
            label: 'Kontrol Mesin IoT',
            icon: <WashingMachine className="w-4 h-4" />,
            badge: `${runningMachinesCount} ON`,
            badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          },
          { id: 'kasir-customers', label: 'Data Pelanggan & Deposit', icon: <Users className="w-4 h-4" /> },
        ];
      case 'kasir':
        return [
          { id: 'kasir-pos', label: 'Kasir POS Baru', icon: <ShoppingCart className="w-4 h-4" /> },
          {
            id: 'kasir-orders',
            label: 'Daftar Transaksi',
            icon: <FileText className="w-4 h-4" />,
            badge: `${activeOrdersCount} Aktif`,
            badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          },
          { id: 'kasir-customers', label: 'Data Pelanggan & Deposit', icon: <Users className="w-4 h-4" /> },
        ];
      case 'produksi':
        return [
          {
            id: 'prod-kanban',
            label: 'Kanban Alur Workshop',
            icon: <LayoutDashboard className="w-4 h-4" />,
            badge: `${activeOrdersCount}`,
            badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          },
          {
            id: 'prod-iot',
            label: 'Kontrol Mesin IoT',
            icon: <WashingMachine className="w-4 h-4" />,
            badge: `${runningMachinesCount} ON`,
            badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          },
          { id: 'prod-productivity', label: 'Produktivitas Tim', icon: <Award className="w-4 h-4" /> },
        ];
      case 'kurir':
        return [
          {
            id: 'kurir-tasks',
            label: 'Antrean Pickup / Antar',
            icon: <Bike className="w-4 h-4" />,
            badge: `${pendingCourierCount} Tugas`,
            badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          },
          { id: 'kurir-map', label: 'Peta Rute Delivery', icon: <MapPin className="w-4 h-4" /> },
          { id: 'kurir-history', label: 'Riwayat Pengantaran', icon: <Clock className="w-4 h-4" /> },
        ];
      case 'pelanggan':
        return [
          { id: 'cust-tracking', label: 'Lacak Status Cucian', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'cust-wallet', label: 'Deposit & Poin Member', icon: <Wallet className="w-4 h-4" /> },
          { id: 'cust-history', label: 'Riwayat Nota Digital', icon: <FileText className="w-4 h-4" /> },
          { id: 'cust-pickup-request', label: 'Request Jemput Laundry', icon: <Bike className="w-4 h-4" /> },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const getRoleHeader = () => {
    switch (currentRole) {
      case 'owner':
        return { label: 'PORTAL OWNER', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
      case 'agen':
        return { label: 'AGEN DROPSHIP (DROP POINT)', color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/30' };
      case 'kasir':
        return { label: 'KASIR (FRONT DESK)', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' };
      case 'produksi':
        return { label: 'WORKSHOP PRODUKSI', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' };
      case 'kurir':
        return { label: 'ARMADA KURIR', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' };
      case 'operator':
        return { label: 'OPERATOR CABANG (ALL-IN-ONE)', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
      case 'pelanggan':
        return { label: 'PORTAL MEMBER', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    }
  };

  const roleMeta = getRoleHeader();

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 flex-shrink-0 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-84px)] p-4 transition-colors">
      <div className="space-y-4">
        {/* Role Badge Indicator */}
        <div className={`p-3 rounded-2xl border ${roleMeta.bg} text-center`}>
          <div className="text-[10px] font-black tracking-widest uppercase opacity-75 text-slate-300">
            Role Aktif
          </div>
          <div className={`text-xs font-black tracking-wider uppercase mt-0.5 ${roleMeta.color}`}>
            {roleMeta.label}
          </div>
        </div>

        {/* Navigation List */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-slate-400 px-3 uppercase tracking-wider mb-2">
            Menu Utama
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? roleMeta.color : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar Footer Info */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2 text-[11px] text-slate-400">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between font-semibold text-slate-300">
            <span>Mesin Berputar:</span>
            <span className="text-cyan-400 font-bold">{runningMachinesCount} Unit</span>
          </div>
          <div className="flex items-center justify-between font-semibold text-slate-300 mt-1">
            <span>Order Berjalan:</span>
            <span className="text-emerald-400 font-bold">{activeOrdersCount} Order</span>
          </div>
        </div>
        <div className="text-center text-[10px] text-slate-400 pt-1">
          LAUNDRYHUB SaaS Platform • 2026
        </div>
      </div>
    </aside>
  );
};
