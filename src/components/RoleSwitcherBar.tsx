import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { Crown, Monitor, WashingMachine, Bike, UserCircle2, Store, Lock, Unlock, ShieldAlert } from 'lucide-react';
import { AuthGateModal } from './AuthGateModal';

export const RoleSwitcherBar: React.FC = () => {
  const { currentRole, setCurrentRole } = useApp();

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
    <div className="w-full bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md px-3 py-2 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <button
            type="button"
            onClick={toggleAuthMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all ${
              isCommercialMode
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-sm'
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
            }`}
            title="Klik untuk beralih antara Mode Demo dan Mode Komersial Terkunci PIN"
          >
            {isCommercialMode ? (
              <>
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>Mode Komersial (PIN On)</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mode Demo Bebas (1-Click)</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar flex-1 justify-end max-w-full">
          {roles.map((r) => {
            const isActive = currentRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => handleRoleClick(r.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? `${r.bgActive} scale-105 font-semibold`
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span className={r.color}>{r.icon}</span>
                <span className="font-medium">{r.label}</span>
                <span className="hidden md:inline text-[10px] opacity-60">({r.desc})</span>
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
    </div>
  );
};
