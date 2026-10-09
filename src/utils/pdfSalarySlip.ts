import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { User, Branch } from '../types';
import { formatCurrency } from './currency';

export interface SalarySlipData {
  userId: string;
  userName: string;
  role: string;
  avatar: string;
  period: string;
  daysPresent: number;
  daysAbsent: number;
  daysLate: number;
  baseSalaryRate: number;
  baseSalaryTotal: number;
  absenceDeductionRate: number;
  absenceDeductionsTotal: number;
  lateDeductionsTotal: number;
  stationCommissions: {
    station: string;
    count: number;
    totalEarned?: number;
    earnings?: number;
    weightKg?: number;
    ratePerKg?: number;
    ratePerItem?: number;
  }[];
  totalStationEarnings: number;
  customerTipsTotal: number;
  netTakeHomePay: number;
}

const STATION_NAMES: Record<string, string> = {
  sortir: 'Sortir, Timbang & Tagging',
  cuci: 'Proses Cuci Mesin Washer',
  kering: 'Pengeringan Dryer Heat',
  setrika: 'Setrika Uap & Finishing',
  packing: 'Packing & QC Segel Plastik',
};

function terbilangRupiah(n: number): string {
  if (n <= 0) return 'Nol Rupiah';
  const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
  function konversi(num: number): string {
    if (num < 12) return satuan[num];
    if (num < 20) return konversi(num - 10) + ' Belas';
    if (num < 100) return (konversi(Math.floor(num / 10)) + ' Puluh ' + konversi(num % 10)).trim();
    if (num < 200) return ('Seratus ' + konversi(num - 100)).trim();
    if (num < 1000) return (konversi(Math.floor(num / 100)) + ' Ratus ' + konversi(num % 100)).trim();
    if (num < 2000) return ('Seribu ' + konversi(num - 1000)).trim();
    if (num < 1000000) return (konversi(Math.floor(num / 1000)) + ' Ribu ' + konversi(num % 1000)).trim();
    if (num < 1000000000) return (konversi(Math.floor(num / 1000000)) + ' Juta ' + konversi(num % 1000000)).trim();
    return (konversi(Math.floor(num / 1000000000)) + ' Miliar ' + konversi(num % 1000000000)).trim();
  }
  return konversi(Math.floor(n)).trim().replace(/\s+/g, ' ') + ' Rupiah';
}

/**
 * Generates and downloads an authentic, official PDF Salary Slip for staff employees.
 */
export async function downloadSalarySlipPdf(
  slip: SalarySlipData,
  staff: User,
  branch?: Branch,
  format: 'document' | 'thermal' = 'document'
): Promise<void> {
  if (!slip || !staff) return;

  try {
    const slipSerialNo = `SLIP/${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}/${staff.id.toUpperCase().replace(/[^A-Z0-9]/g, '')}`;

    let qrDataUrl = '';
    try {
      const verifyPayload = JSON.stringify({
        doc: 'SLIP_GAJI_RESMI',
        serial: slipSerialNo,
        staff: staff.name,
        role: staff.role,
        period: slip.period,
        thp: slip.netTakeHomePay,
        outlet: branch?.name || 'LaundryHub',
        status: 'VERIFIED_OFFICIAL',
      });
      qrDataUrl = await QRCode.toDataURL(verifyPayload, { width: 160, margin: 1 });
    } catch (e) {
      console.warn('QR Code generation failed for salary slip', e);
    }

    if (format === 'thermal') {
      generateThermalSlipPdf(slip, staff, branch, slipSerialNo, qrDataUrl);
    } else {
      generateA4SlipPdf(slip, staff, branch, slipSerialNo, qrDataUrl);
    }
  } catch (error) {
    console.error('Error generating salary slip PDF:', error);
  }
}

/**
 * Generates Official A4 Salary Slip PDF
 */
function generateA4SlipPdf(
  slip: SalarySlipData,
  staff: User,
  branch: Branch | undefined,
  slipSerialNo: string,
  qrDataUrl: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm
  const branchName = branch?.name || 'LaundryHub Express';
  const branchAddress = branch?.address || 'Jl. Kemang Raya No. 42B, Jakarta Selatan';
  const branchPhone = branch?.phone || '0812-8899-7701';

  // 1. Header Band
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, 12, contentWidth, 26, 'F');

  // Accent Line Emerald
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(margin, 12, 4, 26, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('LAUNDRYHUB', margin + 8, 21);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`${branchName} • ${branchPhone}`, margin + 8, 27);
  doc.text(branchAddress.length > 55 ? branchAddress.substring(0, 52) + '...' : branchAddress, margin + 8, 33);

  // Right Header: NOTA & SLIP GAJI
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('SLIP GAJI RESMI', pageWidth - margin - 6, 21, { align: 'right' });

  doc.setTextColor(52, 211, 153); // emerald-400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(slipSerialNo, pageWidth - margin - 6, 27, { align: 'right' });

  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Periode: ${slip.period}`, pageWidth - margin - 6, 33, { align: 'right' });

  // 2. Staff Information & Presensi Card
  let curY = 43;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, curY, contentWidth, 26, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('DATA KARYAWAN:', margin + 6, curY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(staff.name, margin + 6, curY + 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Jabatan / Stasiun: ${staff.role.toUpperCase()}`, margin + 6, curY + 17);
  doc.text(`No. Kontak / WA: ${staff.phone || '-'}`, margin + 6, curY + 22);

  // Right Side: Presensi Stats
  const rightX = margin + 95;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('REKAPITULASI PRESENSI:', rightX, curY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`Hari Kerja Hadir  : ${slip.daysPresent} Hari`, rightX, curY + 12);
  doc.text(`Ketidakhadiran (Alpha): ${slip.daysAbsent} Hari`, rightX, curY + 17);
  doc.text(`Keterlambatan     : ${slip.daysLate} Incident`, rightX, curY + 22);

  // 3. Earnings Table (Penerimaan)
  curY = 74;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, curY, contentWidth, 7, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text('RINCIAN PENERIMAAN (EARNINGS)', margin + 4, curY + 5);
  doc.text('VOLUME / TUGAS', margin + 110, curY + 5, { align: 'right' });
  doc.text('SUBTOTAL (RP)', pageWidth - margin - 4, curY + 5, { align: 'right' });

  curY += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  // Row A: Gaji Pokok
  doc.setTextColor(15, 23, 42);
  doc.text(`1. Gaji Pokok Harian (${slip.daysPresent} hari kerja)`, margin + 4, curY + 5.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`@ ${formatCurrency(slip.baseSalaryRate, 'IDR')}/hari`, margin + 110, curY + 5.5, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(slip.baseSalaryTotal, 'IDR'), pageWidth - margin - 4, curY + 5.5, { align: 'right' });
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, curY + 8, pageWidth - margin, curY + 8);

  curY += 8;

  // Station Commissions Rows
  slip.stationCommissions.forEach((sc, idx) => {
    const isAlt = idx % 2 === 1;
    if (isAlt) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, curY, contentWidth, 7.5, 'F');
    }
    doc.line(margin, curY + 7.5, pageWidth - margin, curY + 7.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    const stationName = STATION_NAMES[sc.station] || sc.station.toUpperCase();
    doc.text(`2.${idx + 1} Komisi Borongan ${stationName}`, margin + 4, curY + 5);

    doc.setTextColor(71, 85, 105);
    const weight = sc.weightKg || 0;
    const volText = weight > 0 ? `${weight} kg (${sc.count} nota)` : `${sc.count} nota`;
    doc.text(volText, margin + 110, curY + 5, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    const earnings = sc.earnings ?? sc.totalEarned ?? 0;
    doc.text(formatCurrency(earnings, 'IDR'), pageWidth - margin - 4, curY + 5, { align: 'right' });

    curY += 7.5;
  });

  // Customer Tips Row
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text('3. Tip & Bonus Langsung Pelanggan', margin + 4, curY + 5);
  doc.setTextColor(71, 85, 105);
  doc.text('Review Pelanggan', margin + 110, curY + 5, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(formatCurrency(slip.customerTipsTotal, 'IDR'), pageWidth - margin - 4, curY + 5, { align: 'right' });
  doc.line(margin, curY + 7.5, pageWidth - margin, curY + 7.5);

  curY += 7.5;

  // Total Gross Earnings Row
  const grossEarnings = slip.baseSalaryTotal + slip.totalStationEarnings + slip.customerTipsTotal;
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, curY, contentWidth, 7.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL PENGHASILAN KOTOR (GROSS)', margin + 4, curY + 5);
  doc.text(formatCurrency(grossEarnings, 'IDR'), pageWidth - margin - 4, curY + 5, { align: 'right' });
  doc.line(margin, curY + 7.5, pageWidth - margin, curY + 7.5);

  // 4. Deductions Table (Potongan)
  curY += 12;
  doc.setFillColor(254, 242, 242); // red-50
  doc.setDrawColor(254, 202, 202);
  doc.rect(margin, curY, contentWidth, 7, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(185, 28, 28); // red-700
  doc.text('RINCIAN POTONGAN KEDISIPLINAN (DEDUCTIONS)', margin + 4, curY + 5);
  doc.text('SUBTOTAL (RP)', pageWidth - margin - 4, curY + 5, { align: 'right' });

  curY += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  // Deductions Rows
  doc.setTextColor(71, 85, 105);
  doc.text(`1. Potongan Keterlambatan (${slip.daysLate} insiden)`, margin + 4, curY + 5);
  doc.setTextColor(225, 29, 72);
  doc.text(`- ${formatCurrency(slip.lateDeductionsTotal, 'IDR')}`, pageWidth - margin - 4, curY + 5, { align: 'right' });
  doc.line(margin, curY + 7.5, pageWidth - margin, curY + 7.5);
  curY += 7.5;

  doc.setTextColor(71, 85, 105);
  doc.text(`2. Potongan Ketidakhadiran / Alpha (${slip.daysAbsent} hari)`, margin + 4, curY + 5);
  doc.setTextColor(225, 29, 72);
  doc.text(`- ${formatCurrency(slip.absenceDeductionsTotal, 'IDR')}`, pageWidth - margin - 4, curY + 5, { align: 'right' });
  doc.line(margin, curY + 7.5, pageWidth - margin, curY + 7.5);
  curY += 7.5;

  const totalDeductions = slip.absenceDeductionsTotal + slip.lateDeductionsTotal;
  doc.setFillColor(254, 242, 242);
  doc.rect(margin, curY, contentWidth, 7.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text('TOTAL POTONGAN KEDISIPLINAN', margin + 4, curY + 5);
  doc.text(`- ${formatCurrency(totalDeductions, 'IDR')}`, pageWidth - margin - 4, curY + 5, { align: 'right' });
  doc.line(margin, curY + 7.5, pageWidth - margin, curY + 7.5);

  // 5. Grand Total (Take Home Pay) Box
  curY += 12;
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(52, 211, 153); // emerald-400
  doc.roundedRect(margin, curY, contentWidth, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(6, 95, 70); // emerald-800
  doc.text('TOTAL GAJI BERSIH DITERIMA (TAKE HOME PAY):', margin + 6, curY + 8);

  doc.setFontSize(15);
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text(formatCurrency(slip.netTakeHomePay, 'IDR'), pageWidth - margin - 6, curY + 10, { align: 'right' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Terbilang: "# ${terbilangRupiah(slip.netTakeHomePay)} #"`, margin + 6, curY + 16);

  // 6. QR Code & Signatures
  curY += 27;

  // QR Validation Box
  if (qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, 'PNG', margin + 4, curY, 22, 22);
    } catch (e) {
      console.warn('Error rendering slip QR code', e);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('DOKUMEN RESMI TERVERIFIKASI', margin + 30, curY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Slip gaji ini digenerate secara otomatis oleh sistem', margin + 30, curY + 10);
  doc.text('LaundryHub Cloud Payroll Management & Kehadiran GPS.', margin + 30, curY + 14);
  doc.text(`Kode Validasi: ${slipSerialNo}`, margin + 30, curY + 18);

  // Signature: Finance & Staff
  const sigColWidth = 50;
  const sigFinanceX = pageWidth - margin - sigColWidth * 2 - 10;
  const sigStaffX = pageWidth - margin - sigColWidth;

  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Bagian Keuangan / Owner,', sigFinanceX + sigColWidth / 2, curY + 4, { align: 'center' });
  doc.line(sigFinanceX + 5, curY + 18, sigFinanceX + sigColWidth - 5, curY + 18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(branchName, sigFinanceX + sigColWidth / 2, curY + 22, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Karyawan Penerima,', sigStaffX + sigColWidth / 2, curY + 4, { align: 'center' });
  doc.line(sigStaffX + 5, curY + 18, sigStaffX + sigColWidth - 5, curY + 18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(staff.name, sigStaffX + sigColWidth / 2, curY + 22, { align: 'center' });

  // 7. Footer Notice
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `LaundryHub Payroll Document • Dicetak pada ${new Date().toLocaleString('id-ID')} • Rahasia & Terlindungi`,
    pageWidth / 2,
    285,
    { align: 'center' }
  );

  const fileName = `Slip_Gaji_${staff.name.replace(/[^A-Za-z0-9]/g, '_')}_${slip.period.replace(/[^A-Za-z0-9]/g, '_')}.pdf`;
  doc.save(fileName);
}

/**
 * Generates Thermal Struk Salary Slip PDF (80mm)
 */
function generateThermalSlipPdf(
  slip: SalarySlipData,
  staff: User,
  branch: Branch | undefined,
  slipSerialNo: string,
  qrDataUrl: string
) {
  const paperWidth = 80;
  const baseHeight = 220;
  const stationsHeight = slip.stationCommissions.length * 8;
  const calculatedHeight = Math.max(240, baseHeight + stationsHeight);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [paperWidth, calculatedHeight],
  });

  const margin = 5;
  const centerX = paperWidth / 2;
  const branchName = branch?.name || 'LaundryHub Express';

  let y = 8;
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.text('LAUNDRYHUB PAYROLL', centerX, y, { align: 'center' });

  y += 4.5;
  doc.setFontSize(8.5);
  doc.text(branchName, centerX, y, { align: 'center' });

  y += 4;
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.text(`SLIP GAJI & BORONGAN`, centerX, y, { align: 'center' });
  y += 3.5;
  doc.text(`NO: ${slipSerialNo}`, centerX, y, { align: 'center' });
  y += 3.5;
  doc.text(`Periode: ${slip.period}`, centerX, y, { align: 'center' });

  y += 3.5;
  doc.text('-'.repeat(38), centerX, y, { align: 'center' });

  // Staff Info
  y += 4;
  doc.setFont('courier', 'bold');
  doc.text(`KARYAWAN: ${staff.name}`, margin, y);
  y += 3.5;
  doc.setFont('courier', 'normal');
  doc.text(`JABATAN : ${staff.role.toUpperCase()}`, margin, y);
  y += 3.5;
  doc.text(`PRESENSI: ${slip.daysPresent} Hadir / ${slip.daysAbsent} Alpa`, margin, y);

  y += 3.5;
  doc.text('-'.repeat(38), centerX, y, { align: 'center' });

  // Earnings
  y += 4;
  doc.setFont('courier', 'bold');
  doc.text('PENERIMAAN:', margin, y);
  y += 3.5;
  doc.setFont('courier', 'normal');
  doc.text(`Gaji Pokok (${slip.daysPresent}h):`, margin, y);
  doc.text(formatCurrency(slip.baseSalaryTotal, 'IDR'), paperWidth - margin, y, { align: 'right' });

  slip.stationCommissions.forEach((sc) => {
    y += 3.5;
    const name = sc.station.substring(0, 8);
    const weight = sc.weightKg || 0;
    const vol = weight > 0 ? `${weight}k` : `${sc.count}n`;
    const earnings = sc.earnings ?? sc.totalEarned ?? 0;
    doc.text(`Borongan ${name} (${vol}):`, margin, y);
    doc.text(formatCurrency(earnings, 'IDR'), paperWidth - margin, y, { align: 'right' });
  });

  if (slip.customerTipsTotal > 0) {
    y += 3.5;
    doc.text('Tip Pelanggan:', margin, y);
    doc.text(formatCurrency(slip.customerTipsTotal, 'IDR'), paperWidth - margin, y, { align: 'right' });
  }

  y += 3.5;
  doc.text('-'.repeat(38), centerX, y, { align: 'center' });

  // Deductions
  const totalDeductions = slip.absenceDeductionsTotal + slip.lateDeductionsTotal;
  if (totalDeductions > 0) {
    y += 4;
    doc.setFont('courier', 'bold');
    doc.text('POTONGAN:', margin, y);
    y += 3.5;
    doc.setFont('courier', 'normal');
    if (slip.lateDeductionsTotal > 0) {
      doc.text(`Telat (${slip.daysLate}x):`, margin, y);
      doc.text(`-${formatCurrency(slip.lateDeductionsTotal, 'IDR')}`, paperWidth - margin, y, { align: 'right' });
      y += 3.5;
    }
    if (slip.absenceDeductionsTotal > 0) {
      doc.text(`Alpa (${slip.daysAbsent}h):`, margin, y);
      doc.text(`-${formatCurrency(slip.absenceDeductionsTotal, 'IDR')}`, paperWidth - margin, y, { align: 'right' });
      y += 3.5;
    }
    doc.text('-'.repeat(38), centerX, y, { align: 'center' });
  }

  // Take Home Pay
  y += 4.5;
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.text('TAKE HOME PAY:', margin, y);
  doc.text(formatCurrency(slip.netTakeHomePay, 'IDR'), paperWidth - margin, y, { align: 'right' });

  y += 4;
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  doc.text('-'.repeat(38), centerX, y, { align: 'center' });

  if (qrDataUrl) {
    y += 3;
    try {
      doc.addImage(qrDataUrl, 'PNG', centerX - 14, y, 28, 28);
      y += 30;
    } catch (e) {}
  }

  doc.text('Dokumen Resmi LaundryHub', centerX, y, { align: 'center' });
  y += 3.5;
  doc.text(`Cetak: ${new Date().toLocaleDateString('id-ID')}`, centerX, y, { align: 'center' });

  const fileName = `Slip_Gaji_${staff.name.replace(/[^A-Za-z0-9]/g, '_')}_${slip.period.replace(/[^A-Za-z0-9]/g, '_')}_thermal.pdf`;
  doc.save(fileName);
}
