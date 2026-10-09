import { jsPDF } from 'jspdf';
import { formatCurrency } from './currency';

export interface PnlReportParams {
  period: string;
  branchName: string;
  grossRevenue: number;
  totalCogs: number;
  totalUtilities: number;
  totalStaffCommissions: number;
  totalDropshipCommissions: number;
  netIncome: number;
  margin: number;
  ordersCount: number;
  totalKg: number;
  branchesBreakdown?: {
    name: string;
    revenue: number;
    ordersCount: number;
    totalWeightKg: number;
  }[];
}

export interface FinancialStatsReportParams {
  year: string;
  branchName: string;
  monthlyData: {
    month: string;
    omzet: number;
    beban: number;
    laba: number;
    margin: number;
    orders: number;
    weightKg: number;
    growthMoM: number;
  }[];
  totalOmzet: number;
  totalLaba: number;
  totalOrders: number;
}

/**
 * Generates and downloads an authentic, official P&L Cash Flow PDF Document
 */
export function downloadPnlPdf(params: PnlReportParams): void {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const margin = 14;
    const contentWidth = pageWidth - margin * 2; // 182mm

    // 1. Header Band
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, 12, contentWidth, 26, 'F');

    // Accent line
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(margin, 12, 4, 26, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('LAUNDRYHUB MANAGEMENT', margin + 8, 21);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Outlet: ${params.branchName} • Dokumen Laba Rugi Riil (P&L)`, margin + 8, 27);
    doc.text(`Periode Laporan: ${params.period}`, margin + 8, 33);

    // Right Header
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('LAPORAN LABA RUGI', pageWidth - margin - 6, 21, { align: 'right' });

    doc.setTextColor(52, 211, 153);
    doc.setFontSize(9.5);
    doc.text(`Margin: ${params.margin}%`, pageWidth - margin - 6, 27, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7.5);
    doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID')}`, pageWidth - margin - 6, 33, { align: 'right' });

    // 2. Executive Metrics Summary Card
    let curY = 43;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, curY, contentWidth, 24, 2, 2, 'FD');

    const colW = contentWidth / 4;
    // Col 1: Omzet
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.text('PENDAPATAN KOTOR', margin + 4, curY + 6);
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(formatCurrency(params.grossRevenue, 'IDR'), margin + 4, curY + 13);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${params.ordersCount} Nota (${params.totalKg} kg)`, margin + 4, curY + 19);

    // Col 2: HPP & Utilitas
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL BEBAN HPP + UTILITAS', margin + colW + 2, curY + 6);
    doc.setFontSize(10);
    doc.setTextColor(225, 29, 72);
    doc.text(`- ${formatCurrency(params.totalCogs + params.totalUtilities, 'IDR')}`, margin + colW + 2, curY + 13);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Kimia, Listrik, Air & Gas', margin + colW + 2, curY + 19);

    // Col 3: Gaji & Dropship
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL KOMISI & GAJI', margin + colW * 2 + 2, curY + 6);
    doc.setFontSize(10);
    doc.setTextColor(225, 29, 72);
    doc.text(`- ${formatCurrency(params.totalStaffCommissions + params.totalDropshipCommissions, 'IDR')}`, margin + colW * 2 + 2, curY + 13);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Staf Operasional & Mitra', margin + colW * 2 + 2, curY + 19);

    // Col 4: Laba Bersih
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text('LABA BERSIH (NET INCOME)', margin + colW * 3 + 2, curY + 6);
    doc.setFontSize(11);
    doc.text(formatCurrency(params.netIncome, 'IDR'), margin + colW * 3 + 2, curY + 13);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(`Net Margin: ${params.margin}%`, margin + colW * 3 + 2, curY + 19);

    // 3. P&L Itemized Table
    curY = 72;
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, curY, contentWidth, 7.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text('KOMPONEN KEUANGAN (P&L BREAKDOWN)', margin + 4, curY + 5);
    doc.text('KATEGORI', margin + 115, curY + 5);
    doc.text('NOMINAL (RP)', pageWidth - margin - 4, curY + 5, { align: 'right' });

    curY += 7.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);

    const items = [
      { name: '1. Pendapatan Kotor Transaksi Laundry', cat: 'Pendapatan', val: params.grossRevenue, isPositive: true },
      { name: '2. Beban Bahan Kimia Operasional (Deterjen, Softener, Parfum, Plastik)', cat: 'HPP (COGS)', val: -params.totalCogs, isPositive: false },
      { name: '3. Beban Pemakaian Utilitas (Listrik, Air PDAM & Gas Dryer IoT)', cat: 'Beban Operasional', val: -params.totalUtilities, isPositive: false },
      { name: '4. Beban Gaji & Komisi Borongan Staf Laundry', cat: 'Beban Tenaga Kerja', val: -params.totalStaffCommissions, isPositive: false },
      { name: '5. Beban Komisi Bagi Hasil Mitra Agen Dropship', cat: 'Beban Distribusi', val: -params.totalDropshipCommissions, isPositive: false },
    ];

    items.forEach((it, idx) => {
      const isAlt = idx % 2 === 1;
      if (isAlt) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, curY, contentWidth, 8, 'F');
      }
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, curY + 8, pageWidth - margin, curY + 8);

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', it.isPositive ? 'bold' : 'normal');
      doc.text(it.name, margin + 4, curY + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(it.cat, margin + 115, curY + 5.5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(it.isPositive ? 16 : 225, it.isPositive ? 185 : 29, it.isPositive ? 129 : 72);
      const textVal = it.isPositive
        ? formatCurrency(it.val, 'IDR')
        : `- ${formatCurrency(Math.abs(it.val), 'IDR')}`;
      doc.text(textVal, pageWidth - margin - 4, curY + 5.5, { align: 'right' });

      curY += 8;
    });

    // Subtotal Net Profit Row
    doc.setFillColor(236, 253, 245);
    doc.rect(margin, curY, contentWidth, 9, 'F');
    doc.setDrawColor(52, 211, 153);
    doc.line(margin, curY, pageWidth - margin, curY);
    doc.line(margin, curY + 9, pageWidth - margin, curY + 9);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(6, 95, 70);
    doc.text('LABA BERSIH RIIL (NET OPERATING PROFIT)', margin + 4, curY + 6);
    doc.text(formatCurrency(params.netIncome, 'IDR'), pageWidth - margin - 4, curY + 6, { align: 'right' });

    curY += 15;

    // 4. Branch Contribution Breakdown (if available)
    if (params.branchesBreakdown && params.branchesBreakdown.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text('KONTRIBUSI PENDAPATAN PER CABANG OUTLET:', margin, curY);
      curY += 4;

      doc.setFillColor(241, 245, 249);
      doc.rect(margin, curY, contentWidth, 6.5, 'F');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text('NAMA CABANG', margin + 4, curY + 4.5);
      doc.text('VOLUME ORDER', margin + 105, curY + 4.5, { align: 'right' });
      doc.text('TOTAL BOBOT', margin + 140, curY + 4.5, { align: 'right' });
      doc.text('TOTAL OMZET', pageWidth - margin - 4, curY + 4.5, { align: 'right' });

      curY += 6.5;
      params.branchesBreakdown.forEach((b) => {
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, curY + 6.5, pageWidth - margin, curY + 6.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(b.name, margin + 4, curY + 4.5);

        doc.setTextColor(71, 85, 105);
        doc.text(`${b.ordersCount} Nota`, margin + 105, curY + 4.5, { align: 'right' });
        doc.text(`${b.totalWeightKg} kg`, margin + 140, curY + 4.5, { align: 'right' });

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(formatCurrency(b.revenue, 'IDR'), pageWidth - margin - 4, curY + 4.5, { align: 'right' });

        curY += 6.5;
      });

      curY += 8;
    }

    // 5. Signatures
    curY = Math.max(curY, 210);
    const sigColWidth = contentWidth / 2;

    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text('Dibuat Oleh (Finance & POS System),', margin + sigColWidth / 2, curY, { align: 'center' });
    doc.line(margin + 20, curY + 16, margin + sigColWidth - 20, curY + 16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('LAUNDRYHUB AUTOMATION', margin + sigColWidth / 2, curY + 20, { align: 'center' });

    const ownerCenter = margin + sigColWidth + sigColWidth / 2;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Disetujui Oleh (Pemilik Usaha / Owner),', ownerCenter, curY, { align: 'center' });
    doc.line(ownerCenter - 25, curY + 16, ownerCenter + 25, curY + 16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(params.branchName, ownerCenter, curY + 20, { align: 'center' });

    // 6. Footer
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `LaundryHub Financial Report • Dokumen Laba Rugi Resmi • Dicetak pada ${new Date().toLocaleString('id-ID')}`,
      pageWidth / 2,
      285,
      { align: 'center' }
    );

    const fileName = `Laporan_PnL_LaundryHub_${params.period.replace(/[^A-Za-z0-9]/g, '_')}.pdf`;
    doc.save(fileName);
  } catch (err) {
    console.error('Error generating PnL PDF:', err);
  }
}

/**
 * Generates and downloads an authentic, official Annual & Monthly Financial Statistics PDF Document
 */
export function downloadFinancialStatsPdf(params: FinancialStatsReportParams): void {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const margin = 14;
    const contentWidth = pageWidth - margin * 2; // 182mm

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, 12, contentWidth, 26, 'F');

    doc.setFillColor(245, 158, 11); // amber-500
    doc.rect(margin, 12, 4, 26, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('LAUNDRYHUB MANAGEMENT', margin + 8, 21);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Rekap Performa Finansial & Statistik Tahunan ${params.year}`, margin + 8, 27);
    doc.text(`Outlet: ${params.branchName}`, margin + 8, 33);

    // Right Header
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('STATISTIK TAHUNAN', pageWidth - margin - 6, 21, { align: 'right' });

    doc.setTextColor(251, 191, 36);
    doc.setFontSize(9.5);
    doc.text(`Tahun: ${params.year}`, pageWidth - margin - 6, 27, { align: 'right' });

    // Summary 3-col card
    let curY = 43;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, curY, contentWidth, 20, 2, 2, 'FD');

    const colW = contentWidth / 3;
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL OMZET TAHUNAN', margin + 6, curY + 6);
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(formatCurrency(params.totalOmzet, 'IDR'), margin + 6, curY + 14);

    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL LABA BERSIH TAHUNAN', margin + colW + 6, curY + 6);
    doc.setFontSize(11);
    doc.setTextColor(16, 185, 129);
    doc.text(formatCurrency(params.totalLaba, 'IDR'), margin + colW + 6, curY + 14);

    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL TRANSAKSI NOTA', margin + colW * 2 + 6, curY + 6);
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`${params.totalOrders} Nota`, margin + colW * 2 + 6, curY + 14);

    // Monthly breakdown table
    curY = 68;
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, curY, contentWidth, 7, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text('BULAN', margin + 3, curY + 5);
    doc.text('OMZET (RP)', margin + 45, curY + 5, { align: 'right' });
    doc.text('BEBAN (RP)', margin + 78, curY + 5, { align: 'right' });
    doc.text('LABA (RP)', margin + 110, curY + 5, { align: 'right' });
    doc.text('MARGIN', margin + 130, curY + 5, { align: 'right' });
    doc.text('NOTA', margin + 148, curY + 5, { align: 'right' });
    doc.text('BOBOT (KG)', margin + 168, curY + 5, { align: 'right' });
    doc.text('GROWTH', pageWidth - margin - 3, curY + 5, { align: 'right' });

    curY += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    params.monthlyData.forEach((m, idx) => {
      const isAlt = idx % 2 === 1;
      if (isAlt) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, curY, contentWidth, 6.5, 'F');
      }
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, curY + 6.5, pageWidth - margin, curY + 6.5);

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(m.month, margin + 3, curY + 4.5);
      doc.setFont('helvetica', 'normal');

      doc.setTextColor(15, 23, 42);
      doc.text(formatCurrency(m.omzet, 'IDR'), margin + 45, curY + 4.5, { align: 'right' });

      doc.setTextColor(225, 29, 72);
      doc.text(formatCurrency(m.beban, 'IDR'), margin + 78, curY + 4.5, { align: 'right' });

      doc.setTextColor(16, 185, 129);
      doc.text(formatCurrency(m.laba, 'IDR'), margin + 110, curY + 4.5, { align: 'right' });

      doc.setTextColor(71, 85, 105);
      doc.text(`${m.margin}%`, margin + 130, curY + 4.5, { align: 'right' });
      doc.text(`${m.orders}`, margin + 148, curY + 4.5, { align: 'right' });
      doc.text(`${m.weightKg}`, margin + 168, curY + 4.5, { align: 'right' });

      const growthText = m.growthMoM > 0 ? `+${m.growthMoM}%` : `${m.growthMoM}%`;
      doc.setTextColor(m.growthMoM >= 0 ? 16 : 225, m.growthMoM >= 0 ? 185 : 29, m.growthMoM >= 0 ? 129 : 72);
      doc.text(growthText, pageWidth - margin - 3, curY + 4.5, { align: 'right' });

      curY += 6.5;
    });

    // Total Row
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, curY, contentWidth, 7.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('TOTAL / KONSOLIDASI', margin + 3, curY + 5);
    doc.text(formatCurrency(params.totalOmzet, 'IDR'), margin + 45, curY + 5, { align: 'right' });
    doc.setTextColor(16, 185, 129);
    doc.text(formatCurrency(params.totalLaba, 'IDR'), margin + 110, curY + 5, { align: 'right' });
    doc.setTextColor(15, 23, 42);
    doc.text(`${params.totalOrders} Nota`, margin + 148, curY + 5, { align: 'right' });

    // Footer
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `LaundryHub Financial Report • Laporan Statistik Tahunan • Dicetak pada ${new Date().toLocaleString('id-ID')}`,
      pageWidth / 2,
      285,
      { align: 'center' }
    );

    const fileName = `Laporan_Statistik_Keuangan_LaundryHub_${params.year}.pdf`;
    doc.save(fileName);
  } catch (err) {
    console.error('Error generating financial stats PDF:', err);
  }
}

/**
 * Downloads P&L Data as CSV Spreadsheet
 */
export function downloadPnlCsv(params: PnlReportParams): void {
  const rows = [
    ['LAPORAN LABA RUGI RIIL LAUNDRYHUB'],
    [`Outlet: ${params.branchName}`],
    [`Periode: ${params.period}`],
    [`Tanggal Cetak: ${new Date().toLocaleString('id-ID')}`],
    [''],
    ['KOMPONEN', 'KATEGORI', 'NOMINAL (RP)'],
    ['1. Pendapatan Kotor Transaksi Laundry', 'Pendapatan', params.grossRevenue],
    ['2. Beban HPP Bahan Kimia (Deterjen, Softener, Parfum, Plastik)', 'HPP (COGS)', -params.totalCogs],
    ['3. Beban Utilitas Operasional (Listrik, Air & Gas IoT)', 'Beban Operasional', -params.totalUtilities],
    ['4. Beban Gaji & Komisi Borongan Staf Laundry', 'Beban Tenaga Kerja', -params.totalStaffCommissions],
    ['5. Beban Komisi Bagi Hasil Mitra Agen Dropship', 'Beban Distribusi', -params.totalDropshipCommissions],
    ['TOTAL LABA BERSIH (NET OPERATING PROFIT)', 'Laba Bersih', params.netIncome],
    [`PROFIT MARGIN (%)`, 'Margin', `${params.margin}%`],
    [`TOTAL PESANAN`, 'Volume', `${params.ordersCount} Nota`],
    [`TOTAL BOBOT`, 'Volume', `${params.totalKg} kg`],
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Laporan_PnL_${params.period.replace(/[^A-Za-z0-9]/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
