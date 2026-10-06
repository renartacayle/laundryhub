import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Coins,
  WashingMachine,
  Bike,
  X,
  ExternalLink,
} from 'lucide-react';

interface SocialProofItem {
  id: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  time: string;
  tag: string;
  tagColor: string;
}

const ACTIVITIES: SocialProofItem[] = [
  {
    id: 1,
    icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
    title: 'Outlet Laundry Berkah (Semarang)',
    subtitle: 'Baru saja cetak 3 nota cucian kiloan (18.5 kg)',
    time: '2 menit lalu',
    tag: 'POS Kasir Aktif',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    id: 2,
    icon: <Coins className="w-4 h-4 text-amber-400" />,
    title: 'Mitra Kampus Tembalang',
    subtitle: 'Berhasil klaim 50 Nota Gratis via Voucher RENA50',
    time: '5 menit lalu',
    tag: 'Free Trial Diklaim',
    tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  {
    id: 3,
    icon: <TrendingUp className="w-4 h-4 text-cyan-400" />,
    title: 'Juragan Laundry Jakarta',
    subtitle: 'Top up Paket Sultan (2.000 Nota) via QRIS SpeedCash',
    time: '12 menit lalu',
    tag: 'Rp 50.000 Masuk',
    tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  },
  {
    id: 4,
    icon: <WashingMachine className="w-4 h-4 text-orange-400" />,
    title: 'Workshop Pusat Kemang',
    subtitle: 'Mesin Washer #02 selesai siklus cuci 45 menit otomatis',
    time: '18 menit lalu',
    tag: 'IoT Otomatis',
    tagColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  },
  {
    id: 5,
    icon: <Bike className="w-4 h-4 text-purple-400" />,
    title: 'Kurir Delivery Budi',
    subtitle: 'Mengantar pakaian bersih ke Tamu Hotel Candi Room 402',
    time: '25 menit lalu',
    tag: 'Hotel & Tourist',
    tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
];

interface LiveSocialProofToastProps {
  onOpenShowcase: () => void;
}

export const LiveSocialProofToast: React.FC<LiveSocialProofToastProps> = ({ onOpenShowcase }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    const interval = setInterval(() => {
      if (!isPaused) {
        setIsVisible(false);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % ACTIVITIES.length);
          setIsVisible(true);
        }, 400);
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [isPaused, isDismissed]);

  if (isDismissed) return null;

  const current = ACTIVITIES[currentIndex];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-40 max-w-xs sm:max-w-sm transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'
      }`}
    >
      <div
        onClick={onOpenShowcase}
        className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 hover:border-emerald-500/40 shadow-2xl backdrop-blur-md cursor-pointer group transition-all relative overflow-hidden"
      >
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 group-hover:scale-110 transition-transform">
              {current.icon}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-100 leading-tight">
                  {current.title}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">• {current.time}</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                {current.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
            className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
            title="Tutup Notifikasi Aktivitas"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[10px] pt-2 border-t border-slate-700/80">
          <span className={`px-2 py-0.5 rounded-full font-bold border ${current.tagColor}`}>
            {current.tag}
          </span>
          <span className="text-emerald-400 font-semibold group-hover:underline flex items-center gap-1">
            <span>Lihat Promo Rp 25</span>
            <ExternalLink className="w-3 h-3" />
          </span>
        </div>

        {/* Animated Progress line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 animate-pulse w-full" />
        </div>
      </div>
    </div>
  );
};
