import { Order, Branch } from '../types';

/**
 * Standard ESC/POS Thermal Byte Commands for 58mm & 80mm Mobile/Desktop Printers
 */
const ESC = 0x1b;
const GS = 0x1d;

export const ESC_POS = {
  INIT: new Uint8Array([ESC, 0x40]), // ESC @: Initialize printer
  ALIGN_LEFT: new Uint8Array([ESC, 0x61, 0x00]),
  ALIGN_CENTER: new Uint8Array([ESC, 0x61, 0x01]),
  ALIGN_RIGHT: new Uint8Array([ESC, 0x61, 0x02]),
  BOLD_ON: new Uint8Array([ESC, 0x45, 0x01]),
  BOLD_OFF: new Uint8Array([ESC, 0x45, 0x00]),
  DOUBLE_SIZE_ON: new Uint8Array([GS, 0x21, 0x11]), // Double height & width
  DOUBLE_HEIGHT_ON: new Uint8Array([GS, 0x21, 0x01]),
  NORMAL_SIZE: new Uint8Array([GS, 0x21, 0x00]),
  LINE_FEED: new Uint8Array([0x0a]),
  CUT_PAPER: new Uint8Array([GS, 0x56, 0x42, 0x00]), // GS V 'B' 0: Cut paper with feed
};

/**
 * Helper to encode UTF-8 / ASCII string to Uint8Array
 */
export function encodeText(text: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(text);
}

/**
 * Combine multiple Uint8Arrays into one contiguous buffer
 */
export function concatByteArrays(arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((acc, curr) => acc + curr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/**
 * Format two-column line with exact character padding (e.g. Left title and Right price)
 */
export function formatTwoColumns(left: string, right: string, maxColumns: number = 32): string {
  const leftTrimmed = left.substring(0, maxColumns - right.length - 1);
  const spacesNeeded = Math.max(1, maxColumns - leftTrimmed.length - right.length);
  return leftTrimmed + ' '.repeat(spacesNeeded) + right + '\n';
}

/**
 * Build ESC/POS Byte Stream for an Order
 */
export function buildReceiptEscPosBytes(
  order: Order,
  branch?: Branch,
  paperWidth: '58mm' | '80mm' = '58mm'
): Uint8Array {
  const cols = paperWidth === '58mm' ? 32 : 48;
  const divider = '-'.repeat(cols) + '\n';
  const doubleDivider = '='.repeat(cols) + '\n';

  const chunks: Uint8Array[] = [];

  const add = (arr: Uint8Array) => chunks.push(arr);
  const addText = (text: string) => chunks.push(encodeText(text));

  // 1. Initialize
  add(ESC_POS.INIT);

  // 2. Header (Centered, bold title)
  add(ESC_POS.ALIGN_CENTER);
  add(ESC_POS.BOLD_ON);
  add(ESC_POS.DOUBLE_HEIGHT_ON);
  addText('LAUNDRYHUB\n');
  add(ESC_POS.NORMAL_SIZE);
  addText((branch?.name || 'LaundryHub Express').toUpperCase() + '\n');
  add(ESC_POS.BOLD_OFF);

  addText((branch?.address || 'Jl. Kemang Raya No. 42B') + '\n');
  addText('WA: ' + (branch?.phone || '0812-8899-7701') + '\n');
  addText(doubleDivider);

  // 3. Metadata (Left aligned)
  add(ESC_POS.ALIGN_LEFT);
  addText(formatTwoColumns('No. Nota:', order.invoiceNo, cols));
  addText(formatTwoColumns('Tanggal:', order.createdAt.substring(0, 16), cols));
  addText(formatTwoColumns('Pelanggan:', order.customerName, cols));
  addText(formatTwoColumns('No. Telp:', order.customerPhone, cols));
  addText(formatTwoColumns('Parfum:', order.perfumeName, cols));
  addText(formatTwoColumns('Est Selesai:', order.estReadyDate.substring(0, 16), cols));
  addText(divider);

  // 4. Items List
  add(ESC_POS.BOLD_ON);
  addText(formatTwoColumns('Layanan', 'Subtotal', cols));
  add(ESC_POS.BOLD_OFF);

  for (const item of order.items) {
    addText(item.serviceName + '\n');
    const qtyPrice = `${item.quantity} ${item.unit} x ${item.pricePerUnit.toLocaleString('id-ID')}`;
    const subtotalStr = `Rp ${item.subtotal.toLocaleString('id-ID')}`;
    addText(formatTwoColumns(`  ${qtyPrice}`, subtotalStr, cols));
  }
  addText(divider);

  // 5. Totals
  const totalWeightStr = order.weightKg > 0 ? `${order.weightKg} kg` : `${order.itemCount} pcs`;
  addText(formatTwoColumns('Total Muatan:', totalWeightStr, cols));
  addText(formatTwoColumns('Subtotal:', `Rp ${order.totalPrice.toLocaleString('id-ID')}`, cols));
  if (order.discount > 0) {
    addText(formatTwoColumns('Diskon Promo:', `-Rp ${order.discount.toLocaleString('id-ID')}`, cols));
  }

  add(ESC_POS.BOLD_ON);
  addText(formatTwoColumns('TOTAL AKHIR:', `Rp ${order.finalPrice.toLocaleString('id-ID')}`, cols));
  add(ESC_POS.BOLD_OFF);

  addText(formatTwoColumns('Metode Bayar:', order.paymentMethod.toUpperCase(), cols));
  addText(formatTwoColumns('Status Bayar:', order.paymentStatus === 'lunas' ? '[LUNAS]' : '[BELUM LUNAS]', cols));
  if (order.paymentMethod === 'tunai' && order.paidAmount) {
    addText(formatTwoColumns('Uang Diterima:', `Rp ${order.paidAmount.toLocaleString('id-ID')}`, cols));
    addText(formatTwoColumns('Kembalian:', `Rp ${(order.changeAmount || 0).toLocaleString('id-ID')}`, cols));
  }

  // 6. Special Notes
  if (order.specialNotes) {
    addText(divider);
    addText(`Catatan: ${order.specialNotes}\n`);
  }

  // 7. Footer
  addText(doubleDivider);
  add(ESC_POS.ALIGN_CENTER);
  addText('Simpan nota untuk pengambilan cucian\n');
  addText('Terima Kasih Telah Mempercayakan\nPakaian Anda Pada Kami!\n\n');

  // 8. Feed & Cut
  add(ESC_POS.LINE_FEED);
  add(ESC_POS.LINE_FEED);
  add(ESC_POS.LINE_FEED);
  add(ESC_POS.CUT_PAPER);

  return concatByteArrays(chunks);
}

/**
 * Web Bluetooth Printer Manager (Native Direct Printing)
 */
class BluetoothPrinterManager {
  private device: any = null;
  private characteristic: any = null;
  public isConnected: boolean = false;
  public deviceName: string = '';

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  public async connect(): Promise<{ success: boolean; message: string }> {
    if (!this.isSupported()) {
      return {
        success: false,
        message: 'Browser Anda belum mendukung Web Bluetooth API. Gunakan Google Chrome / Edge atau dialog browser print.',
      };
    }

    try {
      // Standard Bluetooth Serial Port Profile (SPP) and Thermal Printer UUIDs
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Standard Printer service
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
          '49535343-fe7d-4ae5-8fa9-9fafd205e455',
        ],
      });

      this.device = device;
      this.deviceName = device.name || 'Thermal Bluetooth Printer';

      const server = await device.gatt.connect();
      const services = await server.getPrimaryServices();

      if (services.length === 0) {
        throw new Error('Tidak ada layanan bluetooth printer yang ditemukan pada perangkat ini.');
      }

      // Pick writable characteristic
      for (const service of services) {
        const characteristics = await service.getCharacteristics();
        for (const c of characteristics) {
          if (c.properties.write || c.properties.writeWithoutResponse) {
            this.characteristic = c;
            this.isConnected = true;
            return {
              success: true,
              message: `Berhasil terhubung ke ${this.deviceName}`,
            };
          }
        }
      }

      throw new Error('Karakteristik Bluetooth writable tidak ditemukan.');
    } catch (err: any) {
      this.isConnected = false;
      return {
        success: false,
        message: err.message || 'Gagal menyambungkan ke printer bluetooth',
      };
    }
  }

  public async printBytes(bytes: Uint8Array): Promise<{ success: boolean; message: string }> {
    if (!this.isConnected || !this.characteristic) {
      return {
        success: false,
        message: 'Printer Bluetooth belum terhubung. Sambungkan printer terlebih dahulu.',
      };
    }

    try {
      // Chunking 512 bytes for Bluetooth MTU safety
      const CHUNK_SIZE = 512;
      for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
        const chunk = bytes.slice(i, i + CHUNK_SIZE);
        if (this.characteristic.writeValueWithoutResponse) {
          await this.characteristic.writeValueWithoutResponse(chunk);
        } else {
          await this.characteristic.writeValue(chunk);
        }
      }

      return {
        success: true,
        message: 'Struk berhasil dikirim ke printer thermal bluetooth!',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Gagal mencetak: ${err.message}`,
      };
    }
  }

  public disconnect() {
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.characteristic = null;
    this.isConnected = false;
    this.deviceName = '';
  }
}

export const bluetoothPrinter = new BluetoothPrinterManager();
