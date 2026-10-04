import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus, User, StationCommissionRates } from '../types';
import {
  Camera,
  Upload,
  CheckCircle2,
  X,
  AlertTriangle,
  Sparkles,
  WashingMachine,
  Flame,
  Shirt,
  PackageCheck,
  Coins,
  Clock,
  UserCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StationPhotoProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  station: OrderStatus;
  onSuccess?: () => void;
}

export const StationPhotoProofModal: React.FC<StationPhotoProofModalProps> = ({
  isOpen,
  onClose,
  order,
  station,
  onSuccess,
}) => {
  const { currentUser, users, stationRates, completeStationTask } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(currentUser.id);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Available worker options (workers, operators, or owner)
  const eligibleWorkers = users.filter((u) => u.role === 'produksi' || u.role === 'operator' || u.role === 'kasir' || u.role === 'owner');
  const selectedWorker: User = users.find((u) => u.id === selectedWorkerId) || currentUser;

  // Station details
  const getStationInfo = (st: OrderStatus) => {
    switch (st) {
      case 'cuci':
        return {
          title: 'Station Cuci (Washing)',
          icon: <WashingMachine className="w-5 h-5 text-cyan-400" />,
          color: 'cyan',
          borderColor: 'border-cyan-500/40',
          bgBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          desc: 'Pencucian pakaian di mesin washer, penambahan deterjen & pelembut.',
          defaultPhoto: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&auto=format&fit=crop&q=80',
          presets: [
            {
              label: '🫧 Pakaian Masuk Mesin & Sabun',
              url: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&auto=format&fit=crop&q=80',
            },
            {
              label: '🧺 Pemilahan Warna & Noda Bersih',
              url: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&auto=format&fit=crop&q=80',
            },
          ],
        };
      case 'kering':
        return {
          title: 'Station Pengeringan (Dryer)',
          icon: <Flame className="w-5 h-5 text-orange-400" />,
          color: 'orange',
          borderColor: 'border-orange-500/40',
          bgBadge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
          desc: 'Pengeringan drum dryer suhu terukur hingga 100% kering bebas bau apek.',
          defaultPhoto: 'https://images.unsplash.com/photo-1521656693074-0ef32e80a5d5?w=600&auto=format&fit=crop&q=80',
          presets: [
            {
              label: '🔥 Drum Dryer Berputar Hangat',
              url: 'https://images.unsplash.com/photo-1521656693074-0ef32e80a5d5?w=600&auto=format&fit=crop&q=80',
            },
            {
              label: '☀️ Pakaian Kering Siap Lipat',
              url: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=600&auto=format&fit=crop&q=80',
            },
          ],
        };
      case 'setrika':
        return {
          title: 'Station Setrika Uap (Steam Press)',
          icon: <Shirt className="w-5 h-5 text-purple-400" />,
          color: 'purple',
          borderColor: 'border-purple-500/40',
          bgBadge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          desc: 'Penyetrikaan uap boiler bertekanan tinggi & penyemprotan parfum aroma pilihan.',
          defaultPhoto: 'https://images.unsplash.com/photo-1489274495757-95c7c837b101?w=600&auto=format&fit=crop&q=80',
          presets: [
            {
              label: '💨 Setrika Uap Halus & Wangi',
              url: 'https://images.unsplash.com/photo-1489274495757-95c7c837b101?w=600&auto=format&fit=crop&q=80',
            },
            {
              label: '👔 Lipatan Rapi & Kancing Terpasang',
              url: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=600&auto=format&fit=crop&q=80',
            },
          ],
        };
      case 'packing':
      default:
        return {
          title: 'Station Packing & QC',
          icon: <PackageCheck className="w-5 h-5 text-amber-400" />,
          color: 'amber',
          borderColor: 'border-amber-500/40',
          bgBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          desc: 'Pemeriksaan kelengkapan pakaian, pembungkusan plastik segel rapat & label nota.',
          defaultPhoto: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&auto=format&fit=crop&q=80',
          presets: [
            {
              label: '📦 Pakaian Diplastik & Segel Rapi',
              url: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&auto=format&fit=crop&q=80',
            },
            {
              label: '🏷️ Label Nota & Tag Selesai QC',
              url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=600&auto=format&fit=crop&q=80',
            },
          ],
        };
    }
  };

  const stationInfo = getStationInfo(station);

  // Rate and Commission Calculation
  const ratePerKg = stationRates[station as keyof StationCommissionRates] || 300;
  const rawCommission = order.weightKg > 0
    ? Math.round(order.weightKg * ratePerKg)
    : Math.round(order.itemCount * (ratePerKg * 1.5));
  const estimatedCommission = Math.max(500, rawCommission);

  if (!isOpen) return null;

  // Handle file capture / upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setErrorMsg(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhoto) {
      setErrorMsg('Wajib sertakan foto bukti pengerjaan stasiun sebelum menyelesaikan tugas!');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = completeStationTask(
        order.id,
        station,
        selectedWorker,
        selectedPhoto,
        notes.trim() || undefined
      );

      if (res.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#f59e0b', '#06b6d4'],
        });

        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem saat menyimpan bukti');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDateFormatted = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 space-y-4 my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl bg-slate-800 border ${stationInfo.borderColor}`}>
              {stationInfo.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-orange-400">
                  {order.invoiceNo}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${stationInfo.bgBadge}`}>
                  {station.toUpperCase()}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                {stationInfo.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order & Komisi Reward Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Pelanggan:</span>
            <strong className="text-slate-200">{order.customerName}</strong>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Beban Cucian:</span>
            <span className="font-mono text-cyan-300 font-bold">
              {order.weightKg > 0 ? `${order.weightKg} kg` : `${order.itemCount} pcs`} ({order.items.map((i) => i.serviceName).join(', ')})
            </span>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Tarif Borongan Station Ini:
              </span>
              <span className="text-xs font-mono text-slate-300 font-bold">
                Rp {ratePerKg.toLocaleString('id-ID')} / kg
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-400 font-semibold block uppercase">
                Komisi Yang Didapat:
              </span>
              <div className="text-base font-black font-mono text-emerald-400 flex items-center gap-1 justify-end">
                <Coins className="w-4 h-4 text-emerald-400" />
                <span>+Rp {estimatedCommission.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Worker PIC Picker (shared mobile / outlet tablet support) */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Petugas Pengerjaan (PIC):
            </label>
            <div className="relative">
              <select
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-orange-500"
              >
                {eligibleWorkers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.role.toUpperCase()}) — {w.email}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              💡 Komisi otomatis masuk ke rekening dompet karyawan yang dipilih.
            </p>
          </div>

          {/* Photo Proof Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-orange-400" />
                <span>Foto Bukti Pengerjaan (Wajib):</span>
              </label>
              {selectedPhoto && (
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Foto Terlampir
                </span>
              )}
            </div>

            {/* Hidden Input for Real Camera Capture or File Picker */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Photo Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>Ambil Kamera HP</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>Pilih dari Galeri</span>
              </button>
            </div>

            {/* Quick Realistic Photo Presets */}
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">
                Atau pilih contoh foto realistis untuk simulasi cepat:
              </span>
              <div className="flex gap-2 flex-wrap">
                {stationInfo.presets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedPhoto(preset.url);
                      setErrorMsg(null);
                    }}
                    className={`text-[10px] px-2.5 py-1.5 rounded-lg border transition-all text-left flex items-center gap-1.5 ${
                      selectedPhoto === preset.url
                        ? 'bg-orange-500/20 border-orange-500 text-orange-300 font-bold ring-1 ring-orange-500'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Preview Container with Watermark */}
            {selectedPhoto ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-orange-500/50 shadow-xl max-h-56 bg-black">
                <img
                  src={selectedPhoto}
                  alt="Bukti Pengerjaan"
                  className="w-full h-52 object-cover"
                />
                {/* Watermark Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/95 via-black/80 to-transparent text-[9px] font-mono text-slate-200 space-y-0.5 pointer-events-none">
                  <div className="flex items-center justify-between text-orange-400 font-bold">
                    <span>LAUNDRYHUB BUKTI RESMI</span>
                    <span>{order.invoiceNo}</span>
                  </div>
                  <div className="text-slate-300 flex items-center justify-between">
                    <span>Stasiun: {station.toUpperCase()}</span>
                    <span>PIC: {selectedWorker.name}</span>
                  </div>
                  <div className="text-slate-400 text-[8px] flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{currentDateFormatted}</span>
                  </div>
                </div>

                {/* Change photo button */}
                <button
                  type="button"
                  onClick={() => setSelectedPhoto('')}
                  className="absolute top-2 right-2 p-1.5 rounded-xl bg-black/70 hover:bg-black text-white transition-colors"
                  title="Ganti Foto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center text-slate-500 space-y-2 bg-slate-950/40">
                <Camera className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                <div className="text-xs font-semibold text-slate-400">Belum ada foto bukti yang dipilih</div>
                <p className="text-[10px] text-slate-500">
                  Gunakan tombol kamera HP atau pilih contoh foto di atas untuk melanjutkan
                </p>
              </div>
            )}
          </div>

          {/* Optional Worker Notes */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Catatan Pengerjaan (Opsional):
            </label>
            <input
              type="text"
              placeholder="Misal: Noda minyak sudah dibersihkan, kancing lengkap."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                selectedPhoto
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Menyimpan...'
                  : `Kirim Foto & Klaim Komisi (+Rp ${estimatedCommission.toLocaleString('id-ID')})`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
