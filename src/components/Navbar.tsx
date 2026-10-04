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
  Building2,
  ChevronDown,
  RotateCcw,
  Cpu,
  CheckCircle2,
  X,
  Globe,
  DollarSign,
  Sparkles,
  Search,
  Smartphone,
  Download,
  HelpCircle,
  Menu,
  Store,
  LayoutGrid,
} from 'lucide-react';
import { CoinTopupModal } from './CoinTopupModal';
import { IotMachineControlModal } from './IotMachineControlModal';
import { LandingPageModal } from './LandingPageModal';
import { CommandPaletteModal } from './CommandPaletteModal';
import { GoogleAuthModal } from './GoogleAuthModal';
import { BranchSwitcherModal } from './BranchSwitcherModal';

export const Navbar: React.FC = () => {
  const {
    currentRole,
    currentUser,
    activeGmailAccount,
    isGoogleAuthModalOpen,
    setIsGoogleAuthModalOpen,
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
  } = useApp();

  const [isCoinModalOpen, setIsCoinModalOpen] = useState(false);
  const [isIotModalOpen, setIsIotModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
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

  const roleGlowColors: Record<string, string> = {
    owner: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    kasir: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
    produksi: 'border-orange-500/40 text-orange-400 bg-orange-500/10',
    kurir: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
    pelanggan: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-800/80 px-4 py-2.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Brand & Branch */}
          {/* Mobile Left: Foto Laundry + Nama Laundry + Pindah Laundry */}
          <div
            id="mobile-branch-switcher"
            onClick={() => setIsBranchModalOpen(true)}
            className="flex md:hidden items-center gap-2.5 max-w-[62vw] cursor-pointer group active:scale-[0.98] transition-transform select-none"
            title="Klik untuk pindah cabang laundry"
          >
            {/* Foto Laundry */}
            <div className="relative shrink-0 w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-cyan-950 to-slate-800 border border-cyan-500/40 shadow-glow-cyan group-hover:border-cyan-400 transition-colors flex items-center justify-center">
              <Store className="w-4 h-4 text-cyan-400 absolute" />
              <img
                src={activeBranch.image || 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=150&q=80'}
                alt={activeBranch.name}
                className="w-full h-full object-cover relative z-10"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none z-10" />
            </div>

            {/* Nama Laundry & Pindah Laundry */}
            <div className="flex flex-col min-w-0 text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs sm:text-sm text-white truncate leading-tight group-hover:text-cyan-300 transition-colors">
                  {activeBranch.name}
                </span>
                {activeBranch.isPusat && (
                  <span className="text-[8px] px-1 py-0.2 rounded font-black bg-amber-500/20 text-amber-300 shrink-0">
                    PUSAT
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-bold mt-0.5">
                <Store className="w-3 h-3 text-cyan-400" />
                <span>Pindah Laundry</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:translate-y-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Desktop Left: Brand Logo + Laundry Branch Dropdown */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2.5 group cursor-pointer">
              <div className="relative p-2 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 shadow-glow-cyan transition-transform group-hover:scale-105">
                <WashingMachine className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                    LAUNDRYHUB
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    v2.6
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 hidden sm:block">
                  Unified Laundry Management Ecosystem
                </div>
              </div>
            </div>

            {/* Desktop Branch Selector */}
            <div className="relative ml-2">
              <button
                onClick={() => setIsBranchModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/70 border border-slate-700/80 text-xs text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition-all"
              >
                <img
                  src={activeBranch.image || 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=150&q=80'}
                  alt={activeBranch.name}
                  className="w-4 h-4 rounded object-cover border border-slate-600"
                />
                <span className="font-semibold">{activeBranch.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Quick Command Palette Button */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/40 text-xs text-slate-400 hover:text-slate-200 transition-all cursor-pointer shadow-inner ml-1"
              title="Cari Cepat & Navigasi (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-medium">Cari nota, pelanggan...</span>
              <kbd className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono font-bold">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Quick Widgets & Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-cyan-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Pencarian Cepat & Navigasi"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Coin Balance Widget */}
            <button
              onClick={() => setIsCoinModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/40 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition-all shadow-glow-amber active:scale-95"
              title="Klik untuk Top Up Koin"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{tokenCoins.toLocaleString('id-ID')}</span>
              <span className="hidden sm:inline text-[10px] font-normal text-amber-300/80">{t.nav.coins}</span>
              <span className="text-[10px] ml-0.5 px-1 bg-amber-500/30 rounded font-black">+</span>
            </button>

            {/* Dark / Pastel Light Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="flex p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:scale-105 active:scale-95 transition-all shadow-sm"
              title={isDarkMode ? 'Ganti ke Mode Pastel Terang' : 'Ganti ke Mode Midnight Gelap'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-600 dark:text-cyan-400" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-xl bg-slate-800/70 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Notifikasi Sistem"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Notif Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-white">
                    <span>Notifikasi ({notifications.length})</span>
                    <button
                      onClick={() => setIsNotifOpen(false)}
                      className="text-slate-400 hover:text-white"
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
                            ? 'bg-slate-950/40 border-slate-800 text-slate-400'
                            : 'bg-slate-800/70 border-slate-700 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span>{n.title}</span>
                          <span className="text-[9px] text-slate-500">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] mt-0.5 text-slate-300">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Ekosistem & Alat Dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/40 text-xs font-semibold text-slate-200 transition-all shadow-sm active:scale-95"
                title="Menu & Alat Ekosistem"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden lg:inline">Alat & Fitur</span>
                {runningMachinesCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isToolsMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isToolsMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsToolsMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 space-y-1 text-xs">
                    {/* Header / Cloud sync status */}
                    <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-800 text-[11px]">
                      <span className="font-bold text-slate-400 uppercase tracking-wider">Ekosistem</span>
                      <span className={`inline-flex items-center gap-1 font-semibold ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                        {isOnline ? 'Cloud Synced' : 'Offline'}
                      </span>
                    </div>

                    {/* Promo Rp 25 */}
                    <button
                      onClick={() => {
                        setIsToolsMenuOpen(false);
                        setIsLandingOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold leading-tight">Promo Rp 25/Nota</div>
                        <div className="text-[10px] text-slate-400">Lihat kalkulasi hemat & paket</div>
                      </div>
                    </button>

                    {/* Unduh APK */}
                    <a
                      href="/laundryhub.apk"
                      download="laundryhub.apk"
                      onClick={() => setIsToolsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                    >
                      <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold leading-tight">Unduh Aplikasi Android</div>
                        <div className="text-[10px] text-slate-400">File APK Resmi (4 MB)</div>
                      </div>
                    </a>

                    {/* Mesin IoT */}
                    <button
                      onClick={() => {
                        setIsToolsMenuOpen(false);
                        setIsIotModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold leading-tight">Kontrol Mesin IoT</div>
                        <div className="text-[10px] text-slate-400">{runningMachinesCount} mesin aktif berputar</div>
                      </div>
                    </button>

                    {/* Panduan */}
                    <button
                      onClick={() => {
                        setIsToolsMenuOpen(false);
                        window.dispatchEvent(new CustomEvent('lh_open_intro'));
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold leading-tight">Panduan Aplikasi</div>
                        <div className="text-[10px] text-slate-400">Tur interaktif fitur laundry</div>
                      </div>
                    </button>

                    <div className="border-t border-slate-800 my-1 pt-1">
                      {/* Language & Currency toggles */}
                      <div className="grid grid-cols-2 gap-1 px-1">
                        <button
                          onClick={() => {
                            const nextLang = language === 'id' ? 'en' : 'id';
                            setLanguage(nextLang);
                            if (nextLang === 'en') setCurrency('USD');
                            else setCurrency('IDR');
                          }}
                          className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-[11px] font-semibold text-slate-200"
                        >
                          <Globe className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{language === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
                        </button>
                        <button
                          onClick={() => setCurrency(currency === 'IDR' ? 'USD' : 'IDR')}
                          className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-[11px] font-semibold text-slate-200"
                        >
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
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
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 mt-1 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-[11px] transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                        <span>Reset Data Demo</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-800/90 border border-slate-700/80 text-slate-300 hover:text-white transition-colors"
              title="Menu Lainnya"
            >
              <Menu className="w-4 h-4 text-cyan-400" />
            </button>

            {/* Interactive Google / Gmail User Account Pill */}
            <button
              type="button"
              onClick={() => setIsGoogleAuthModalOpen(true)}
              className={`hidden sm:flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl border transition-all hover:scale-105 active:scale-95 ${
                roleGlowColors[currentRole] || 'border-slate-700 bg-slate-800/80'
              }`}
              title={`Akun Google: ${activeGmailAccount || currentUser.email} (Klik untuk kelola / ganti akun)`}
            >
              {/* Google G mini icon */}
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-5 h-5 rounded-lg object-cover border border-white/20"
              />
              <div className="hidden xl:block text-left">
                <div className="text-[11px] font-bold text-white leading-tight flex items-center gap-1">
                  <span>{currentUser.name}</span>
                  {activeGmailAccount && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>
                <div className="text-[9px] uppercase font-bold tracking-wider opacity-80 flex items-center gap-1">
                  <span>{currentRole}</span>
                  <span className="opacity-60 lowercase font-mono">
                    ({activeGmailAccount ? activeGmailAccount.split('@')[0] : 'demo'})
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Action Drawer / Sheet */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-slate-900 border-t border-slate-700/80 rounded-t-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950">
                  <WashingMachine className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-sm text-white">Menu & Pengaturan</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Google Account Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Akun Google / Gmail</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-slate-800 text-cyan-300">
                  {currentRole}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-white truncate">{currentUser.name}</div>
                  <div className="text-[11px] text-cyan-400 font-mono truncate">
                    {activeGmailAccount || currentUser.email}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsGoogleAuthModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] shrink-0 shadow-glow-cyan"
                >
                  Ganti Akun
                </button>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href="/laundryhub.apk"
                download="laundryhub.apk"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 font-bold text-xs"
              >
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>Unduh APK (4 MB)</span>
              </a>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsLandingOpen(true);
                }}
                className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-bold text-xs"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Promo Rp 25/Nota</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsIotModalOpen(true);
                }}
                className="flex items-center gap-2 p-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs"
              >
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Mesin IoT ({runningMachinesCount} ON)</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('lh_open_intro'));
                }}
                className="flex items-center gap-2 p-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs"
              >
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>Panduan Intro</span>
              </button>
            </div>

            {/* Outlet Branch Selector */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
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
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-300 bg-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    <span>{b.name}</span>
                    {b.isPusat && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">PUSAT</span>}
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
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200"
              >
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Bahasa: {language === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
              </button>

              <button
                onClick={() => setCurrency(currency === 'IDR' ? 'USD' : 'IDR')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200"
              >
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Mata Uang: {currency}</span>
              </button>
            </div>

            {/* Theme & Reset */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
              <button
                onClick={toggleDarkMode}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
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
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400"
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
      <GoogleAuthModal
        isOpen={isGoogleAuthModalOpen}
        onClose={() => setIsGoogleAuthModalOpen(false)}
      />
      <BranchSwitcherModal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
      />
    </>
  );
};
