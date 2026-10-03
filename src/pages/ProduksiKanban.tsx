import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import {
  WashingMachine,
  Flame,
  Shirt,
  PackageCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Sparkles,
  Info,
  X,
  Play,
  UserCheck,
  Zap,
} from 'lucide-react';
import { IotMachineControlModal } from '../components/IotMachineControlModal';

interface ProduksiKanbanProps {
  currentSubTab?: string;
}

export const ProduksiKanban: React.FC<ProduksiKanbanProps> = ({ currentSubTab = 'prod-kanban' }) => {
  const {
    orders,
    currentBranchId,
    currentUser,
    users,
    updateOrderStatus,
    machines,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'kanban' | 'iot' | 'productivity'>(
    currentSubTab === 'prod-iot' ? 'iot' : currentSubTab === 'prod-productivity' ? 'productivity' : 'kanban'
  );

  React.useEffect(() => {
    if (currentSubTab === 'prod-iot') setActiveTab('iot');
    else if (currentSubTab === 'prod-productivity') setActiveTab('productivity');
    else setActiveTab('kanban');
  }, [currentSubTab]);

  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('all');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [isIotModalOpen, setIsIotModalOpen] = useState(false);
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);

  // Workflow Columns definitions
  const columns: { id: OrderStatus; title: string; icon: React.ReactNode; color: string; badge: string }[] = [
    {
      id: 'antrean',
      title: '1. Antrean Masuk',
      icon: <Clock className="w-4 h-4" />,
      color: 'border-slate-700 bg-slate-900/60',
      badge: 'bg-slate-800 text-slate-300',
    },
    {
      id: 'cuci',
      title: '2. Proses Cuci',
      icon: <WashingMachine className="w-4 h-4" />,
      color: 'border-cyan-500/40 bg-cyan-950/20',
      badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
    },
    {
      id: 'kering',
      title: '3. Pengeringan',
      icon: <Flame className="w-4 h-4" />,
      color: 'border-orange-500/40 bg-orange-950/20',
      badge: 'bg-orange-500/20 text-orange-300 border border-orange-500/40',
    },
    {
      id: 'setrika',
      title: '4. Setrika Uap',
      icon: <Shirt className="w-4 h-4" />,
      color: 'border-purple-500/40 bg-purple-950/20',
      badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/40',
    },
    {
      id: 'packing',
      title: '5. Packing & QC',
      icon: <PackageCheck className="w-4 h-4" />,
      color: 'border-amber-500/40 bg-amber-950/20',
      badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    },
    {
      id: 'siap',
      title: '6. Siap Ambil / Antar',
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: 'border-emerald-500/40 bg-emerald-950/20',
      badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
    },
  ];

  // Filter orders by staff PIC if filtered
  const filteredOrders = orders.filter((o) => {
    if (selectedStaffFilter === 'all') return true;
    const timestamps = Object.values(o.statusTimestamps || {});
    return timestamps.some((t) => t?.picId === selectedStaffFilter);
  });

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const sequence: OrderStatus[] = ['antrean', 'cuci', 'kering', 'setrika', 'packing', 'siap'];
    const idx = sequence.indexOf(current);
    if (idx >= 0 && idx < sequence.length - 1) {
      return sequence[idx + 1];
    }
    return null;
  };

  const handleAdvanceStatus = (orderId: string, currentStatus: OrderStatus) => {
    const next = getNextStatus(currentStatus);
    if (next) {
      updateOrderStatus(orderId, next, currentUser);
    }
  };

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData('text/plain', orderId);
    setDraggedOrderId(orderId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: OrderStatus) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('text/plain') || draggedOrderId;
    if (orderId) {
      updateOrderStatus(orderId, targetStatus, currentUser);
      setDraggedOrderId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'kanban'
                ? 'bg-orange-500 text-slate-950 shadow-orange-500/20 shadow-lg'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Shirt className="w-4 h-4" />
            <span>Kanban Workflow Workshop</span>
          </button>
          <button
            onClick={() => setIsIotModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-slate-800/80 text-cyan-300 hover:bg-slate-800 border border-cyan-500/30"
          >
            <WashingMachine className="w-4 h-4 text-cyan-400" />
            <span>Panel Kontrol IoT Mesin ({machines.filter((m) => m.status === 'running').length} ON)</span>
          </button>
        </div>

        {/* Staff Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Filter PIC Staf:</span>
          <select
            value={selectedStaffFilter}
            onChange={(e) => setSelectedStaffFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 font-semibold"
          >
            <option value="all">Semua Karyawan Produksi</option>
            {users
              .filter((u) => u.role === 'produksi' || u.role === 'kasir')
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start">
        {columns.map((col) => {
          const colOrders = filteredOrders.filter((o) => o.currentStatus === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`rounded-2xl border p-3 flex flex-col min-h-[560px] max-h-[750px] ${col.color}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                <div className="flex items-center gap-2 font-bold text-xs text-white">
                  <span className="text-orange-400">{col.icon}</span>
                  <span>{col.title}</span>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${col.badge}`}>
                  {colOrders.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="pt-3 space-y-2.5 overflow-y-auto flex-1 pr-1">
                {colOrders.length === 0 ? (
                  <div className="text-center py-10 text-[11px] text-slate-500 italic">
                    Tidak ada pesanan di tahap ini
                  </div>
                ) : (
                  colOrders.map((ord) => {
                    const next = getNextStatus(ord.currentStatus);
                    const latestTimestamp = ord.statusTimestamps?.[ord.currentStatus];

                    return (
                      <div
                        key={ord.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, ord.id)}
                        className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-orange-500/50 shadow-md transition-all cursor-grab active:cursor-grabbing space-y-2 group"
                      >
                        {/* Header: Invoice + Express badge */}
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <span className="font-mono font-bold text-xs text-orange-400">
                              {ord.invoiceNo}
                            </span>
                            <div className="font-bold text-xs text-white leading-tight">
                              {ord.customerName}
                            </div>
                          </div>
                          {ord.isExpress && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500 text-slate-950 uppercase flex items-center gap-0.5">
                              <Zap className="w-2.5 h-2.5 fill-current" /> Express
                            </span>
                          )}
                        </div>

                        {/* Items & Weight info */}
                        <div className="text-[11px] text-slate-300">
                          <div className="line-clamp-1 font-medium">
                            {ord.items.map((i) => i.serviceName).join(', ')}
                          </div>
                          <div className="flex items-center justify-between text-slate-400 text-[10px] mt-0.5">
                            <span>
                              ⚖️ {ord.weightKg > 0 ? `${ord.weightKg} kg` : `${ord.itemCount} pcs`}
                            </span>
                            <span className="text-purple-300">🌸 {ord.perfumeName}</span>
                          </div>
                        </div>

                        {/* Notes if any */}
                        {ord.specialNotes && (
                          <div className="text-[10px] bg-slate-950/80 text-amber-300 p-1.5 rounded border border-amber-500/20 line-clamp-1">
                            💬 {ord.specialNotes}
                          </div>
                        )}

                        {/* PIC & Timestamp */}
                        {latestTimestamp && (
                          <div className="text-[9px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-800">
                            <span>PIC: {latestTimestamp.picName || 'Operator'}</span>
                            <span>{latestTimestamp.time.substring(11, 16)}</span>
                          </div>
                        )}

                        {/* Card Actions */}
                        <div className="pt-2 flex items-center justify-between gap-1.5">
                          <button
                            onClick={() => setSelectedOrderForDetail(ord)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Detail Order"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick IoT trigger if cuci / kering */}
                          {(ord.currentStatus === 'antrean' || ord.currentStatus === 'cuci') && (
                            <button
                              onClick={() => setIsIotModalOpen(true)}
                              className="px-2 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold flex items-center gap-1"
                              title="Sambungkan ke Mesin IoT"
                            >
                              <WashingMachine className="w-3 h-3" />
                              <span>IoT</span>
                            </button>
                          )}

                          {/* 1-Click Advance Button */}
                          {next && (
                            <button
                              onClick={() => handleAdvanceStatus(ord.id, ord.currentStatus)}
                              className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-[10px] transition-colors"
                            >
                              <span>Lanjut</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Detail Modal */}
      {selectedOrderForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-orange-400">
                  {selectedOrderForDetail.invoiceNo}
                </span>
                <h3 className="text-sm font-bold text-white">Detail Produksi Order</h3>
              </div>
              <button
                onClick={() => setSelectedOrderForDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Pelanggan:</span>
                <span className="font-bold">{selectedOrderForDetail.customerName} ({selectedOrderForDetail.customerPhone})</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Parfum Terpilih:</span>
                <span className="font-bold text-purple-300">{selectedOrderForDetail.perfumeName}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Status Saat Ini:</span>
                <span className="font-bold uppercase text-orange-400">{selectedOrderForDetail.currentStatus}</span>
              </div>

              {/* Items List */}
              <div className="p-3 bg-slate-950 rounded-xl space-y-1.5 border border-slate-800">
                <span className="font-bold text-slate-400 block text-[10px] uppercase">Rincian Item Pakaian:</span>
                {selectedOrderForDetail.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-slate-200 text-xs">
                    <span>{i.serviceName} ({i.quantity} {i.unit})</span>
                    <span className="font-mono">Rp {i.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>

              {/* Status Timestamps History */}
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <span className="font-bold text-slate-400 block text-[10px] uppercase">Riwayat Workflow & PIC:</span>
                {Object.entries(selectedOrderForDetail.statusTimestamps || {}).map(([st, ts]) => (
                  <div key={st} className="flex justify-between text-[11px] font-mono text-slate-300">
                    <span className="capitalize text-orange-300 font-semibold">{st}</span>
                    <span>{ts?.picName || 'System'} ({ts?.time})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedOrderForDetail(null)}
                className="w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IoT Machine Control Modal */}
      <IotMachineControlModal isOpen={isIotModalOpen} onClose={() => setIsIotModalOpen(false)} />
    </div>
  );
};
