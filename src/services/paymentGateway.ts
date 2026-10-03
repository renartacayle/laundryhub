/**
 * Standard Indonesian EMVCo QRIS Generator & Payment Gateway Integration Service
 * Compliant with Bank Indonesia & ASPI Dynamic QRIS Specifications
 */

/**
 * Calculate CRC16-CCITT checksum for EMVCo QR Code
 */
export function calculateCRC16(str: string): string {
  let crc = 0xffff;
  const strlen = str.length;

  for (let c = 0; c < strlen; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  const hex = (crc & 0xffff).toString(16).toUpperCase();
  return hex.padStart(4, '0');
}

/**
 * Format an EMVCo Tag-Length-Value (TLV) segment
 */
function tlv(tag: string, value: string): string {
  const len = String(value.length).padStart(2, '0');
  return `${tag}${len}${value}`;
}

/**
 * Generate official Bank Indonesia compliant Dynamic QRIS string
 */
export function generateDynamicQrisPayload(
  invoiceNo: string,
  amount: number,
  merchantName: string = 'LAUNDRYHUB EXPRESS',
  merchantCity: string = 'JAKARTA SELATAN',
  nmid: string = 'ID1020023910291'
): string {
  // Format dynamic QR with amount and reference invoice
  const payloadWithoutCRC =
    tlv('00', '01') + // Format Indicator
    tlv('01', '12') + // Point of Initiation: 12 (Dynamic QR)
    // Tag 26: Merchant Account Information
    tlv(
      '26',
      tlv('00', 'ID.CO.QRIS.WWW') +
      tlv('01', nmid) +
      tlv('02', '01') +
      tlv('03', 'UMI') // Usaha Mikro / Kecil
    ) +
    tlv('52', '7210') + // Merchant Category Code: Laundry & Garment Services
    tlv('53', '360') + // Currency: IDR (360)
    tlv('54', String(amount)) + // Transaction Amount
    tlv('58', 'ID') + // Country Code
    tlv('59', merchantName.substring(0, 25)) + // Merchant Name
    tlv('60', merchantCity.substring(0, 15)) + // Merchant City
    tlv('61', '12730') + // Postal Code
    // Tag 62: Additional Data Field (Invoice reference)
    tlv(
      '62',
      tlv('01', invoiceNo) +
      tlv('05', 'LAUNDRY')
    ) +
    '6304'; // CRC Tag with length 04

  const checksum = calculateCRC16(payloadWithoutCRC);
  return payloadWithoutCRC + checksum;
}

export interface PaymentStatusResult {
  paid: boolean;
  paymentMethod?: string;
  transactionId?: string;
  paidAt?: string;
}

class PaymentGatewayService {
  private merchantNmid: string;
  private merchantName: string;
  private merchantCity: string;

  constructor() {
    this.merchantNmid = import.meta.env.VITE_MERCHANT_QRIS_NMID || 'ID1025407037114';
    this.merchantName = import.meta.env.VITE_MERCHANT_NAME || 'RENARTASHOP';
    this.merchantCity = import.meta.env.VITE_MERCHANT_CITY || 'SEMARANG';
  }

  public getRawStaticQris(): string {
    return '00020101021126760024ID.CO.SPEEDCASH.MERCHANT01189360081530001783110215ID10250017831130303UKE51440014ID.CO.QRIS.WWW0215ID10254070371140303UKE5204597053033605802ID5911RENARTASHOP6008SEMARANG61055051962410509S450748890117202609302100283600703A016304B0BB';
  }

  public getQrisString(invoiceNo: string, amount: number): string {
    return generateDynamicQrisPayload(
      invoiceNo,
      amount,
      this.merchantName,
      this.merchantCity,
      this.merchantNmid
    );
  }

  /**
   * Check status against Payment Gateway API / Webhook queue
   */
  public async checkPaymentStatus(invoiceNo: string): Promise<PaymentStatusResult> {
    // In production, this polls the backend or listens to WebSocket webhook event
    await new Promise((r) => setTimeout(r, 600));

    // Check if flagged as paid in local simulated webhook registry
    const paidInvoices = JSON.parse(localStorage.getItem('lh_paid_qris') || '[]');
    if (paidInvoices.includes(invoiceNo)) {
      return {
        paid: true,
        paymentMethod: 'QRIS (BCA / GoPay / ShopeePay)',
        transactionId: `TRX-${Date.now()}`,
        paidAt: new Date().toISOString(),
      };
    }

    return { paid: false };
  }

  /**
   * Simulate instant bank webhook notification
   */
  public simulateBankWebhook(invoiceNo: string): void {
    const paidInvoices = JSON.parse(localStorage.getItem('lh_paid_qris') || '[]');
    if (!paidInvoices.includes(invoiceNo)) {
      paidInvoices.push(invoiceNo);
      localStorage.setItem('lh_paid_qris', JSON.stringify(paidInvoices));
    }
  }
}

export const paymentGateway = new PaymentGatewayService();
