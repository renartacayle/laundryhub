import React, { useState } from 'react';
import {
  Crown,
  Monitor,
  UserCircle2,
  WashingMachine,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X,
  Zap,
  Camera,
  Coins,
  ShieldCheck,
  Smartphone,
  QrCode,
  DollarSign,
  Layers,
  Users,
  Building2,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';

interface DemoTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type TutorialRoleChoice = 'owner' | 'pekerja' | 'pelanggan';

export const DemoTutorialModal: React.FC<DemoTutorialModalProps> = ({ isOpen, onClose }) => {
  const { startTutorial, setIsGoogleAuthModalOpen, topupCoins } = useApp();
  const [selectedRole, setSelectedRole] = useState<TutorialRoleChoice>('owner');

  if (!isOpen) return null;

  const handleStart = (role: TutorialRoleChoice) => {
    // Reward trial coins if first time
    const redeemed: string[] = JSON.parse(localStorage.getItem('lh_redeemed_codes') || '[]');
    if (!redeemed.includes('DEMO50')) {
      topupCoins(50);
      redeemed.push('DEMO50');
      localStorage.setItem('lh_redeemed_codes', JSON.stringify(redeemed));
    }

    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore if confetti not supported
    }

    startTutorial(role);
    onClose();
  };

  const tutorialGuides: Record<
    TutorialRoleChoice,
    {
      roleName: string;
      roleTitle: string;
      badge: string;
      badgeColor: string;
      icon: React.ReactNode;
      color: string;
      borderActive: string;
      accentBg: string;
      description: string;
      ctaText: string;
      steps: {
        number: string;
        title: string;
        desc: string;
        tag: string;
      }[];
    }
  > = {
    owner: {
      roleName: 'owner',
      roleTitle: 'Pemilik Laundry (Owner)',
      badge: 'KONTROL BISNIS & CUAN',
      badgeColor: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
      icon: <Crown className="w-6 h-6 text-amber-500" />,
      color: 'text-amber-500',
      borderActive: 'border-amber-500 ring-2 ring-amber-400/40',
      accentBg: 'bg-amber-500/10',
      description:
        'Pantau seluruh operasional bisnis laundry Anda, omzet konsolidasi cabang, atur tarif komisi borongan stasiun staf, dan nikmati sistem kasir tanpa biaya langganan bulanan.',
      ctaText: '👑 Mulai Demo Sebagai Owner',
      steps: [
        {
          number: '01',
          title: 'Dashboard Eksekutif & Omzet Konsolidasi',
          desc: 'Pantau grafik pendapatan harian, laba bersih (margin 62%), dan performa seluruh cabang secara real-time.',
          tag: 'Real-time Analytics',
        },
        {
          number: '02',
          title: 'Atur Tarif Komisi Borongan per Stasiun',
          desc: 'Tentukan tarif komisi per stasiun (Sortir, Cuci, Kering, Setrika, Packing) agar staf termotivasi dan pembagian tugas adil.',
          tag: 'Sistem Bagi Hasil',
        },
        {
          number: '03',
          title: 'Pantau Alur Cucian & Foto Bukti Pakaian',
          desc: 'Periksa foto bukti cucian yang di-upload staf di setiap stasiun untuk menjaga kualitas dan mencegah komplain.',
          tag: 'Quality Control',
        },
        {
          number: '04',
          title: 'Kontrol Timer Mesin IoT Otomatis',
          desc: 'Mesin cuci/dryer hanya aktif saat nota kasir resmi dicetak. Mencegah staf mencuci pakaian pribadi/tanpa izin.',
          tag: 'Anti-Kecurangan',
        },
        {
          number: '05',
          title: 'Sistem Kuota Transaksi Rp 25 per Nota',
          desc: 'Hemat biaya langganan ratusan ribu rupiah. Cukup bayar Rp 25 per nota transaksi dengan 50 nota gratis pertama!',
          tag: 'Hemat 90%',
        },
      ],
    },
    pekerja: {
      roleName: 'pekerja',
      roleTitle: 'Pekerja / Karyawan (Staff)',
      badge: 'KASIR & PRODUKSI FLEKSIBEL',
      badgeColor: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
      icon: <Monitor className="w-6 h-6 text-cyan-500" />,
      color: 'text-cyan-500',
      borderActive: 'border-cyan-500 ring-2 ring-cyan-400/40',
      accentBg: 'bg-cyan-500/10',
      description:
        'Sistem kerja fleksibel untuk kasir dan operator produksi. Input nota kilat, hitung helai di stasiun sortir, ambil stasiun yang belum selesai, upload foto bukti, dan dapatkan komisi langsung.',
      ctaText: '👔 Mulai Demo Sebagai Pekerja',
      steps: [
        {
          number: '01',
          title: 'Kasir POS Super Cepat (Kiloan & Satuan)',
          desc: 'Input cucian dalam 10 detik, pilih varian parfum, timbangan otomatis, cetak struk Bluetooth, dan kirim nota WhatsApp.',
          tag: 'Input Kilat',
        },
        {
          number: '02',
          title: 'Stasiun Sortir & Detailing Pakaian',
          desc: 'Hitung helai pakaian (baju, celana, celana dalam), serta tambahkan catatan noda atau luntur sebelum dicuci.',
          tag: 'Detail Pakaian',
        },
        {
          number: '03',
          title: 'Ambil & Kerjakan Stasiun yang Belum Selesai',
          desc: 'Semua staf dalam cabang bisa saling bantu mengambil tugas stasiun (Cuci, Kering, Setrika, atau Packing).',
          tag: 'Multi-Worker',
        },
        {
          number: '04',
          title: 'Upload Foto Bukti Hasil Pakaian',
          desc: 'Ambil foto bukti saat selesai menyetrika atau packing sebagai validasi bahwa pakaian bersih dan rapi.',
          tag: 'Foto Bukti',
        },
        {
          number: '05',
          title: 'Dompet Komisi Harian Karyawan',
          desc: 'Setiap tugas stasiun yang diselesaikan otomatis menambah saldo komisi harian pekerja secara transparan.',
          tag: 'Komisi Langsung',
        },
      ],
    },
    pelanggan: {
      roleName: 'pelanggan',
      roleTitle: 'Pelanggan / Member Laundry',
      badge: 'TRANSPARAN & LACAK REAL-TIME',
      badgeColor: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      icon: <UserCircle2 className="w-6 h-6 text-emerald-500" />,
      color: 'text-emerald-500',
      borderActive: 'border-emerald-500 ring-2 ring-emerald-400/40',
      accentBg: 'bg-emerald-500/10',
      description:
        'Pengalaman pelanggan modern. Lacak alur cucian 7 tahapan secara real-time dari HP, periksa foto pakaian Anda, unduh nota digital QRIS, dan nikmati poin reward.',
      ctaText: '👤 Mulai Demo Sebagai Pelanggan',
      steps: [
        {
          number: '01',
          title: 'Live Realtime Tracking 7 Tahapan',
          desc: 'Ketahui posisi cucian tanpa perlu telepon kasir: 01 Antrean ➔ 02 Sortir ➔ 03 Cuci ➔ 04 Kering ➔ 05 Setrika ➔ 06 Packing ➔ 07 Siap.',
          tag: 'Lacak 7 Tahap',
        },
        {
          number: '02',
          title: 'Lihat Foto Pakaian Hasil Cucian',
          desc: 'Buka foto bukti kondisi pakaian Anda yang difoto staf outlet saat sortir maupun packing rapi.',
          tag: 'Foto Pakaian',
        },
        {
          number: '03',
          title: 'Nota Digital & Pembayaran QRIS',
          desc: 'Akses rincian pakaian, invoice digital resmi, dan bayar lewat QRIS instan tanpa antre di kasir.',
          tag: 'QRIS & Nota',
        },
        {
          number: '04',
          title: 'Notifikasi Otomatis via WhatsApp',
          desc: 'Dapatkan pemberitahuan otomatis di WhatsApp saat cucian selesai dipacking dan siap diambil.',
          tag: 'Notif WA',
        },
        {
          number: '05',
          title: 'Poin Loyalitas & Request Antar-Jemput',
          desc: 'Kumpulkan poin reward cucian, tukarkan voucher diskon, atau minta kurir jemput pakaian ke rumah.',
          tag: 'Poin & Jemput',
        },
      ],
    },
  };

  const activeGuide = tutorialGuides[selectedRole];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-slate-700 flex items-center justify-between gap-3 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 flex items-center justify-center shadow-md shadow-emerald-500/20 font-bold shrink-0">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-100">
                  Coba Versi Demo LAUNDRYHUB
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-cyan-300 border border-emerald-500/30 hidden sm:inline">
                  Tutorial Interaktif
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pilih peran Anda untuk melihat tutorial langkah demi langkah sebelum mencoba alur sistem.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* 3 Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(['owner', 'pekerja', 'pelanggan'] as TutorialRoleChoice[]).map((roleKey) => {
              const r = tutorialGuides[roleKey];
              const isSelected = selectedRole === roleKey;

              return (
                <button
                  key={roleKey}
                  type="button"
                  data-tutorial-role={roleKey}
                  onClick={() => setSelectedRole(roleKey)}
                  className={`p-4 rounded-2xl border text-left transition-all active:scale-[0.98] flex flex-col justify-between ${
                    isSelected
                      ? `${r.borderActive} bg-slate-900 shadow-md`
                      : 'border-slate-700 bg-slate-800/60 hover:bg-slate-900 hover:border-slate-600'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2.5 rounded-xl ${r.accentBg}`}>{r.icon}</div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${r.badgeColor}`}>
                        {r.badge}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-slate-100 mt-1">
                      {r.roleTitle}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {r.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs font-bold">
                    <span className={isSelected ? r.color : 'text-slate-400'}>
                      {isSelected ? '✓ Terpilih' : 'Pilih Peran'}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? r.color : 'text-slate-400'}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Step-by-Step Tutorial Breakdown for Selected Role */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-700/70">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Tutorial Langkah demi Langkah:
                </span>
                <span className={`text-xs font-bold ${activeGuide.color}`}>
                  {activeGuide.roleTitle}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400">
                5 Tahapan Utama Terpandu
              </span>
            </div>

            {/* 5 Steps Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {activeGuide.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-700 flex flex-col justify-between shadow-xs hover:border-emerald-500/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-slate-800 text-slate-200">
                        {step.number}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-cyan-400">
                        {step.tag}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-100 leading-tight">
                      {step.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-snug line-clamp-3">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Execution Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-300 text-center sm:text-left">
                🎁 Bonus Baru: Dapatkan <strong className="text-emerald-600 dark:text-cyan-400">50 Nota Gratis</strong> langsung aktif untuk mencoba alur transaksi!
              </div>

              <button
                type="button"
                data-testid="start-tutorial-btn"
                onClick={() => handleStart(selectedRole)}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-xs sm:text-sm hover:opacity-95 shadow-md shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{activeGuide.ctaText}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer: Real Google Account Alternative */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span>Ingin menggunakan data outlet nyata Anda?</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                onClose();
                setIsGoogleAuthModalOpen(true);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold transition-all"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Masuk dengan Google Saya</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-slate-400 hover:text-slate-100 transition-colors"
            >
              Lewati & Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
