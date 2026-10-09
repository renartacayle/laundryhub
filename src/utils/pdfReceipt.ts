import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Order, Branch } from '../types';
import { formatCurrency } from './currency';

/**
 * Generates and downloads an authentic, official PDF Invoice / Receipt for LaundryHub orders.
 * Generates an actual .pdf binary file using jsPDF and directly downloads it to the device,
 * completely avoiding browser popup blockers.
 * Supports both Official A4 Document format and Thermal Receipt format (58mm / 80mm).
 */
export async function downloadReceiptPdf(
  order: Order,
  branch?: Branch,
  defaultFormat: 'a4' | '80mm' | '58mm' = 'a4'
): Promise<void> {
  if (!order) return;

  try {
    const trackingUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/?nota=${order.invoiceNo}`
      : `https://laundryhub.app/?nota=${order.invoiceNo}`;

    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(trackingUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
    } catch (err) {
      console.warn('Error generating QR code for receipt PDF:', err);
    }

    const branchName = branch?.name || 'LAUNDRYHUB EXPRESS';
    const branchAddress = branch?.address || 'Jl. Kemang Raya No. 42B, Mampang Prapatan, Jakarta Selatan';
    const branchPhone = branch?.phone || '0812-8899-7701';

    const orderDate = new Date(order.createdAt).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const estReadyDate = new Date(order.estReadyDate).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const isLunas = order.paymentStatus === 'lunas';

    if (defaultFormat === '58mm' || defaultFormat === '80mm') {
      // Generate Thermal Receipt PDF
      generateThermalPdf({
        order,
        branchName,
        branchAddress,
        branchPhone,
        orderDate,
        estReadyDate,
        isLunas,
        qrDataUrl,
        trackingUrl,
        paperWidth: defaultFormat === '58mm' ? 58 : 80,
      });
    } else {
      // Generate Official A4 Document PDF
      generateA4Pdf({
        order,
        branchName,
        branchAddress,
        branchPhone,
        orderDate,
        estReadyDate,
        isLunas,
        qrDataUrl,
        trackingUrl,
      });
    }
  } catch (error) {
    console.error('Failed to generate or download receipt PDF:', error);
  }
}

interface ReceiptPdfParams {
  order: Order;
  branchName: string;
  branchAddress: string;
  branchPhone: string;
  orderDate: string;
  estReadyDate: string;
  isLunas: boolean;
  qrDataUrl: string;
  trackingUrl: string;
  paperWidth?: number;
}

/**
 * Builds and downloads Official A4 Invoice PDF
 */
function generateA4Pdf(params: ReceiptPdfParams) {
  const {
    order,
    branchName,
    branchAddress,
    branchPhone,
    orderDate,
    estReadyDate,
    isLunas,
    qrDataUrl,
    trackingUrl,
  } = params;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  const drawHeader = (isFirstPage: boolean) => {
    // Top Decorative Brand Bar
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, 12, contentWidth, isFirstPage ? 26 : 14, 'F');

    // Accent Line
    doc.setFillColor(6, 182, 212); // cyan-500
    doc.rect(margin, 12, 4, isFirstPage ? 26 : 14, 'F');

    // Brand Name
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(isFirstPage ? 16 : 11);
    doc.text('LAUNDRYHUB', margin + 8, isFirstPage ? 21 : 21);

    if (isFirstPage) {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`${branchName} • ${branchPhone}`, margin + 8, 27);
      doc.text(branchAddress.length > 55 ? branchAddress.substring(0, 52) + '...' : branchAddress, margin + 8, 33);

      // Right Side Header: NOTA TRANSAKSI & Invoice No
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('NOTA TRANSAKSI', pageWidth - margin - 6, 21, { align: 'right' });

      doc.setTextColor(34, 211, 238); // cyan-400
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(order.invoiceNo || 'INV-0000', pageWidth - margin - 6, 27, { align: 'right' });

      // Status Badge in Header
      if (isLunas) {
        doc.setFillColor(22, 101, 52); // emerald-800
        doc.setTextColor(187, 247, 208); // emerald-200
        doc.roundedRect(pageWidth - margin - 32, 30, 26, 6, 1.5, 1.5, 'F');
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text('✓ LUNAS', pageWidth - margin - 19, 34.2, { align: 'center' });
      } else {
        doc.setFillColor(153, 27, 27); // red-800
        doc.setTextColor(254, 202, 202); // red-200
        doc.roundedRect(pageWidth - margin - 42, 30, 36, 6, 1.5, 1.5, 'F');
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text('⚠️ BELUM LUNAS', pageWidth - margin - 24, 34.2, { align: 'center' });
      }
    } else {
      doc.setTextColor(34, 211, 238);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text(`Nota: ${order.invoiceNo} (Lanjutan)`, pageWidth - margin - 6, 21, { align: 'right' });
    }
  };

  drawHeader(true);

  // 2. Customer & Transaction Details Card
  let curY = 43;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, curY, contentWidth, 34, 2, 2, 'FD');

  // Left Column: Customer Details
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.setFont('helvetica', 'bold');
  doc.text('PELANGGAN:', margin + 6, curY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(order.customerName || 'Pelanggan Umum', margin + 6, curY + 12);

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text(`No. WA: ${order.customerPhone || '-'}`, margin + 6, curY + 17);
  if (order.customerAddress) {
    const addr = order.customerAddress.length > 40 ? order.customerAddress.substring(0, 37) + '...' : order.customerAddress;
    doc.text(`Alamat: ${addr}`, margin + 6, curY + 22);
  } else {
    doc.text(`Alamat: Outlet Pickup`, margin + 6, curY + 22);
  }
  doc.setTextColor(124, 58, 237); // purple-600
  doc.text(`Parfum: ${order.perfumeName || 'Aroma Standar'}`, margin + 6, curY + 28);

  // Right Column: Order Dates & Service Type
  const rightColX = margin + 95;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMASI ORDER:', rightColX, curY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Tgl Masuk: ${orderDate}`, rightColX, curY + 12);

  doc.setTextColor(5, 150, 105); // emerald-600
  doc.setFont('helvetica', 'bold');
  doc.text(`Est. Siap: ${estReadyDate}`, rightColX, curY + 17);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text(`Metode: ${(order.paymentMethod || 'TUNAI').toUpperCase()}`, rightColX, curY + 22);
  doc.text(`Layanan: ${order.pickupDeliveryType === 'delivery' ? 'Antar Jemput (Delivery)' : 'Ambil di Outlet'}`, rightColX, curY + 28);

  // 3. Items Table Header
  curY = 82;
  const drawTableHeader = (y: number) => {
    doc.setFillColor(241, 245, 249); // slate-100
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.rect(margin, y, contentWidth, 8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text('NO', margin + 3, y + 5.5);
    doc.text('RINCIAN LAYANAN & ITEM', margin + 14, y + 5.5);
    doc.text('QTY / BERAT', margin + 105, y + 5.5, { align: 'right' });
    doc.text('TARIF', margin + 142, y + 5.5, { align: 'right' });
    doc.text('SUBTOTAL', pageWidth - margin - 4, y + 5.5, { align: 'right' });
  };

  drawTableHeader(curY);

  // Items Table Rows
  curY += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  order.items.forEach((item, idx) => {
    // Pagination check: if near bottom of page
    if (curY > pageHeight - 75) {
      doc.addPage();
      drawHeader(false);
      curY = 32;
      drawTableHeader(curY);
      curY += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
    }

    const isAlt = idx % 2 === 1;
    if (isAlt) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, curY, contentWidth, 8.5, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, curY + 8.5, pageWidth - margin, curY + 8.5);

    doc.setTextColor(100, 116, 139);
    doc.text(`${idx + 1}`, margin + 3, curY + 5.5);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(item.serviceName, margin + 14, curY + 5.5);
    doc.setFont('helvetica', 'normal');

    doc.setTextColor(51, 65, 85);
    doc.text(`${item.quantity} ${item.unit || ''}`, margin + 105, curY + 5.5, { align: 'right' });
    doc.text(formatCurrency(item.pricePerUnit, 'IDR'), margin + 142, curY + 5.5, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(formatCurrency(item.subtotal, 'IDR'), pageWidth - margin - 4, curY + 5.5, { align: 'right' });

    curY += 8.5;
  });

  // 4. Clothes Details Box (if available)
  if (order.clothesDetails && order.clothesDetails.length > 0) {
    if (curY > pageHeight - 80) {
      doc.addPage();
      drawHeader(false);
      curY = 32;
    }

    curY += 4;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    const totalHelai = order.totalPieces || order.clothesDetails.reduce((a, b) => a + (b.quantity || 0), 0);
    doc.roundedRect(margin, curY, contentWidth, 14, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`📋 RINCIAN PAKAIAN TERCATAT (${totalHelai} helai):`, margin + 4, curY + 5);

    const clothesSummary = order.clothesDetails
      .map((c) => `${c.name} (${c.quantity}x)`)
      .join(', ');
    const displayClothes = clothesSummary.length > 95 ? clothesSummary.substring(0, 92) + '...' : clothesSummary;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(displayClothes, margin + 4, curY + 10);

    curY += 15;
  } else {
    curY += 4;
  }

  // Check if enough space for Totals + QR + Policy + Signatures
  const totalBoxHeight = (order.discount && order.discount > 0) ? 38 : 32;
  const neededBottomHeight = totalBoxHeight + 18 + 26 + 10;
  if (curY + neededBottomHeight > pageHeight - 15) {
    doc.addPage();
    drawHeader(false);
    curY = 32;
  }

  // 5. Totals Breakdown Card
  const totalBoxWidth = 84;
  const totalBoxX = pageWidth - margin - totalBoxWidth;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(totalBoxX, curY, totalBoxWidth, totalBoxHeight, 2, 2, 'FD');

  let rowY = curY + 6;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Total Tagihan Layanan:', totalBoxX + 4, rowY);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(order.totalPrice || order.finalPrice, 'IDR'), totalBoxX + totalBoxWidth - 4, rowY, { align: 'right' });

  if (order.discount && order.discount > 0) {
    rowY += 5.5;
    doc.setTextColor(225, 29, 72); // rose-600
    doc.setFont('helvetica', 'normal');
    doc.text('Diskon / Reward Spin:', totalBoxX + 4, rowY);
    doc.setFont('helvetica', 'bold');
    doc.text(`- ${formatCurrency(order.discount, 'IDR')}`, totalBoxX + totalBoxWidth - 4, rowY, { align: 'right' });
  }

  rowY += 6.5;
  doc.setDrawColor(15, 23, 42);
  doc.line(totalBoxX + 4, rowY - 1, totalBoxX + totalBoxWidth - 4, rowY - 1);

  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL AKHIR:', totalBoxX + 4, rowY + 3);
  doc.setTextColor(2, 132, 199); // sky-600
  doc.text(formatCurrency(order.finalPrice, 'IDR'), totalBoxX + totalBoxWidth - 4, rowY + 3, { align: 'right' });

  rowY += 7.5;
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('Jumlah Dibayar:', totalBoxX + 4, rowY);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(order.paidAmount ?? order.finalPrice, 'IDR'), totalBoxX + totalBoxWidth - 4, rowY, { align: 'right' });

  rowY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Kembalian:', totalBoxX + 4, rowY);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(order.changeAmount ?? 0, 'IDR'), totalBoxX + totalBoxWidth - 4, rowY, { align: 'right' });

  // 6. QR Code Tracking & Instructions (Left side)
  const qrBoxWidth = contentWidth - totalBoxWidth - 6;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, curY, qrBoxWidth, totalBoxHeight, 2, 2, 'FD');

  if (qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, 'PNG', margin + 4, curY + 3.5, 25, 25);
    } catch (e) {
      console.warn('Error adding QR to A4 PDF', e);
    }
  }

  const qrTextX = margin + 33;
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('📱 LACAK LIVE & LUCKY SPIN', qrTextX, curY + 7);

  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text('Scan QR ini lewat kamera HP untuk cek', qrTextX, curY + 12);
  doc.text('progres cuci & putar roda hadiah diskon.', qrTextX, curY + 16);

  doc.setTextColor(2, 132, 199);
  doc.setFont('helvetica', 'bold');
  doc.text(`Link: ${trackingUrl.substring(0, 32)}...`, qrTextX, curY + 22);

  // 7. Policy / Ketentuan Layanan
  curY += totalBoxHeight + 6;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, curY, contentWidth, 18, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text('KETENTUAN PENGAMBILAN & GARANSI OUTLET:', margin + 4, curY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('1. Pengambilan cucian wajib membawa nota resmi ini atau memperlihatkan riwayat nota di WhatsApp.', margin + 4, curY + 8.5);
  doc.text('2. Komplain atas kerusakan atau ketidaksesuaian pakaian maksimal 1x24 jam sejak cucian diambil disertai nota.', margin + 4, curY + 12);
  doc.text('3. Pakaian yang tidak diambil dalam waktu lebih dari 30 hari di luar tanggung jawab pihak laundry.', margin + 4, curY + 15.5);

  // 8. Signatures
  curY += 24;
  const sigColWidth = contentWidth / 2;

  // Kasir Signature Box
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text('Petugas Kasir Bertugas,', margin + sigColWidth / 2, curY, { align: 'center' });
  doc.line(margin + 20, curY + 16, margin + sigColWidth - 20, curY + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(branchName, margin + sigColWidth / 2, curY + 20, { align: 'center' });

  // Customer Signature Box
  const custSigCenter = margin + sigColWidth + sigColWidth / 2;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Pelanggan Terhormat,', custSigCenter, curY, { align: 'center' });
  doc.line(custSigCenter - 25, curY + 16, custSigCenter + 25, curY + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(order.customerName || 'Pelanggan', custSigCenter, curY + 20, { align: 'center' });

  // 9. Document Footer
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `LaundryHub POS Cloud System • Dokumen Resmi Digital • Dicetak pada ${new Date().toLocaleString('id-ID')}`,
    pageWidth / 2,
    285,
    { align: 'center' }
  );

  // Trigger Instant Native Download
  const fileName = `Nota_${order.invoiceNo || 'Order'}.pdf`;
  doc.save(fileName);
}

/**
 * Builds and downloads Thermal Receipt PDF (58mm / 80mm)
 */
function generateThermalPdf(params: ReceiptPdfParams) {
  const {
    order,
    branchName,
    branchAddress,
    branchPhone,
    orderDate,
    estReadyDate,
    isLunas,
    qrDataUrl,
    paperWidth = 80,
  } = params;

  // Calculate dynamic page height according to items and clothes count to ensure zero truncation
  const baseHeight = 175;
  const itemsHeight = (order.items || []).length * 9;
  const clothesCount = (order.clothesDetails || []).length;
  const clothesHeight = clothesCount > 0 ? (12 + clothesCount * 4) : 0;
  const qrHeight = qrDataUrl ? (paperWidth === 58 ? 32 : 38) : 0;
  const calculatedHeight = Math.max(190, baseHeight + itemsHeight + clothesHeight + qrHeight);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [paperWidth, calculatedHeight],
  });

  const margin = paperWidth === 58 ? 4 : 6;
  const centerX = paperWidth / 2;

  let y = 8;

  // Header Title
  doc.setFont('courier', 'bold');
  doc.setFontSize(paperWidth === 58 ? 10 : 12);
  doc.setTextColor(0, 0, 0);
  doc.text('LAUNDRYHUB', centerX, y, { align: 'center' });

  y += 4.5;
  doc.setFontSize(paperWidth === 58 ? 7.5 : 8.5);
  doc.text(branchName, centerX, y, { align: 'center' });

  y += 3.8;
  doc.setFont('courier', 'normal');
  doc.setFontSize(paperWidth === 58 ? 6.5 : 7.5);
  doc.text(branchPhone, centerX, y, { align: 'center' });

  y += 3.5;
  const shortAddr = branchAddress.length > 36 ? branchAddress.substring(0, 33) + '...' : branchAddress;
  doc.text(shortAddr, centerX, y, { align: 'center' });

  // Dashed Line
  y += 3.5;
  doc.text('-'.repeat(paperWidth === 58 ? 26 : 38), centerX, y, { align: 'center' });

  // Receipt Meta
  y += 4;
  doc.setFont('courier', 'bold');
  doc.setFontSize(paperWidth === 58 ? 8 : 9);
  doc.text(`NO: ${order.invoiceNo || 'INV-0000'}`, margin, y);

  y += 4;
  doc.setFont('courier', 'normal');
  doc.setFontSize(paperWidth === 58 ? 6.5 : 7.5);
  doc.text(`TGL : ${orderDate}`, margin, y);

  y += 3.5;
  doc.text(`SIAP: ${estReadyDate}`, margin, y);

  y += 3.5;
  doc.text(`NAMA: ${order.customerName || 'Pelanggan Umum'}`, margin, y);

  y += 3.5;
  doc.text(`TELP: ${order.customerPhone || '-'}`, margin, y);

  y += 3.5;
  doc.text(`WANGI: ${order.perfumeName || 'Aroma Standar'}`, margin, y);

  y += 3.5;
  doc.setFont('courier', 'bold');
  doc.text(`STATUS: ${isLunas ? '[ LUNAS ]' : '[ BELUM LUNAS ]'}`, margin, y);

  // Dashed Line
  y += 3.5;
  doc.setFont('courier', 'normal');
  doc.text('-'.repeat(paperWidth === 58 ? 26 : 38), centerX, y, { align: 'center' });

  // Table items
  y += 4;
  (order.items || []).forEach((item) => {
    doc.setFont('courier', 'bold');
    doc.setFontSize(paperWidth === 58 ? 7 : 8);
    doc.text(item.serviceName, margin, y);

    y += 3.5;
    doc.setFont('courier', 'normal');
    const qtyText = `${item.quantity} ${item.unit || ''} x ${formatCurrency(item.pricePerUnit, 'IDR')}`;
    const subtotalText = formatCurrency(item.subtotal, 'IDR');

    doc.text(qtyText, margin, y);
    doc.text(subtotalText, paperWidth - margin, y, { align: 'right' });
    y += 4;
  });

  // Clothes Details (if present)
  if (order.clothesDetails && order.clothesDetails.length > 0) {
    doc.text('-'.repeat(paperWidth === 58 ? 26 : 38), centerX, y, { align: 'center' });
    y += 3.5;

    doc.setFont('courier', 'bold');
    doc.setFontSize(paperWidth === 58 ? 6.5 : 7.5);
    doc.text(`RINCIAN PAKAIAN (${order.totalPieces || order.clothesDetails.length} helai):`, margin, y);
    y += 3.5;

    doc.setFont('courier', 'normal');
    doc.setFontSize(paperWidth === 58 ? 6 : 7);
    order.clothesDetails.forEach((c) => {
      doc.text(`• ${c.name} (${c.quantity}x)`, margin + 1.5, y);
      y += 3.2;
    });
  }

  // Dashed Line
  doc.text('-'.repeat(paperWidth === 58 ? 26 : 38), centerX, y, { align: 'center' });
  y += 4;

  // Totals
  doc.setFontSize(paperWidth === 58 ? 7 : 8);
  doc.text('Subtotal:', margin, y);
  doc.text(formatCurrency(order.totalPrice || order.finalPrice, 'IDR'), paperWidth - margin, y, { align: 'right' });

  if (order.discount && order.discount > 0) {
    y += 3.5;
    doc.text('Diskon:', margin, y);
    doc.text(`-${formatCurrency(order.discount, 'IDR')}`, paperWidth - margin, y, { align: 'right' });
  }

  y += 4.5;
  doc.setFont('courier', 'bold');
  doc.setFontSize(paperWidth === 58 ? 8 : 9.5);
  doc.text('TOTAL:', margin, y);
  doc.text(formatCurrency(order.finalPrice, 'IDR'), paperWidth - margin, y, { align: 'right' });

  y += 4;
  doc.setFont('courier', 'normal');
  doc.setFontSize(paperWidth === 58 ? 7 : 8);
  doc.text('Bayar:', margin, y);
  doc.text(formatCurrency(order.paidAmount ?? order.finalPrice, 'IDR'), paperWidth - margin, y, { align: 'right' });

  y += 3.5;
  doc.text('Kembali:', margin, y);
  doc.text(formatCurrency(order.changeAmount ?? 0, 'IDR'), paperWidth - margin, y, { align: 'right' });

  // QR Code
  if (qrDataUrl) {
    y += 4;
    try {
      const qrSize = paperWidth === 58 ? 24 : 30;
      const qrX = centerX - qrSize / 2;
      doc.addImage(qrDataUrl, 'PNG', qrX, y, qrSize, qrSize);
      y += qrSize + 2;
    } catch (e) {
      console.warn('Error rendering thermal QR', e);
    }
  }

  // Footer Note
  doc.setFont('courier', 'normal');
  doc.setFontSize(paperWidth === 58 ? 6 : 7);
  doc.text('Scan QR untuk Status & Lucky Spin', centerX, y, { align: 'center' });

  y += 3.5;
  doc.text('Komplain max 1x24 jam bawa nota', centerX, y, { align: 'center' });

  y += 3.5;
  doc.text('Terima Kasih atas Kepercayaan Anda', centerX, y, { align: 'center' });

  // Download PDF
  const fileName = `Nota_${order.invoiceNo || 'Order'}_thermal_${paperWidth}mm.pdf`;
  doc.save(fileName);
}
