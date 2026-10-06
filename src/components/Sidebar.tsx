import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import {
  WashingMachine,
  Crown,
  Monitor,
  Store,
  Bike,
  UserCircle2,
  Lock,
  Unlock,
  Sparkles,
  Search,
  Camera,
  Clock,
  Coins,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  RotateCcw,
  Wifi,
  WifiOff,
  TrendingUp,
  BarChart3,
  Layers,
  Package,
  Users,
  Megaphone,
  FileText,
  ShoppingCart,
  LayoutDashboard,
  Flame,
  MapPin,
  Wallet,
  Truck,
  Check,
  X,
  Plus,
} from 'lucide-react';
import { CoinTopupModal } from './CoinTopupModal';
import { BranchSwitcherModal } from './BranchSwitcherModal';
import { CommandPaletteModal } from './CommandPaletteModal';
import { AuthGateModal } from './AuthGateModal';
import { IotMachineControlModal } from './IotMachineControlModal';
import { LandingPageModal } from './LandingPageModal';
import { formatCurrency } from '../utils/currency';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const {
    currentRole,
    setCurrentRole,
    currentUser,
    activeGmailAccount,
    setIsGoogleAuthModalOpen,
    setIsDemoTutorialModalOpen,
    branches,
    currentBranchId,
    tokenCoins,
    isDarkMode,
    toggleDarkMode,
    isOnline,
    currency,
    machines,
    orders,
    inventory,
    courierTasks,
    dropshipAgents,
    withdrawalRequests,
    notifications,
    markNotificationRead,
    resetAllData,
    setIsQrScannerOpen,
    setIsAttendanceModalOpen,
  } = useApp();

  // Modals state
  const [isCoinModalOpen, setIsCoinModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isIotModalOpen, setIsIotModalOpen] = useState(false);
  const [isLandingOpen, setIsLandingOpen] = useState(false);
  const [authModalTargetRole, setAuthModalTargetRole] = useState<Role | null>(null);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Commercial (PIN Protected) vs Demo Mode
  const [isCommercialMode, setIsCommercialMode] = useState<boolean>(() => {
    return localStorage.getItem('lh_auth_mode') === 'commercial';
  });

  const toggleAuthMode = () => {
    const nextMode = !isCommercialMode;
    setIsCommercialMode(nextMode);
    localStorage.setItem('lh_auth_mode', nextMode ? 'commercial' : 'demo');
  };

  const handleRoleClick = (roleId: Role) => {
    setIsRoleDropdownOpen(false);
    if (roleId === currentRole) return;

    if (isCommercialMode) {
      setAuthModalTargetRole(roleId);
    } else {
      setCurrentRole(roleId);
    }
  };

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeBranch = branches.find((b) => b.id === currentBranchId) || branches[0];
  const activeOrdersCount = orders.filter((o) => o.currentStatus !== 'selesai').length;
  const runningMachinesCount = machines.filter((m) => m.status === 'running').length;
  const lowStockCount = inventory.filter((i) => i.stock <= i.minStockWarning).length;
  const pendingCourierCount = courierTasks.filter((t) => t.status !== 'completed').length;
  const pendingWithdrawalCount = withdrawalRequests.filter((w) => w.status === 'pending').length;
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  // Roles definition
  const rolesList: {
    id: Role;
    label: string;
    pin: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    borderColor: string;
    activeBg: string;
  }[] = [
    {
      id: 'owner',
      label: 'Owner',
      pin: '8888',
      icon: <Crown className="w-4 h-4" />,
      color: 'text-amber-500 dark:text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      activeBg: 'bg-amber-500/15 border-amber-500/50 text-amber-700 dark:text-amber-300',
    },
    {
      id: 'kasir',
      label: 'Kasir POS',
      pin: '1234',
      icon: <Monitor className="w-4 h-4" />,
      color: 'text-cyan-500 dark:text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      activeBg: 'bg-cyan-500/15 border-cyan-500/50 text-cyan-700 dark:text-cyan-300',
    },
    {
      id: 'produksi',
      label: 'Workshop Produksi',
      pin: '2345',
      icon: <WashingMachine className="w-4 h-4" />,
      color: 'text-orange-500 dark:text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      activeBg: 'bg-orange-500/15 border-orange-500/50 text-orange-700 dark:text-orange-300',
    },
    {
      id: 'kurir',
      label: 'Armada Kurir',
      pin: '3456',
      icon: <Bike className="w-4 h-4" />,
      color: 'text-purple-500 dark:text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      activeBg: 'bg-purple-500/15 border-purple-500/50 text-purple-700 dark:text-purple-300',
    },
    {
      id: 'agen',
      label: 'Agen Dropship',
      pin: '5678',
      icon: <Store className="w-4 h-4" />,
      color: 'text-teal-500 dark:text-teal-400',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/30',
      activeBg: 'bg-teal-500/15 border-teal-500/50 text-teal-700 dark:text-teal-300',
    },
    {
      id: 'pelanggan',
      label: 'Portal Pelanggan',
      pin: '0000',
      icon: <UserCircle2 className="w-4 h-4" />,
      color: 'text-emerald-500 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      activeBg: 'bg-emerald-500/15 border-emerald-500/50 text-emerald-700 dark:text-emerald-300',
    },
  ];

  const currentRoleMeta = rolesList.find((r) => r.id === currentRole) || rolesList[0];

  // Navigation items per role
  const getNavItems = () => {
    switch (currentRole) {
      case 'owner':
        return [
          { id: 'owner-overview', label: 'Ringkasan Eksekutif', icon: <TrendingUp className="w-4 h-4" /> },
          {
            id: 'owner-pnl',
            label: 'Laba Rugi (P&L)',
            icon: <TrendingUp className="w-4 h-4 text-emerald-500" />,
            badge: 'AUTO',
            badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          },
          { id: 'owner-stats', label: 'Statistik Bulanan & Tahunan', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'owner-branches', label: 'Performa Multi-Cabang', icon: <Layers className="w-4 h-4" /> },
          {
            id: 'owner-dropship',
            label: 'Jaringan Kemitraan Dropship',
            icon: <Store className="w-4 h-4" />,
            badge: pendingWithdrawalCount > 0 ? `${pendingWithdrawalCount} Payout` : `${dropshipAgents.length} Mitra`,
            badgeColor: pendingWithdrawalCount > 0 ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' : 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30',
          },
          { id: 'owner-supplies', label: 'Pasokan Dropship B2B', icon: <Truck className="w-4 h-4" /> },
          {
            id: 'owner-inventory',
            label: 'Monitoring Stok',
            icon: <Package className="w-4 h-4" />,
            badge: lowStockCount > 0 ? `${lowStockCount} Menipis` : undefined,
            badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
          },
          { id: 'owner-staff', label: 'Karyawan & Komisi', icon: <Users className="w-4 h-4" /> },
          {
            id: 'owner-marketing',
            label: 'Pusat Marketing & Cuan',
            icon: <Megaphone className="w-4 h-4" />,
            badge: 'HOT 🔥',
            badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          },
          { id: 'owner-audit', label: 'Riwayat Audit Log', icon: <FileText className="w-4 h-4" /> },
        ];

      case 'kasir':
      case 'operator':
        return [
          { id: 'kasir-pos', label: 'Kasir POS Baru', icon: <ShoppingCart className="w-4 h-4" /> },
          {
            id: 'kasir-orders',
            label: 'Daftar Transaksi',
            icon: <FileText className="w-4 h-4" />,
            badge: `${activeOrdersCount} Aktif`,
            badgeColor: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
          },
          { id: 'kasir-customers', label: 'Data Pelanggan & Deposit', icon: <Users className="w-4 h-4" /> },
          {
            id: 'prod-kanban',
            label: 'Kanban Alur Workshop',
            icon: <LayoutDashboard className="w-4 h-4" />,
            badge: `${activeOrdersCount}`,
            badgeColor: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
          },
          {
            id: 'prod-iot',
            label: 'Kontrol Mesin IoT',
            icon: <WashingMachine className="w-4 h-4" />,
            badge: `${runningMachinesCount} ON`,
            badgeColor: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
          },
        ];

      case 'produksi':
        return [
          {
            id: 'prod-kanban',
            label: 'Alur Workshop (Semua)',
            icon: <LayoutDashboard className="w-4 h-4 text-orange-500" />,
            badge: `${activeOrdersCount}`,
            badgeColor: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
          },
          {
            id: 'prod-station-sortir',
            label: '1. Sortir & Tagging',
            icon: <Layers className="w-4 h-4 text-indigo-500" />,
            badge: `${orders.filter((o) => o.currentStatus === 'sortir').length}`,
            badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
          },
          {
            id: 'prod-station-cuci',
            label: '2. Proses Cuci',
            icon: <WashingMachine className="w-4 h-4 text-cyan-500" />,
            badge: `${orders.filter((o) => o.currentStatus === 'cuci').length}`,
            badgeColor: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
          },
          {
            id: 'prod-station-kering',
            label: '3. Pengeringan',
            icon: <Flame className="w-4 h-4 text-orange-500" />,
            badge: `${orders.filter((o) => o.currentStatus === 'kering').length}`,
            badgeColor: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
          },
          {
            id: 'prod-station-setrika',
            label: '4. Setrika Uap',
            icon: <Sparkles className="w-4 h-4 text-purple-500" />,
            badge: `${orders.filter((o) => o.currentStatus === 'setrika').length}`,
            badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
          },
          {
            id: 'prod-station-packing',
            label: '5. Packing & QC',
            icon: <Package className="w-4 h-4 text-amber-500" />,
            badge: `${orders.filter((o) => o.currentStatus === 'packing').length}`,
            badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
          },
          {
            id: 'prod-iot',
            label: 'Kontrol Mesin IoT',
            icon: <WashingMachine className="w-4 h-4" />,
            badge: `${runningMachinesCount} ON`,
            badgeColor: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
          },
        ];

      case 'kurir':
        return [
          {
            id: 'kurir-tasks',
            label: 'Antrean Pickup / Antar',
            icon: <Bike className="w-4 h-4" />,
            badge: `${pendingCourierCount} Tugas`,
            badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
          },
          { id: 'kurir-map', label: 'Peta Rute Delivery', icon: <MapPin className="w-4 h-4" /> },
          { id: 'kurir-history', label: 'Riwayat Pengantaran', icon: <Clock className="w-4 h-4" /> },
        ];

      case 'agen':
        return [
          { id: 'agen-pos', label: 'POS Mitra Drop Point', icon: <ShoppingCart className="w-4 h-4" /> },
          { id: 'agen-manifest', label: 'Manifest & Kurir Jemput', icon: <Truck className="w-4 h-4" /> },
          { id: 'agen-wallet', label: 'Dompet Komisi & Payout', icon: <Wallet className="w-4 h-4" /> },
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

  return (
    <>
      <aside className="w-72 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col h-screen sticky top-0 z-30 hidden md:flex transition-colors select-none shadow-xs">
        {/* =========================================================
            1. TOP HEADER: Brand Logo & Outlet Switcher Card
            ========================================================= */}
        <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800/80 space-y-3">
          {/* Brand Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <WashingMachine className="w-4 h-4 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">
                    LAUNDRYHUB
                  </span>
                  <span className="text-[9px] px-1 py-0.2 rounded font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                    v2.6
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>SaaS Management POS</span>
                </div>
              </div>
            </div>

            {/* Cloud Sync & Google Auth */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsGoogleAuthModalOpen(true)}
                className={`p-1.5 rounded-lg border transition-all text-xs ${
                  activeGmailAccount
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
                title={activeGmailAccount ? `Akun Google: ${activeGmailAccount}` : 'Login Akun Google'}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Active Branch Outlet Card */}
          <div
            onClick={() => setIsBranchModalOpen(true)}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 cursor-pointer group transition-all"
            title="Klik untuk memilih atau pindah cabang laundry"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-emerald-500/10 dark:bg-cyan-950/80 border border-emerald-500/30 dark:border-cyan-500/40 flex items-center justify-center">
                  <img
                    src={activeBranch.image || 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=150&q=80'}
                    alt={activeBranch.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <Store className="w-4 h-4 text-emerald-600 dark:text-cyan-400 absolute" />
                </div>
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-xs text-slate-800 dark:text-white truncate">
                      {activeBranch.name}
                    </span>
                    {activeBranch.isPusat && (
                      <span className="text-[8px] px-1 py-0.2 rounded font-black bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
                        PUSAT
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-cyan-400 font-bold flex items-center gap-0.5">
                    <span>Pindah Cabang</span>
                    <ChevronDown className="w-2.5 h-2.5 group-hover:translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            2. ROLE SWITCHER & ACCESS SECURITY
            ========================================================= */}
        <div className="p-3 border-b border-slate-200/80 dark:border-slate-800/80 space-y-2">
          {/* Active Role Selector Button */}
          <div className="relative">
            <button
              id="sidebar-role-selector-btn"
              type="button"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs font-bold transition-all ${currentRoleMeta.activeBg}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={currentRoleMeta.color}>{currentRoleMeta.icon}</span>
                <div className="text-left">
                  <div className="text-[9px] font-bold uppercase tracking-wider opacity-70">
                    Akses Role Aktif
                  </div>
                  <div className="font-black truncate">{currentRoleMeta.label}</div>
                </div>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 opacity-70 transition-transform ${
                  isRoleDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu for Roles */}
            {isRoleDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsRoleDropdownOpen(false)}
                />
                <div className="absolute left-0 right-0 top-full mt-1.5 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95 space-y-1">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                    Pilih Role (Mode: {isCommercialMode ? 'Komersial PIN' : 'Demo 1-Click'})
                  </div>
                  {rolesList.map((r) => {
                    const isActive = currentRole === r.id;
                    return (
                      <button
                        key={r.id}
                        id={`sidebar-role-opt-${r.id}`}
                        type="button"
                        onClick={() => handleRoleClick(r.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? `${r.activeBg} font-bold`
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={r.color}>{r.icon}</span>
                          <span>{r.label}</span>
                        </div>
                        {isCommercialMode ? (
                          <span className="text-[9px] font-mono opacity-60">PIN: {r.pin}</span>
                        ) : isActive ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Sub Row: Mode Toggle & Tutorial */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleAuthMode}
              className={`flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                isCommercialMode
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
              }`}
              title="Ganti antara Mode Demo (1-Click) dan Mode Komersial (Terkunci PIN)"
            >
              {isCommercialMode ? (
                <>
                  <Lock className="w-3 h-3 text-rose-500" />
                  <span>Komersial (PIN)</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3 h-3 text-emerald-500" />
                  <span>Mode Demo</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsDemoTutorialModalOpen(true)}
              className="flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 transition-all"
              title="Panduan Interaktif Tutorial Step-by-Step"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Tutorial</span>
            </button>
          </div>
        </div>

        {/* =========================================================
            3. QUICK TOOLS ROW (Coins, Search, Scan, Presensi)
            ========================================================= */}
        <div className="px-3 py-2 border-b border-slate-200/80 dark:border-slate-800/80 space-y-1.5">
          {/* Token Coins Balance */}
          <div
            onClick={() => setIsCoinModalOpen(true)}
            className="flex items-center justify-between p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 cursor-pointer transition-all group"
            title="Klik untuk Isi Ulang Token Koin"
          >
            <div className="flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" />
              <div>
                <div className="text-[9px] font-bold uppercase opacity-70">Saldo Token</div>
                <div className="text-xs font-black font-mono leading-none">
                  {tokenCoins.toLocaleString('id-ID')} Koin
                </div>
              </div>
            </div>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 flex items-center gap-0.5 shadow-xs">
              <Plus className="w-2.5 h-2.5" /> Topup
            </span>
          </div>

          {/* Quick Utility Icon Grid */}
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700 transition-all"
              title="Cari Cepat (Ctrl + K)"
            >
              <Search className="w-3 h-3 text-cyan-500" />
              <span>Cari</span>
            </button>

            <button
              type="button"
              onClick={() => setIsQrScannerOpen(true)}
              className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700 transition-all"
              title="Scan QR Code Nota Laundry"
            >
              <Camera className="w-3 h-3 text-emerald-500" />
              <span>Scan QR</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAttendanceModalOpen(true)}
              className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-700 transition-all"
              title="Presensi & Absensi Karyawan"
            >
              <Clock className="w-3 h-3 text-purple-500" />
              <span>Presensi</span>
            </button>
          </div>
        </div>

        {/* =========================================================
            4. MAIN NAVIGATION ITEMS (Scrollable)
            ========================================================= */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-2 uppercase tracking-wider mb-1.5">
            Menu {currentRoleMeta.label}
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white font-bold shadow-xs border border-slate-700/60'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={isActive ? currentRoleMeta.color : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border shrink-0 ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* =========================================================
            5. FOOTER & USER CONTROLS
            ========================================================= */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2 bg-slate-50/50 dark:bg-slate-950/40">
          {/* Machine & Orders Live Status */}
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              <span>Mesin ON:</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-mono">{runningMachinesCount}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Order Aktif:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">{activeOrdersCount}</span>
            </div>
          </div>

          {/* User Profile Info & System Actions */}
          <div className="flex items-center justify-between pt-1">
            {/* User Avatar & Name */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 text-left">
                <div className="text-xs font-bold text-slate-800 dark:text-white truncate">
                  {currentUser?.name || 'Karyawan'}
                </div>
                <div className="text-[9px] text-slate-400 uppercase font-mono truncate">
                  {currentRole}
                </div>
              </div>
            </div>

            {/* Action Buttons: Notif, Theme, Reset */}
            <div className="flex items-center gap-1">
              {/* Notif Bell */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors relative"
                  title="Lihat Notifikasi"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifsCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  )}
                  {unreadNotifsCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-rose-500" />
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                    <div className="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-white">
                        <span>Notifikasi ({notifications.length})</span>
                        <button
                          onClick={() => setIsNotifOpen(false)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="space-y-1.5 max-h-56 overflow-y-auto no-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="text-center py-4 text-xs text-slate-400">Tidak ada notifikasi</div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => markNotificationRead(n.id)}
                              className={`p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                                n.read
                                  ? 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-500'
                                  : 'bg-emerald-50/50 dark:bg-slate-800/70 border-emerald-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between font-bold text-[11px]">
                                <span>{n.title}</span>
                                <span className="text-[9px] text-slate-400">{n.timestamp}</span>
                              </div>
                              <p className="text-[10px] mt-0.5 text-slate-600 dark:text-slate-400">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Dark mode toggle */}
              <button
                type="button"
                onClick={toggleDarkMode}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
              </button>

              {/* Reset Data button */}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset semua data demo kembali ke awal?')) {
                    resetAllData();
                  }
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Reset Data Demo"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Modals integrated into Desktop Sidebar */}
      <CoinTopupModal isOpen={isCoinModalOpen} onClose={() => setIsCoinModalOpen(false)} />
      <BranchSwitcherModal isOpen={isBranchModalOpen} onClose={() => setIsBranchModalOpen(false)} />
      <IotMachineControlModal isOpen={isIotModalOpen} onClose={() => setIsIotModalOpen(false)} />
      <LandingPageModal isOpen={isLandingOpen} onClose={() => setIsLandingOpen(false)} />
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenCoinModal={() => setIsCoinModalOpen(true)}
        onOpenIotModal={() => setIsIotModalOpen(true)}
        onOpenLandingModal={() => setIsLandingOpen(true)}
      />

      {/* Auth PIN Gate Modal for role switching */}
      {authModalTargetRole && (
        <AuthGateModal
          isOpen={!!authModalTargetRole}
          targetRole={authModalTargetRole}
          onClose={() => setAuthModalTargetRole(null)}
          onSuccess={() => {
            setCurrentRole(authModalTargetRole);
            setAuthModalTargetRole(null);
          }}
        />
      )}
    </>
  );
};
