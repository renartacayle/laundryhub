import QRCode from 'qrcode';
import { Order, Branch } from '../types';
import { formatCurrency } from './currency';

/**
 * Generates an official, beautiful PDF Invoice / Receipt for LaundryHub orders.
 * Supports both Official A4 Document format and Thermal Receipt (58mm / 80mm).
 */
export async function downloadReceiptPdf(
  order: Order,
  branch?: Branch,
  defaultFormat: 'a4' | '80mm' | '58mm' = 'a4'
): Promise<void> {
  if (!order) return;

  const trackingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?nota=${order.invoiceNo}`
    : `https://laundryhub.app/?nota=${order.invoiceNo}`;

  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(trackingUrl, {
      width: 180,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Error generating QR code for receipt PDF:', err);
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

  // Construct printable HTML document with embedded CSS
  const printHtml = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Nota_${order.invoiceNo}_${order.customerName.replace(/\\s+/g, '_')}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #f1f5f9;
      color: #0f172a;
      -webkit-font-smoothing: antialiased;
      padding: 20px;
    }

    .no-print-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 16px;
      max-width: 800px;
      margin: 0 auto 20px auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #06b6d4;
      color: #0f172a;
    }
    .btn-primary:hover {
      background: #22d3ee;
    }

    .btn-secondary {
      background: #1e293b;
      color: #cbd5e1;
      border: 1px solid #334155;
    }
    .btn-secondary:hover {
      background: #334155;
      color: #ffffff;
    }

    /* A4 Document Format */
    .receipt-container {
      background: #ffffff;
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      position: relative;
    }

    /* Thermal Formats */
    body.format-80mm .receipt-container {
      max-width: 320px;
      padding: 16px;
      border-radius: 0;
      box-shadow: none;
      font-family: 'JetBrains Mono', monospace;
    }
    body.format-58mm .receipt-container {
      max-width: 240px;
      padding: 12px;
      border-radius: 0;
      box-shadow: none;
      font-family: 'JetBrains Mono', monospace;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }

    body.format-80mm .header,
    body.format-58mm .header {
      display: block;
      text-align: center;
      border-bottom: 1px dashed #94a3b8;
      padding-bottom: 12px;
      margin-bottom: 12px;
    }

    .brand-title {
      font-size: 24px;
      font-weight: 800;
      color: #0284c7;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      font-size: 13px;
      font-weight: 700;
      color: #334155;
      margin-top: 2px;
    }
    .brand-meta {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
      max-width: 380px;
      line-height: 1.4;
    }

    .invoice-badge-box {
      text-align: right;
    }
    body.format-80mm .invoice-badge-box,
    body.format-58mm .invoice-badge-box {
      text-align: center;
      margin-top: 10px;
    }

    .invoice-title {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
    }
    .invoice-no {
      font-size: 14px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: #0284c7;
      margin-top: 2px;
    }
    .status-badge {
      display: inline-block;
      margin-top: 6px;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-lunas {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
    }
    .status-piutang {
      background: #fee2e2;
      color: #b91c1c;
      border: 1px solid #fca5a5;
    }

    .grid-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 16px 20px;
      margin-bottom: 24px;
      font-size: 12px;
    }
    body.format-80mm .grid-info,
    body.format-58mm .grid-info {
      display: block;
      background: transparent;
      border: none;
      border-bottom: 1px dashed #94a3b8;
      border-radius: 0;
      padding: 8px 0;
      margin-bottom: 12px;
      font-size: 10px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .info-label {
      color: #64748b;
      font-weight: 600;
    }
    .info-value {
      font-weight: 700;
      color: #0f172a;
    }

    table.items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 12px;
    }
    body.format-80mm table.items-table,
    body.format-58mm table.items-table {
      font-size: 10px;
      margin-bottom: 12px;
    }

    table.items-table th {
      background: #f1f5f9;
      color: #475569;
      font-weight: 700;
      text-align: left;
      padding: 10px 14px;
      border-bottom: 2px solid #cbd5e1;
    }
    table.items-table td {
      padding: 10px 14px;
      border-bottom: 1px solid #e2e8f0;
    }
    body.format-80mm table.items-table th,
    body.format-80mm table.items-table td,
    body.format-58mm table.items-table th,
    body.format-58mm table.items-table td {
      padding: 6px 2px;
      border-bottom: 1px dashed #cbd5e1;
    }

    .text-right {
      text-align: right;
    }
    .font-mono {
      font-family: 'JetBrains Mono', monospace;
    }

    .totals-area {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 24px;
    }
    body.format-80mm .totals-area,
    body.format-58mm .totals-area {
      display: block;
      margin-bottom: 16px;
    }

    .totals-card {
      width: 320px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 16px;
    }
    body.format-80mm .totals-card,
    body.format-58mm .totals-card {
      width: 100%;
      background: transparent;
      border: none;
      padding: 0;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 12px;
    }
    .totals-row.grand-total {
      border-top: 2px solid #0f172a;
      padding-top: 10px;
      margin-top: 10px;
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
    }

    .qr-and-policy {
      display: flex;
      gap: 20px;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 16px 20px;
      margin-bottom: 24px;
    }
    body.format-80mm .qr-and-policy,
    body.format-58mm .qr-and-policy {
      display: block;
      text-align: center;
      background: transparent;
      border: none;
      border-top: 1px dashed #94a3b8;
      border-radius: 0;
      padding: 12px 0;
      margin-bottom: 12px;
    }

    .qr-img {
      width: 90px;
      height: 90px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
    }

    .policy-text {
      font-size: 10px;
      color: #64748b;
      line-height: 1.5;
    }

    .footer-signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      text-align: center;
      margin-top: 30px;
      font-size: 12px;
    }
    body.format-80mm .footer-signatures,
    body.format-58mm .footer-signatures {
      display: none;
    }

    .sig-line {
      margin-top: 50px;
      border-bottom: 1px solid #94a3b8;
      width: 180px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Print media overrides */
    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .no-print-toolbar {
        display: none !important;
      }
      .receipt-container {
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
      body.format-80mm .receipt-container {
        width: 80mm !important;
      }
      body.format-58mm .receipt-container {
        width: 58mm !important;
      }
      @page {
        margin: 10mm;
        size: auto;
      }
    }
  </style>
</head>
<body class="format-${defaultFormat}">

  <!-- Floating Toolbar (Hidden on Print) -->
  <div class="no-print-toolbar">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 18px;">📄</span>
      <div>
        <strong style="font-size: 13px; display: block;">Nota Digital LaundryHub</strong>
        <span style="font-size: 10px; color: #94a3b8;">${order.invoiceNo} • ${order.customerName}</span>
      </div>
    </div>

    <div style="display: flex; align-items: center; gap: 8px;">
      <!-- Format Toggle -->
      <button class="btn btn-secondary" onclick="switchFormat('a4')">Format A4</button>
      <button class="btn btn-secondary" onclick="switchFormat('80mm')">Thermal 80mm</button>
      <button class="btn btn-secondary" onclick="switchFormat('58mm')">Thermal 58mm</button>
      
      <!-- Print/Download PDF Button -->
      <button class="btn btn-primary" onclick="window.print()">
        <span>📥 Download / Cetak PDF</span>
      </button>

      <button class="btn btn-secondary" onclick="window.close()">✖ Tutup</button>
    </div>
  </div>

  <!-- Printable Receipt Body -->
  <div class="receipt-container" id="printable-doc">
    
    <!-- Header -->
    <div class="header">
      <div>
        <div class="brand-title">LAUNDRYHUB</div>
        <div class="brand-sub">${branchName}</div>
        <div class="brand-meta">
          ${branchAddress}<br>
          WhatsApp / Hotline: <strong>${branchPhone}</strong>
        </div>
      </div>

      <div class="invoice-badge-box">
        <div class="invoice-title">NOTA TRANSAKSI</div>
        <div class="invoice-no">${order.invoiceNo}</div>
        <div>
          <span class="status-badge ${isLunas ? 'status-lunas' : 'status-piutang'}">
            ${isLunas ? '✓ LUNAS' : '⚠️ BELUM LUNAS / PIUTANG'}
          </span>
        </div>
      </div>
    </div>

    <!-- Metadata Grid -->
    <div class="grid-info">
      <div>
        <div class="info-row">
          <span class="info-label">Nama Pelanggan:</span>
          <span class="info-value">${order.customerName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">No. Telepon / WA:</span>
          <span class="info-value font-mono">${order.customerPhone}</span>
        </div>
        ${order.customerAddress ? `
        <div class="info-row">
          <span class="info-label">Alamat:</span>
          <span class="info-value">${order.customerAddress}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="info-label">Pilihan Parfum:</span>
          <span class="info-value" style="color: #7c3aed;">🌸 ${order.perfumeName}</span>
        </div>
      </div>

      <div>
        <div class="info-row">
          <span class="info-label">Tgl. Diterima:</span>
          <span class="info-value font-mono">${orderDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Est. Siap Ambil:</span>
          <span class="info-value font-mono" style="color: #059669;">${estReadyDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Metode Pembayaran:</span>
          <span class="info-value font-mono" style="text-transform: uppercase;">${order.paymentMethod}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Layanan Pengambilan:</span>
          <span class="info-value">${order.pickupDeliveryType === 'delivery' ? '🚗 Antar Jemput (Delivery)' : '🏢 Ambil Sendiri di Outlet'}</span>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th>Layanan & Rincian</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Tarif</th>
          <th class="text-right">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map(it => `
          <tr>
            <td>
              <strong>${it.serviceName}</strong>
              <div style="font-size: 10px; color: #64748b;">Kategori: ${it.category === 'kiloan' ? 'Cuci Kiloan' : 'Cuci Satuan'}</div>
            </td>
            <td class="text-right font-mono">${it.quantity} ${it.unit}</td>
            <td class="text-right font-mono">${formatCurrency(it.pricePerUnit, 'IDR')}</td>
            <td class="text-right font-mono font-bold">${formatCurrency(it.subtotal, 'IDR')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Rincian Pakaian Sortir if available -->
    ${order.clothesDetails && order.clothesDetails.length > 0 ? `
      <div style="margin-bottom: 20px; padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 11px;">
        <strong style="color: #334155; display: block; margin-bottom: 6px;">📋 Rincian Pakaian Tercatat (${order.totalPieces || order.clothesDetails.reduce((a,b) => a + b.quantity, 0)} helai):</strong>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${order.clothesDetails.map(c => `
            <span style="background: #ffffff; border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 6px; font-family: monospace;">
              ${c.name}: <strong>${c.quantity}x</strong>
            </span>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Totals Area -->
    <div class="totals-area">
      <div class="totals-card">
        <div class="totals-row">
          <span class="info-label">Total Harga Layanan:</span>
          <span class="font-mono font-bold">${formatCurrency(order.totalPrice, 'IDR')}</span>
        </div>

        ${order.discount > 0 ? `
          <div class="totals-row" style="color: #e11d48;">
            <span class="info-label" style="color: #e11d48;">Diskon / Promo Lucky Reward:</span>
            <span class="font-mono font-bold">- ${formatCurrency(order.discount, 'IDR')}</span>
          </div>
        ` : ''}

        <div class="totals-row grand-total">
          <span>TOTAL AKHIR:</span>
          <span class="font-mono" style="color: #0284c7;">${formatCurrency(order.finalPrice, 'IDR')}</span>
        </div>

        <div class="totals-row" style="margin-top: 8px;">
          <span class="info-label">Jumlah Dibayar:</span>
          <span class="font-mono">${formatCurrency(order.paidAmount, 'IDR')}</span>
        </div>
        <div class="totals-row">
          <span class="info-label">Kembalian:</span>
          <span class="font-mono">${formatCurrency(order.changeAmount, 'IDR')}</span>
        </div>
      </div>
    </div>

    <!-- QR Code Tracking & Ketentuan -->
    <div class="qr-and-policy">
      ${qrDataUrl ? `<img src="${qrDataUrl}" alt="QR Tracking" class="qr-img" />` : ''}
      <div class="policy-text">
        <strong style="color: #1e293b; display: block; margin-bottom: 2px;">📱 Scan QR Code untuk Cek Progres Cucian & Putar Lucky Spin</strong>
        Link Pelacakan: <span style="font-family: monospace; color: #0284c7;">${trackingUrl}</span><br>
        1. Pengambilan cucian wajib menunjukkan nota ini atau bukti WA resmi.<br>
        2. Komplain maksimal 1x24 jam setelah cucian diambil dengan membawa nota & pakaian utuh.<br>
        3. Pakaian yang tidak diambil lebih dari 30 hari di luar tanggung jawab outlet.
      </div>
    </div>

    <!-- Signatures for A4 -->
    <div class="footer-signatures">
      <div>
        <span>Kasir Bertugas / Outlet</span>
        <div class="sig-line"></div>
        <span style="font-weight: 700; color: #334155; margin-top: 4px; display: block;">${branchName}</span>
      </div>
      <div>
        <span>Pelanggan</span>
        <div class="sig-line"></div>
        <span style="font-weight: 700; color: #334155; margin-top: 4px; display: block;">${order.customerName}</span>
      </div>
    </div>

  </div>

  <script>
    function switchFormat(fmt) {
      document.body.className = 'format-' + fmt;
    }

    // Auto-trigger print dialog smoothly after rendering
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>
  `;

  // Open clean printable document window
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
  } else {
    // Fallback: If popup blocker blocked window.open, use an iframe or fallback print
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    if (iframe.contentWindow) {
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(printHtml);
      iframe.contentWindow.document.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 60000);
      }, 500);
    }
  }
}
