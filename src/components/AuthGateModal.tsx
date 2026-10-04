import React, { useState } from 'react';
import { Role } from '../types';
import { Shield, Lock, X, CheckCircle, AlertTriangle, KeyRound } from 'lucide-react';

interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole: Role;
  onSuccess: () => void;
}

// Preset default commercial PINs per role
export const ROLE_DEFAULT_PINS: Record<Role, { pin: string; title: string; defaultUser: string }> = {
  owner: { pin: '8888', title: 'Owner & Direksi', defaultUser: 'Budi Pratama (Owner)' },
  operator: { pin: '1111', title: 'Operator Cabang All-in-One', defaultUser: 'Siti Rahmawati (Solo Operator)' },
  kasir: { pin: '1234', title: 'Kasir Front Desk', defaultUser: 'Dewi Lestari (Kasir)' },
  produksi: { pin: '2345', title: 'Workshop Produksi', defaultUser: 'Agus Santoso (Produksi)' },
  kurir: { pin: '3456', title: 'Armada Kurir', defaultUser: 'Rian Hidayat (Kurir)' },
  agen: { pin: '5678', title: 'Mitra Drop Point', defaultUser: 'Siti Rahmawati (Agen)' },
  pelanggan: { pin: '0000', title: 'Portal Member', defaultUser: 'Anisa Wijaya (Member)' },
};

export const AuthGateModal: React.FC<AuthGateModalProps> = ({
  isOpen,
  onClose,
  targetRole,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const roleMeta = ROLE_DEFAULT_PINS[targetRole];

  const handleKeyClick = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg('');

      // Auto submit when 4 digits reached
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const verifyPin = (enteredPin: string) => {
    if (enteredPin === roleMeta.pin) {
      setPin('');
      setErrorMsg('');
      onSuccess();
    } else {
      setErrorMsg(`PIN salah! (Hint default: ${roleMeta.pin})`);
      setTimeout(() => setPin(''), 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-center space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Autentikasi Hak Akses Komersial</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Otorisasi PIN untuk peran <strong className="text-amber-300">{roleMeta.title}</strong>
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center gap-3 py-2">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-amber-400 scale-125 shadow-glow-amber'
                    : 'bg-slate-800 border border-slate-600'
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        {errorMsg ? (
          <div className="text-xs font-semibold text-rose-400 animate-pulse flex items-center justify-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{errorMsg}</span>
          </div>
        ) : (
          <div className="text-[11px] text-slate-500">
            Ketik 4 digit PIN kasir/staf (Default: <strong className="text-slate-400 font-mono">{roleMeta.pin}</strong>)
          </div>
        )}

        {/* Keypad 3x4 */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyClick(digit)}
              className="h-12 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-white font-bold text-lg border border-slate-700/60 transition-all flex items-center justify-center shadow"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              // Quick fill default PIN
              verifyPin(roleMeta.pin);
            }}
            className="h-12 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 text-amber-300 font-bold text-xs border border-amber-500/30 transition-all flex items-center justify-center"
            title="Bypass demo"
          >
            Auto PIN
          </button>
          <button
            type="button"
            onClick={() => handleKeyClick('0')}
            className="h-12 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-white font-bold text-lg border border-slate-700/60 transition-all flex items-center justify-center shadow"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-12 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-rose-400 font-bold text-sm border border-slate-700/60 transition-all flex items-center justify-center shadow"
          >
            ⌫
          </button>
        </div>

        {/* Footer info */}
        <div className="pt-2 text-[10px] text-slate-500 border-t border-slate-800">
          Sistem Keamanan Toko Fisik LAUNDRYHUB • Anti Privilege Escalation
        </div>
      </div>
    </div>
  );
};
