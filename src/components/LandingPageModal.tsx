import React, { useState } from 'react';
import {
  WashingMachine,
  Sparkles,
  CheckCircle2,
  XCircle,
  X,
  TrendingDown,
  DollarSign,
  Smartphone,
  ShieldCheck,
  Zap,
  Globe,
  Share2,
  Phone,
  ArrowRight,
  Gift,
  Coins,
  Cpu,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LandingPageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LandingPageModal: React.FC<LandingPageModalProps> = ({ isOpen, onClose }) => {
  const { setCurrentRole, topupCoins } = useApp();
  const [dailyNotes, setDailyNotes] = useState<number>(50);
  const [claimedCode, setClaimedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  // ROI Calculations
  const monthlyNotes = dailyNotes * 30;
  const standardPosCost = 299000; // Average traditional POS like Moka/Majoo
  const ratePerNote = dailyNotes >= 60 ? 25 : dailyNotes >= 30 ? 30 : dailyNotes >= 15 ? 40 : 50;
  const laundryHubCost = monthlyNotes * ratePerNote;
  const monthlySavings = standardPosCost - laundryHubCost;
  const yearlySavings = monthlySavings * 12;
  const savingsPercent = Math.max(10, Math.round((monthlySavings / standardPosCost) * 100));

  const handleClaimFreeTrial = () => {
    const redeemed: string[] = JSON.parse(localStorage.getItem('lh_redeemed_codes') || '[]');
    if (!redeemed.includes('RENA50')) {
      topupCoins(50);
      redeemed.push('RENA50');
      localStorage.setItem('lh_redeemed_codes', JSON.stringify(redeemed));
    }
    setClaimedCode('RENA50');
    setCurrentRole('kasir');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Sticky Header */}
        <div className="sticky top-0 z-20 glass-panel border-b border-slate-800 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black">
              <WashingMachine className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  LAUNDRYHUB SHOWCASE
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  CUMA RP 25/NOTA
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Aplikasi Kasir Laundry #1 Tanpa Biaya Langganan Bulanan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-8 text-slate-200">
          {/* Hero Section */}
          <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-cyan-950/60 border border-emerald-500/30 shadow-glow-emerald text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-4">
              <Gift className="w-4 h-4 text-emerald-400 animate-bounce" />
              <span>Promo Spesial: Gratis 50 Nota Pertama (Kode: RENA50)</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight max-w-2xl mx-auto leading-tight">
              Ganti Mesin Kasir Mahalmu.{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Cuma Bayar Rp 25/Nota!
              </span>
            </h1>

            <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
              Tidak ada biaya bulanan wajib Rp 250.000 - Rp 350.000 lagi. Uang cucian 100% langsung masuk ke
              rekening/QRIS laundry Anda sendiri.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleClaimFreeTrial}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-sm hover:from-emerald-400 hover:to-teal-400 transition-all shadow-glow-emerald active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>{claimedCode ? '✓ Voucher RENA50 Diklaim!' : 'Coba Gratis 50 Nota Sekarang'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="https://wa.me/6281228263200?text=Halo%20Admin%20LaundryHub%2C%20saya%20tertarik%20menggunakan%20aplikasi%20kasir%20LaundryHub%20untuk%20outlet%20laundry%20saya"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm transition-all"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Konsultasi WA: 081228263200</span>
              </a>
            </div>
          </div>

          {/* Interactive ROI Calculator */}
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-950/70 border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-emerald-400" />
                  Kalkulator Penghematan Biaya Kasir (ROI)
                </h3>
                <p className="text-xs text-slate-400">
                  Geser slider di bawah untuk melihat berapa ratus ribu yang Anda hemat tiap bulan
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/30">
                Hemat Hingga {savingsPercent}%
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-2">
                <span className="text-slate-300">Rata-rata Nota Laundry per Hari:</span>
                <span className="text-emerald-400 font-black text-base">{dailyNotes} Nota / Hari</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={dailyNotes}
                onChange={(e) => setDailyNotes(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>10 Nota (Outlet Santai)</span>
                <span>50 Nota (Ramai)</span>
                <span>100 Nota (Super Ramai)</span>
                <span>200 Nota (Pusat Workshop)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                <div className="text-[11px] font-bold text-rose-300 uppercase">POS Lain (Moka/Majoo)</div>
                <div className="text-xl font-extrabold text-white mt-1">
                  Rp {standardPosCost.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-rose-300/80 mt-1">Biaya bulanan flat, sepi tetap bayar</div>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
                <div className="text-[11px] font-bold text-cyan-300 uppercase">LAUNDRYHUB (Rp {ratePerNote}/nota)</div>
                <div className="text-xl font-extrabold text-cyan-300 mt-1">
                  Rp {laundryHubCost.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-cyan-300/80 mt-1">
                  {monthlyNotes.toLocaleString('id-ID')} nota × Rp {ratePerNote} (Beli saat perlu)
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/50 shadow-glow-emerald">
                <div className="text-[11px] font-bold text-emerald-300 uppercase">Total Uang Anda Yang Selamat</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  Rp {monthlySavings.toLocaleString('id-ID')}
                  <span className="text-xs font-semibold text-slate-300">/bln</span>
                </div>
                <div className="text-[10px] text-emerald-300/90 mt-1 font-semibold">
                  🎉 Rp {yearlySavings.toLocaleString('id-ID')} per tahun disimpan di kas Anda!
                </div>
              </div>
            </div>
          </div>

          {/* Feature Comparison Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Perbandingan: LaundryHub vs Kasir Konvensional
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-bold">Fitur & Layanan</th>
                    <th className="py-3 px-4 font-bold text-emerald-400">LAUNDRYHUB</th>
                    <th className="py-3 px-4 font-bold text-slate-400">Kasir Biasa (Moka / Majoo)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  <tr>
                    <td className="py-3 px-4 font-semibold text-white">Biaya Langganan Bulanan</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Rp 0 (Hanya bayar per nota digunakan)
                    </td>
                    <td className="py-3 px-4 text-rose-400 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" /> Wajib Rp 250.000 - Rp 350.000/bln
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-white">Uang Pembayaran Pelanggan</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> 100% Langsung ke Rekening/QRIS Outlet
                    </td>
                    <td className="py-3 px-4 text-amber-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Ditahan payment gateway + potongan admin
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-white">Nota Digital WhatsApp</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Otomatis kirim format nota rapi & lacak cucian
                    </td>
                    <td className="py-3 px-4 text-slate-400 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-400" /> Wajib beli kertas thermal terus
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-white">Integrasi Kontrol Mesin IoT</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Ada (Mesin nyala hanya jika ada nota kasir)
                    </td>
                    <td className="py-3 px-4 text-slate-400 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-400" /> Tidak ada perlindungan kasir curang
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-white">Multi-Bahasa & Wisatawan Hotel</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Bahasa Inggris + Mata Uang USD Ready
                    </td>
                    <td className="py-3 px-4 text-slate-400 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-400" /> Hanya Rupiah & Indonesia
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-white">Jaringan Dropship Drop Point</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Bisa rekrut warung tetangga jadi cabang
                    </td>
                    <td className="py-3 px-4 text-slate-400 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-400" /> Harus bayar lisensi cabang mahal
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Packages */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">Pilihan Paket Kuota Nota (Beli Saat Perlu)</h3>
              <p className="text-xs text-slate-400">Tidak ada masa kedaluwarsa. Kuota tersimpan selamanya di akun Anda.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-xs font-bold text-slate-400">Starter Pack</div>
                <div className="text-xl font-extrabold text-white mt-1">Rp 10.000</div>
                <div className="text-emerald-400 font-mono text-sm font-bold mt-1">200 Nota</div>
                <div className="text-[10px] text-slate-400 mt-2">Rp 50 / nota</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-xs font-bold text-cyan-400">Bisnis Pro</div>
                <div className="text-xl font-extrabold text-white mt-1">Rp 20.000</div>
                <div className="text-cyan-400 font-mono text-sm font-bold mt-1">500 Nota</div>
                <div className="text-[10px] text-slate-400 mt-2">Rp 40 / nota</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-xs font-bold text-amber-400">Juragan Laundry</div>
                <div className="text-xl font-extrabold text-white mt-1">Rp 30.000</div>
                <div className="text-amber-400 font-mono text-sm font-bold mt-1">1.000 Nota</div>
                <div className="text-[10px] text-slate-400 mt-2">Rp 30 / nota</div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-500/20 to-slate-950/90 border border-emerald-500/50 text-center relative shadow-glow-emerald">
                <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-slate-950">
                  BEST VALUE
                </span>
                <div className="text-xs font-bold text-emerald-300">Sultan Laundry</div>
                <div className="text-xl font-extrabold text-white mt-1">Rp 50.000</div>
                <div className="text-emerald-300 font-mono text-sm font-bold mt-1">2.000 Nota</div>
                <div className="text-[10px] text-emerald-400 font-bold mt-2">Cuma Rp 25 / nota</div>
              </div>
            </div>
          </div>

          {/* Testimonial Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/30">
                  BL
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Bu Linda — Laundry Berkah</div>
                  <div className="text-[10px] text-slate-400">Semarang Barat • 40-60 nota/hari</div>
                </div>
              </div>
              <p className="text-xs text-slate-300 italic">
                &ldquo;Dulu sebulan wajib keluar Rp 300.000 bayar aplikasi kasir. Sekarang pakai LaundryHub cuma beli
                token Rp 30.000 tahan sebulan lebih. Pelanggan juga senang nota langsung masuk WhatsApp mereka.&rdquo;
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-sm border border-cyan-500/30">
                  MD
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Mas Dian — Tembalang Wash & Iron</div>
                  <div className="text-[10px] text-slate-400">Area Kampus Undip • 80-120 nota/hari</div>
                </div>
              </div>
              <p className="text-xs text-slate-300 italic">
                &ldquo;Fitur IoT-nya sangat ngebantu, kasir gak bisa nyuci diam-diam tanpa cetak nota. Pengeluaran nota
                cuma Rp 25 per cucian, hemat banget untuk laundry skala mahasiswa.&rdquo;
              </p>
            </div>
          </div>

          {/* Bottom Action CTA */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900/60 to-cyan-900/60 border border-emerald-500/40 text-center space-y-4">
            <h3 className="text-xl font-extrabold text-white">Siap Beralih ke Kasir Laundry Paling Hemat?</h3>
            <p className="text-xs text-slate-300 max-w-lg mx-auto">
              Langsung klik tombol di bawah untuk klaim 50 nota gratis dan langsung pakai di HP atau laptop Anda!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleClaimFreeTrial}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-glow-emerald transition-all"
              >
                🚀 Masuk Kasir & Klaim 50 Nota Gratis
              </button>
              <button
                onClick={onClose}
                className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all"
              >
                Tutup & Jelajahi Fitur Lain
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
