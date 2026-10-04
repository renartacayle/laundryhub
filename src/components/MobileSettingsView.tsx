import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Store,
  QrCode,
  Cpu,
  Mail,
  Shield,
  Sun,
  Moon,
  Globe,
  DollarSign,
  Smartphone,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  UserCheck,
  Building2,
  Lock,
  Unlock,
  Coins,
  CheckCircle2,
  Palette,
} from 'lucide-react';
import { OutletQrisConfigModal } from './OutletQrisConfigModal';
import { IotMachineControlModal } from './IotMachineControlModal';
import { CoinTopupModal } from './CoinTopupModal';
import { BranchSwitcherModal } from './BranchSwitcherModal';

export const MobileSettingsView: React.FC = () => {
  const {
    branches,
    currentBranchId,
    setCurrentBranchId,
    currentUser,
    activeGmailAccount,
    setIsGoogleAuthModalOpen,
    tokenCoins,
    isDarkMode,
    setIsDarkMode,
    toggleDarkMode,
    language,
    setLanguage,
    currency,
    setCurrency,
    machines,
    resetAllData,
  } = useApp();

  const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);
  const [isIotModalOpen, setIsIotModalOpen] = useState(false);
  const [isCoinModalOpen, setIsCoinModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);

  // Commercial / PIN mode toggle
  const [isCommercialMode, setIsCommercialMode] = useState<boolean>(() => {
    return localStorage.getItem('lh_auth_mode') === 'commercial';
  });

  const toggleAuthMode = () => {
    const nextMode = !isCommercialMode;
    setIsCommercialMode(nextMode);
    localStorage.setItem('lh_auth_mode', nextMode ? 'commercial' : 'demo');
  };

  const activeBranch = branches.find((b) => b.id === currentBranchId) || branches[0];
  const runningMachinesCount = machines.filter((m) => m.status === 'running').length;

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header Card: Active Laundry Profile */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-700/80 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0 w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-950 to-slate-800 border border-cyan-500/40 shadow-glow-cyan flex items-center justify-center">
            <Store className="w-8 h-8 text-cyan-400/60 absolute" />
            <img
              src={activeBranch.image || 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=200&q=80'}
              alt={activeBranch.name}
              className="w-full h-full object-cover relative z-10"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            {activeBranch.isPusat && (
              <span className="absolute top-1 right-1 text-[8px] px-1.5 py-0.5 rounded-full font-black bg-amber-500 text-slate-950 shadow z-20">
                PUSAT
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-extrabold text-base text-white truncate">{activeBranch.name}</h2>
            <p className="text-xs text-slate-400 truncate">{activeBranch.address}</p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => setIsBranchModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all active:scale-95 shadow-sm"
              >
                <Store className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pindah Laundry</span>
                <ChevronRight className="w-3 h-3 text-cyan-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Google Account & Saldo Koin */}
      <div className="grid grid-cols-2 gap-3">
        {/* Google Account Card */}
        <div
          onClick={() => setIsGoogleAuthModalOpen(true)}
          className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all active:scale-95 space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
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
              <span>Akun Gmail</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="font-bold text-xs text-white truncate">
            {activeGmailAccount ? activeGmailAccount.split('@')[0] : currentUser.name}
          </div>
          <div className="text-[10px] text-cyan-400 font-mono truncate">
            {activeGmailAccount || 'Login Akun Google'}
          </div>
        </div>

        {/* Saldo Koin Card */}
        <div
          onClick={() => setIsCoinModalOpen(true)}
          className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 cursor-pointer transition-all active:scale-95 space-y-1.5"
        >
          <div className="flex items-center justify-between text-amber-300">
            <span className="text-[10px] uppercase font-bold flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Saldo Koin</span>
            </span>
            <span className="text-[10px] px-1 bg-amber-500/30 rounded font-black">+ Topup</span>
          </div>
          <div className="font-black text-lg text-amber-300">
            {tokenCoins.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-amber-200/80">Koin siap pakai (Rp 25/nota)</div>
        </div>
      </div>

      {/* Operasional Settings Group */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Konfigurasi Operasional
        </h3>

        {/* QRIS Outlet Config */}
        <button
          onClick={() => setIsQrisModalOpen(true)}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/70 border border-slate-700 hover:border-cyan-500/40 transition-all text-left active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <QrCode className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">QRIS Dinamis Outlet</div>
              <div className="text-[10px] text-slate-400">Atur NMID, Merchant ID & QRIS Toko</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* IoT Machines Control */}
        <button
          onClick={() => setIsIotModalOpen(true)}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/70 border border-slate-700 hover:border-cyan-500/40 transition-all text-left active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-300 border border-orange-500/30">
              <Cpu className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Kontrol Mesin IoT</div>
              <div className="text-[10px] text-slate-400">
                {runningMachinesCount} Mesin ON • {machines.length} Total Mesin
              </div>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-700 text-slate-300">
            {runningMachinesCount} Aktif
          </span>
        </button>

        {/* Commercial PIN Mode Toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/70 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${isCommercialMode ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}>
              {isCommercialMode ? <Lock className="w-4 h-4 text-rose-400" /> : <Unlock className="w-4 h-4 text-emerald-400" />}
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {isCommercialMode ? 'Mode Komersial (PIN Aktif)' : 'Mode Demo (Bebas Akses)'}
              </div>
              <div className="text-[10px] text-slate-400">
                {isCommercialMode ? 'PIN diperlukan untuk akses menu' : 'PIN kasir/owner tidak dikunci'}
              </div>
            </div>
          </div>
          <button
            onClick={toggleAuthMode}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-all ${
              isCommercialMode
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
            }`}
          >
            {isCommercialMode ? 'Kunci ON' : 'Demo ON'}
          </button>
        </div>
      </div>

      {/* App & Device Preferences Group */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Aplikasi & Tampilan
        </h3>

        {/* Android APK Download */}
        <a
          href="/laundryhub.apk"
          download="laundryhub.apk"
          className="flex items-center justify-between p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Smartphone className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-cyan-300">Unduh Aplikasi Android Resmi</div>
              <div className="text-[10px] text-slate-400">File APK Asli siap install (Ukuran 4 MB)</div>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            APK 4 MB
          </span>
        </a>

        {/* Intro Walkthrough */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('lh_open_intro'))}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/70 border border-slate-700 hover:border-emerald-500/40 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Panduan & Pengenalan Aplikasi</div>
              <div className="text-[10px] text-slate-400">Pelajari cara kerja & alur LaundryHub</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Theme Switcher: Pastel Light vs Midnight Dark */}
        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-100">Tema Warna Tampilan</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-700 text-slate-300">
              {isDarkMode ? '🌙 Midnight Dark' : '🌸 Pastel Light'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            {/* Pastel Light Mode Option */}
            <button
              onClick={() => setIsDarkMode(false)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                !isDarkMode
                  ? 'bg-amber-500/15 border-amber-400 text-slate-900 shadow-sm ring-1 ring-amber-400'
                  : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 font-bold text-xs">
                <Sun className="w-4 h-4 text-amber-500" />
                <span className={!isDarkMode ? 'font-black' : ''}>Pastel Light</span>
              </div>
              <div className="text-[10px] text-slate-500">Lembut & Estetik</div>
              <div className="flex gap-1 mt-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-300 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-violet-300 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-sky-300 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-300 inline-block"></span>
              </div>
            </button>

            {/* Midnight Dark Mode Option */}
            <button
              onClick={() => setIsDarkMode(true)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                isDarkMode
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm ring-1 ring-cyan-400'
                  : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 font-bold text-xs">
                <Moon className="w-4 h-4 text-cyan-400" />
                <span className={isDarkMode ? 'font-black' : ''}>Midnight Dark</span>
              </div>
              <div className="text-[10px] text-slate-400">OLED & Neon Glow</div>
              <div className="flex gap-1 mt-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
              </div>
            </button>
          </div>
        </div>

        {/* Language & Currency Quick Toggle */}
        <button
          onClick={() => {
            const nextLang = language === 'id' ? 'en' : 'id';
            setLanguage(nextLang);
            if (nextLang === 'en') setCurrency('USD');
            else setCurrency('IDR');
          }}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs font-bold text-slate-200"
        >
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Bahasa & Mata Uang</span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-700/80 text-cyan-300">
            {language === 'id' ? '🇮🇩 Bahasa Indonesia (IDR)' : '🇬🇧 English (USD)'}
          </span>
        </button>

        {/* Reset Demo Data Button */}
        <button
          onClick={() => {
            if (window.confirm('Reset seluruh data transaksi kembali ke seed awal?')) {
              resetAllData();
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-bold transition-all"
        >
          <RotateCcw className="w-4 h-4 text-rose-400" />
          <span>Reset Seluruh Data Demo</span>
        </button>
      </div>

      {/* Modals */}
      <OutletQrisConfigModal isOpen={isQrisModalOpen} onClose={() => setIsQrisModalOpen(false)} />
      <IotMachineControlModal isOpen={isIotModalOpen} onClose={() => setIsIotModalOpen(false)} />
      <CoinTopupModal isOpen={isCoinModalOpen} onClose={() => setIsCoinModalOpen(false)} />
      <BranchSwitcherModal isOpen={isBranchModalOpen} onClose={() => setIsBranchModalOpen(false)} />
    </div>
  );
};
