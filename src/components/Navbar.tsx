import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  WashingMachine,
  Coins,
  Bell,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  ChevronDown,
  RotateCcw,
  Cpu,
  X,
  Globe,
  DollarSign,
  Sparkles,
  Search,
  Smartphone,
  HelpCircle,
  Menu,
  Store,
  LayoutGrid,
  Camera,
  Clock,
} from 'lucide-react';
import { CoinTopupModal } from './CoinTopupModal';
import { IotMachineControlModal } from './IotMachineControlModal';
import { LandingPageModal } from './LandingPageModal';
import { CommandPaletteModal } from './CommandPaletteModal';
import { BranchSwitcherModal } from './BranchSwitcherModal';

export const Navbar: React.FC = () => {
  const {
    currentRole,
    currentUser,
    activeGmailAccount,
    isGoogleAuthModalOpen,
    setIsGoogleAuthModalOpen,
    setIsDemoTutorialModalOpen,
    activeTutorial,
    branches,
    currentBranchId,
    setCurrentBranchId,
    tokenCoins,
    isDarkMode,
    toggleDarkMode,
    isOnline,
    language,
    setLanguage,
    currency,
    setCurrency,
    t,
    machines,
    notifications,
    markNotificationRead,
    resetAllData,
    setIsQrScannerOpen,
    setIsAttendanceModalOpen,
  } = useApp();

  const [isCoinModalOpen, setIsCoinModalOpen] = useState(false);
  const [isIotModalOpen, setIsIotModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('branchModal')) {
      return true;
    }
    return false;
  });
  const [isLandingOpen, setIsLandingOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  React.useEffect(() => {
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
  const runningMachinesCount = machines.filter((m) => m.status === 'running').length;
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const getShortName = (name: string) => {
    if (!name) return 'User';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[1][0]}.`;
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/80 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-3 sm:px-6 gap-3">
          {/* =========================================================
              LEFT ZONE: Brand Logo & Branch Outlet Switcher
              ========================================================= */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile Branch Switcher (Phone screen) */}
            <div
              id="mobile-branch-switcher"
              onClick={() => setIsBranchModalOpen(true)}
              className="flex md:hidden items-center gap-2.5 max-w-[60vw] cursor-pointer group active:scale-[0.98] transition-transform select-none"
              title="Klik untuk pindah cabang laundry"
            >
              <div className="relative shrink-0 w-9 h-9 rounded-xl overflow-hidden bg-emerald-500/10 dark:bg-cyan-950/80 border border-emerald-500/30 dark:border-cyan-500/40 shadow-xs flex items-center justify-center">
                <Store className="w-4 h-4 text-emerald-600 dark:text-cyan-400 absolute" />
                <img
                  src={activeBranch.image || 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=150&q=80'}
                  alt={activeBranch.name}
                  className="w-full h-full object-cover relative z-10"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <div className="flex flex-col min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate leading-tight group-hover:text-emerald-600 dark:group-hover:text-cyan-300 transition-colors">
                    {activeBranch.name}
                  </span>
                  {activeBranch.isPusat && (
                    <span className="text-[8px] px-1 py-0.2 rounded font-black bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
                      PUSAT
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-cyan-400 font-bold mt-0.5">
                  <span>Pindah Cabang</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 group-hover:translate-y-0.5 transition-transform" />
                </div>
              </div>
            </div>

            {/* Desktop Brand Logo */}
            <div className="hidden md:flex items-center gap-2.5 group cursor-pointer select-none">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 flex items-center justify-center shadow-md shadow-emerald-500/20 transition-transform group-hover:scale-105">
                <WashingMachine className="w-5 h-5 text-slate-950" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">
                  LAUNDRYHUB
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                  v2.6
                </span>
              </div>
            </div>

            {/* Elegant Divider (Desktop) */}
            <div className="hidden md:block h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

            {/* Desktop Branch Selector Chip */}
            <button
              onClick={() => setIsBranchModalOpen(true)}
              className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all active:scale-95 group"
              title="Pilih atau Pindah Cabang Laundry"
            >
              <Store className="w-3.5 h-3.5 text-emerald-600 dark:text-cyan-400 shrink-0" />
              <span className="max-w-[140px] truncate">{activeBranch.name}</span>
              {activeBranch.isPusat && (
                <span className="text-[8px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold shrink-0">
                  PUSAT
                </span>
              )}
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:translate-y-0.5 transition-transform shrink-0" />
            </button>
          </div>

          {/* =========================================================
              CENTER ZONE: Sleek Global Search Bar (Desktop)
              ========================================================= */}
          <div className="hidden lg:flex items-center flex-1 max-w-sm mx-2">
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="w-full h-9 flex items-center justify-between px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/40 dark:hover:border-cyan-500/40 text-xs text-slate-400 hover:text-slate-100 transition-all cursor-pointer shadow-xs group"
              title="Cari Cepat & Navigasi (Ctrl+K)"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 dark:group-hover:text-cyan-400 transition-colors" />
                <span className="text-[12px] truncate">Cari nota, pelanggan, mesin...</span>
              </div>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-400 font-mono font-medium shadow-xs shrink-0">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* =========================================================
              RIGHT ZONE: Actions, Koin, Tools, Theme, & Google Account
              ========================================================= */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile Search Icon Button */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/80 text-slate-300 dark:text-cyan-400 hover:scale-105 active:scale-95 transition-all"
              title="Pencarian Cepat & Navigasi"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* In-App Camera QR Scanner Button */}
            <button
              id="navbar-qr-scan-btn"
              onClick={() => setIsQrScannerOpen(true)}
              className="h-9 flex items-center gap-1.5 px-2 sm:px-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs font-bold transition-all shadow-xs active:scale-95 group"
              title="Scan QR Code Nota Laundry"
            >
              <Camera className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="hidden sm:inline">Scan QR</span>
            </button>

            {/* Online Attendance / Presensi Staf Button */}
            <button
              id="navbar-attendance-btn"
              onClick={() => setIsAttendanceModalOpen(true)}
              className="h-9 flex items-center gap-1.5 px-2 sm:px-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all shadow-xs active:scale-95 group"
              title="Absen Kehadiran Online & Slip Gaji Borongan"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:rotate-12 transition-transform shrink-0" />
              <span className="hidden md:inline">Presensi</span>
            </button>

            {/* Token Coin Pill */}
            <button
              onClick={() => setIsCoinModalOpen(true)}
              className="h-9 flex items-center gap-1.5 px-2.5 sm:px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold transition-all shadow-xs active:scale-95 group"
              title="Saldo Koin Laundry (Klik untuk Top Up)"
            >
              <Coins className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-12 transition-transform shrink-0" />
              <span>{tokenCoins.toLocaleString('id-ID')}</span>
              <span className="hidden xl:inline text-[10px] font-normal text-amber-600 dark:text-amber-400">Koin</span>
              <span className="text-[10px] ml-0.5 px-1 py-0.2 bg-amber-500/25 rounded font-black text-amber-700 dark:text-amber-300">+</span>
            </button>

            {/* Theme Toggle (Sun / Moon) */}
            <button
              id="theme-toggle-btn"
              onClick={toggleDarkMode}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all hover:scale-105 active:scale-95 shadow-xs"
              title={isDarkMode ? 'Ganti ke Pastel Light Mode' : 'Ganti ke Midnight Dark Mode'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-violet-600" />
              )}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-slate-100 transition-all relative active:scale-95 shadow-xs"
                title="Notifikasi Sistem"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs animate-pulse">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-white">
                      <span>Notifikasi ({notifications.length})</span>
                      <button
                        onClick={() => setIsNotifOpen(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                            n.read
                              ? 'bg-slate-50 dark:bg-slate-950/40 border-slate-150 dark:border-slate-850 text-slate-500 dark:text-slate-400'
                              : 'bg-emerald-50/50 dark:bg-slate-800/70 border-emerald-200/60 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span>{n.title}</span>
                            <span className="text-[9px] text-slate-400">{n.timestamp}</span>
                          </div>
                          <p className="text-[11px] mt-0.5 text-slate-600 dark:text-slate-300">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Menu Alat & Fitur Dropdown (Desktop) */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
                className="h-9 flex items-center gap-1.5 px-3 rounded-xl bg-slate-100/80 hover:bg-slate-200/70 dark:bg-slate-800/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all active:scale-95 shadow-xs"
                title="Menu & Alat Ekosistem"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-emerald-600 dark:text-cyan-400" />
                <span className="hidden xl:inline">Fitur</span>
                {runningMachinesCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-cyan-400 animate-pulse" />
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isToolsMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isToolsMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsToolsMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2.5 z-50 animate-in fade-in zoom-in-95 space-y-1 text-xs">
                    {/* Header / Cloud sync status */}
                    <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[11px]">
                      <span className="font-bold text-slate-400 uppercase tracking-wider">Ekosistem</span>
                      <span className={`inline-flex items-center gap-1 font-semibold ${isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                        {isOnline ? 'Cloud Synced' : 'Offline Mode'}
                      </span>
                    </div>

                    {/* Tutorial Versi Demo (Owner, Pekerja, Pelanggan) */}
                    <button
                      onClick={() => {
                        setIsToolsMenuOpen(false);
                        setIsDemoTutorialModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold leading-tight">Tutorial Versi Demo</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Pilih panduan Owner, Pekerja, atau Pelanggan</div>
                      </div>
                    </button>

                    {/* Promo Rp 25 */}
                    <button
                      onClick={() => {
                        setIsToolsMenuOpen(false);
                        setIsLandingOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold leading-tight">Promo Rp 25/Nota</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Lihat simulasi hemat & paket</div>
                      </div>
                    </button>

                    {/* Unduh APK */}
                    <a
                      href="/laundryhub.apk"
                      download="laundryhub.apk"
                      onClick={() => setIsToolsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors"
                    >
                      <Smartphone className="w-4 h-4 text-cyan-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold leading-tight">Unduh Aplikasi Android</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">File APK Resmi (4 MB)</div>
                      </div>
                    </a>

                    {/* Mesin IoT */}
                    <button
                      onClick={() => {
                        setIsToolsMenuOpen(false);
                        setIsIotModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Cpu className="w-4 h-4 text-cyan-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold leading-tight">Kontrol Mesin IoT</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{runningMachinesCount} mesin aktif berputar</div>
                      </div>
                    </button>

                    {/* Panduan */}
                    <button
                      onClick={() => {
                        setIsToolsMenuOpen(false);
                        window.dispatchEvent(new CustomEvent('lh_open_intro'));
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold leading-tight">Panduan Aplikasi</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Tur interaktif fitur laundry</div>
                      </div>
                    </button>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                      {/* Language & Currency toggles */}
                      <div className="grid grid-cols-2 gap-1 px-1">
                        <button
                          onClick={() => {
                            const nextLang = language === 'id' ? 'en' : 'id';
                            setLanguage(nextLang);
                            if (nextLang === 'en') setCurrency('USD');
                            else setCurrency('IDR');
                          }}
                          className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-[11px] font-semibold text-slate-700 dark:text-slate-200"
                        >
                          <Globe className="w-3.5 h-3.5 text-cyan-500" />
                          <span>{language === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
                        </button>
                        <button
                          onClick={() => setCurrency(currency === 'IDR' ? 'USD' : 'IDR')}
                          className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-[11px] font-semibold text-slate-700 dark:text-slate-200"
                        >
                          <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{currency}</span>
                        </button>
                      </div>

                      {/* Reset Demo Data */}
                      <button
                        onClick={() => {
                          if (window.confirm('Reset semua data kembali ke seed demo awal?')) {
                            resetAllData();
                            setIsToolsMenuOpen(false);
                          }
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 mt-1 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-[11px] transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                        <span>Reset Data Demo</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700/80 text-slate-300 transition-colors"
              title="Menu Lainnya"
            >
              <Menu className="w-4 h-4 text-emerald-600 dark:text-cyan-400" />
            </button>

            {/* Divider (Desktop) */}
            <div className="hidden sm:block h-5 w-px bg-slate-700 mx-0.5" />

            {/* =========================================================
                DEMO VERSION OR GOOGLE ACCOUNT PROFILE PILL
                ========================================================= */}
            {!activeGmailAccount ? (
              <button
                type="button"
                onClick={() => setIsDemoTutorialModalOpen(true)}
                className="h-9 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 rounded-xl border border-emerald-500/40 dark:border-cyan-500/40 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 hover:from-emerald-500/20 hover:to-cyan-500/20 text-emerald-800 dark:text-cyan-200 transition-all cursor-pointer group shadow-xs active:scale-95"
                title="Coba Versi Demo Interaktif (Tutorial Step-by-Step Owner, Pekerja, Pelanggan)"
              >
                <div className="w-5 h-5 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Sparkles className="w-3 h-3 text-slate-950" />
                </div>
                <div className="flex flex-col text-left leading-none">
                  <div className="text-xs font-black tracking-tight flex items-center gap-1 text-slate-100">
                    <span>Coba Versi Demo</span>
                    <span className="hidden sm:inline text-[8px] px-1 py-0.2 rounded font-black bg-emerald-500/25 text-emerald-800 dark:text-cyan-300">
                      TUTORIAL
                    </span>
                  </div>
                  <div className="text-[9px] font-semibold text-emerald-700 dark:text-cyan-400 uppercase mt-0.5 tracking-wide">
                    {activeTutorial ? `Mode ${activeTutorial}` : currentRole}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:translate-y-0.5 transition-transform shrink-0" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsGoogleAuthModalOpen(true)}
                className="h-9 flex items-center gap-2 pl-1.5 pr-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 transition-all cursor-pointer group shadow-xs active:scale-95"
                title={`Akun Google: ${activeGmailAccount} (Klik untuk ganti akun)`}
              >
                {/* Google G mini icon */}
                <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 shadow-xs">
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>

                {/* Avatar circle */}
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                />

                {/* Name & Role Text */}
                <div className="hidden sm:flex flex-col text-left leading-none">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 max-w-[85px] xl:max-w-[110px] truncate flex items-center gap-1">
                    <span>{getShortName(currentUser.name)}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  </div>
                  <div className="text-[9px] font-semibold text-emerald-600 dark:text-cyan-400 uppercase mt-0.5 tracking-wide">
                    {currentRole}
                  </div>
                </div>

                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:translate-y-0.5 transition-transform shrink-0" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Action Drawer / Sheet */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700/80 rounded-t-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950">
                  <WashingMachine className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">Menu & Pengaturan</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Google Account Banner OR Demo Version Card */}
            {!activeGmailAccount ? (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-cyan-400" />
                    <span className="text-xs font-black text-slate-100">
                      Versi Demo Interaktif
                    </span>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-500/20 text-emerald-800 dark:text-cyan-300">
                    {activeTutorial ? `Mode ${activeTutorial}` : currentRole}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  Jelajahi seluruh fitur laundry dengan tutorial step-by-step (Owner, Pekerja, Pelanggan) tanpa perlu login!
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsDemoTutorialModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Pilih Tutorial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsGoogleAuthModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-bold text-xs shadow-xs"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Masuk Google</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Akun Google / Gmail</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-100 dark:bg-slate-800 text-emerald-800 dark:text-cyan-300">
                    {currentRole}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{currentUser.name}</div>
                    <div className="text-[11px] text-emerald-600 dark:text-cyan-400 font-mono truncate">
                      {activeGmailAccount}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsGoogleAuthModalOpen(true);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shrink-0 shadow-xs"
                  >
                    Ganti Akun
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href="/laundryhub.apk"
                download="laundryhub.apk"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300 font-bold text-xs"
              >
                <Smartphone className="w-4 h-4 text-cyan-500" />
                <span>Unduh APK (4 MB)</span>
              </a>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsLandingOpen(true);
                }}
                className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-bold text-xs"
              >
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>Promo Rp 25/Nota</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsIotModalOpen(true);
                }}
                className="flex items-center gap-2 p-3 rounded-2xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs"
              >
                <Cpu className="w-4 h-4 text-cyan-500" />
                <span>Mesin IoT ({runningMachinesCount} ON)</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('lh_open_intro'));
                }}
                className="flex items-center gap-2 p-3 rounded-2xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs"
              >
                <HelpCircle className="w-4 h-4 text-emerald-500" />
                <span>Panduan Intro</span>
              </button>
            </div>

            {/* Outlet Branch Selector */}
            <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-700 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Pilih Outlet Cabang:
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setCurrentBranchId(b.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
                      b.id === currentBranchId
                        ? 'bg-emerald-500/15 text-emerald-800 dark:text-cyan-300 border border-emerald-500/30'
                        : 'text-slate-300 bg-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    <span>{b.name}</span>
                    {b.isPusat && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">PUSAT</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Language & Currency row */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const nextLang = language === 'id' ? 'en' : 'id';
                  setLanguage(nextLang);
                  if (nextLang === 'en') setCurrency('USD');
                  else setCurrency('IDR');
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200"
              >
                <Globe className="w-4 h-4 text-cyan-500" />
                <span>Bahasa: {language === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
              </button>

              <button
                onClick={() => setCurrency(currency === 'IDR' ? 'USD' : 'IDR')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200"
              >
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Mata Uang: {currency}</span>
              </button>
            </div>

            {/* Theme & Reset */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-700">
              <button
                onClick={toggleDarkMode}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
                <span>{isDarkMode ? 'Mode Terang' : 'Mode Gelap'}</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Reset semua data kembali ke awal?')) {
                    resetAllData();
                    setIsMobileMenuOpen(false);
                  }
                }}
                className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-rose-500"
                title="Reset Data"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CoinTopupModal isOpen={isCoinModalOpen} onClose={() => setIsCoinModalOpen(false)} />
      <IotMachineControlModal isOpen={isIotModalOpen} onClose={() => setIsIotModalOpen(false)} />
      <LandingPageModal isOpen={isLandingOpen} onClose={() => setIsLandingOpen(false)} />
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenCoinModal={() => setIsCoinModalOpen(true)}
        onOpenIotModal={() => setIsIotModalOpen(true)}
        onOpenLandingModal={() => setIsLandingOpen(true)}
      />
      <BranchSwitcherModal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
      />
    </>
  );
};
