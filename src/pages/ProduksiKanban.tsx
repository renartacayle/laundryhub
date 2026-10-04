import React, { useState, useEffect } from 'react';
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
  Layers,
  Search,
  ChevronDown,
  ListFilter,
  CheckCheck,
} from 'lucide-react';
import { IotMachineControlModal } from '../components/IotMachineControlModal';
import { StationPhotoProofModal } from '../components/StationPhotoProofModal';
import { ClothesDetailModal } from '../components/ClothesDetailModal';

interface ProduksiKanbanProps {
  currentSubTab?: string;
}

interface StationInfo {
  id: OrderStatus;
  step: number;
  label: string;
  emoji: string;
  desc: string;
  color: string;
  borderColor: string;
  bgPill: string;
  textPill: string;
}

const STATIONS: StationInfo[] = [
  {
    id: 'antrean',
    step: 1,
    label: 'Antrean Masuk',
    emoji: '📥',
    desc: 'Cucian baru diterima kasir / kurir, siap disortir',
    color: 'text-slate-300',
    borderColor: 'border-slate-700',
    bgPill: 'bg-slate-800 text-slate-300 border-slate-700',
    textPill: 'text-slate-300',
  },
  {
    id: 'sortir',
    step: 2,
    label: 'Sortir & Tagging',
    emoji: '🔍',
    desc: 'Pengecekan noda, jenis kain, hitung pcs pakaian & tagging barcode',
    color: 'text-indigo-400',
    borderColor: 'border-indigo-500/40',
    bgPill: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    textPill: 'text-indigo-300',
  },
  {
    id: 'cuci',
    step: 3,
    label: 'Proses Cuci',
    emoji: '🫧',
    desc: 'Pencucian mesin washer sesuai petunjuk deterjen & softener',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    bgPill: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    textPill: 'text-cyan-300',
  },
  {
    id: 'kering',
    step: 4,
    label: 'Pengeringan Dryer',
    emoji: '🔥',
    desc: 'Pengeringan mesin dryer otomatis hingga kering sempurna',
    color: 'text-orange-400',
    borderColor: 'border-orange-500/40',
    bgPill: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    textPill: 'text-orange-300',
  },
  {
    id: 'setrika',
    step: 5,
    label: 'Setrika Uap',
    emoji: '💨',
    desc: 'Penyetrikaan uap boiler licin, rapi, dan semprot parfum pilihan',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    bgPill: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    textPill: 'text-purple-300',
  },
  {
    id: 'packing',
    step: 6,
    label: 'Packing & QC',
    emoji: '📦',
    desc: 'Quality control akhir, pelipatan rapi, pembungkusan & segel nota',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    bgPill: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    textPill: 'text-amber-300',
  },
  {
    id: 'siap',
    step: 7,
    label: 'Siap Ambil / Antar',
    emoji: '✅',
    desc: 'Pakaian telah selesai dipack, siap diambil pelanggan atau diantar kurir',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    bgPill: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    textPill: 'text-emerald-300',
  },
];

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

  // Selected station in the sidebar: 'all' or one of the 7 OrderStatus
  const [selectedStation, setSelectedStation] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('all');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [isIotModalOpen, setIsIotModalOpen] = useState(false);
  const [clothesModalOrder, setClothesModalOrder] = useState<Order | null>(null);
  const [stationModalOrder, setStationModalOrder] = useState<Order | null>(null);
  const [stationModalStation, setStationModalStation] = useState<OrderStatus>('sortir');
  const [photoViewerData, setPhotoViewerData] = useState<{
    url: string; invoiceNo: string; station: string; picName: string; time: string; commission?: number; notes?: string;
  } | null>(null);

  useEffect(() => {
    if (currentSubTab === 'prod-iot') {
      setActiveTab('iot');
    } else if (currentSubTab === 'prod-productivity') {
      setActiveTab('productivity');
    } else if (currentSubTab.startsWith('prod-station-')) {
      const st = currentSubTab.replace('prod-station-', '') as OrderStatus;
      if (STATIONS.some((s) => s.id === st)) {
        setSelectedStation(st);
        setActiveTab('kanban');
      }
    } else {
      setActiveTab('kanban');
    }
  }, [currentSubTab]);

  // Filter orders by staff PIC & search text
  const filteredOrders = orders.filter((o) => {
    if (selectedStaffFilter !== 'all') {
      const timestamps = Object.values(o.statusTimestamps || {});
      const hasPic = timestamps.some((t) => t?.picId === selectedStaffFilter);
      if (!hasPic) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchInvoice = o.invoiceNo.toLowerCase().includes(q);
      const matchCustomer = o.customerName.toLowerCase().includes(q);
      const matchItems = o.items.some((i) => i.serviceName.toLowerCase().includes(q));
      if (!matchInvoice && !matchCustomer && !matchItems) return false;
    }
    return true;
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

  // Counts per station
  const stationCounts = STATIONS.reduce((acc, st) => {
    acc[st.id] = filteredOrders.filter((o) => o.currentStatus === st.id).length;
    return acc;
  }, {} as Record<OrderStatus, number>);

  const totalActiveOrders = filteredOrders.filter((o) => o.currentStatus !== 'selesai').length;

  const currentStationInfo = STATIONS.find((s) => s.id === selectedStation);

  // Orders to render in main view
  const displayedOrders = selectedStation === 'all'
    ? filteredOrders
    : filteredOrders.filter((o) => o.currentStatus === selectedStation);

  // Render individual Order Card
  const renderOrderCard = (ord: Order) => {
    const stConfig = STATIONS.find((s) => s.id === ord.currentStatus) || STATIONS[0];
    const next = getNextStatus(ord.currentStatus);
    const isProductionStation = STATION_SEQUENCE.includes(ord.currentStatus);
    const currentRate = isProductionStation
      ? (stationRates[ord.currentStatus as keyof StationCommissionRates] || 200)
      : 200;
    const estCommission = Math.max(500, Math.round(
      ord.weightKg > 0 ? ord.weightKg * currentRate : ord.itemCount * (currentRate * 1.5)
    ));
    const isClaimedByMe = ord.currentClaim?.workerId === currentUser.id;

    return (
      <div
        key={ord.id}
        className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-lg hover:border-orange-500/50 hover:shadow-orange-500/5 transition-all flex flex-col justify-between overflow-hidden group"
      >
        {/* Top Header Card */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => openTrackingModal(ord.invoiceNo)}
                  className="font-mono text-xs font-bold text-orange-400 hover:text-orange-300 hover:underline flex items-center gap-1"
                >
                  <span>{ord.invoiceNo}</span>
                  <Eye className="w-3 h-3 opacity-70" />
                </button>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${stConfig.bgPill}`}>
                  {stConfig.emoji} {stConfig.label}
                </span>
                {ord.isExpress && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 flex items-center gap-1 shadow-sm">
                    <Zap className="w-2.5 h-2.5 fill-current" /> Kilat
                  </span>
                )}
              </div>

              <div className="text-base font-black text-white mt-1 leading-snug truncate">
                {ord.customerName}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {ord.items.map((i) => `${i.serviceName} (${i.quantity} ${i.unit})`).join(', ')}
              </p>
            </div>

            <div className="text-right shrink-0 flex flex-col items-end">
              <span className="px-2.5 py-1 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-xs">
                ⚖️ {ord.weightKg > 0 ? `${ord.weightKg} kg` : `${ord.itemCount} pcs`}
              </span>
              {ord.perfumeName && (
                <span className="text-[11px] text-purple-300 mt-1 flex items-center gap-1">
                  🌸 {ord.perfumeName}
                </span>
              )}
            </div>
          </div>

          {/* Notes alert */}
          {(ord.specialNotes || ord.sortingNotes) && (
            <div className="mt-2.5 p-2 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span className="truncate">{ord.sortingNotes || ord.specialNotes}</span>
            </div>
          )}
        </div>

        {/* Middle Body: Progress Stepper & Clothes */}
        <div className="p-4 space-y-3.5">
          {/* Station Stepper Track */}
          <div>
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 mb-1.5">
              <span>Alur Stasiun Pengerjaan</span>
              <span className="text-slate-500 font-mono">5 Stasiun Borongan</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {STATION_SEQUENCE.map((st) => {
                const ts = ord.statusTimestamps?.[st];
                const isDone = !!ts;
                const isCurrent = ord.currentStatus === st;
                const stMeta = STATIONS.find((s) => s.id === st);

                return (
                  <div
                    key={st}
                    className={`rounded-xl border p-2 text-center transition-all ${
                      isDone
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : isCurrent
                        ? 'bg-orange-950/50 border-orange-500/60 text-orange-300 ring-1 ring-orange-500/50'
                        : 'bg-slate-950/50 border-slate-800 text-slate-600'
                    }`}
                  >
                    <div className="text-xs">{stMeta?.emoji}</div>
                    <div className="text-[9px] font-bold mt-0.5 truncate">{stMeta?.label.split(' ')[0]}</div>
                    <div className="mt-1">
                      {ts?.photoProof ? (
                        <button
                          type="button"
                          onClick={() =>
                            setPhotoViewerData({
                              url: ts.photoProof!,
                              invoiceNo: ord.invoiceNo,
                              station: st,
                              picName: ts.picName || 'Operator',
                              time: ts.time,
                              commission: ts.commissionEarned,
                              notes: ts.stationNotes,
                            })
                          }
                          className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold hover:underline flex items-center justify-center gap-0.5 mx-auto"
                        >
                          <Camera className="w-2.5 h-2.5" /> Foto
                        </button>
                      ) : isDone ? (
                        <span className="text-[10px] text-emerald-400 font-bold">✓ Selesai</span>
                      ) : isCurrent ? (
                        <span className="text-[9px] text-orange-400 font-black animate-pulse">● Aktif</span>
                      ) : (
                        <span className="text-[9px] text-slate-700">-</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clothes Detail & AI Scanner Pill */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setClothesModalOrder(ord)}
              className="flex items-center gap-1.5 text-xs text-indigo-300 hover:text-indigo-200 font-semibold"
            >
              <ClipboardCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                {ord.clothesDetails && ord.clothesDetails.length > 0
                  ? `${ord.totalPieces || ord.clothesDetails.reduce((s, c) => s + (c.quantity || 0), 0)} Pcs Pakaian`
                  : '+ Hitung Jumlah Pcs'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => openAiScanner(ord.id)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-yellow-300 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/30 flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-yellow-300" />
              <span>AI Scan</span>
              {ord.aiInspection && <BadgeCheck className="w-3 h-3 text-emerald-400" />}
            </button>
          </div>
        </div>

        {/* Bottom Action Area */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
          {/* Production Station Action Box */}
          {isProductionStation && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Stasiun Pengerjaan: <strong className="text-white uppercase">{ord.currentStatus}</strong>
                </span>
                <span className="font-mono text-emerald-400 font-black text-sm flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-emerald-400" />
                  +Rp {estCommission.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Claim detail */}
              {ord.currentClaim?.station === ord.currentStatus ? (
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>
                      {isClaimedByMe ? (
                        <strong className="text-cyan-300">Anda sedang mengerjakan tugas ini</strong>
                      ) : (
                        <span>Dikerjakan: <strong className="text-white">{ord.currentClaim.workerName}</strong></span>
                      )}
                    </span>
                  </span>
                  {(isClaimedByMe || currentUser.role === 'owner') && (
                    <button
                      type="button"
                      onClick={() => unclaimStationTask(ord.id)}
                      className="text-xs text-rose-400 hover:underline font-semibold ml-2"
                    >
                      Lepas Klaim
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="text-amber-400/90 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Belum ada yang ambil
                  </span>
                  <span className="font-mono text-slate-500">Tarif: Rp {currentRate}/kg</span>
                </div>
              )}

              {/* Buttons: Claim & Upload Proof */}
              <div className="grid grid-cols-2 gap-2">
                {(!ord.currentClaim || ord.currentClaim.station !== ord.currentStatus) && (
                  <button
                    type="button"
                    onClick={() => claimStationTask(ord.id, ord.currentStatus, currentUser)}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-cyan-500/30 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    <HandMetal className="w-4 h-4 text-cyan-400" />
                    <span>Ambil Tugas</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setStationModalOrder(ord);
                    setStationModalStation(ord.currentStatus);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer ${
                    (!ord.currentClaim || ord.currentClaim.station !== ord.currentStatus)
                      ? 'col-span-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-orange-500/20'
                      : 'col-span-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 shadow-orange-500/20'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>Upload Foto Bukti</span>
                </button>
              </div>
            </div>
          )}

          {/* Antrean: Start button */}
          {ord.currentStatus === 'antrean' && (
            <button
              type="button"
              onClick={() => {
                setStationModalOrder(ord);
                setStationModalStation('cuci');
              }}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer"
            >
              <WashingMachine className="w-4 h-4" />
              <span>Mulai Cuci (Upload Foto Bukti)</span>
            </button>
          )}

          {/* Siap Ambil: Send WA Button */}
          {ord.currentStatus === 'siap' && (
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Semua 5 Stasiun Selesai • Siap Diambil</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const cleanPhone = ord.customerPhone.replace(/[^0-9]/g, '');
                  const phone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
                  const text = encodeURIComponent(
                    `Halo Kak *${ord.customerName}*! Cucian Anda di LaundryHub dengan No. Nota *${ord.invoiceNo}* (${ord.weightKg} kg) sudah SELESAI, bersih, wangi ${ord.perfumeName}, dan siap diambil ✨\n\nCek foto bukti cucian: https://laundryhub.app/?nota=${ord.invoiceNo}`
                  );
                  window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Kirim WhatsApp Siap ke Pelanggan</span>
              </button>
            </div>
          )}

          {/* Card Footer Tools */}
          <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800">
            <button
              onClick={() => setSelectedOrderForDetail(ord)}
              className="text-slate-400 hover:text-white flex items-center gap-1 font-medium transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Detail Order</span>
            </button>

            <div className="flex items-center gap-1.5">
              {(ord.currentStatus === 'antrean' || ord.currentStatus === 'cuci') && (
                <button
                  onClick={() => setIsIotModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-900 transition flex items-center gap-1"
                >
                  <WashingMachine className="w-3 h-3 text-cyan-400" />
                  <span>IoT Mesin</span>
                </button>
              )}

              {next && (
                <button
                  onClick={() => handleAdvanceStatus(ord.id, ord.currentStatus)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1"
                  title="Majukan ke tahap berikutnya secara manual"
                >
                  <span>Skip</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 w-full max-w-full overflow-x-hidden">
      {/* ─── TOP ACTION BAR ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab Sub-View pills */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-1">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'kanban'
                  ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shirt className="w-3.5 h-3.5" />
              <span>Alur Kerja Workshop</span>
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
              <span>IoT Mesin</span>
              <span className="bg-cyan-400/20 text-cyan-300 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                {machines.filter((m) => m.status === 'running').length} ON
              </span>
            </button>
          </div>

          {/* Dompet Cuan Gaji */}
          <button
            onClick={() => openDopaminePayday(currentUser.id)}
            className="px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 text-slate-950 shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform cursor-pointer"
          >
            <Coins className="w-3.5 h-3.5 text-slate-950" />
            <span>💰 Dompet: Rp {mySlip.netTakeHomePay.toLocaleString('id-ID')}</span>
          </button>

          {/* Nota Gaji Resmi Modal Button */}
          <button
            onClick={() => openSalarySlipModal(currentUser.id)}
            className="px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
            title="Lihat & Cetak Nota Gaji Resmi (Dokumen / Thermal)"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nota Gaji</span>
          </button>

          {/* AI Scanner */}
          <button
            onClick={() => openAiScanner()}
            className="px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 bg-indigo-600/20 hover:bg-indigo-600/35 text-indigo-300 border border-indigo-500/30 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>AI Scan Noda</span>
          </button>

          {/* IoT control shortcut */}
          <button
            onClick={() => setIsIotModalOpen(true)}
            className="px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 bg-cyan-600/20 hover:bg-cyan-600/35 text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer"
          >
            <WashingMachine className="w-3.5 h-3.5" />
            <span>Panel IoT</span>
          </button>
        </div>

        {/* Search & Staff Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nota / nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 w-44"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedStaffFilter}
              onChange={(e) => setSelectedStaffFilter(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">Semua Karyawan</option>
              {users
                .filter((u) => u.role === 'produksi' || u.role === 'kasir')
                .map((u) => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                    {u.name} ({u.role})
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* ─── 2-COLUMN SIDEBAR WORKFLOW LAYOUT (NO HORIZONTAL SCROLL) ───── */}
      <div className="flex flex-col lg:flex-row gap-5 items-start w-full">
        {/* ================= LEFT COLUMN: ALUR STASIUN SIDEBAR ================= */}
        <div className="w-full lg:w-72 xl:w-80 shrink-0 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-black">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-black text-sm text-white">Alur Stasiun</h4>
                <p className="text-[10px] text-slate-400 font-medium">Workflow Workshop Produksi</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-black bg-orange-500 text-slate-950">
              {totalActiveOrders} Total
            </span>
          </div>

          {/* Navigation Items (Sidebar Style) */}
          <div className="space-y-1.5">
            {/* Option "Semua Tahap" */}
            <button
              type="button"
              onClick={() => setSelectedStation('all')}
              className={`w-full p-3 rounded-2xl transition-all flex items-center justify-between text-left group ${
                selectedStation === 'all'
                  ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/10 border-2 border-orange-500 shadow-md shadow-orange-500/10'
                  : 'bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/80 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🌟</span>
                <div>
                  <div className={`text-xs font-black ${selectedStation === 'all' ? 'text-orange-400' : 'text-white'}`}>
                    Semua Tahap Workshop
                  </div>
                  <div className="text-[10px] text-slate-400">Ringkasan seluruh antrean</div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                selectedStation === 'all'
                  ? 'bg-orange-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {totalActiveOrders}
              </span>
            </button>

            {/* List of 7 Stages */}
            {STATIONS.map((st) => {
              const count = stationCounts[st.id] || 0;
              const isSelected = selectedStation === st.id;
              const isPieceRate = STATION_SEQUENCE.includes(st.id);
              const rate = isPieceRate ? (stationRates[st.id as keyof StationCommissionRates] || 200) : null;

              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStation(st.id)}
                  className={`w-full p-2.5 rounded-2xl transition-all flex items-center justify-between text-left group cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-2 border-orange-500 shadow-md shadow-orange-500/10'
                      : 'bg-slate-950/40 hover:bg-slate-800/50 border border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg shrink-0">{st.emoji}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-mono font-bold">#{st.step}</span>
                        <span className={`text-xs font-black truncate ${isSelected ? 'text-orange-400 font-extrabold' : 'text-white'}`}>
                          {st.label}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        {rate ? (
                          <span className="text-emerald-400 font-mono font-semibold">+Rp {rate}/kg</span>
                        ) : (
                          <span>{st.id === 'antrean' ? 'Cucian masuk' : 'Siap pickup/kirim'}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-xs font-black shrink-0 ml-2 ${
                    isSelected
                      ? 'bg-orange-500 text-slate-950'
                      : count > 0
                      ? 'bg-slate-800 text-orange-300 border border-orange-500/30'
                      : 'bg-slate-800/60 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Card in Station Sidebar: Worker Payday Summary */}
          <div className="pt-3 border-t border-slate-800">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>Komisi Stasiun Saya</span>
                </span>
                <span className="font-mono text-emerald-400 font-black text-xs">
                  +Rp {mySlip.totalStationEarnings.toLocaleString('id-ID')}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Setiap stasiun yang Anda kerjakan & upload foto bukti otomatis menambah komisi take-home pay!
              </p>
              <button
                type="button"
                onClick={() => openDopaminePayday(currentUser.id)}
                className="w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-black transition flex items-center justify-center gap-1.5"
              >
                <span>Lihat Rekap Cuan Dompet</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: MAIN ORDERS WORKSPACE ================= */}
        <div className="flex-1 w-full min-w-0 space-y-4">
          {/* Header of the Active Workspace */}
          <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shadow-inner shrink-0">
                {selectedStation === 'all' ? '🌟' : currentStationInfo?.emoji}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white">
                    {selectedStation === 'all'
                      ? 'Semua Tahap Workshop Produksi'
                      : `Tahap ${currentStationInfo?.step}: ${currentStationInfo?.label}`}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    {displayedOrders.length} Pesanan
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedStation === 'all'
                    ? 'Menampilkan seluruh pesanan aktif workshop dari tahap 1 hingga 7 secara vertikal (tanpa scroll horizontal).'
                    : currentStationInfo?.desc}
                </p>
              </div>
            </div>

            {/* Quick action: View switcher or jump */}
            {selectedStation !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedStation('all')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <span>Lihat Semua Tahap</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Cards Content Area: Single Station vs All Stations */}
          {selectedStation !== 'all' ? (
            /* Mode 1: Selected Station Only */
            displayedOrders.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-2">
                <div className="text-4xl">{currentStationInfo?.emoji}</div>
                <h4 className="text-base font-bold text-white">Tidak ada cucian di tahap {currentStationInfo?.label}</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Semua cucian di tahap ini sudah selesai atau belum mencapai tahap ini.
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedStation('all')}
                  className="mt-3 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-orange-400 text-xs font-bold transition inline-flex items-center gap-1"
                >
                  <span>Buka Semua Tahap</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedOrders.map(renderOrderCard)}
              </div>
            )
          ) : (
            /* Mode 2: All Stations Stacked Vertically */
            <div className="space-y-6">
              {STATIONS.map((st) => {
                const ordersInStation = filteredOrders.filter((o) => o.currentStatus === st.id);

                return (
                  <div key={st.id} className="space-y-3">
                    {/* Station Group Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{st.emoji}</span>
                        <div>
                          <span className="text-xs font-black text-white">
                            Tahap {st.step}: {st.label}
                          </span>
                          <span className="text-[11px] text-slate-400 ml-2 hidden sm:inline">
                            — {st.desc}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedStation(st.id)}
                          className="text-[10px] text-orange-400 hover:underline font-bold"
                        >
                          Fokus Stasiun Ini
                        </button>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                          ordersInStation.length > 0
                            ? 'bg-orange-500 text-slate-950'
                            : 'bg-slate-800 text-slate-500'
                        }`}>
                          {ordersInStation.length}
                        </span>
                      </div>
                    </div>

                    {/* Cards in this station */}
                    {ordersInStation.length === 0 ? (
                      <div className="p-4 text-center rounded-2xl bg-slate-900/30 border border-slate-800/60 text-xs text-slate-500 italic">
                        Tidak ada pesanan di tahap ini
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ordersInStation.map(renderOrderCard)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── ORDER DETAIL MODAL ──────────────────────────────────────── */}
      {selectedOrderForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
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
                  <div className="font-bold text-white">{selectedOrderForDetail.customerName}</div>
                </div>
                <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-800">
                  <div className="text-slate-500 text-[10px] mb-0.5">Status Saat Ini</div>
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
                </div>
              )}

              {/* Station history */}
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <span className="font-bold text-slate-400 block text-[10px] uppercase">Riwayat Pengerjaan Stasiun:</span>
                {Object.entries(selectedOrderForDetail.statusTimestamps || {}).map(([st, ts]) => (
                  <div key={st} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
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
                    {ts?.photoProof && (
                      <div className="flex items-center gap-2 pt-1">
                        <img
                          src={ts.photoProof}
                          alt={`Bukti ${st}`}
                          className="w-16 h-12 object-cover rounded-lg border border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setPhotoViewerData({ url: ts.photoProof!, invoiceNo: selectedOrderForDetail.invoiceNo, station: st, picName: ts.picName || 'Operator', time: ts.time, commission: ts.commissionEarned, notes: ts.stationNotes })}
                        />
                        <button
                          type="button"
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
