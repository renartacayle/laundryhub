import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MachineIoT, Order } from '../types';
import {
  WashingMachine,
  Flame,
  X,
  Play,
  Square,
  AlertTriangle,
  Clock,
  Zap,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface IotMachineControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMachineId?: string;
}

export const IotMachineControlModal: React.FC<IotMachineControlModalProps> = ({
  isOpen,
  onClose,
  selectedMachineId,
}) => {
  const { machines, orders, startIotMachine, stopIotMachine } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'washer' | 'dryer'>('all');
  const [targetOrderMap, setTargetOrderMap] = useState<Record<string, string>>({});
  const [durationMap, setDurationMap] = useState<Record<string, number>>({});
  const [notificationMsg, setNotificationMsg] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const filteredMachines = machines.filter((m) => {
    if (activeTab === 'all') return true;
    return m.type === activeTab;
  });

  // Eligible orders for washer (antrean / cuci) and dryer (cuci / kering)
  const getEligibleOrders = (machineType: 'washer' | 'dryer'): Order[] => {
    if (machineType === 'washer') {
      return orders.filter((o) => o.currentStatus === 'antrean' || o.currentStatus === 'cuci');
    } else {
      return orders.filter((o) => o.currentStatus === 'cuci' || o.currentStatus === 'kering');
    }
  };

  const handleStart = (machine: MachineIoT) => {
    const orderId = targetOrderMap[machine.id];
    if (!orderId) {
      setNotificationMsg({
        text: `⚠️ Anti-Fraud Shield: Pilih Order yang sah untuk menyalakan ${machine.name}!`,
        isError: true,
      });
      return;
    }

    const duration = durationMap[machine.id] || (machine.type === 'washer' ? 45 : 40);
    const result = startIotMachine(machine.id, orderId, duration);

    setNotificationMsg({
      text: result.message,
      isError: !result.success,
    });
  };

  const formatTimer = (secondsLeft: number) => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-emerald-500 text-slate-950 rounded-2xl shadow-glow-cyan">
              <WashingMachine className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Snapbridge IoT Machine Center</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Anti-Fraud Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Kontrol hardware mesin cuci & pengering secara otomatis terintegrasi invoice
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Status Notification Banner */}
        {notificationMsg && (
          <div
            className={`px-6 py-2.5 text-xs font-medium flex items-center justify-between ${
              notificationMsg.isError
                ? 'bg-rose-950/80 text-rose-200 border-b border-rose-800/50'
                : 'bg-emerald-950/80 text-emerald-200 border-b border-emerald-800/50'
            }`}
          >
            <span>{notificationMsg.text}</span>
            <button
              onClick={() => setNotificationMsg(null)}
              className="text-[11px] underline opacity-80 hover:opacity-100"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Tab Filter */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semua Mesin ({machines.length})
            </button>
            <button
              onClick={() => setActiveTab('washer')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'washer'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <WashingMachine className="w-3.5 h-3.5" />
              Washer (Mesin Cuci)
            </button>
            <button
              onClick={() => setActiveTab('dryer')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'dryer'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Dryer (Pengering)
            </button>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Protokol: MQTT / WebSocket Secure
          </div>
        </div>

        {/* Machine Cards List */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMachines.map((m) => {
              const eligibleOrders = getEligibleOrders(m.type);
              const isRunning = m.status === 'running';
              const isCompleted = m.status === 'completed';
              const isMaintenance = m.status === 'maintenance';

              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isRunning
                      ? 'bg-cyan-950/20 border-cyan-500/60 shadow-glow-cyan'
                      : isCompleted
                      ? 'bg-emerald-950/20 border-emerald-500/50'
                      : isMaintenance
                      ? 'bg-slate-900 border-rose-500/40 opacity-75'
                      : 'bg-slate-800/40 border-slate-700/60'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2 rounded-xl ${
                          m.type === 'washer'
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'bg-orange-500/20 text-orange-400'
                        }`}
                      >
                        {m.type === 'washer' ? (
                          <WashingMachine
                            className={`w-5 h-5 ${isRunning ? 'animate-spin-slow' : ''}`}
                          />
                        ) : (
                          <Flame
                            className={`w-5 h-5 ${isRunning ? 'animate-pulse' : ''}`}
                          />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{m.name}</h4>
                        <p className="text-[11px] text-slate-400">{m.model}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isRunning
                          ? 'bg-cyan-500 text-slate-950 font-black animate-pulse'
                          : isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : isMaintenance
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {isRunning
                        ? 'Menyala'
                        : isCompleted
                        ? 'Selesai'
                        : isMaintenance
                        ? 'Maintenance'
                        : 'Standby / Idle'}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                    {/* Running State */}
                    {isRunning && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between bg-slate-950/70 p-3 rounded-xl border border-cyan-500/30">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">
                              Sisa Waktu
                            </span>
                            <div className="text-2xl font-black font-mono text-cyan-400">
                              {formatTimer(m.timerSecondsLeft)}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">
                              Invoice Terkunci
                            </span>
                            <div className="text-xs font-bold text-white">{m.currentInvoiceNo}</div>
                            <span className="text-[10px] text-emerald-400 font-mono">
                              {m.energyKwh} kWh
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-cyan-400 h-1.5 transition-all duration-1000"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round(
                                  ((m.totalDurationSeconds - m.timerSecondsLeft) /
                                    m.totalDurationSeconds) *
                                    100
                                )
                              )}%`,
                            }}
                          />
                        </div>

                        <button
                          onClick={() => stopIotMachine(m.id)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-900/40 hover:border-rose-500/50 text-rose-400 text-xs font-semibold border border-slate-700 transition-colors"
                        >
                          <Square className="w-3.5 h-3.5" />
                          <span>Hentikan Mesin (Emergency Stop)</span>
                        </button>
                      </div>
                    )}

                    {/* Completed State */}
                    {isCompleted && (
                      <div className="space-y-3">
                        <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Siklus Selesai! Pakaian siap diangkat.</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{m.energyKwh} kWh</span>
                        </div>
                        <button
                          onClick={() => stopIotMachine(m.id)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-glow-emerald"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Bongkar Mesin & Setel ke Idle</span>
                        </button>
                      </div>
                    )}

                    {/* Idle State: Form to bind with valid order */}
                    {!isRunning && !isCompleted && !isMaintenance && (
                      <div className="space-y-2.5">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                            Pilih Order Masuk (Wajib):
                          </label>
                          <select
                            value={targetOrderMap[m.id] || ''}
                            onChange={(e) =>
                              setTargetOrderMap((prev) => ({ ...prev, [m.id]: e.target.value }))
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                          >
                            <option value="">-- Pilih Order Valid --</option>
                            {eligibleOrders.map((ord) => (
                              <option key={ord.id} value={ord.id}>
                                {ord.invoiceNo} — {ord.customerName} ({ord.weightKg || ord.itemCount} {ord.weightKg ? 'kg' : 'pcs'})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="text-[10px] text-slate-400 block mb-1">Durasi</label>
                            <select
                              value={durationMap[m.id] || (m.type === 'washer' ? 45 : 40)}
                              onChange={(e) =>
                                setDurationMap((prev) => ({
                                  ...prev,
                                  [m.id]: parseInt(e.target.value, 10),
                                }))
                              }
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                            >
                              <option value={30}>30 Menit (Quick)</option>
                              <option value={45}>45 Menit (Standar)</option>
                              <option value={60}>60 Menit (Heavy / Blanket)</option>
                            </select>
                          </div>
                          <div className="flex-1 flex items-end">
                            <button
                              onClick={() => handleStart(m)}
                              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-glow-cyan"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Nyalakan IoT</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Maintenance State */}
                    {isMaintenance && (
                      <div className="p-3 bg-rose-950/30 rounded-xl border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Mesin dalam perbaikan servis berkala teknisi resmi.</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Gateway Modul IoT: SNAPBRIDGE-GW-V3-CONNECTED</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Tutup Panel
          </button>
        </div>
      </div>
    </div>
  );
};
