/**
 * Multi-Currency Utility for LAUNDRYHUB
 * Supports Indonesian Rupiah (IDR) and US Dollar (USD) for international payments
 */

export type Currency = 'IDR' | 'USD';

// Standard estimated exchange rate: 1 USD = Rp 16,000 IDR
export const USD_EXCHANGE_RATE = 16000;

/**
 * Format price according to selected currency
 * @param amountInIDR Amount in Indonesian Rupiah
 * @param currency Target currency ('IDR' or 'USD')
 */
export function formatCurrency(amountInIDR: number, currency: Currency = 'IDR'): string {
  if (currency === 'USD') {
    const usdVal = amountInIDR / USD_EXCHANGE_RATE;
    // Format to 2 decimal places with $ symbol
    return `$${usdVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return `Rp ${amountInIDR.toLocaleString('id-ID')}`;
}

/**
 * Convert IDR to USD rounded to 2 decimal digits
 */
export function idrToUsd(amountInIDR: number): number {
  return Number((amountInIDR / USD_EXCHANGE_RATE).toFixed(2));
}

/**
 * Convert USD to IDR
 */
export function usdToIdr(amountInUSD: number): number {
  return Math.round(amountInUSD * USD_EXCHANGE_RATE);
}
