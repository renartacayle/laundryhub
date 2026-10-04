import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus, StationCommissionRates, ClothesItem } from '../types';
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
  Camera,
  Coins,
  Eye,
  HandMetal,
  Check,
  ClipboardCheck,
  Edit3,
  MessageSquare,
  ChevronRight,
  BadgeCheck,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { IotMachineControlModal } from '../components/IotMachineControlModal';
import { StationPhotoProofModal } from '../components/StationPhotoProofModal';
import { ClothesDetailModal } from '../components/ClothesDetailModal';

interface ProduksiKanbanProps {
  currentSubTab?: string;
}

const STATUS_CONFIG: Record<string, { label: string; emoji: string; color: string; ring: string; textColor: string; bgCard: string; borderCard: string }> = {
  antrean: {
    label: 'Antrean Masuk', emoji: '📥', color: 'bg-slate-700/40',
    ring: 'ring-slate-600', textColor: 'text-slate-300',
    bgCard: 'bg-slate-900', borderCard: 'border-slate-700/70',
  },
  sortir: {
    label: 'Sortir & Tagging', emoji: '🔍', color: 'bg-indigo-900/20',
    ring: 'ring-indigo-500/50', textColor: 'text-indigo-300',
    bgCard: 'bg-indigo-950/30', borderCard: 'border-indigo-500/30',
  },
  cuci: {
    label: 'Proses Cuci', emoji: '🫧', color: 'bg-cyan-900/20',
    ring: 'ring-cyan-500/50', textColor: 'text-cyan-300',
    bgCard: 'bg-cyan-950/30', borderCard: 'border-cyan-500/30',
  },
  kering: {
    label: 'Pengeringan', emoji: '🔥', color: 'bg-orange-900/20',
    ring: 'ring-orange-500/50', textColor: 'text-orange-300',
    bgCard: 'bg-orange-950/30', borderCard: 'border-orange-500/30',
  },
  setrika: {
    label: 'Setrika Uap', emoji: '💨', color: 'bg-purple-900/20',
    ring: 'ring-purple-500/50', textColor: 'text-purple-300',
    bgCard: 'bg-purple-950/30', borderCard: 'border-purple-500/30',
  },
  packing: {
    label: 'Packing & QC', emoji: '📦', color: 'bg-amber-900/20',
    ring: 'ring-amber-500/50', textColor: 'text-amber-300',
    bgCard: 'bg-amber-950/30', borderCard: 'border-amber-500/30',
  },
  siap: {
    label: 'Siap Ambil / Antar', emoji: '✅', color: 'bg-emerald-900/20',
    ring: 'ring-emerald-500/50', textColor: 'text-emerald-300',
    bgCard: 'bg-emerald-950/30', borderCard: 'border-emerald-500/30',
  },
};

const STATION_SEQUENCE: OrderStatus[] = ['sortir', 'cuci', 'kering', 'setrika', 'packing'];

export const ProduksiKanban: React.FC<ProduksiKanbanProps> = ({ currentSubTab = 'prod-kanban' }) => {
  const {
    orders,
    currentBranchId,
    currentUser,
    users,
    updateOrderStatus,
    updateOrderClothesDetails,
    machines,
    stationRates,
    claimStationTask,
    unclaimStationTask,
    openTrackingModal,
    openDopaminePayday,
    openSalarySlipModal,
    calculateStaffSalarySlip,
    setIsAttendanceModalOpen,
    openAiScanner,
    openWhatsAppBot,
  } = useApp();

  const mySlip = calculateStaffSalarySlip(currentUser.id);

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
  const [clothesModalOrder, setClothesModalOrder] = useState<Order | null>(null);
  const [stationModalOrder, setStationModalOrder] = useState<Order | null>(null);
  const [stationModalStation, setStationModalStation] = useState<OrderStatus>('sortir');
  const [photoViewerData, setPhotoViewerData] = useState<{
    url: string; invoiceNo: string; station: string; picName: string; time: string; commission?: number; notes?: string;
  } | null>(null);

  const columns: { id: OrderStatus; step: number }[] = [
    { id: 'antrean', step: 1 },
    { id: 'sortir', step: 2 },
    { id: 'cuci', step: 3 },
    { id: 'kering', step: 4 },
    { id: 'setrika', step: 5 },
    { id: 'packing', step: 6 },
    { id: 'siap', step: 7 },
  ];

  const filteredOrders = orders.filter((o) => {
    if (selectedStaffFilter === 'all') return true;
    const timestamps = Object.values(o.statusTimestamps || {});
    return timestamps.some((t) => t?.picId === selectedStaffFilter);
  });

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const sequence: OrderStatus[] = ['antrean', 'sortir', 'cuci', 'kering', 'setrika', 'packing', 'siap'];
    const idx = sequence.indexOf(current);
    if (idx >= 0 && idx < sequence.length - 1) return sequence[idx + 1];
    return null;
  };

  const handleAdvanceStatus = (orderId: string, currentStatus: OrderStatus) => {
    const next = getNextStatus(currentStatus);
    if (next) updateOrderStatus(orderId, next, currentUser);
  };

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData('text/plain', orderId);
    setDraggedOrderId(orderId);
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, targetStatus: OrderStatus) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('text/plain') || draggedOrderId;
    if (orderId) { updateOrderStatus(orderId, targetStatus, currentUser); setDraggedOrderId(null); }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ─── TOP HEADER ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-slate-800">
        {/* Tab pills */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-2xl p-1">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'kanban'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            Alur Kerja Kanban
          </button>
          <button
            onClick={() => setActiveTab('iot')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'iot'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <WashingMachine className="w-3.5 h-3.5" />
            IoT Mesin
            <span className="bg-cyan-400/20 text-cyan-300 text-[9px] font-black px-1.5 py-0.5 rounded-full">
              {machines.filter((m) => m.status === 'running').length} ON
            </span>
          </button>
        </div>

        {/* Salary wallet pill */}
        <button
          onClick={() => openDopaminePayday(currentUser.id)}
          className="px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 text-slate-950 shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform"
        >
          <Coins className="w-3.5 h-3.5" />
          💰 Dompet: Rp {mySlip.netTakeHomePay.toLocaleString('id-ID')}
        </button>

        {/* Nota Gaji Resmi */}
        <button
          onClick={() => openSalarySlipModal(currentUser.id)}
          className="px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-300 border border-emerald-500/30 transition-colors"
          title="Buka & Cetak Nota Gaji Resmi (Dokumen / Thermal)"
        >
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span>Nota Gaji</span>
        </button>

        {/* AI Scanner */}
        <button
          onClick={() => openAiScanner()}
          className="px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 bg-indigo-600/20 hover:bg-indigo-600/35 text-indigo-300 border border-indigo-500/30 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          AI Scan Noda
        </button>

        {/* IoT control shortcut */}
        <button
          onClick={() => setIsIotModalOpen(true)}
          className="px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 bg-cyan-600/20 hover:bg-cyan-600/35 text-cyan-300 border border-cyan-500/30 transition-colors"
        >
          <WashingMachine className="w-3.5 h-3.5" />
          Panel IoT
        </button>

        {/* Staff filter — pushed to the right */}
        <div className="ml-auto flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={selectedStaffFilter}
            onChange={(e) => setSelectedStaffFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 font-semibold cursor-pointer"
          >
            <option value="all">Semua Karyawan</option>
            {users
              .filter((u) => u.role === 'produksi' || u.role === 'kasir')
              .map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
          </select>
        </div>
      </div>

      {/* ─── KANBAN BOARD ─────────────────────────────────────────────── */}
      <div className="flex gap-3 overflow-x-auto pb-2" style={{ minHeight: '600px' }}>
        {columns.map((col) => {
          const cfg = STATUS_CONFIG[col.id];
          const colOrders = filteredOrders.filter((o) => o.currentStatus === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex-shrink-0 rounded-2xl border border-slate-800/80 ${cfg.color} flex flex-col`}
              style={{ minWidth: '272px', width: '272px' }}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-3.5 pt-3.5 pb-2.5 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{cfg.emoji}</span>
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Tahap {col.step}</div>
                    <div className={`text-xs font-black ${cfg.textColor}`}>{cfg.label}</div>
                  </div>
                </div>
                <span className={`min-w-[22px] h-[22px] flex items-center justify-center rounded-full text-[11px] font-black ${
                  colOrders.length > 0 ? 'bg-orange-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                }`}>
                  {colOrders.length}
                </span>
              </div>

              {/* Cards */}
              <div className="p-2 space-y-2 overflow-y-auto flex-1">
                {colOrders.length === 0 ? (
                  <div className="mt-8 text-center text-[11px] text-slate-600 italic">
                    Tidak ada order<br />di tahap ini
                  </div>
                ) : (
                  colOrders.map((ord) => {
                    const next = getNextStatus(ord.currentStatus);
                    const isProductionStation = STATION_SEQUENCE.includes(ord.currentStatus);
                    const currentRate = isProductionStation
                      ? (stationRates[ord.currentStatus as keyof StationCommissionRates] || 200)
                      : 200;
                    const estCommission = Math.max(500, Math.round(
                      ord.weightKg > 0 ? ord.weightKg * currentRate : ord.itemCount * (currentRate * 1.5)
                    ));
                    const isClaimedByMe = ord.currentClaim?.workerId === currentUser.id;
                    const claimedByOther = ord.currentClaim?.station === ord.currentStatus && !isClaimedByMe;

                    return (
                      <div
                        key={ord.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, ord.id)}
                        className={`rounded-xl border ${cfg.borderCard} ${cfg.bgCard} shadow-sm hover:shadow-md hover:border-orange-500/40 transition-all cursor-grab active:cursor-grabbing group`}
                      >
                        {/* Card Top: Invoice + Customer */}
                        <div className="px-3 pt-3 pb-2 border-b border-slate-800/60">
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex-1 min-w-0">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); openTrackingModal(ord.invoiceNo); }}
                                className="font-mono text-[10px] font-bold text-orange-400 hover:text-orange-300 hover:underline flex items-center gap-0.5"
                              >
                                {ord.invoiceNo}
                                <Eye className="w-2.5 h-2.5 opacity-60" />
                              </button>
                              <div className="font-bold text-sm text-white leading-tight truncate">{ord.customerName}</div>
                              <div className="text-[11px] text-slate-400 truncate mt-0.5">
                                {ord.items.map((i) => i.serviceName).join(', ')}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              {ord.isExpress && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500 text-slate-950 flex items-center gap-0.5">
                                  <Zap className="w-2.5 h-2.5 fill-current" /> Kilat
                                </span>
                              )}
                              <span className="text-[10px] font-mono font-semibold text-cyan-300">
                                ⚖️ {ord.weightKg > 0 ? `${ord.weightKg} kg` : `${ord.itemCount} pcs`}
                              </span>
                            </div>
                          </div>

                          {/* Parfum + special notes */}
                          {(ord.perfumeName || ord.specialNotes) && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {ord.perfumeName && (
                                <span className="text-[10px] text-purple-300 bg-purple-950/40 px-1.5 py-0.5 rounded-full border border-purple-500/20">
                                  🌸 {ord.perfumeName}
                                </span>
                              )}
                              {ord.specialNotes && (
                                <span className="text-[10px] text-amber-300 bg-amber-950/30 px-1.5 py-0.5 rounded-full border border-amber-500/20 truncate max-w-full">
                                  💬 {ord.specialNotes}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Station Progress Track */}
                        <div className="px-3 py-2.5 border-b border-slate-800/60">
                          <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                            Progress Stasiun
                          </div>
                          <div className="flex items-center gap-0.5">
                            {STATION_SEQUENCE.map((st, idx) => {
                              const ts = ord.statusTimestamps?.[st];
                              const isDone = !!ts;
                              const isCurrent = ord.currentStatus === st;
                              return (
                                <React.Fragment key={st}>
                                  <div
                                    className={`relative flex-1 flex flex-col items-center`}
                                    title={`${st}: ${isDone ? `✓ ${ts.picName || 'Selesai'}` : isCurrent ? 'Sedang dikerjakan' : 'Belum'}`}
                                  >
                                    <div className={`w-full h-1.5 rounded-full transition-all ${
                                      isDone ? 'bg-emerald-500' : isCurrent ? 'bg-orange-500' : 'bg-slate-700'
                                    }`} />
                                    {ts?.photoProof ? (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setPhotoViewerData({
                                            url: ts.photoProof!,
                                            invoiceNo: ord.invoiceNo,
                                            station: st,
                                            picName: ts.picName || 'Operator',
                                            time: ts.time,
                                            commission: ts.commissionEarned,
                                            notes: ts.stationNotes,
                                          });
                                        }}
                                        className="mt-0.5 text-[8px] text-emerald-400 font-bold hover:underline"
                                      >
                                        📸
                                      </button>
                                    ) : isDone ? (
                                      <span className="mt-0.5 text-[8px] text-emerald-400">✓</span>
                                    ) : isCurrent ? (
                                      <span className="mt-0.5 text-[8px] text-orange-400 animate-pulse">●</span>
                                    ) : (
                                      <span className="mt-0.5 text-[8px] text-slate-700">-</span>
                                    )}
                                    <span className="text-[8px] text-slate-500 mt-0.5 font-semibold">
                                      {st === 'sortir' ? 'Sort' : st === 'cuci' ? 'Cuci' : st === 'kering' ? 'Kng' : st === 'setrika' ? 'Stk' : 'Pack'}
                                    </span>
                                  </div>
                                  {idx < STATION_SEQUENCE.length - 1 && (
                                    <div className="w-1 shrink-0" />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>

                        {/* Clothes count + AI scan */}
                        <div className="px-3 py-2 border-b border-slate-800/60 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setClothesModalOrder(ord); }}
                            className="flex items-center gap-1.5 text-[11px] text-indigo-300 hover:text-indigo-200 font-semibold"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            {ord.clothesDetails && ord.clothesDetails.length > 0
                              ? `${ord.totalPieces || ord.clothesDetails.reduce((s, c) => s + (c.quantity || 0), 0)} Pcs`
                              : <span className="text-slate-500">+ Hitung Pcs</span>
                            }
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openAiScanner(ord.id); }}
                            className="flex items-center gap-1 text-[9px] font-bold text-yellow-300 bg-indigo-900/50 hover:bg-indigo-800/60 px-2 py-1 rounded-lg border border-indigo-500/30 transition-colors"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            AI Scan
                            {ord.aiInspection && <BadgeCheck className="w-2.5 h-2.5 text-emerald-400" />}
                          </button>
                        </div>

                        {/* ── Production Station Action Box ─────────── */}
                        {isProductionStation && (
                          <div className="px-3 py-2.5 space-y-2">
                            {/* Commission badge */}
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-400">
                                Stasiun <strong className={`${cfg.textColor} uppercase`}>{ord.currentStatus}</strong>
                              </span>
                              <span className="text-[11px] font-mono font-black text-emerald-400 flex items-center gap-0.5">
                                <Coins className="w-3 h-3" />+Rp {estCommission.toLocaleString('id-ID')}
                              </span>
                            </div>

                            {/* Claimed by info */}
                            {ord.currentClaim?.station === ord.currentStatus ? (
                              <div className="flex items-center justify-between text-[10px] bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
                                <span className="flex items-center gap-1 text-slate-300">
                                  <UserCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                                  <span>
                                    {isClaimedByMe
                                      ? <strong className="text-cyan-300">Saya sedang mengerjakan</strong>
                                      : <span>Dikerjakan: <strong>{ord.currentClaim.workerName}</strong></span>
                                    }
                                  </span>
                                </span>
                                {(isClaimedByMe || currentUser.role === 'owner') && (
                                  <button
                                    type="button"
                                    onClick={() => unclaimStationTask(ord.id)}
                                    className="text-[9px] text-rose-400 hover:underline font-semibold ml-1 shrink-0"
                                  >
                                    Lepas
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-between text-[10px] text-slate-500">
                                <span className="text-amber-400/80 font-medium flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> Belum ada yang ambil
                                </span>
                                <span className="font-mono">Rp {currentRate}/kg</span>
                              </div>
                            )}

                            {/* Action buttons */}
                            <div className="grid grid-cols-2 gap-1.5">
                              {(!ord.currentClaim || ord.currentClaim.station !== ord.currentStatus) && (
                                <button
                                  type="button"
                                  onClick={() => claimStationTask(ord.id, ord.currentStatus, currentUser)}
                                  className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 transition-all flex items-center justify-center gap-1 active:scale-95"
                                >
                                  <HandMetal className="w-3 h-3" />
                                  Ambil Tugas
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => { setStationModalOrder(ord); setStationModalStation(ord.currentStatus); }}
                                className={`py-2 px-2 rounded-xl text-slate-950 font-black text-[10px] transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95 ${
                                  (!ord.currentClaim || ord.currentClaim.station !== ord.currentStatus)
                                    ? 'col-span-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400'
                                    : 'col-span-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400'
                                }`}
                              >
                                <Camera className="w-3.5 h-3.5" />
                                Upload Foto Bukti
                              </button>
                            </div>
                          </div>
                        )}

                        {/* ── Antrean start button ───────────────────── */}
                        {ord.currentStatus === 'antrean' && (
                          <div className="px-3 py-2.5">
                            <button
                              type="button"
                              onClick={() => { setStationModalOrder(ord); setStationModalStation('cuci'); }}
                              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95"
                            >
                              <WashingMachine className="w-4 h-4" />
                              Mulai Cuci (Foto Bukti)
                            </button>
                          </div>
                        )}

                        {/* ── Siap ambil ────────────────────────────── */}
                        {ord.currentStatus === 'siap' && (
                          <div className="px-3 py-2.5 space-y-2">
                            <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold bg-emerald-950/40 border border-emerald-500/30 py-2 rounded-xl">
                              <CheckCircle2 className="w-4 h-4" />
                              Semua Stasiun Selesai!
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const cleanPhone = ord.customerPhone.replace(/[^0-9]/g, '');
                                const phone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
                                const text = encodeURIComponent(
                                  `Halo Kak ${ord.customerName}! Cucian Anda di LaundryHub dengan No. Nota *${ord.invoiceNo}* sudah SELESAI ✨\n\nCek status & foto bukti: https://laundryhub.app/?nota=${ord.invoiceNo}`
                                );
                                window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
                              }}
                              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              WA Siap ke Pelanggan
                            </button>
                          </div>
                        )}

                        {/* ── Card Footer: Detail + Advance ─────────── */}
                        <div className="px-3 pb-3 pt-1 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setSelectedOrderForDetail(ord)}
                            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 font-medium transition-colors"
                          >
                            <Info className="w-3 h-3" />
                            Detail
                          </button>
                          <div className="flex items-center gap-1.5">
                            {(ord.currentStatus === 'antrean' || ord.currentStatus === 'cuci') && (
                              <button
                                onClick={() => setIsIotModalOpen(true)}
                                className="px-2 py-1 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/70 border border-cyan-500/20 text-cyan-400 text-[9px] font-bold flex items-center gap-0.5 transition-colors"
                              >
                                <WashingMachine className="w-2.5 h-2.5" />
                                IoT
                              </button>
                            )}
                            {next && (
                              <button
                                onClick={() => handleAdvanceStatus(ord.id, ord.currentStatus)}
                                title="Majukan status (skip)"
                                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[9px] font-bold flex items-center gap-0.5 transition-colors"
                              >
                                Skip <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
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

      {/* ─── ORDER DETAIL MODAL ──────────────────────────────────────── */}
      {selectedOrderForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-orange-400">{selectedOrderForDetail.invoiceNo}</span>
                <h3 className="text-sm font-bold text-white">Detail Produksi & Bukti Foto Stasiun</h3>
              </div>
              <button onClick={() => setSelectedOrderForDetail(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800">
                  <div className="text-slate-500 text-[10px] mb-0.5">Pelanggan</div>
                  <div className="font-bold">{selectedOrderForDetail.customerName}</div>
                </div>
                <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800">
                  <div className="text-slate-500 text-[10px] mb-0.5">Status</div>
                  <div className="font-bold uppercase text-orange-400">{selectedOrderForDetail.currentStatus}</div>
                </div>
                <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800">
                  <div className="text-slate-500 text-[10px] mb-0.5">Parfum</div>
                  <div className="font-bold text-purple-300">🌸 {selectedOrderForDetail.perfumeName}</div>
                </div>
                <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800">
                  <div className="text-slate-500 text-[10px] mb-0.5">Berat</div>
                  <div className="font-bold text-cyan-300">⚖️ {selectedOrderForDetail.weightKg} kg</div>
                </div>
              </div>

              {/* Items */}
              <div className="p-3 bg-slate-950 rounded-xl space-y-1.5 border border-slate-800">
                <span className="font-bold text-slate-400 block text-[10px] uppercase">Rincian Layanan:</span>
                {selectedOrderForDetail.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-slate-200">
                    <span>{i.serviceName} ({i.quantity} {i.unit})</span>
                    <span className="font-mono">Rp {i.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>

              {/* Clothes detail */}
              {selectedOrderForDetail.clothesDetails && selectedOrderForDetail.clothesDetails.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-300 flex items-center gap-1">
                      <ClipboardCheck className="w-3.5 h-3.5 text-indigo-400" />
                      Rincian Pakaian ({selectedOrderForDetail.totalPieces || selectedOrderForDetail.clothesDetails.reduce((a, b) => a + b.quantity, 0)} Pcs)
                    </span>
                    <button type="button" onClick={() => setClothesModalOrder(selectedOrderForDetail)} className="text-[10px] text-indigo-400 hover:underline font-bold">
                      Edit Pcs
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {selectedOrderForDetail.clothesDetails.filter((c) => c.quantity > 0).map((c, i) => (
                      <div key={i} className="flex justify-between bg-slate-900/80 px-2 py-1 rounded text-[11px] text-slate-300">
                        <span className="truncate">• {c.name}</span>
                        <strong className="text-indigo-300 shrink-0 ml-1">{c.quantity} pcs</strong>
                      </div>
                    ))}
                  </div>
                  {selectedOrderForDetail.sortingNotes && (
                    <div className="text-[10px] text-amber-300 bg-amber-950/40 p-1.5 rounded border border-amber-500/20">
                      <strong>Catatan Sortir:</strong> {selectedOrderForDetail.sortingNotes}
                    </div>
                  )}
                </div>
              )}

              {/* Station history */}
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <span className="font-bold text-slate-400 block text-[10px] uppercase">Riwayat Pengerjaan:</span>
                {Object.entries(selectedOrderForDetail.statusTimestamps || {}).map(([st, ts]) => (
                  <div key={st} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="capitalize font-bold text-orange-400">
                        {st === 'sortir' ? '🔍 Sortir' : st === 'cuci' ? '🫧 Cuci' : st === 'kering' ? '🔥 Kering' : st === 'setrika' ? '💨 Setrika' : st === 'packing' ? '📦 Packing' : st}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{ts?.time}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span>PIC: <strong>{ts?.picName || 'Operator'}</strong></span>
                      {ts?.commissionEarned && (
                        <span className="text-emerald-400 font-mono font-bold">+Rp {ts.commissionEarned.toLocaleString('id-ID')}</span>
                      )}
                    </div>
                    {ts?.stationNotes && (
                      <p className="text-[10px] text-amber-300/90 italic bg-slate-900/80 p-1 rounded">"{ts.stationNotes}"</p>
                    )}
                    {ts?.photoProof && (
                      <div className="flex items-center gap-2">
                        <img
                          src={ts.photoProof}
                          alt={`Bukti ${st}`}
                          className="w-16 h-12 object-cover rounded-lg border border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setPhotoViewerData({ url: ts.photoProof!, invoiceNo: selectedOrderForDetail.invoiceNo, station: st, picName: ts.picName || 'Operator', time: ts.time, commission: ts.commissionEarned, notes: ts.stationNotes })}
                        />
                        <button type="button"
                          onClick={() => setPhotoViewerData({ url: ts.photoProof!, invoiceNo: selectedOrderForDetail.invoiceNo, station: st, picName: ts.picName || 'Operator', time: ts.time, commission: ts.commissionEarned, notes: ts.stationNotes })}
                          className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Camera className="w-3 h-3" /> Lihat Foto Bukti
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setSelectedOrderForDetail(null)} className="w-full py-2.5 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 transition-colors">
              Tutup Detail
            </button>
          </div>
        </div>
      )}

      {/* ─── PHOTO LIGHTBOX ──────────────────────────────────────────── */}
      {photoViewerData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
              <div>
                <span className="font-mono text-xs font-bold text-orange-400">{photoViewerData.invoiceNo}</span>
                <h4 className="text-sm font-bold text-white capitalize">Bukti Pengerjaan: Stasiun {photoViewerData.station}</h4>
              </div>
              <button onClick={() => setPhotoViewerData(null)} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative bg-black px-4 flex justify-center">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 w-full max-h-[360px]">
                <img src={photoViewerData.url} alt="Bukti Foto Full" className="w-full h-full object-contain max-h-[360px]" />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent text-[10px] font-mono text-slate-200">
                  <div className="flex items-center justify-between text-orange-400 font-bold">
                    <span>LAUNDRYHUB BUKTI RESMI</span>
                    <span>{photoViewerData.invoiceNo}</span>
                  </div>
                  <div className="text-slate-300 flex items-center justify-between mt-0.5">
                    <span>PIC: {photoViewerData.picName}</span>
                    <span>{photoViewerData.time}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 pt-2 space-y-2 text-xs">
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400">Komisi Yang Diterima PIC:</span>
                <span className="font-mono text-emerald-400 font-black text-sm">+Rp {(photoViewerData.commission || 0).toLocaleString('id-ID')}</span>
              </div>
              {photoViewerData.notes && (
                <div className="text-amber-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                  <strong>Catatan Petugas:</strong> {photoViewerData.notes}
                </div>
              )}
              <button type="button" onClick={() => setPhotoViewerData(null)} className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 font-semibold">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {stationModalOrder && (
        <StationPhotoProofModal
          isOpen={!!stationModalOrder}
          onClose={() => setStationModalOrder(null)}
          order={stationModalOrder}
          station={stationModalStation}
        />
      )}
      {clothesModalOrder && (
        <ClothesDetailModal
          isOpen={!!clothesModalOrder}
          onClose={() => setClothesModalOrder(null)}
          initialClothes={clothesModalOrder.clothesDetails}
          initialNotes={clothesModalOrder.sortingNotes}
          orderInvoiceNo={clothesModalOrder.invoiceNo}
          orderCustomerName={clothesModalOrder.customerName}
          orderWeightKg={clothesModalOrder.weightKg}
          onSave={(updatedClothes, updatedNotes, totalPieces) => {
            updateOrderClothesDetails(clothesModalOrder.id, updatedClothes, updatedNotes, totalPieces);
            setClothesModalOrder(null);
          }}
        />
      )}
      <IotMachineControlModal isOpen={isIotModalOpen} onClose={() => setIsIotModalOpen(false)} />
    </div>
  );
};
