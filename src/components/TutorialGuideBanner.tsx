import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  Crown,
  Monitor,
  UserCircle2,
  Lightbulb,
} from 'lucide-react';

export const TutorialGuideBanner: React.FC = () => {
  const {
    activeTutorial,
    tutorialStep,
    nextTutorialStep,
    prevTutorialStep,
    exitTutorial,
    setIsDemoTutorialModalOpen,
  } = useApp();

  const [isMinimized, setIsMinimized] = useState(false);

  if (!activeTutorial) return null;

  const tutorialStepsData: Record<
    'owner' | 'pekerja' | 'pelanggan',
    {
      roleTitle: string;
      icon: React.ReactNode;
      color: string;
      steps: {
        title: string;
        instruction: string;
        highlightText: string;
      }[];
    }
  > = {
    owner: {
      roleTitle: 'Tutorial Owner',
      icon: <Crown className="w-4 h-4 text-amber-500" />,
      color: 'border-amber-500/40 text-amber-700 dark:text-amber-300',
      steps: [
        {
          title: 'Ringkasan Omzet & Laba Bersih',
          instruction: 'Lihat kartu Omzet Konsolidasi (Rp 1.207.900) dan Estimasi Laba Bersih (~62% margin) secara real-time.',
          highlightText: 'Buka Tab: Ringkasan Eksekutif',
        },
        {
          title: 'Sistem Gaji & Komisi per Stasiun',
          instruction: 'Owner bisa mengatur tarif borongan per stasiun kerja (Sortir, Cuci, Setrika, Packing) agar staf adil & rajin.',
          highlightText: 'Buka Tab: Karyawan & Komisi',
        },
        {
          title: 'Monitoring Alur & Foto Bukti Pakaian',
          instruction: 'Periksa status seluruh pesanan yang sedang berjalan beserta foto validasi cucian dari karyawan.',
          highlightText: 'Buka Tab: Multi-Cabang & Alur',
        },
        {
          title: 'Kontrol Mesin IoT Otomatis',
          instruction: 'Klik tombol "Mesin IoT" di navbar atas untuk menyalakan/mematikan mesin cuci dengan timer otomatis.',
          highlightText: 'Fitur: Panel Kontrol IoT Mesin',
        },
        {
          title: 'Saldo Koin Transaksi Cuma Rp 25/Nota',
          instruction: 'Tanpa bayar langganan bulanan mahal. Anda memiliki bonus 50 nota gratis untuk mencoba transaksi!',
          highlightText: 'Fitur: Bebas Biaya Bulanan',
        },
      ],
    },
    pekerja: {
      roleTitle: 'Tutorial Pekerja (Kasir & Produksi)',
      icon: <Monitor className="w-4 h-4 text-cyan-500" />,
      color: 'border-cyan-500/40 text-cyan-700 dark:text-cyan-300',
      steps: [
        {
          title: 'Kasir POS Super Kilat',
          instruction: 'Coba input cucian kiloan atau satuan, pilih parfum, dan cetak struk thermal via Bluetooth printer.',
          highlightText: 'Role: Kasir POS (Cetak & Input)',
        },
        {
          title: 'Stasiun Sortir & Detailing Baju',
          instruction: 'Operator sortir dapat memasukkan jumlah helai baju, celana, dan catatan noda/luntur agar aman dari komplain.',
          highlightText: 'Role: Produksi (Stasiun Sortir)',
        },
        {
          title: 'Ambil & Kerjakan Stasiun Cucian',
          instruction: 'Semua staf dapat fleksibel mengklaim cucian yang belum selesai di stasiun Cuci, Kering, Setrika, atau Packing.',
          highlightText: 'Role: Produksi (Klaim Tugas)',
        },
        {
          title: 'Upload Foto Bukti Cucian',
          instruction: 'Ambil foto bukti saat menyelesaikan cucian atau packing sebagai bukti validasi ke pelanggan dan owner.',
          highlightText: 'Role: Produksi (Foto Bukti)',
        },
        {
          title: 'Dompet Komisi Harian Karyawan',
          instruction: 'Setiap stasiun yang Anda selesaikan langsung menambah saldo komisi harian dompet karyawan.',
          highlightText: 'Fitur: Saldo Komisi Cair Harian',
        },
      ],
    },
    pelanggan: {
      roleTitle: 'Tutorial Pelanggan (Member)',
      icon: <UserCircle2 className="w-4 h-4 text-emerald-500" />,
      color: 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300',
      steps: [
        {
          title: 'Lacak Status Cucian Real-time (7 Tahap)',
          instruction: 'Lihat posisi cucian Anda bergerak dari Antrean ➔ Sortir ➔ Cuci ➔ Kering ➔ Setrika ➔ Packing ➔ Siap.',
          highlightText: 'Portal Pelanggan: Live Tracking',
        },
        {
          title: 'Lihat Foto Bukti Cucian Pakaian',
          instruction: 'Klik tombol "Foto Bukti" pada tahapan sortir atau packing untuk melihat kondisi pakaian Anda.',
          highlightText: 'Portal Pelanggan: Foto Pakaian',
        },
        {
          title: 'Nota Digital Resmi & Bayar QRIS',
          instruction: 'Buka invoice digital resmi outlet, cek rincian harga transparan, dan lakukan pembayaran QRIS tanpa antre.',
          highlightText: 'Portal Pelanggan: Nota Digital',
        },
        {
          title: 'Simulasi Notifikasi Otomatis WhatsApp',
          instruction: 'Klik "Simulasi WA Notifikasi" untuk melihat format pesan update status yang dikirim otomatis ke HP Anda.',
          highlightText: 'Portal Pelanggan: Notif WhatsApp',
        },
        {
          title: 'Poin Loyalitas & Request Antar-Jemput',
          instruction: 'Cek saldo reward poin untuk tukar voucher, atau minta kurir jemput cucian kotor langsung dari rumah.',
          highlightText: 'Portal Pelanggan: Poin & Jemput',
        },
      ],
    },
  };

  const currentRoleGuide = tutorialStepsData[activeTutorial];
  const currentStepData = currentRoleGuide.steps[tutorialStep] || currentRoleGuide.steps[0];
  const isLastStep = tutorialStep >= currentRoleGuide.steps.length - 1;

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 left-4 z-40 animate-in fade-in slide-in-from-bottom-2">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900 text-slate-100 border border-emerald-500/40 shadow-xl backdrop-blur-md text-xs font-bold hover:scale-105 active:scale-95 transition-all"
        >
          <Lightbulb className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Panduan: {currentRoleGuide.roleTitle} (Langkah {tutorialStep + 1}/5)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95vw] max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="p-3.5 sm:p-4 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl backdrop-blur-md flex flex-col gap-2.5">
        {/* Top Guide Bar Header */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-xl bg-slate-800 shrink-0">
              {currentRoleGuide.icon}
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-extrabold text-xs text-slate-100 truncate">
                {currentRoleGuide.roleTitle}
              </span>
              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-cyan-300 shrink-0">
                Langkah {tutorialStep + 1} dari {currentRoleGuide.steps.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsDemoTutorialModalOpen(true)}
              className="text-[11px] font-bold text-slate-400 hover:text-emerald-600 dark:hover:text-cyan-400 px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Ganti jalur tutorial"
            >
              Ganti Peran
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100"
              title="Minimalkan panduan"
            >
              —
            </button>
            <button
              onClick={exitTutorial}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-500"
              title="Tutup tutorial"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Middle Step Content */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-black text-xs sm:text-sm text-slate-100 leading-tight">
                {currentStepData.title}
              </h4>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 hidden sm:inline">
                {currentStepData.highlightText}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {currentStepData.instruction}
            </p>
          </div>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-1 gap-2">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {currentRoleGuide.steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === tutorialStep
                    ? 'w-6 bg-emerald-500'
                    : i < tutorialStep
                    ? 'w-2 bg-emerald-500/50'
                    : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {tutorialStep > 0 && (
              <button
                type="button"
                onClick={prevTutorialStep}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all active:scale-95"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>
            )}

            {!isLastStep ? (
              <button
                type="button"
                data-testid="tutorial-next-btn"
                onClick={nextTutorialStep}
                className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs hover:opacity-95 shadow-sm transition-all active:scale-95"
              >
                <span>Lanjut Langkah Berikutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={exitTutorial}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition-all active:scale-95 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Selesai Tutorial</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
