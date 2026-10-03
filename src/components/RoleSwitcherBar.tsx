import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { Crown, Monitor, WashingMachine, Bike, UserCircle2, Store, Lock, Unlock, ShieldAlert } from 'lucide-react';
import { AuthGateModal } from './AuthGateModal';

export const RoleSwitcherBar: React.FC = () => {
  const { currentRole, setCurrentRole, activeGmailAccount, setIsGoogleAuthModalOpen } = useApp();

  // Mode: Demo (1-click free) vs Commercial (PIN Protected)
  const [isCommercialMode, setIsCommercialMode] = useState<boolean>(() => {
    return localStorage.getItem('lh_auth_mode') === 'commercial';
  });

  const [authModalTargetRole, setAuthModalTargetRole] = useState<Role | null>(null);

  const toggleAuthMode = () => {
    const nextMode = !isCommercialMode;
    setIsCommercialMode(nextMode);
    localStorage.setItem('lh_auth_mode', nextMode ? 'commercial' : 'demo');
  };

  const handleRoleClick = (roleId: Role) => {
    if (roleId === currentRole) return;

    if (isCommercialMode) {
      // Require PIN authorization before role switch!
      setAuthModalTargetRole(roleId);
    } else {
      // 1-Click demo switch
      setCurrentRole(roleId);
    }
  };

  const roles: { id: Role; label: string; desc: string; icon: React.ReactNode; color: string; badge: string; bgActive: string }[] = [
    {
      id: 'owner',
      label: 'Owner',
      desc: 'PIN: 8888',
      icon: <Crown className="w-4 h-4" />,
      color: 'text-amber-400',
      badge: 'border-amber-500/40 text-amber-300 bg-amber-500/10',
      bgActive: 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-glow-amber',
    },
    {
      id: 'agen',
      label: 'Agen Dropship',
      desc: 'PIN: 5678',
      icon: <Store className="w-4 h-4" />,
      color: 'text-teal-400',
      badge: 'border-teal-500/40 text-teal-300 bg-teal-500/10',
      bgActive: 'bg-teal-500/20 border-teal-500 text-teal-200 shadow-teal-500/20 shadow-lg',
    },
    {
      id: 'kasir',
      label: 'Kasir POS',
      desc: 'PIN: 1234',
      icon: <Monitor className="w-4 h-4" />,
      color: 'text-cyan-400',
      badge: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10',
      bgActive: 'bg-cyan-500/20 border-cyan-500 text-cyan-200 shadow-glow-cyan',
    },
    {
      id: 'produksi',
      label: 'Produksi',
      desc: 'PIN: 2345',
      icon: <WashingMachine className="w-4 h-4" />,
      color: 'text-orange-400',
      badge: 'border-orange-500/40 text-orange-300 bg-orange-500/10',
      bgActive: 'bg-orange-500/20 border-orange-500 text-orange-200 shadow-orange-500/20 shadow-lg',
    },
    {
      id: 'kurir',
      label: 'Kurir',
      desc: 'PIN: 3456',
      icon: <Bike className="w-4 h-4" />,
      color: 'text-purple-400',
      badge: 'border-purple-500/40 text-purple-300 bg-purple-500/10',
      bgActive: 'bg-purple-500/20 border-purple-500 text-purple-200 shadow-glow-violet',
    },
    {
      id: 'pelanggan',
      label: 'Pelanggan',
      desc: 'PIN: 0000',
      icon: <UserCircle2 className="w-4 h-4" />,
      color: 'text-emerald-400',
      badge: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10',
      bgActive: 'bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-glow-emerald',
    },
  ];

  return (
    <>
      <div className="w-full bg-slate-900/95 border-b border-slate-800/80 backdrop-blur-md px-2 sm:px-3 py-1 sm:py-1.5 sticky top-0 z-40 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-nowrap py-0.5">
        {/* Google Auth button in switcher */}
        <button
          type="button"
          onClick={() => setIsGoogleAuthModalOpen(true)}
          className={`flex-shrink-0 flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold border transition-all active:scale-95 ${
            activeGmailAccount
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-glow-cyan'
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title="Login Akun Google / Gmail Karyawan"
        >
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" viewBox="0 0 24 24">
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
          <span className="truncate max-w-[80px] sm:max-w-[120px]">
            {activeGmailAccount ? activeGmailAccount.split('@')[0] : 'Gmail'}
          </span>
        </button>

        {/* Mode toggle */}
        <button
          type="button"
          onClick={toggleAuthMode}
          className={`flex-shrink-0 flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold border transition-all ${
            isCommercialMode
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-sm'
              : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
          }`}
          title="Klik untuk beralih antara Mode Demo dan Mode Komersial Terkunci PIN"
        >
          {isCommercialMode ? (
            <>
              <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400" />
              <span>PIN On</span>
            </>
          ) : (
            <>
              <Unlock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
              <span>Demo</span>
            </>
          )}
        </button>

        <div className="h-4 w-[1px] bg-slate-800 flex-shrink-0 hidden sm:block" />

        {/* Roles list */}
        {roles.map((r) => {
          const isActive = currentRole === r.id;
          return (
            <button
              key={r.id}
              onClick={() => handleRoleClick(r.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-medium transition-all duration-200 whitespace-nowrap active:scale-95 ${
                isActive
                  ? `${r.bgActive} font-bold`
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className={r.color}>{r.icon}</span>
              <span>{r.label}</span>
              <span className="hidden lg:inline text-[9px] opacity-60">({r.desc})</span>
            </button>
          );
        })}
      </div>
    </div>

      {/* Auth PIN Gate Modal */}
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
