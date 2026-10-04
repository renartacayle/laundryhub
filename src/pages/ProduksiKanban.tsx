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
} from 'lucide-react';
import { IotMachineControlModal } from '../components/IotMachineControlModal';
import { StationPhotoProofModal } from '../components/StationPhotoProofModal';
import { ClothesDetailModal } from '../components/ClothesDetailModal';

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
    updateOrderClothesDetails,
    machines,
    stationRates,
    claimStationTask,
    unclaimStationTask,
    openTrackingModal,
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

  // Clothes Detail Modal State
  const [clothesModalOrder, setClothesModalOrder] = useState<Order | null>(null);

  // Station Photo Proof Modal State
  const [stationModalOrder, setStationModalOrder] = useState<Order | null>(null);
  const [stationModalStation, setStationModalStation] = useState<OrderStatus>('sortir');

  // Photo Proof Lightbox Viewer State
  const [photoViewerData, setPhotoViewerData] = useState<{
    url: string;
    invoiceNo: string;
    station: string;
    picName: string;
    time: string;
    commission?: number;
    notes?: string;
  } | null>(null);

  // Workflow Columns definitions (now includes 2. Sortir & Tagging)
  const columns: { id: OrderStatus; title: string; icon: React.ReactNode; color: string; badge: string }[] = [
    {
      id: 'antrean',
      title: '1. Antrean Masuk',
      icon: <Clock className="w-4 h-4" />,
      color: 'border-slate-700 bg-slate-900/60',
      badge: 'bg-slate-800 text-slate-300',
    },
    {
      id: 'sortir',
      title: '2. Sortir & Tagging',
      icon: <ClipboardCheck className="w-4 h-4 text-indigo-400" />,
      color: 'border-indigo-500/40 bg-indigo-950/20',
      badge: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40',
    },
    {
      id: 'cuci',
      title: '3. Proses Cuci',
      icon: <WashingMachine className="w-4 h-4" />,
      color: 'border-cyan-500/40 bg-cyan-950/20',
      badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
    },
    {
      id: 'kering',
      title: '4. Pengeringan',
      icon: <Flame className="w-4 h-4" />,
      color: 'border-orange-500/40 bg-orange-950/20',
      badge: 'bg-orange-500/20 text-orange-300 border border-orange-500/40',
    },
    {
      id: 'setrika',
      title: '5. Setrika Uap',
      icon: <Shirt className="w-4 h-4" />,
      color: 'border-purple-500/40 bg-purple-950/20',
      badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/40',
    },
    {
      id: 'packing',
      title: '6. Packing & QC',
      icon: <PackageCheck className="w-4 h-4" />,
      color: 'border-amber-500/40 bg-amber-950/20',
      badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    },
    {
      id: 'siap',
      title: '7. Siap Ambil / Antar',
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
    const sequence: OrderStatus[] = ['antrean', 'sortir', 'cuci', 'kering', 'setrika', 'packing', 'siap'];
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
                    const isProductionStation = ord.currentStatus === 'sortir' || ord.currentStatus === 'cuci' || ord.currentStatus === 'kering' || ord.currentStatus === 'setrika' || ord.currentStatus === 'packing';
                    const currentRate = isProductionStation ? (stationRates[ord.currentStatus as keyof StationCommissionRates] || 200) : 200;
                    const estCommission = Math.max(500, Math.round(ord.weightKg > 0 ? ord.weightKg * currentRate : ord.itemCount * (currentRate * 1.5)));
                    const isClaimedByMe = ord.currentClaim?.workerId === currentUser.id;

                    const stationsList: { id: OrderStatus; name: string; shortName: string; icon: string }[] = [
                      { id: 'sortir', name: 'Sortir', shortName: 'Sortir', icon: '🔍' },
                      { id: 'cuci', name: 'Cuci', shortName: 'Cuci', icon: '🫧' },
                      { id: 'kering', name: 'Kering', shortName: 'Kering', icon: '🔥' },
                      { id: 'setrika', name: 'Setrika', shortName: 'Setrika', icon: '💨' },
                      { id: 'packing', name: 'Packing', shortName: 'Pack', icon: '📦' },
                    ];

                    return (
                      <div
                        key={ord.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, ord.id)}
                        className="p-3.5 rounded-2xl bg-slate-900/95 border border-slate-800 hover:border-orange-500/60 shadow-lg transition-all cursor-grab active:cursor-grabbing space-y-2.5 group"
                      >
                        {/* Header: Invoice + Express badge */}
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openTrackingModal(ord.invoiceNo);
                              }}
                              className="font-mono font-bold text-xs text-orange-400 hover:text-orange-300 hover:underline flex items-center gap-1 text-left"
                              title="Buka Status Cucian & Ambil Stasiun"
                            >
                              <span>{ord.invoiceNo}</span>
                              <Eye className="w-3 h-3 text-orange-400/80" />
                            </button>
                            <div className="font-bold text-xs text-white leading-tight">
                              {ord.customerName}
                            </div>
                          </div>
                          {ord.isExpress && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500 text-slate-950 uppercase flex items-center gap-0.5 shadow-sm">
                              <Zap className="w-2.5 h-2.5 fill-current" /> Express
                            </span>
                          )}
                        </div>

                        {/* Items & Weight info */}
                        <div className="text-[11px] text-slate-300">
                          <div className="line-clamp-1 font-medium text-slate-200">
                            {ord.items.map((i) => i.serviceName).join(', ')}
                          </div>
                          <div className="flex items-center justify-between text-slate-400 text-[10px] mt-0.5">
                            <span className="font-mono font-semibold text-cyan-300">
                              ⚖️ {ord.weightKg > 0 ? `${ord.weightKg} kg` : `${ord.itemCount} pcs`}
                            </span>
                            <span className="text-purple-300">🌸 {ord.perfumeName}</span>
                          </div>
                        </div>

                        {/* Clothes Breakdown & Defect Note */}
                        <div className="p-2 rounded-xl bg-slate-950/70 border border-indigo-500/20 space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-indigo-300 flex items-center gap-1">
                              <ClipboardCheck className="w-3 h-3 text-indigo-400" />
                              <span>
                                {ord.clothesDetails && ord.clothesDetails.length > 0
                                  ? `${ord.totalPieces || ord.clothesDetails.reduce((s, c) => s + (c.quantity || 0), 0)} Pcs Pakaian`
                                  : 'Belum dihitung'}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setClothesModalOrder(ord);
                              }}
                              className="text-[9px] font-bold text-indigo-400 hover:text-indigo-200 underline flex items-center gap-0.5"
                            >
                              <Edit3 className="w-2.5 h-2.5" />
                              <span>{ord.clothesDetails && ord.clothesDetails.length > 0 ? 'Edit' : '+ Hitung'}</span>
                            </button>
                          </div>
                          {ord.clothesDetails && ord.clothesDetails.length > 0 && (
                            <div className="text-[9px] text-slate-400 truncate">
                              {ord.clothesDetails.filter((c) => c.quantity > 0).map((c) => `${c.quantity} ${c.name.split(' ')[0]}`).join(', ')}
                            </div>
                          )}
                          {ord.sortingNotes && (
                            <div className="text-[9px] text-amber-300/90 font-medium truncate bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/20">
                              ⚠️ {ord.sortingNotes}
                            </div>
                          )}
                        </div>

                        {/* Notes if any */}
                        {ord.specialNotes && (
                          <div className="text-[10px] bg-slate-950/80 text-amber-300 p-1.5 rounded-lg border border-amber-500/20 line-clamp-1">
                            💬 {ord.specialNotes}
                          </div>
                        )}

                        {/* Multi-Worker Station Progress & Photo Proofs */}
                        <div className="pt-1 border-t border-slate-800/80">
                          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
                            Progress Borongan per Stasiun:
                          </span>
                          <div className="grid grid-cols-5 gap-1">
                            {stationsList.map((st) => {
                              const ts = ord.statusTimestamps?.[st.id];
                              const isCompleted = !!ts;
                              const isCurrent = ord.currentStatus === st.id;

                              return (
                                <div
                                  key={st.id}
                                  className={`p-1 rounded-lg text-center transition-all flex flex-col items-center justify-between min-h-[44px] overflow-hidden border ${
                                    isCompleted
                                      ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                                      : isCurrent
                                      ? 'bg-orange-950/40 border-orange-500/50 text-orange-300 ring-1 ring-orange-500/40'
                                      : 'bg-slate-950/60 border-slate-800/80 text-slate-600'
                                  }`}
                                >
                                  <div className="text-[10px] flex items-center justify-center gap-0.5 truncate w-full">
                                    <span className="text-[10px] shrink-0">{st.icon}</span>
                                    <span className="text-[8px] font-bold truncate">{st.shortName}</span>
                                  </div>

                                  {isCompleted ? (
                                    ts.photoProof ? (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setPhotoViewerData({
                                            url: ts.photoProof!,
                                            invoiceNo: ord.invoiceNo,
                                            station: st.name,
                                            picName: ts.picName || 'Operator',
                                            time: ts.time,
                                            commission: ts.commissionEarned,
                                            notes: ts.stationNotes,
                                          });
                                        }}
                                        className="mt-0.5 px-1 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/40 text-[8px] font-black text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5 transition-colors"
                                        title={`Lihat Foto Bukti (${ts.picName})`}
                                      >
                                        <Camera className="w-2.5 h-2.5 text-emerald-400" />
                                        <span>Foto</span>
                                      </button>
                                    ) : (
                                      <span className="text-[8px] font-mono text-emerald-400 font-bold">
                                        ✓ Selesai
                                      </span>
                                    )
                                  ) : isCurrent ? (
                                    <span className="text-[8px] font-bold text-orange-400 animate-pulse">
                                      ● Aktif
                                    </span>
                                  ) : (
                                    <span className="text-[8px] text-slate-600">-</span>
                                  )}

                                  {isCompleted && ts.picName && (
                                    <span className="text-[8px] text-slate-400 truncate max-w-full font-mono mt-0.5 leading-tight">
                                      {ts.picName.split(' ')[0]}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Station Task Claim & Photo Proof Action Box */}
                        {isProductionStation && (
                          <div className="p-2.5 rounded-xl bg-slate-950/90 border border-orange-500/30 space-y-2">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 font-medium">
                                Stasiun <strong className="text-orange-300 uppercase">{ord.currentStatus}</strong>:
                              </span>
                              <span className="font-mono text-emerald-400 font-bold flex items-center gap-0.5">
                                <Coins className="w-3 h-3 text-emerald-400" />
                                <span>+Rp {estCommission.toLocaleString('id-ID')}</span>
                              </span>
                            </div>

                            {/* Claim status details */}
                            {ord.currentClaim?.station === ord.currentStatus ? (
                              <div className="flex items-center justify-between text-[9px] bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                                <span className="text-slate-300 flex items-center gap-1 truncate">
                                  <UserCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                                  <span>Dikerjakan: <strong>{ord.currentClaim.workerName}</strong></span>
                                </span>
                                {(isClaimedByMe || currentUser.role === 'owner') && (
                                  <button
                                    type="button"
                                    onClick={() => unclaimStationTask(ord.id)}
                                    className="text-[8px] text-rose-400 hover:underline shrink-0 ml-1 font-semibold"
                                  >
                                    Lepas Klaim
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="text-[9px] text-slate-400 flex items-center justify-between">
                                <span className="text-amber-400/90 font-medium">● Belum ada yang ambil</span>
                                <span className="text-[9px] text-slate-500 font-mono">Tarif: Rp {currentRate}/kg</span>
                              </div>
                            )}

                            {/* Action Buttons for this Station */}
                            <div className="grid grid-cols-1 gap-1.5 pt-0.5">
                              {(!ord.currentClaim || ord.currentClaim.station !== ord.currentStatus) && (
                                <button
                                  type="button"
                                  onClick={() => claimStationTask(ord.id, ord.currentStatus, currentUser)}
                                  className="w-full py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 transition-all flex items-center justify-center gap-1 active:scale-95"
                                  title="Ambil tugas ini agar rekan kerja tahu"
                                >
                                  <HandMetal className="w-3 h-3 text-cyan-400" />
                                  <span>Ambil Tugas (Klaim)</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setStationModalOrder(ord);
                                  setStationModalStation(ord.currentStatus);
                                }}
                                className="w-full py-1.5 px-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-[10px] transition-all flex items-center justify-center gap-1 shadow-md shadow-orange-500/20 active:scale-95"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span>Upload Foto Bukti (+Rp {estCommission.toLocaleString('id-ID')})</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {ord.currentStatus === 'antrean' && (
                          <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">Siap dicuci:</span>
                            <button
                              type="button"
                              onClick={() => {
                                setStationModalOrder(ord);
                                setStationModalStation('cuci');
                              }}
                              className="py-1 px-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm"
                            >
                              <WashingMachine className="w-3 h-3" />
                              <span>Mulai Cuci (Foto Bukti)</span>
                            </button>
                          </div>
                        )}

                        {ord.currentStatus === 'siap' && (
                          <div className="space-y-1.5">
                            <div className="p-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Semua Stasiun Selesai • Siap Ambil / Antar</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const cleanPhone = ord.customerPhone.replace(/[^0-9]/g, '');
                                const phone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
                                const text = encodeURIComponent(
                                  `Halo Kak ${ord.customerName}! Cucian Anda di LaundryHub dengan No. Nota *${ord.invoiceNo}* (${ord.weightKg} kg) sudah SELESAI, bersih, wangi ${ord.perfumeName}, dan rapi dipacking ✨\n\nPesanan sudah siap diambil di outlet atau siap diantar kurir.\nCek status & foto bukti cucian: https://laundryhub.app/?nota=${ord.invoiceNo}`
                                );
                                window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
                              }}
                              className="w-full py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
                              title="Kirim Pesan WhatsApp Siap Ambil / Antar ke Pelanggan"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Kirim WhatsApp Siap ke Pelanggan</span>
                            </button>
                          </div>
                        )}

                        {/* Card Bottom Bar: Detail Info & IoT controls */}
                        <div className="pt-1.5 flex items-center justify-between gap-1.5 border-t border-slate-800">
                          <button
                            onClick={() => setSelectedOrderForDetail(ord)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-[10px] font-medium"
                            title="Detail Order & Riwayat Foto"
                          >
                            <Info className="w-3.5 h-3.5 text-slate-400" />
                            <span>Detail</span>
                          </button>

                          {/* Quick IoT trigger if cuci / kering */}
                          {(ord.currentStatus === 'antrean' || ord.currentStatus === 'cuci') && (
                            <button
                              onClick={() => setIsIotModalOpen(true)}
                              className="px-2 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold flex items-center gap-1"
                              title="Sambungkan ke Mesin IoT"
                            >
                              <WashingMachine className="w-3 h-3" />
                              <span>IoT Mesin</span>
                            </button>
                          )}

                          {/* Quick Advance fallback */}
                          {next && (
                            <button
                              onClick={() => handleAdvanceStatus(ord.id, ord.currentStatus)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[10px] transition-colors"
                              title="Lewati / Majukan status secara manual"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
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

      {/* Order Detail Modal with Photo Proof Gallery */}
      {selectedOrderForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-orange-400">
                  {selectedOrderForDetail.invoiceNo}
                </span>
                <h3 className="text-sm font-bold text-white">Detail Produksi & Bukti Foto Stasiun</h3>
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

              {/* Detail Isi Pakaian & Catatan Sortir */}
              {selectedOrderForDetail.clothesDetails && selectedOrderForDetail.clothesDetails.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-300 flex items-center gap-1">
                      <ClipboardCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Rincian Pakaian ({selectedOrderForDetail.totalPieces || selectedOrderForDetail.clothesDetails.reduce((a, b) => a + b.quantity, 0)} Pcs):</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setClothesModalOrder(selectedOrderForDetail);
                      }}
                      className="text-[10px] text-indigo-400 hover:underline font-bold"
                    >
                      Edit Pcs
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300">
                    {selectedOrderForDetail.clothesDetails.filter((c) => c.quantity > 0).map((c, i) => (
                      <div key={i} className="flex justify-between bg-slate-900/80 px-2 py-1 rounded">
                        <span className="truncate">• {c.name} {c.notes ? `(${c.notes})` : ''}</span>
                        <strong className="text-indigo-300 shrink-0 ml-1">{c.quantity} pcs</strong>
                      </div>
                    ))}
                  </div>
                  {selectedOrderForDetail.sortingNotes && (
                    <div className="mt-1 text-[10px] text-amber-300 bg-amber-950/40 p-1.5 rounded border border-amber-500/20">
                      <strong>Catatan Sortir / Kerusakan:</strong> {selectedOrderForDetail.sortingNotes}
                    </div>
                  )}
                </div>
              )}

              {/* Status Timestamps & Photo Proofs Gallery */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="font-bold text-slate-400 block text-[10px] uppercase">
                  Riwayat Pengerjaan Stasiun & Bukti Foto:
                </span>
                <div className="space-y-2">
                  {Object.entries(selectedOrderForDetail.statusTimestamps || {}).map(([st, ts]) => (
                    <div
                      key={st}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="capitalize font-bold text-orange-400 flex items-center gap-1">
                          <span>{st === 'sortir' ? '🔍 Sortir' : st === 'cuci' ? '🫧 Cuci' : st === 'kering' ? '🔥 Kering' : st === 'setrika' ? '💨 Setrika' : st === 'packing' ? '📦 Packing' : st}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{ts?.time}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <span>Petugas (PIC): <strong>{ts?.picName || 'Operator'}</strong></span>
                        {ts?.commissionEarned && (
                          <span className="text-emerald-400 font-mono font-bold">
                            +Rp {ts.commissionEarned.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>

                      {ts?.stationNotes && (
                        <p className="text-[10px] text-amber-300/90 italic bg-slate-900/80 p-1 rounded">
                          "{ts.stationNotes}"
                        </p>
                      )}

                      {ts?.photoProof && (
                        <div className="pt-1 flex items-center gap-2">
                          <img
                            src={ts.photoProof}
                            alt={`Bukti ${st}`}
                            className="w-16 h-12 object-cover rounded-lg border border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              setPhotoViewerData({
                                url: ts.photoProof!,
                                invoiceNo: selectedOrderForDetail.invoiceNo,
                                station: st,
                                picName: ts.picName || 'Operator',
                                time: ts.time,
                                commission: ts.commissionEarned,
                                notes: ts.stationNotes,
                              });
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPhotoViewerData({
                                url: ts.photoProof!,
                                invoiceNo: selectedOrderForDetail.invoiceNo,
                                station: st,
                                picName: ts.picName || 'Operator',
                                time: ts.time,
                                commission: ts.commissionEarned,
                                notes: ts.stationNotes,
                              });
                            }}
                            className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Camera className="w-3 h-3" />
                            <span>Lihat Foto Bukti Stasiun</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedOrderForDetail(null)}
                className="w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 transition-colors"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Station Photo Proof Upload Modal */}
      {stationModalOrder && (
        <StationPhotoProofModal
          isOpen={!!stationModalOrder}
          onClose={() => setStationModalOrder(null)}
          order={stationModalOrder}
          station={stationModalStation}
        />
      )}

      {/* Clothes Detail Modal */}
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

      {/* Photo Proof Lightbox Viewer Modal */}
      {photoViewerData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden space-y-3">
            {/* Top Bar */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
              <div>
                <span className="font-mono text-xs font-bold text-orange-400">
                  {photoViewerData.invoiceNo}
                </span>
                <h4 className="text-sm font-bold text-white capitalize">
                  Bukti Pengerjaan: Station {photoViewerData.station}
                </h4>
              </div>
              <button
                onClick={() => setPhotoViewerData(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo with Watermark overlay */}
            <div className="relative bg-black px-4 flex justify-center">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 w-full max-h-[360px]">
                <img
                  src={photoViewerData.url}
                  alt="Bukti Foto Full"
                  className="w-full h-full object-contain max-h-[360px]"
                />
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

            {/* Details Footer */}
            <div className="p-4 pt-1 space-y-2 text-xs">
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400">Komisi Yang Diterima PIC:</span>
                <span className="font-mono text-emerald-400 font-black text-sm">
                  +Rp {(photoViewerData.commission || 0).toLocaleString('id-ID')}
                </span>
              </div>
              {photoViewerData.notes && (
                <div className="text-amber-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                  <strong>Catatan Petugas:</strong> {photoViewerData.notes}
                </div>
              )}
              <button
                type="button"
                onClick={() => setPhotoViewerData(null)}
                className="w-full py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 font-semibold text-xs"
              >
                Tutup
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
