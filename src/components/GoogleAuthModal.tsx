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
  Trash2,
  Crown,
  Check,
  Smartphone,
  Info,
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
    loginWithPersonalGoogle,
    deleteDemoAccounts,
    clearDemoOrders,
    hasDemoAccounts,
    logoutGmail,
    branches,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'personal' | 'accounts'>('personal');
  const [personalEmail, setPersonalEmail] = useState('');
  const [personalName, setPersonalName] = useState('');
  const [personalPhone, setPersonalPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('owner');
  const [alsoClearOrders, setAlsoClearOrders] = useState(false);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmDeleteDemo, setConfirmDeleteDemo] = useState(false);

  if (!isOpen) return null;

  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const email = personalEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setErrorMsg('Mohon masukkan alamat Gmail yang valid (contoh: bisnis.laundry@gmail.com)');
      return;
    }

    const result = loginWithPersonalGoogle({
      email,
      name: personalName.trim() || undefined,
      phone: personalPhone.trim() || undefined,
      role: selectedRole,
    });

    if (result.success) {
      setAuthSuccessMsg(result.message);
      setTimeout(() => {
        setAuthSuccessMsg(null);
        onClose();
      }, 1000);
    } else {
      setErrorMsg('Gagal memproses login Google.');
    }
  };

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
    logoutGmail();
    setAuthSuccessMsg('Berhasil logout dari akun Google.');
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

        {/* Header with Google Logo */}
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
              <span>Akun Google & Akses Sistem</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Mode Riil
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Gunakan akun Google pribadi Anda untuk mengelola outlet secara nyata.
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
                Akun Aktif Saat Ini:
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
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1 bg-slate-950/70 border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'personal'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Masuk Akun Google Pribadi</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('accounts')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'accounts'
                ? 'bg-slate-800 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Daftar Akun ({users.length})</span>
          </button>
        </div>

        {/* TAB 1: FORM LOGIN AKUN GOOGLE PRIBADI */}
        {activeTab === 'personal' && (
          <form onSubmit={handlePersonalSubmit} className="space-y-3.5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div>
              <label className="text-[11px] font-bold text-slate-200 block mb-1">
                Alamat Gmail Pribadi Anda:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="lh-google-email-input"
                  type="email"
                  required
                  placeholder="contoh: namamu@gmail.com"
                  value={personalEmail}
                  onChange={(e) => setPersonalEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex gap-1.5 mt-1.5">
                {['@gmail.com', '@google.com'].map((domain) => (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => {
                      if (!personalEmail.includes('@')) {
                        setPersonalEmail((prev) => `${prev.trim()}${domain}`);
                      }
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700"
                  >
                    + {domain}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-200 block mb-1">
                  Nama Pemilik / Nama Anda:
                </label>
                <input
                  id="lh-google-name-input"
                  type="text"
                  placeholder="Misal: Hendra Saputra"
                  value={personalName}
                  onChange={(e) => setPersonalName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-200 block mb-1">
                  No. Telepon / WhatsApp:
                </label>
                <input
                  id="lh-google-phone-input"
                  type="text"
                  placeholder="0812-xxxx-xxxx"
                  value={personalPhone}
                  onChange={(e) => setPersonalPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Peran / Hak Akses */}
            <div>
              <label className="text-[11px] font-bold text-slate-200 block mb-1.5">
                Pilih Hak Akses / Jabatan:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'owner' as Role, label: '👑 Owner (Pemilik)', desc: 'Kendali Penuh Toko' },
                  { id: 'kasir' as Role, label: '🖥️ Kasir POS', desc: 'Front Desk & Nota' },
                  { id: 'produksi' as Role, label: '🧺 Produksi', desc: 'Cuci & Setrika' },
                  { id: 'kurir' as Role, label: '🛵 Kurir', desc: 'Antar Jemput' },
                  { id: 'agen' as Role, label: '🏪 Agen Drop Point', desc: 'Mitra Dropship' },
                  { id: 'pelanggan' as Role, label: '👤 Pelanggan', desc: 'Lacak & Diskon' },
                ].map((r) => {
                  const isSelected = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRole(r.id)}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-glow-cyan'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-[11px]">{r.label}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">{r.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Privilege Highlight Box */}
            <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-slate-300 flex items-start gap-2">
              <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-[10px] text-slate-400 leading-relaxed">
                {selectedRole === 'owner' ? (
                  <>
                    <strong className="text-cyan-300">Mode Owner Riil:</strong> Anda memiliki hak akses penuh untuk mengatur harga jasa laundry, mengelola karyawan, memantau omzet harian, dan menerima pembayaran QRIS langsung ke rekening Anda.
                  </>
                ) : (
                  <>
                    <strong className="text-cyan-300">Mode Staf Riil:</strong> Akun Google Anda akan terdaftar sebagai tim operasional outlet dan dapat mencatat pengerjaan serta mengumpulkan komisi kerja.
                  </>
                )}
              </div>
            </div>

            <button
              id="lh-google-submit-btn"
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:opacity-95 text-slate-950 font-black text-xs shadow-glow-cyan transition-all flex items-center justify-center gap-1.5 active:scale-98"
            >
              <span>Masuk dengan Akun Google Pribadi Ini</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 2: DAFTAR AKUN & KARYAWAN TERDAFTAR */}
        {activeTab === 'accounts' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Pilih akun untuk beralih profil:</span>
              <span className="text-[10px] text-slate-400 font-mono">{users.length} akun terdaftar</span>
            </div>

            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
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
                          {user.isPersonalGoogleAccount && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 shrink-0">
                              Akun Riil
                            </span>
                          )}
                          {user.isDemo && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shrink-0">
                              Demo
                            </span>
                          )}
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
        )}

        {/* =======================================================================
            CLEAN SLATE: HAPUS SEMUA AKUN DEMO
            ======================================================================= */}
        <div className="pt-2 border-t border-slate-800">
          {hasDemoAccounts ? (
            <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <Trash2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-rose-200">
                    Bersihkan Akun Contoh (Demo)
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                    Hapus 8 akun contoh dummy (Oscar, Siti, Budi, Dewi, Agus, Slamet, Rian, Linda) agar outlet bersih dan hanya memiliki akun Google riil Anda.
                  </p>
                </div>
              </div>

              {!confirmDeleteDemo ? (
                <button
                  id="lh-delete-demo-btn"
                  type="button"
                  onClick={() => setConfirmDeleteDemo(true)}
                  className="w-full py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 hover:text-rose-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Semua Akun Demo</span>
                </button>
              ) : (
                <div className="p-3 bg-slate-900 rounded-xl border border-rose-500/50 space-y-2">
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
            <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Akun demo telah dibersihkan. Sistem berjalan 100% riil!</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>OAuth 2.0 Google Security Verified</span>
          </div>
          <span className="text-slate-400 font-mono">LaundryHub Production</span>
        </div>
      </div>
    </div>
  );
};
