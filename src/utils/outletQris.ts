/**
 * Outlet QRIS Management Utility
 * Allows individual laundry shops / outlets to upload and configure their own QRIS
 * for receiving laundry customer payments directly to their own account.
 */

export interface OutletQrisConfig {
  merchantName: string;
  merchantCity: string;
  nmid: string;
  imageUrl: string;
  isCustomized: boolean;
  updatedAt: string;
}

const STORAGE_KEY = 'lh_outlet_qris_config';

export function getOutletQrisConfig(): OutletQrisConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read outlet QRIS config', e);
  }

  return {
    merchantName: 'LAUNDRYHUB EXPRESS OUTLET',
    merchantCity: 'JAKARTA',
    nmid: 'ID1020023910291',
    imageUrl: '',
    isCustomized: false,
    updatedAt: new Date().toISOString(),
  };
}

export function saveOutletQrisConfig(config: Partial<OutletQrisConfig>): OutletQrisConfig {
  const current = getOutletQrisConfig();
  const updated: OutletQrisConfig = {
    ...current,
    ...config,
    isCustomized: true,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('lh_outlet_qris_updated'));
  return updated;
}

export function resetOutletQrisConfig(): OutletQrisConfig {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('lh_outlet_qris_updated'));
  return getOutletQrisConfig();
}
