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
} from 'lucide-react';
import { CoinTopupModal } from './CoinTopupModal';
import { IotMachineControlModal } from './IotMachineControlModal';
import { LandingPageModal } from './LandingPageModal';

export const Navbar: React.FC = () => {
  const {
    currentRole,
    currentUser,
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
  const [isLandingOpen, setIsLandingOpen] = useState(false);

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
          <div className="flex items-center gap-3">
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

            {/* Branch Selector (Custom Dropdown) */}
            <div className="relative ml-2 hidden md:block">
              <button
                onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/70 border border-slate-700/80 text-xs text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition-all"
              >
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold">{activeBranch.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isBranchMenuOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Pilih Outlet Aktif:
                  </div>
                  {branches.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setCurrentBranchId(b.id);
                        setIsBranchMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                        b.id === currentBranchId
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{b.name}</div>
                        <div className="text-[10px] text-slate-400">{b.code} • {b.phone}</div>
                      </div>
                      {b.isPusat && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                          PUSAT
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Quick Widgets & Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Online / Offline status */}
            <div
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                isOnline
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{isOnline ? 'Cloud Sync Online' : 'Offline Cache'}</span>
            </div>

            {/* Showcase & Promo Button */}
            <button
              onClick={() => setIsLandingOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-500/40 hover:border-emerald-400 text-xs font-bold text-emerald-300 transition-all shadow-glow-emerald hover:scale-105"
              title="Lihat Keunggulan & Promo Rp 25/Nota"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Promo Rp 25</span>
              <span className="sm:hidden">Rp 25</span>
            </button>

            {/* IoT Machine Trigger Button */}
            <button
              onClick={() => setIsIotModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-cyan-500/50 text-xs font-semibold text-slate-200 transition-all hover:bg-slate-800"
              title="Panel Kontrol IoT Mesin"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Mesin IoT</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  runningMachinesCount > 0
                    ? 'bg-cyan-500 text-slate-950 font-black'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {runningMachinesCount} ON
              </span>
            </button>

            {/* Coin Balance Widget */}
            <button
              onClick={() => setIsCoinModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/40 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition-all shadow-glow-amber"
              title="Klik untuk Top Up Koin"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{tokenCoins.toLocaleString('id-ID')}</span>
              <span className="hidden sm:inline text-[10px] font-normal text-amber-300/80">{t.nav.coins}</span>
              <span className="text-[10px] ml-1 px-1 bg-amber-500/30 rounded font-black">+</span>
            </button>

            {/* Language Switcher (ID / EN) */}
            <button
              onClick={() => {
                const nextLang = language === 'id' ? 'en' : 'id';
                setLanguage(nextLang);
                if (nextLang === 'en') setCurrency('USD');
                else setCurrency('IDR');
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-cyan-500/50 text-xs font-bold text-slate-200 transition-all hover:bg-slate-800"
              title={language === 'id' ? 'Switch to English (Global)' : 'Ganti ke Bahasa Indonesia'}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
            </button>

            {/* Currency Switcher (IDR / USD) */}
            <button
              onClick={() => setCurrency(currency === 'IDR' ? 'USD' : 'IDR')}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                currency === 'USD'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-glow-emerald'
                  : 'bg-slate-800/70 border-slate-700/80 text-slate-300 hover:text-white'
              }`}
              title="Toggle Currency (IDR / USD)"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>{currency}</span>
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

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-800/70 border border-slate-700/80 text-slate-300 hover:text-amber-300 hover:bg-slate-800 transition-colors"
              title="Ganti Tema Gelap / Terang"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={() => {
                if (window.confirm('Reset semua data kembali ke seed demo awal?')) {
                  resetAllData();
                }
              }}
              className="p-2 rounded-xl bg-slate-800/70 border border-slate-700/80 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors hidden sm:block"
              title="Reset Data Demo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Active User Pill */}
            <div
              className={`flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl border ${
                roleGlowColors[currentRole] || 'border-slate-700'
              }`}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-lg object-cover border border-white/20"
              />
              <div className="hidden xl:block text-left">
                <div className="text-[11px] font-bold text-white leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[9px] uppercase font-bold tracking-wider opacity-80">
                  {currentRole}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <CoinTopupModal isOpen={isCoinModalOpen} onClose={() => setIsCoinModalOpen(false)} />
      <IotMachineControlModal isOpen={isIotModalOpen} onClose={() => setIsIotModalOpen(false)} />
      <LandingPageModal isOpen={isLandingOpen} onClose={() => setIsLandingOpen(false)} />
    </>
  );
};
