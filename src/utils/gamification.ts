import { GamificationSettings, Order } from '../types';

export interface GamificationPeriodStatus {
  isActive: boolean;
  status: 'active' | 'upcoming' | 'expired' | 'disabled';
  label: string;
  badgeColor: string;
  message: string;
  daysLeft?: number;
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return `${day} ${months[monthIdx] || parts[1]} ${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Checks whether gamification promo is currently active according to Owner settings & date period.
 */
export function checkGamificationPeriod(settings: GamificationSettings): GamificationPeriodStatus {
  if (!settings.isEnabled) {
    return {
      isActive: false,
      status: 'disabled',
      label: 'Nonaktif',
      badgeColor: 'bg-slate-700/80 text-slate-300 border-slate-600',
      message: 'Program Lucky Spin & Gamifikasi saat ini dinonaktifkan oleh Owner.',
    };
  }

  // If period limit is disabled, promo runs indefinitely
  if (!settings.hasPeriodLimit) {
    return {
      isActive: true,
      status: 'active',
      label: 'Aktif Selamanya',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      message: 'Promo berjalan aktif tanpa batasan tanggal.',
    };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const start = settings.startDate || '1970-01-01';
  const end = settings.endDate || '2099-12-31';

  if (todayStr < start) {
    return {
      isActive: false,
      status: 'upcoming',
      label: 'Promo Belum Dimulai',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      message: `Periode promo Lucky Spin baru dimulai pada ${formatDateIndo(start)}.`,
    };
  }

  if (todayStr > end) {
    return {
      isActive: false,
      status: 'expired',
      label: 'Promo Telah Berakhir',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      message: `Periode promo Lucky Spin telah berakhir pada ${formatDateIndo(end)}.`,
    };
  }

  // Calculate remaining days
  const todayDate = new Date(todayStr);
  const endDate = new Date(end);
  const diffTime = endDate.getTime() - todayDate.getTime();
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return {
    isActive: true,
    status: 'active',
    label: `Promo Aktif (${diffDays} hari tersisa)`,
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    message: `Periode promo aktif s.d ${formatDateIndo(end)}.`,
    daysLeft: diffDays,
  };
}

/**
 * Checks if an order or general context is eligible to spin the wheel or scratch the card.
 * Enforces:
 * 1. Active promo period
 * 2. 1-spin per nota limit (if oneSpinPerOrder is enabled by owner)
 */
export function checkOrderSpinEligibility(
  settings: GamificationSettings,
  order?: Order | null
): {
  canSpin: boolean;
  reason?: string;
  claimedAt?: string;
  prizeClaimed?: string;
  isPeriodBlocked?: boolean;
  isClaimedBlocked?: boolean;
  isNotReadyForPickup?: boolean;
} {
  // 1. Period check
  const periodStatus = checkGamificationPeriod(settings);
  if (!periodStatus.isActive) {
    return {
      canSpin: false,
      reason: periodStatus.message,
      isPeriodBlocked: true,
    };
  }

  // 2. Order check
  if (!order) {
    // If no order attached (e.g. Owner preview testing), allow spin
    return { canSpin: true };
  }

  // 3. Limit 1 nota 1 spin check
  if (settings.oneSpinPerOrder && order.hasClaimedGamification) {
    return {
      canSpin: false,
      reason: `Nota #${order.invoiceNo} sudah menggunakan jatah 1x Lucky Spin.`,
      claimedAt: order.gamificationClaimedAt,
      prizeClaimed: order.gamificationRewardClaimed || order.appliedPromoReward || 'Hadiah Telah Diklaim',
      isClaimedBlocked: true,
    };
  }

  // 4. Khusus Pas Ambil Cucian Saja (status: siap / diantar / selesai)
  if (settings.onlyOnPickup) {
    const isPickupReady = order.currentStatus === 'siap' || order.currentStatus === 'diantar' || order.currentStatus === 'selesai';
    if (!isPickupReady) {
      const statusLabels: Record<string, string> = {
        antrean: 'Antrean Masuk',
        sortir: 'Proses Sortir',
        cuci: 'Proses Cuci',
        kering: 'Proses Pengeringan',
        setrika: 'Proses Setrika Uap',
        packing: 'Proses Pengemasan',
      };
      const currLabel = statusLabels[order.currentStatus] || order.currentStatus;
      return {
        canSpin: false,
        reason: `Nota #${order.invoiceNo} masih dalam tahap "${currLabel}". Lucky Spin khusus dibuka saat pakaian sudah selesai & siap diambil di outlet (Status: Siap Ambil / Selesai).`,
        isNotReadyForPickup: true,
      };
    }
  }

  return { canSpin: true };
}
