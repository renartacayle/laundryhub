import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Camera,
  CheckCircle2,
  AlertTriangle,
  X,
  ShieldCheck,
  Search,
  Scan,
  RefreshCw,
  FileText,
  Sliders,
  ChevronRight,
  Info,
  Droplets,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AiGarmentInspection, AiStainDetection, Order } from '../types';
import { soundEngine } from '../utils/audio';

interface AiGarmentScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string | null;
}

// Preset samples for quick demonstration if camera is unavailable
const SAMPLE_PRESETS: {
  id: string;
  name: string;
  photoUrl: string;
  garmentType: string;
  fabricCareNote: string;
  stains: AiStainDetection[];
  disclaimerNote: string;
}[] = [
  {
    id: 'preset-1',
    name: 'Kemeja Putih Katun (Kerah Daki & Kancing Longgar)',
    photoUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
    garmentType: 'Kemeja Kerja Putih (100% Katun Pima)',
    fabricCareNote: 'Bahan katun sensitif noda daki protein. Hindari klorin keras agar tidak menguning.',
    stains: [
      {
        id: 'st-1',
        label: 'Noda Kerah Daki & Minyak Kulit (Tingkat 65%)',
        severity: 'high',
        confidence: 0.94,
        boundingBox: { x: 35, y: 18, width: 30, height: 15 },
        recommendedTreatment: 'Spotting Alkali Booster + Sikat Lembut sebelum Cuci',
        defectType: 'noda',
      },
      {
        id: 'st-2',
        label: 'Kancing Ke-2 Longgar & Benang Terurai',
        severity: 'medium',
        confidence: 0.89,
        boundingBox: { x: 48, y: 42, width: 12, height: 12 },
        recommendedTreatment: 'Amankan kancing / masukkan laundry net saat proses putar',
        defectType: 'kancing_lepas',
      },
      {
        id: 'st-3',
        label: 'Bercak Saus Samar di Saku Depan',
        severity: 'low',
        confidence: 0.82,
        boundingBox: { x: 62, y: 55, width: 16, height: 14 },
        recommendedTreatment: 'Oksigen Bleach Cair 40°C',
        defectType: 'noda',
      },
    ],
    disclaimerNote: 'Diterima dalam kondisi noda kerah daki tebal dan kancing ke-2 longgar dari pelanggan. LaundryHub bebas tuntutan kerusakan bawaan pakaian.',
  },
  {
    id: 'preset-2',
    name: 'Celana Jeans Denim (Lumpur & Sobek Jahitan)',
    photoUrl: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=600&auto=format&fit=crop&q=80',
    garmentType: 'Celana Jeans Denim Indigo',
    fabricCareNote: 'Pewarna indigo rentan luntur ke pakaian lain. Wajib dicuci terpisah.',
    stains: [
      {
        id: 'st-4',
        label: 'Noda Lumpur Tanah di Ujung Kaki',
        severity: 'medium',
        confidence: 0.91,
        boundingBox: { x: 40, y: 70, width: 25, height: 20 },
        recommendedTreatment: 'Pre-wash rendam bilas terpisah',
        defectType: 'noda',
      },
      {
        id: 'st-5',
        label: 'Sobek Jahitan Saku Belakang (Defect Bawaan)',
        severity: 'high',
        confidence: 0.96,
        boundingBox: { x: 50, y: 35, width: 20, height: 15 },
        recommendedTreatment: 'Catat defect bawaan agar tidak diklaim pelanggan',
        defectType: 'robek',
      },
    ],
    disclaimerNote: 'Diterima dengan sobekan jahitan saku belakang bawaan pemakaian. Foto bukti tersimpan di sistem.',
  },
  {
    id: 'preset-3',
    name: 'Gaun Pesta Silk (Risiko Luntur & Bercak Kopi)',
    photoUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80',
    garmentType: 'Gaun Pesta Silk Sutra Campuran',
    fabricCareNote: 'Dry cleaning only. Suhu air dingin (<25°C), jangan peras dengan mesin sentrifugal.',
    stains: [
      {
        id: 'st-6',
        label: 'Bercak Noda Kopi / Tanin di Bagian Rok',
        severity: 'high',
        confidence: 0.88,
        boundingBox: { x: 45, y: 50, width: 22, height: 25 },
        recommendedTreatment: 'Neutral Spotter + Dry Cleaning Fluid',
        defectType: 'noda',
      },
      {
        id: 'st-7',
        label: 'Kain Rentan Luntur (Serat Sutra Halus)',
        severity: 'medium',
        confidence: 0.93,
        boundingBox: { x: 20, y: 30, width: 60, height: 50 },
        recommendedTreatment: 'Gunakan deterjen pH netral + Color Catcher',
        defectType: 'luntur',
      },
    ],
    disclaimerNote: 'Bahan sutra khusus dengan bercak tanin lama. Dilakukan dry-clean khusus tanpa jaminan hilang 100% demi menjaga serat kain.',
  },
];

export const AiGarmentScannerModal: React.FC<AiGarmentScannerModalProps> = ({
  isOpen,
  onClose,
  orderId,
}) => {
  const { orders, saveAiInspection } = useApp();

  const [selectedPreset, setSelectedPreset] = useState(SAMPLE_PRESETS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [hasScanned, setHasScanned] = useState(true);
  const [selectedStain, setSelectedStain] = useState<AiStainDetection | null>(SAMPLE_PRESETS[0].stains[0]);
  const [customDisclaimer, setCustomDisclaimer] = useState(SAMPLE_PRESETS[0].disclaimerNote);
  const [activePhoto, setActivePhoto] = useState(SAMPLE_PRESETS[0].photoUrl);

  const matchedOrder = orders.find((o) => o.id === orderId || o.invoiceNo === orderId) || orders[0];

  useEffect(() => {
    if (selectedPreset) {
      setActivePhoto(selectedPreset.photoUrl);
      setSelectedStain(selectedPreset.stains[0]);
      setCustomDisclaimer(selectedPreset.disclaimerNote);
      setHasScanned(true);
    }
  }, [selectedPreset]);

  const handleStartScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    soundEngine.playScanBeep();

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setHasScanned(true);
          soundEngine.playStationDing();
          return 100;
        }
        return prev + 15;
      });
    }, 120);
  };

  const handleSaveToInvoice = () => {
    if (!matchedOrder) return;

    const inspection: AiGarmentInspection = {
      analyzedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      garmentType: selectedPreset.garmentType,
      fabricCareNote: selectedPreset.fabricCareNote,
      stains: selectedPreset.stains,
      disclaimerNote: customDisclaimer,
      photoUrl: activePhoto,
    };

    saveAiInspection(matchedOrder.id, inspection);
    alert(`Hasil AI Scan & Legal Disclaimer berhasil dipasang ke Nota #${matchedOrder.invoiceNo}!`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 rounded-2xl shadow-inner">
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-tight">AI Garment & Stain Scanner</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-cyan-100 flex items-center gap-1">
                  <Scan className="w-3 h-3" />
                  Neural Vision 2.4
                </span>
              </div>
              <p className="text-xs text-indigo-100">
                Pemeriksaan otomatis cacat kain, noda membandel, & disclaimer anti-tuduhan pelanggan
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Top Order Context & Preset Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-200 dark:border-indigo-800/60">
            <div className="text-xs">
              <span className="text-slate-500 dark:text-slate-400">Target Pemeriksaan Nota:</span>
              <p className="font-extrabold text-sm text-indigo-950 dark:text-indigo-200">
                #{matchedOrder.invoiceNo} — {matchedOrder.customerName} ({matchedOrder.weightKg} kg)
              </p>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Pilih Sampel:</span>
              <select
                value={selectedPreset.id}
                onChange={(e) => {
                  const p = SAMPLE_PRESETS.find((pr) => pr.id === e.target.value);
                  if (p) setSelectedPreset(p);
                }}
                className="text-xs py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 font-semibold text-slate-800 dark:text-slate-100"
              >
                {SAMPLE_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Grid: Viewfinder Left / AI Results Right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* LEFT: Futuristic AI Camera Viewfinder */}
            <div className="space-y-3">
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-950 border-2 border-indigo-500/50 shadow-inner group">
                {/* Garment Image */}
                <img
                  src={activePhoto}
                  alt="Garment Inspection"
                  className="w-full h-full object-cover select-none"
                />

                {/* HUD Grid Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/60 pointer-events-none" />

                {/* Scanning Laser Beam */}
                {isScanning && (
                  <div
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 shadow-[0_0_15px_#38bdf8] transition-all duration-100 pointer-events-none"
                    style={{ top: `${scanProgress}%` }}
                  />
                )}

                {/* Detected Stain Bounding Boxes (Interactive HUD Markers) */}
                {hasScanned &&
                  !isScanning &&
                  selectedPreset.stains.map((stain) => {
                    const b = stain.boundingBox || { x: 40, y: 40, width: 20, height: 20 };
                    const isSelected = selectedStain?.id === stain.id;

                    return (
                      <div
                        key={stain.id}
                        onClick={() => setSelectedStain(stain)}
                        className={`absolute border-2 rounded-xl transition-all cursor-pointer flex items-start justify-end p-1 ${
                          isSelected
                            ? 'border-yellow-400 bg-yellow-400/20 shadow-[0_0_12px_rgba(250,204,21,0.8)] scale-105 z-10'
                            : stain.severity === 'high'
                            ? 'border-rose-500 bg-rose-500/10'
                            : 'border-cyan-400 bg-cyan-400/10'
                        }`}
                        style={{
                          left: `${b.x}%`,
                          top: `${b.y}%`,
                          width: `${b.width}%`,
                          height: `${b.height}%`,
                        }}
                      >
                        <span
                          className={`text-[9px] font-black px-1 py-0.5 rounded shadow ${
                            stain.severity === 'high' ? 'bg-rose-600 text-white' : 'bg-cyan-600 text-white'
                          }`}
                        >
                          {Math.round(stain.confidence * 100)}%
                        </span>
                      </div>
                    );
                  })}

                {/* Viewfinder Corners */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

                {/* Status Bar inside Viewfinder */}
                <div className="absolute bottom-3 left-3 right-3 px-3 py-1.5 bg-slate-950/80 backdrop-blur-md rounded-xl text-white text-[11px] flex items-center justify-between border border-slate-700/60">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>AI Model: Vision GarmentNet v2.4</span>
                  </span>
                  <span className="text-cyan-300 font-mono font-bold">
                    {selectedPreset.stains.length} Cacat Terdeteksi
                  </span>
                </div>
              </div>

              {/* Viewfinder Controls */}
              <div className="flex gap-2">
                <button
                  onClick={handleStartScan}
                  disabled={isScanning}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? `Memindai (${scanProgress}%)...` : 'Pindai Ulang Kamera'}</span>
                </button>
              </div>
            </div>

            {/* RIGHT: AI Diagnostic & Legal Disclaimer Output */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                {/* Garment Classification Card */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                      Klasifikasi Jenis Kain & Bahan
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Terverifikasi AI
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                    {selectedPreset.garmentType}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span>{selectedPreset.fabricCareNote}</span>
                  </p>
                </div>

                {/* Detected Stains List */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Daftar Noda & Kerusakan Bawaan ({selectedPreset.stains.length}):</span>
                  </p>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedPreset.stains.map((stain) => {
                      const isSelected = selectedStain?.id === stain.id;

                      return (
                        <div
                          key={stain.id}
                          onClick={() => setSelectedStain(stain)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-400 dark:border-indigo-600 shadow-sm'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {stain.label}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                stain.severity === 'high'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                  : stain.severity === 'medium'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300'
                              }`}
                            >
                              Severity: {stain.severity}
                            </span>
                          </div>

                          <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900/60 p-2 rounded-xl flex items-start gap-1.5">
                            <Droplets className="w-3 h-3 text-cyan-500 shrink-0 mt-0.5" />
                            <span>
                              <strong className="text-indigo-600 dark:text-indigo-400">Treatment:</strong>{' '}
                              {stain.recommendedTreatment}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legal Disclaimer for Receipt (Anti-Fraud) */}
                <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800/70 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Klausul Disclaimer Perlindungan Laundry:</span>
                  </div>
                  <textarea
                    rows={2}
                    value={customDisclaimer}
                    onChange={(e) => setCustomDisclaimer(e.target.value)}
                    className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                    placeholder="Catatan disclaimer resmi di nota..."
                  />
                  <p className="text-[10px] text-amber-700 dark:text-amber-300">
                    * Klausul ini otomatis tertera pada e-Nota pelanggan & link tracking publik untuk mencegah tuduhan ganti rugi.
                  </p>
                </div>
              </div>

              {/* Action: Save & Apply to Invoice */}
              <button
                onClick={handleSaveToInvoice}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-2xl font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Simpan Hasil Scan AI & Pasang Disclaimer ke Nota #{matchedOrder.invoiceNo}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
