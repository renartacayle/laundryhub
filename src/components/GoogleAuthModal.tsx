import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Mail,
  CheckCircle2,
  Shield,
  UserCheck,
  Building2,
  LogOut,
  Sparkles,
  ArrowRight,
  AlertCircle,
  KeyRound,
  UserPlus,
} from 'lucide-react';
import { Role } from '../types';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const {
    users,
    currentUser,
    currentRole,
    activeGmailAccount,
    loginWithGmail,
    logoutGmail,
    branches,
  } = useApp();

  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectAccount = (email: string, name?: string, avatar?: string) => {
    setErrorMsg(null);
    const result = loginWithGmail(email, name, avatar);
    if (result.success) {
      setAuthSuccessMsg(result.message);
      setTimeout(() => {
        setAuthSuccessMsg(null);
        onClose();
      }, 900);
    } else {
      setErrorMsg(result.message);
    }
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const email = customEmail.trim();
    if (!email || !email.includes('@')) {
      setErrorMsg('Mohon masukkan alamat email yang valid (contoh: nama@gmail.com)');
      return;
    }

    const result = loginWithGmail(email, customName.trim() || undefined);
    if (result.success) {
      setAuthSuccessMsg(result.message);
      setCustomEmail('');
      setCustomName('');
      setIsCustomMode(false);
      setTimeout(() => {
        setAuthSuccessMsg(null);
        onClose();
      }, 900);
    } else {
      setErrorMsg(result.message);
    }
  };

  const handleLogout = () => {
    logoutGmail();
    setAuthSuccessMsg('Berhasil logout dari akun Google.');
    setTimeout(() => {
      setAuthSuccessMsg(null);
    }, 1000);
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'owner':
        return { label: '👑 Owner / Direksi', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/90 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Google Logo */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          {/* Google G Multi-Color SVG Icon */}
          <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-md shrink-0">
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
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <span>Masuk dengan Google</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Gmail Auth
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Hak akses otomatis disesuaikan dengan akun Gmail terdaftar
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

        {/* Current Active Account Card (if logged in) */}
        {activeGmailAccount && (
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Akun Google Aktif Saat Ini:
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-bold"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-700"
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs text-white truncate">{currentUser.name}</div>
                <div className="text-[11px] text-cyan-400 font-mono truncate">{activeGmailAccount}</div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadge(currentRole).bg}`}>
                {getRoleBadge(currentRole).label}
              </span>
            </div>
          </div>
        )}

        {/* Account Selector List */}
        {!isCustomMode ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Pilih Akun Gmail Tersedia:</span>
              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 text-[11px]"
              >
                <span>+ Gunakan Gmail Lain</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {users.map((user) => {
                const isCurrent = activeGmailAccount?.toLowerCase() === user.email.toLowerCase();
                const branch = branches.find((b) => b.id === user.branchId);
                const roleBadge = getRoleBadge(user.role);

                return (
                  <button
                    key={user.id}
                    onClick={() => handleSelectAccount(user.email, user.name, user.avatar)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 group ${
                      isCurrent
                        ? 'bg-cyan-500/10 border-cyan-500/50 shadow-glow-cyan'
                        : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-white truncate">{user.name}</span>
                          {isCurrent && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono truncate">{user.email}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Cabang: <strong className="text-slate-300">{branch?.name || 'Pusat'}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${roleBadge.bg}`}>
                        {roleBadge.label}
                      </span>
                      <span className="text-[10px] text-slate-400 group-hover:text-cyan-300 flex items-center gap-0.5 transition-colors">
                        <span>Pilih</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Form Input Gmail Lain */
          <form onSubmit={handleCustomLogin} className="space-y-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>Masuk dengan Gmail Baru</span>
              </span>
              <button
                type="button"
                onClick={() => setIsCustomMode(false)}
                className="text-[11px] text-slate-400 hover:text-slate-200"
              >
                Kembali ke Daftar
              </button>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Alamat Akun Gmail:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="contoh: namamu@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex gap-1.5 mt-1.5">
                {['@gmail.com', '@google.com'].map((domain) => (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => {
                      if (!customEmail.includes('@')) {
                        setCustomEmail((prev) => `${prev.trim()}${domain}`);
                      }
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700"
                  >
                    + {domain}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Nama Lengkap (Opsional):
              </label>
              <input
                type="text"
                placeholder="Misal: Oscar Herdian"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-slate-300 space-y-1">
              <div className="flex items-center gap-1 font-bold text-cyan-300">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>Otomatisasi Hak Akses:</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Jika Gmail ini sudah didaftarkan oleh Owner sebagai Karyawan, Anda akan langsung dialihkan ke dashboard kerja (Kasir/Produksi/Kurir). Jika belum, Anda akan masuk sebagai Pelanggan.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all flex items-center justify-center gap-1.5"
            >
              <span>Lanjutkan dengan Akun Google Ini</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1 text-slate-400">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>OAuth 2.0 Google Security</span>
          </div>
          <span className="text-slate-400">LaundryHub v2.6 Cloud</span>
        </div>
      </div>
    </div>
  );
};
