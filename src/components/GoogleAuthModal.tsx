import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Mail,
  CheckCircle2,
  Shield,
  Building2,
  LogOut,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Trash2,
  Crown,
  Smartphone,
  Copy,
  Check,
  Lock,
  UserPlus,
} from 'lucide-react';
import { Role } from '../types';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    currentRole,
    activeGmailAccount,
    activeOwnerUid,
    currentOwnerProfile,
    loginOwnerWithGoogleAndPin,
    registerNewOwner,
    loginWithPersonalGoogle,
    deleteDemoAccounts,
    clearDemoOrders,
    hasDemoAccounts,
    logoutOwner,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPin, setLoginPin] = useState('');
  
  // Register form state
  const [regEmail, setRegEmail] = useState('');
  const [regName, setRegName] = useState('');
  const [regOutlet, setRegOutlet] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPin, setRegPin] = useState('');
  
  const [alsoClearOrders, setAlsoClearOrders] = useState(false);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmDeleteDemo, setConfirmDeleteDemo] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  if (!isOpen) return null;

  const handleCopyUid = () => {
    const uidToCopy = currentUser.ownerUid || activeOwnerUid;
    if (uidToCopy) {
      navigator.clipboard.writeText(uidToCopy);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const email = loginEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setErrorMsg('Mohon masukkan alamat Gmail yang valid (contoh: bisnis.laundry@gmail.com)');
      return;
    }

    const pin = loginPin.trim() || '8888';
    const res = loginOwnerWithGoogleAndPin(email, pin);

    if (res.success) {
      setAuthSuccessMsg(res.message);
      setTimeout(() => {
        setAuthSuccessMsg(null);
        onClose();
      }, 1000);
    } else {
      // If email is not yet registered in registry, allow instant setup as owner with their unique UID
      if (res.message.includes('belum terdaftar')) {
        const fallbackRes = loginWithPersonalGoogle({
          email,
          pin,
          name: email.split('@')[0],
          role: 'owner',
        });
        if (fallbackRes.success) {
          setAuthSuccessMsg(`Selamat datang! Outlet baru dibuat dengan UID: ${fallbackRes.user.ownerUid}`);
          setTimeout(() => {
            setAuthSuccessMsg(null);
            onClose();
          }, 1000);
          return;
        }
      }
      setErrorMsg(res.message);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const email = regEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setErrorMsg('Mohon masukkan alamat Gmail yang valid.');
      return;
    }

    const name = regName.trim();
    if (!name) {
      setErrorMsg('Mohon masukkan nama pemilik outlet.');
      return;
    }

    const res = registerNewOwner({
      email,
      name,
      outletName: regOutlet.trim() || `${name}'s LaundryHub`,
      phone: regPhone.trim() || '0812-8899-7701',
      pin: regPin.trim() || '8888',
    });

    if (res.success) {
      setAuthSuccessMsg(res.message);
      setTimeout(() => {
        setAuthSuccessMsg(null);
        onClose();
      }, 1200);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleDeleteDemo = () => {
    setErrorMsg(null);
    const result = deleteDemoAccounts();
    if (alsoClearOrders) {
      clearDemoOrders();
    }
    setConfirmDeleteDemo(false);
    setAuthSuccessMsg(
      `${result.message} ${alsoClearOrders ? 'Transaksi demo juga telah dibersihkan.' : ''}`
    );
    setTimeout(() => {
      setAuthSuccessMsg(null);
    }, 2500);
  };

  const handleLogout = () => {
    logoutOwner();
    setAuthSuccessMsg('Berhasil keluar dari sesi Owner.');
    setTimeout(() => {
      setAuthSuccessMsg(null);
    }, 1000);
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'owner':
        return { label: '👑 Owner / Pemilik', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'kasir':
        return { label: '🖥️ Kasir Front Desk', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
      case 'produksi':
        return { label: '🧺 Staf Produksi', bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40' };
      case 'kurir':
        return { label: '🛵 Armada Kurir', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'agen':
        return { label: '🏪 Mitra Drop Point', bg: 'bg-teal-500/20 text-teal-300 border-teal-500/40' };
      case 'pelanggan':
        return { label: '👤 Member Pelanggan', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      default:
        return { label: role, bg: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/90 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Google Logo & Security Notice */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
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
          </div>

          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>Autentikasi Akun Owner</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                UID Terisolasi
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Setiap Owner memiliki UID sendiri. Tidak dapat saling masuk antar owner.
            </p>
          </div>
        </div>

        {/* Success or Error alert */}
        {authSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{authSuccessMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Current Active Account Card with Owner UID */}
        {activeGmailAccount && (
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Sesi Akun Aktif Saat Ini:
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-bold transition-colors"
              >
                <LogOut className="w-3 h-3" />
                <span>Keluar Sesi</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs text-white truncate flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                  {currentUser.isPersonalGoogleAccount && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                      Pribadi
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-cyan-400 font-mono truncate">{activeGmailAccount}</div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadge(currentRole).bg}`}>
                {getRoleBadge(currentRole).label}
              </span>
            </div>

            {/* Owner UID Badge */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400 text-[11px]">Owner UID:</span>
                <span className="font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30 text-[11px]">
                  {currentUser.ownerUid || activeOwnerUid}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyUid}
                className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                title="Salin Owner UID"
              >
                {copiedUid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUid ? 'Tersalin' : 'Salin UID'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation: Secure Login vs Register Outlet */}
        <div className="flex items-center gap-2 p-1 bg-slate-950/70 border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Masuk Owner (PIN + UID)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Daftar Owner Baru (Terbit UID)</span>
          </button>
        </div>

        {/* TAB 1: FORM LOGIN AKUN OWNER (EMAIL + PIN) */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div>
              <label className="text-[11px] font-bold text-slate-200 block mb-1">
                Alamat Gmail Pemilik Outlet:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="lh-google-email-input"
                  type="email"
                  required
                  placeholder="contoh: hendra.laundry@gmail.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex gap-1.5 mt-1.5">
                {['@gmail.com', '@google.com'].map((domain) => (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => {
                      if (!loginEmail.includes('@')) {
                        setLoginEmail((prev) => `${prev.trim()}${domain}`);
                      }
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700"
                  >
                    + {domain}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-200 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>PIN Keamanan Owner (4-6 Digit):</span>
                </label>
                <span className="text-[10px] text-slate-400">Default PIN baru: 8888</span>
              </div>
              <input
                id="lh-google-pin-input"
                type="password"
                maxLength={6}
                placeholder="Masukkan PIN (misal: 8888)"
                value={loginPin}
                onChange={(e) => setLoginPin(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono tracking-widest focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Security Guarantee Box */}
            <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-[11px] text-slate-300 flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[10px] text-slate-400 leading-relaxed">
                <strong className="text-amber-300">Privasi UID Mandiri:</strong> Seluruh database outlet, nota, pelanggan, dan omzet terikat pada UID Owner Anda. Pemilik lain tidak dapat mengakses toko Anda tanpa kombinasi Gmail dan PIN yang valid.
              </div>
            </div>

            <button
              id="lh-google-submit-btn"
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:opacity-95 text-slate-950 font-black text-xs shadow-glow-amber transition-all flex items-center justify-center gap-1.5 active:scale-98"
            >
              <span>Masuk ke Outlet (Verifikasi UID)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 2: FORM REGISTRASI OWNER BARU & PENERBITAN UID */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div>
              <label className="text-[11px] font-bold text-slate-200 block mb-1">
                Alamat Gmail Pribadi:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="lh-google-reg-email"
                  type="email"
                  required
                  placeholder="contoh: owner.baru@gmail.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-200 block mb-1">
                  Nama Lengkap Pemilik:
                </label>
                <input
                  id="lh-google-name-input"
                  type="text"
                  required
                  placeholder="Misal: Hendra Saputra"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-200 block mb-1">
                  Nama Outlet / Usaha Laundry:
                </label>
                <input
                  id="lh-google-outlet-input"
                  type="text"
                  placeholder="Misal: LaundryHub Kemang"
                  value={regOutlet}
                  onChange={(e) => setRegOutlet(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-200 block mb-1">
                  No. WhatsApp Aktif:
                </label>
                <input
                  id="lh-google-phone-input"
                  type="text"
                  placeholder="0812-xxxx-xxxx"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-200 block mb-1">
                  Buat PIN Keamanan (4-6 Digit):
                </label>
                <input
                  id="lh-google-reg-pin"
                  type="password"
                  maxLength={6}
                  placeholder="Contoh: 8888"
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono tracking-widest focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-slate-300 flex items-start gap-2">
              <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-[10px] text-slate-400 leading-relaxed">
                Sistem akan membuatkan <strong className="text-cyan-300">Owner UID Baru (Unik)</strong> dan menginisialisasi database outlet bersih khusus untuk Anda.
              </div>
            </div>

            <button
              id="lh-google-reg-submit-btn"
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:opacity-95 text-slate-950 font-black text-xs shadow-glow-cyan transition-all flex items-center justify-center gap-1.5 active:scale-98"
            >
              <span>Daftar & Terbitkan Owner UID Baru</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Clean Demo Accounts Section */}
        <div className="pt-2 border-t border-slate-800">
          {hasDemoAccounts ? (
            <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
              <div className="flex items-start gap-2">
                <Trash2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-rose-200">
                    Bersihkan Akun Contoh (Demo)
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                    Hapus 8 akun contoh dummy agar database bersih dan hanya berisi akun owner riil Anda.
                  </p>
                </div>
              </div>

              {!confirmDeleteDemo ? (
                <button
                  id="lh-delete-demo-btn"
                  type="button"
                  onClick={() => setConfirmDeleteDemo(true)}
                  className="w-full py-1.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 hover:text-rose-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Semua Akun Demo</span>
                </button>
              ) : (
                <div className="p-2.5 bg-slate-900 rounded-xl border border-rose-500/50 space-y-2">
                  <p className="text-[11px] text-rose-200 font-semibold">
                    Konfirmasi: Hapus semua akun demo dummy sekarang?
                  </p>

                  <label className="flex items-center gap-2 text-[10px] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alsoClearOrders}
                      onChange={(e) => setAlsoClearOrders(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-800 text-rose-500 focus:ring-0"
                    />
                    <span>Bersihkan juga transaksi demo (mulai dari 0 nota riil)</span>
                  </label>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      id="lh-confirm-delete-demo-btn"
                      type="button"
                      onClick={handleDeleteDemo}
                      className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-colors"
                    >
                      Ya, Hapus Akun Demo
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteDemo(false)}
                      className="py-1.5 px-3 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-2.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Database bersih: berjalan 100% dengan akun riil ber-UID mandiri.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Multi-Tenant UID Security</span>
          </div>
          <span className="text-slate-400 font-mono">LaundryHub Production</span>
        </div>
      </div>
    </div>
  );
};
