import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CourierTask } from '../types';
import {
  Bike,
  MapPin,
  Clock,
  Phone,
  Navigation,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  X,
  Compass,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface KurirDashboardProps {
  currentSubTab?: string;
}

export const KurirDashboard: React.FC<KurirDashboardProps> = ({ currentSubTab = 'kurir-tasks' }) => {
  const {
    courierTasks,
    currentUser,
    updateCourierTaskStatus,
    updateOrderStatus,
    orders,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tasks' | 'map' | 'history'>(
    currentSubTab === 'kurir-map' ? 'map' : currentSubTab === 'kurir-history' ? 'history' : 'tasks'
  );

  React.useEffect(() => {
    if (currentSubTab === 'kurir-map') setActiveTab('map');
    else if (currentSubTab === 'kurir-history') setActiveTab('history');
    else setActiveTab('tasks');
  }, [currentSubTab]);

  const [activeTaskForCod, setActiveTaskForCod] = useState<CourierTask | null>(null);
  const [codAmountReceived, setCodAmountReceived] = useState<number>(0);

  const pendingTasks = courierTasks.filter((t) => t.status !== 'completed');
  const completedTasks = courierTasks.filter((t) => t.status === 'completed');

  const handleUpdateStatus = (task: CourierTask, nextStatus: CourierTask['status']) => {
    if (nextStatus === 'completed' && task.amountToCollect > 0) {
      // Must collect COD first!
      setActiveTaskForCod(task);
      setCodAmountReceived(task.amountToCollect);
      return;
    }

    updateCourierTaskStatus(task.id, nextStatus);

    // If order delivery is completed, mark order status as selesai
    if (nextStatus === 'completed' && task.orderId) {
      updateOrderStatus(task.orderId, 'selesai', currentUser);
    }
  };

  const handleConfirmCod = () => {
    if (!activeTaskForCod) return;

    updateCourierTaskStatus(activeTaskForCod.id, 'completed', codAmountReceived);

    if (activeTaskForCod.orderId) {
      updateOrderStatus(activeTaskForCod.orderId, 'selesai', currentUser);
    }

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    setActiveTaskForCod(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Courier Header */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'tasks'
                ? 'bg-purple-600 text-white shadow-glow-violet'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Tugas Aktif ({pendingTasks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'map'
                ? 'bg-purple-600 text-white shadow-glow-violet'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Peta Rute Delivery (Simulasi)</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white shadow-glow-violet'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Riwayat Selesai ({completedTasks.length})</span>
          </button>
        </div>

        <div className="text-xs text-slate-400">
          Kurir Bertugas: <strong className="text-purple-300">{currentUser.name}</strong>
        </div>
      </div>

      {/* 1. TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl glass-card border border-purple-500/30 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Antrean Penjemputan & Pengantaran Pakaian</h3>
              <p className="text-xs text-slate-400">
                Pilih status untuk memperbarui progres langsung ke dashboard kasir & pelanggan
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
              Komisi: +Rp 3.000 / trip selesai
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="p-5 rounded-2xl glass-panel border border-slate-700/80 space-y-4 hover:border-purple-500/50 transition-all"
              >
                {/* Header Card */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2.5 rounded-xl ${
                        task.type === 'pickup'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}
                    >
                      <Bike className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {task.type === 'pickup' ? '🛵 Jemput dari Rumah' : '📦 Antar Cucian Bersih'}
                      </span>
                      <h4 className="text-sm font-bold text-white">{task.customerName}</h4>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      task.status === 'on_the_way'
                        ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {task.status === 'on_the_way' ? 'Dalam Perjalanan' : 'Menunggu Dispatch'}
                  </span>
                </div>

                {/* Address & Phone */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-start gap-2 text-slate-300">
                    <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{task.customerAddress}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <a
                      href={`https://wa.me/${task.customerPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-cyan-400 hover:underline"
                    >
                      {task.customerPhone} (Chat WA)
                    </a>
                  </div>
                  {task.notes && (
                    <div className="text-[11px] text-amber-300 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
                      📝 {task.notes}
                    </div>
                  )}
                </div>

                {/* Amount to Collect (COD) */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Tagihan Pembayaran:</span>
                  <div className="text-right">
                    <div className="text-sm font-black font-mono text-emerald-400">
                      {task.amountToCollect > 0
                        ? `Rp ${task.amountToCollect.toLocaleString('id-ID')}`
                        : 'LUNAS (Tanpa Tagihan)'}
                    </div>
                    <span className="text-[10px] text-slate-500">{task.paymentMethod}</span>
                  </div>
                </div>

                {/* Status Update Stepper Buttons */}
                <div className="pt-2 border-t border-slate-800 flex gap-2">
                  {task.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(task, 'on_the_way')}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-glow-violet"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Mulai Berangkat (Dalam Perjalanan)</span>
                    </button>
                  )}

                  {task.status === 'on_the_way' && (
                    <button
                      onClick={() => handleUpdateStatus(task, 'completed')}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-glow-emerald"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{task.amountToCollect > 0 ? 'Terima COD & Selesai' : 'Konfirmasi Selesai Diantar'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. SIMULATED ROUTE MAP TAB */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl glass-card border border-purple-500/30">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-purple-400" />
              <span>Simulasi Navigasi GPS & Titik Antar</span>
            </h3>
            <p className="text-xs text-slate-400">
              Visualisasi rute armada kurir dari Hub Laundry ke alamat pelanggan
            </p>
          </div>

          {/* Interactive Map Visual Mockup */}
          <div className="relative w-full h-[450px] bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden flex items-center justify-center p-6 shadow-2xl">
            {/* Grid Pattern Background */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, #a855f7 1px, transparent 0)',
                backgroundSize: '32px 32px',
              }}
            />

            {/* Simulated Road Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M 120 180 Q 280 120 450 240 T 780 200"
                fill="none"
                stroke="#6366f1"
                strokeWidth="4"
                strokeDasharray="8 6"
                className="animate-pulse"
              />
              <path
                d="M 280 120 Q 320 320 540 360"
                fill="none"
                stroke="#a855f7"
                strokeWidth="3"
                strokeDasharray="6 4"
              />
            </svg>

            {/* Waypoint 1: LaundryHub Hub Central */}
            <div className="absolute left-[12%] top-[38%] p-3 rounded-2xl bg-slate-900 border-2 border-cyan-400 shadow-glow-cyan text-center z-10">
              <div className="w-8 h-8 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300 font-bold mb-1">
                HQ
              </div>
              <div className="text-[11px] font-bold text-white">Hub Kemang</div>
              <div className="text-[9px] text-slate-400">Titik Keberangkatan</div>
            </div>

            {/* Waypoint 2: Destination 1 */}
            <div className="absolute left-[52%] top-[48%] p-3 rounded-2xl bg-slate-900 border-2 border-purple-500 shadow-glow-violet text-center z-10 animate-bounce">
              <div className="w-8 h-8 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold mb-1">
                📍
              </div>
              <div className="text-[11px] font-bold text-white">Anisa Rahmawati</div>
              <div className="text-[9px] text-emerald-400 font-mono">COD Rp 31.500</div>
            </div>

            {/* Waypoint 3: Destination 2 */}
            <div className="absolute right-[16%] top-[35%] p-3 rounded-2xl bg-slate-900 border-2 border-amber-500 text-center z-10">
              <div className="w-8 h-8 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300 font-bold mb-1">
                🏠
              </div>
              <div className="text-[11px] font-bold text-white">Reza Rahadian</div>
              <div className="text-[9px] text-slate-400">Sudah Lunas</div>
            </div>

            {/* Courier Live Pin */}
            <div className="absolute left-[36%] top-[32%] p-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-xl flex items-center gap-1.5 px-3 z-20">
              <Bike className="w-4 h-4 animate-spin-slow" />
              <span className="text-[10px] font-bold">Rian (Kurir On The Way)</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl glass-card border border-slate-700/80">
            <h3 className="text-sm font-bold text-white">Riwayat Pengantaran Sukses</h3>
            <p className="text-xs text-slate-400">Total pesanan yang telah diserahterimakan ke konsumen</p>
          </div>

          <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Invoice</th>
                  <th className="p-3.5">Pelanggan</th>
                  <th className="p-3.5">Alamat Pengantaran</th>
                  <th className="p-3.5">Nominal COD</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {completedTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono font-bold text-purple-300">{t.invoiceNo}</td>
                    <td className="p-3.5 font-bold text-white">{t.customerName}</td>
                    <td className="p-3.5 text-slate-400">{t.customerAddress}</td>
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">
                      {t.amountToCollect > 0 ? `Rp ${t.amountToCollect.toLocaleString('id-ID')}` : 'Lunas (Online)'}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Selesai Diantar
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: COD Cash Collection Confirmation */}
      {activeTaskForCod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Konfirmasi Penerimaan COD</span>
              </h3>
              <button
                onClick={() => setActiveTaskForCod(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-2">
              <div className="text-slate-300">
                Pelanggan: <strong className="text-white">{activeTaskForCod.customerName}</strong>
              </div>
              <div className="text-slate-300">
                No. Nota: <span className="font-mono text-purple-300">{activeTaskForCod.invoiceNo}</span>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Jumlah Uang COD Diterima:</label>
                <div className="text-2xl font-black font-mono text-emerald-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  Rp {activeTaskForCod.amountToCollect.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setActiveTaskForCod(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmCod}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-glow-emerald"
              >
                Uang Diterima & Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
