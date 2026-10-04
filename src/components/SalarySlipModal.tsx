import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Share2,
  Copy,
  Check,
  Building2,
  Calendar,
  User,
  Clock,
  Coins,
  FileText,
  BadgeCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  Sparkles,
  QrCode as QrIcon,
  Receipt,
  CheckCircle2,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useApp } from '../context/AppContext';

interface SalarySlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffId?: string | null;
}

const STATION_LABELS: Record<string, { label: string; icon: string }> = {
  sortir: { label: 'Sortir & Tagging', icon: '🔍' },
  cuci: { label: 'Proses Cuci', icon: '🫧' },
  kering: { label: 'Pengeringan Dryer', icon: '🔥' },
  setrika: { label: 'Setrika Uap', icon: '💨' },
  packing: { label: 'Packing & QC Segel', icon: '📦' },
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

export const SalarySlipModal: React.FC<SalarySlipModalProps> = ({
  isOpen,
  onClose,
  staffId,
}) => {
  const {
    users,
    currentUser,
    branches,
    currentBranchId,
    calculateStaffSalarySlip,
    openDopaminePayday,
  } = useApp();

  const [activeStaffId, setActiveStaffId] = useState<string>(staffId || currentUser.id);
  const [viewFormat, setViewFormat] = useState<'document' | 'thermal'>('document');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (staffId) {
      setActiveStaffId(staffId);
    } else {
      setActiveStaffId(currentUser.id);
    }
  }, [staffId, currentUser.id, isOpen]);

  const activeStaff = users.find((u) => u.id === activeStaffId) || currentUser;
  const slip = calculateStaffSalarySlip(activeStaff.id);
  const staffBranch = branches.find((b) => b.id === activeStaff.branchId) || branches.find((b) => b.id === currentBranchId) || branches[0];

  const slipSerialNo = `SLIP/${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}/${activeStaff.id.toUpperCase().replace(/[^A-Z0-9]/g, '')}`;

  useEffect(() => {
    if (isOpen) {
      const verifyPayload = JSON.stringify({
        doc: 'SLIP_GAJI_RESMI',
        serial: slipSerialNo,
        staff: activeStaff.name,
        role: activeStaff.role,
        period: slip.period,
        thp: slip.netTakeHomePay,
        outlet: staffBranch?.name,
        status: 'VERIFIED_OFFICIAL',
      });
      QRCode.toDataURL(verifyPayload, { width: 140, margin: 1 })
        .then((url) => setQrCodeDataUrl(url))
        .catch(console.error);
    }
  }, [isOpen, activeStaffId, slipSerialNo, slip.netTakeHomePay]);

  if (!isOpen) return null;

  const totalDeductions = slip.absenceDeductionsTotal + slip.lateDeductionsTotal;
  const totalNotaBorongan = slip.stationCommissions.reduce((a, b) => a + b.count, 0);
  const grossEarnings = slip.baseSalaryTotal + slip.totalStationEarnings + slip.customerTipsTotal;
  const attendanceRate = slip.daysPresent + slip.daysAbsent > 0
    ? Math.round((slip.daysPresent / (slip.daysPresent + slip.daysAbsent)) * 100)
    : 100;

  const handleCopyText = () => {
    const text = `🧾 *NOTA & SLIP GAJI RESMI LAUNDRYHUB*
No. Dokumen: ${slipSerialNo}
Periode: ${slip.period}
Outlet: ${staffBranch?.name || 'LaundryHub Workshop'}

👤 *Data Karyawan:*
• Nama: ${activeStaff.name}
• Role: ${activeStaff.role.toUpperCase()}
• Presensi: ${slip.daysPresent} Hadir | ${slip.daysAbsent} Alpha | ${slip.daysLate} Telat

💰 *Penerimaan:*
• Gaji Pokok (${slip.daysPresent} hari): Rp ${slip.baseSalaryTotal.toLocaleString('id-ID')}
• Borongan 5 Stasiun (${totalNotaBorongan} nota): +Rp ${slip.totalStationEarnings.toLocaleString('id-ID')}
${slip.stationCommissions.map(s => `  - ${STATION_LABELS[s.station]?.label || s.station}: ${s.count} nota (+Rp ${s.totalEarned.toLocaleString('id-ID')})`).join('\n')}
${slip.customerTipsTotal > 0 ? `• Tip Pelanggan Bintang 5: +Rp ${slip.customerTipsTotal.toLocaleString('id-ID')}\n` : ''}
🔻 *Potongan:*
${totalDeductions > 0 ? `• Denda Alpha/Telat: -Rp ${totalDeductions.toLocaleString('id-ID')}` : '• Disiplin 100% (Tanpa Potongan): Rp 0'}

💵 *TOTAL TAKE HOME PAY (BERSIH):*
*Rp ${slip.netTakeHomePay.toLocaleString('id-ID')}*
_${terbilangRupiah(slip.netTakeHomePay)}_

Status: DIBAYAR LUNAS & TERVERIFIKASI SISTEM
Cek keabsahan online: https://laundryhub.app/verify/${slipSerialNo}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const cleanPhone = (activeStaff.phone || '081234567890').replace(/[^0-9]/g, '');
    const phone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const text = `Halo Kak *${activeStaff.name}*! Berikut Nota & Slip Gaji Resmi Anda periode *${slip.period}* dari *${staffBranch?.name || 'LaundryHub'}*:\n\n` +
      `💵 *TOTAL GAJI BERSIH (THP): Rp ${slip.netTakeHomePay.toLocaleString('id-ID')}*\n` +
      `(${terbilangRupiah(slip.netTakeHomePay)})\n\n` +
      `📊 Rincian:\n` +
      `• Gaji Pokok: Rp ${slip.baseSalaryTotal.toLocaleString('id-ID')}\n` +
      `• Borongan 5 Stasiun (${totalNotaBorongan} nota): +Rp ${slip.totalStationEarnings.toLocaleString('id-ID')}\n` +
      `${totalDeductions > 0 ? `• Potongan Denda: -Rp ${totalDeductions.toLocaleString('id-ID')}\n` : '• Disiplin Kehadiran: 100% Prima\n'}` +
      `\nTerima kasih atas kerja keras dan dedikasi Anda menjaga kualitas cucian bersih, wangi, dan rapi! ✨🧺`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in print:p-0 print:bg-white">
      {/* CSS print helper */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #salary-slip-printable-area, #salary-slip-printable-area * {
            visibility: visible;
          }
          #salary-slip-printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-3xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[94vh] print:max-h-none print:border-none print:shadow-none print:bg-white print:m-0 print:p-0">
        {/* Header Modal Bar (Hidden on Print) */}
        <div className="flex items-center justify-between p-4 bg-neutral-900 border-b border-neutral-800 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 shadow-md">
              <FileText className="w-5 h-5 text-neutral-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-100" style={{ color: '#f8fafc' }}>
                  Nota & Slip Gaji Karyawan
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  RESMI
                </span>
              </div>
              <p className="text-[11px] font-mono mt-0.5" style={{ color: '#94a3b8' }}>
                {slipSerialNo} • {slip.period}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Staff Switcher */}
            {users.length > 1 && (
              <select
                value={activeStaffId}
                onChange={(e) => setActiveStaffId(e.target.value)}
                style={{ color: '#f8fafc', backgroundColor: '#262626' }}
                className="border border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id} style={{ color: '#f8fafc', backgroundColor: '#262626' }}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            )}

            {/* Toggle Document vs Thermal */}
            <div className="flex items-center bg-neutral-950 rounded-xl p-1 border border-neutral-800">
              <button
                type="button"
                onClick={() => setViewFormat('document')}
                style={{ color: viewFormat === 'document' ? '#0a0a0a' : '#cbd5e1' }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  viewFormat === 'document'
                    ? 'bg-emerald-500 shadow-sm'
                    : 'hover:bg-neutral-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dokumen</span>
              </button>
              <button
                type="button"
                onClick={() => setViewFormat('thermal')}
                style={{ color: viewFormat === 'thermal' ? '#0a0a0a' : '#cbd5e1' }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  viewFormat === 'thermal'
                    ? 'bg-emerald-500 shadow-sm'
                    : 'hover:bg-neutral-800'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Thermal</span>
              </button>
            </div>

            <button
              onClick={onClose}
              style={{ color: '#94a3b8' }}
              className="p-1.5 rounded-xl hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-neutral-950/70 print:p-0 print:bg-white print:overflow-visible">
          {/* Print container target */}
          <div id="salary-slip-printable-area">
            {viewFormat === 'document' ? (
              /* ================= FORMAT 1: DOKUMEN RESMI A4 / VOUCHER ================= */
              <div className="bg-white text-neutral-900 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 border border-neutral-300 relative overflow-hidden">
                {/* Official Watermark Stamp (Positioned cleanly on top-right without covering text) */}
                <div className="absolute right-6 top-5 pointer-events-none select-none opacity-85 transform rotate-[-12deg] border-2 border-emerald-600 rounded-xl px-3 py-1.5 text-center shadow-xs bg-emerald-50/70">
                  <div className="text-xs font-black text-emerald-800 tracking-widest uppercase flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>LUNAS & TERVERIFIKASI</span>
                  </div>
                  <div className="text-[9px] font-bold text-emerald-700 font-mono">
                    LAUNDRYHUB MANAGEMENT • {new Date().toLocaleDateString('id-ID')}
                  </div>
                </div>

                {/* Slip Header / Letterhead */}
                <div className="flex items-start justify-between pb-4 border-b-2 border-neutral-900">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-950 text-emerald-400 flex items-center justify-center font-black text-2xl shadow-md">
                      🧺
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black tracking-tight text-neutral-950 leading-none">
                          LAUNDRYHUB
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                          ENTERPRISE CLOUD POS
                        </span>
                      </div>
                      <p className="text-xs font-bold text-neutral-800 mt-1">
                        {staffBranch?.name || 'Workshop Kemang Flagship Central'}
                      </p>
                      <p className="text-[10px] text-neutral-600 font-mono">
                        {staffBranch?.address || 'Jl. Kemang Raya No. 45B, Jakarta Selatan'} • Telp: (021) 719-8822
                      </p>
                    </div>
                  </div>

                  {/* Empty spacer to respect the watermark stamp */}
                  <div className="w-44 h-12 shrink-0 hidden sm:block" />
                </div>

                {/* Sub-header meta bar */}
                <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-neutral-100 rounded-xl font-mono text-neutral-800 border border-neutral-200">
                  <span><strong>DOKUMEN:</strong> SLIP GAJI BORONGAN & PRESENSI</span>
                  <span><strong>NO:</strong> {slipSerialNo}</span>
                  <span><strong>PERIODE:</strong> {slip.period}</span>
                </div>

                {/* Employee Info Card */}
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-300 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={activeStaff.avatar}
                      alt={activeStaff.name}
                      className="w-12 h-12 rounded-2xl border-2 border-emerald-600 object-cover shadow-xs"
                    />
                    <div>
                      <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                        Penerima Gaji (Karyawan)
                      </div>
                      <div className="text-base font-black text-neutral-950 leading-tight">
                        {activeStaff.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 font-bold text-[10px] uppercase">
                          {activeStaff.role}
                        </span>
                        <span className="text-[11px] text-neutral-600 font-mono font-semibold">
                          ID: {activeStaff.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Performance Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-center border-t sm:border-t-0 sm:border-l border-neutral-300 pt-2 sm:pt-0 sm:pl-4">
                    <div className="bg-white p-2 rounded-xl border border-neutral-200 shadow-2xs">
                      <div className="text-[10px] font-bold text-neutral-600">Hadir</div>
                      <div className="text-sm font-black text-emerald-700 font-mono">{slip.daysPresent} Hari</div>
                      <div className="text-[9px] text-emerald-800 font-medium">Valid GPS</div>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-neutral-200 shadow-2xs">
                      <div className="text-[10px] font-bold text-neutral-600">Alpha / Telat</div>
                      <div className="text-sm font-black text-rose-700 font-mono">
                        {slip.daysAbsent} / {slip.daysLate}
                      </div>
                      <div className="text-[9px] text-neutral-600">Presensi</div>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-neutral-200 shadow-2xs">
                      <div className="text-[10px] font-bold text-neutral-600">Disiplin</div>
                      <div className="text-sm font-black text-indigo-700 font-mono">{attendanceRate}%</div>
                      <div className="text-[9px] text-indigo-800 font-bold">Teladan</div>
                    </div>
                  </div>
                </div>

                {/* Earnings & Deductions Tables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Bagian A: Penerimaan (Income) */}
                  <div className="rounded-2xl border border-emerald-300 bg-emerald-50/40 overflow-hidden">
                    <div className="px-4 py-2.5 bg-emerald-700 text-white flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <ArrowUpRight className="w-4 h-4" />
                        A. Rincian Penerimaan
                      </span>
                      <span className="text-[10px] font-mono font-bold">Nominal</span>
                    </div>

                    <div className="p-3.5 space-y-2.5 text-xs divide-y divide-neutral-200">
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <div className="font-bold text-neutral-900">Gaji Pokok Harian</div>
                          <div className="text-[10px] text-neutral-600">
                            Rp {slip.baseSalaryRate.toLocaleString('id-ID')} × {slip.daysPresent} hari hadir
                          </div>
                        </div>
                        <span className="font-mono font-bold text-neutral-950 text-sm">
                          Rp {slip.baseSalaryTotal.toLocaleString('id-ID')}
                        </span>
                      </div>

                      {/* Borongan Stasiun */}
                      <div className="pt-2 space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-neutral-900">
                          <span className="text-emerald-900 font-black">
                            Komisi Borongan 5 Stasiun ({totalNotaBorongan} nota):
                          </span>
                          <span className="font-mono font-black text-emerald-800 text-sm">
                            +Rp {slip.totalStationEarnings.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="space-y-1 pl-2 border-l-2 border-emerald-500">
                          {slip.stationCommissions.map((st) => (
                            <div key={st.station} className="flex items-center justify-between text-[11px] text-neutral-700">
                              <span className="flex items-center gap-1">
                                <span>{STATION_LABELS[st.station]?.icon || '⚙️'}</span>
                                <span className="font-semibold text-neutral-800">{STATION_LABELS[st.station]?.label || st.station}</span>
                                <span className="text-[10px] text-neutral-500">({st.count} nota)</span>
                              </span>
                              <span className="font-mono font-bold text-neutral-900">
                                {st.totalEarned > 0 ? `+Rp ${st.totalEarned.toLocaleString('id-ID')}` : 'Rp 0'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tip Pelanggan */}
                      {slip.customerTipsTotal > 0 && (
                        <div className="flex items-center justify-between pt-2">
                          <div>
                            <div className="font-bold text-pink-800 flex items-center gap-1">
                              <span>⭐</span>
                              <span>Tip Rating Bintang 5</span>
                            </div>
                            <div className="text-[10px] text-neutral-600">Dari pelanggan puas</div>
                          </div>
                          <span className="font-mono font-bold text-pink-800 text-sm">
                            +Rp {slip.customerTipsTotal.toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 font-black text-neutral-950">
                        <span>Total Penerimaan Kotor:</span>
                        <span className="font-mono text-sm text-emerald-900 font-black">
                          Rp {grossEarnings.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bagian B: Potongan (Deductions) */}
                  <div className="rounded-2xl border border-rose-300 bg-rose-50/40 overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="px-4 py-2.5 bg-rose-700 text-white flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                          <ArrowDownRight className="w-4 h-4" />
                          B. Rincian Potongan
                        </span>
                        <span className="text-[10px] font-mono font-bold">Nominal</span>
                      </div>

                      <div className="p-3.5 space-y-2 text-xs">
                        {totalDeductions > 0 ? (
                          <div className="space-y-2 divide-y divide-neutral-200">
                            {slip.daysAbsent > 0 && (
                              <div className="flex items-center justify-between pt-1">
                                <div>
                                  <div className="font-bold text-rose-900">Denda Alpha / Tidak Masuk</div>
                                  <div className="text-[10px] text-neutral-600">
                                    Rp {slip.absenceDeductionRate.toLocaleString('id-ID')} × {slip.daysAbsent} hari
                                  </div>
                                </div>
                                <span className="font-mono font-bold text-rose-800">
                                  -Rp {slip.absenceDeductionsTotal.toLocaleString('id-ID')}
                                </span>
                              </div>
                            )}

                            {slip.daysLate > 0 && (
                              <div className="flex items-center justify-between pt-2">
                                <div>
                                  <div className="font-bold text-amber-900">Denda Terlambat Clock-In</div>
                                  <div className="text-[10px] text-neutral-600">{slip.daysLate} kali insiden telat</div>
                                </div>
                                <span className="font-mono font-bold text-amber-800">
                                  -Rp {slip.lateDeductionsTotal.toLocaleString('id-ID')}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl bg-emerald-100 border border-emerald-300 text-center space-y-1 my-2">
                            <BadgeCheck className="w-8 h-8 text-emerald-700 mx-auto" />
                            <div className="font-black text-xs text-emerald-950">DISIPLIN SEMPURNA 100%!</div>
                            <p className="text-[10px] text-emerald-900 font-medium">
                              Tidak ada potongan denda alpha maupun keterlambatan. Karyawan teladan bulan ini!
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 border-t border-rose-300 bg-rose-100/70 flex items-center justify-between font-black text-xs text-neutral-950">
                      <span>Total Potongan Gaji:</span>
                      <span className="font-mono text-rose-800 text-sm font-black">
                        {totalDeductions > 0 ? `-Rp ${totalDeductions.toLocaleString('id-ID')}` : 'Rp 0'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grand Total Box (TAKE HOME PAY) */}
                <div className="rounded-2xl p-5 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 text-white shadow-xl border-2 border-emerald-500 relative overflow-hidden">
                  <div className="absolute right-0 top-0 bottom-0 w-48 bg-emerald-500/10 rounded-l-full pointer-events-none" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-neutral-950 uppercase tracking-widest inline-flex items-center gap-1">
                        <Banknote className="w-3.5 h-3.5" />
                        TOTAL TAKE HOME PAY (BERSIH)
                      </span>
                      <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mt-1">
                        Rp {slip.netTakeHomePay.toLocaleString('id-ID')}
                      </div>
                      <p className="text-[11px] text-neutral-300 font-semibold italic mt-0.5">
                        Terbilang: #{terbilangRupiah(slip.netTakeHomePay)}#
                      </p>
                    </div>

                    <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-800">
                      <div className="text-[10px] text-neutral-400">Status Pembayaran:</div>
                      <div className="text-xs font-black text-emerald-400 flex items-center sm:justify-end gap-1">
                        <BadgeCheck className="w-4 h-4 text-emerald-400" />
                        <span>DITRANSFER / LUNAS</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        Rekening Staf: Mandiri / BCA / GoPay
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slip Signatures & Verification QR Footer */}
                <div className="pt-4 border-t-2 border-dashed border-neutral-300 grid grid-cols-3 gap-4 items-end text-center text-xs">
                  <div>
                    <p className="text-[10px] font-bold text-neutral-600 uppercase">Staf Penerima,</p>
                    <div className="h-12 flex items-center justify-center">
                      <span className="font-serif italic text-neutral-500 text-xs">Signed digitally</span>
                    </div>
                    <p className="font-black text-neutral-950 border-t border-neutral-300 pt-1">
                      {activeStaff.name}
                    </p>
                    <p className="text-[9px] text-neutral-600 font-mono font-semibold">NIK: STF-{activeStaff.id.slice(-4).toUpperCase()}</p>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="QR Keabsahan Slip Gaji"
                        className="w-16 h-16 border border-neutral-300 p-0.5 rounded-lg shadow-2xs"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-400">
                        <QrIcon className="w-8 h-8" />
                      </div>
                    )}
                    <p className="text-[8px] text-neutral-600 font-mono mt-1 font-bold">Scan Verifikasi Keaslian</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-neutral-600 uppercase">Finance & Management,</p>
                    <div className="h-12 flex items-center justify-center">
                      <span className="font-serif italic text-emerald-700 text-xs font-bold">Approved By LaundryHub</span>
                    </div>
                    <p className="font-black text-neutral-950 border-t border-neutral-300 pt-1">
                      (Management Outlet)
                    </p>
                    <p className="text-[9px] text-neutral-600 font-mono font-semibold">{staffBranch?.name || 'LaundryHub Pusat'}</p>
                  </div>
                </div>

                <div className="text-[9px] text-neutral-500 font-mono text-center pt-2 border-t border-neutral-200">
                  Dokumen ini diterbitkan secara elektronik oleh LAUNDRYHUB Enterprise Cloud POS. Berlaku sah tanpa tanda tangan basah berdasarkan UU ITE.
                </div>
              </div>
            ) : (
              /* ================= FORMAT 2: STRUK THERMAL KASIR 58/80MM ================= */
              <div className="max-w-sm mx-auto bg-[#fffdf5] text-neutral-950 font-mono text-xs rounded-2xl shadow-2xl p-5 border border-amber-300 relative overflow-hidden">
                <div className="text-center pb-3 border-b-2 border-dashed border-neutral-400 space-y-1">
                  <div className="text-xl font-black tracking-widest text-neutral-950">LAUNDRYHUB</div>
                  <div className="text-[11px] font-bold text-neutral-800">{staffBranch?.name || 'Workshop Kemang (HQ)'}</div>
                  <div className="text-[10px] text-neutral-700">{staffBranch?.address || 'Jl. Kemang Raya No. 45B'}</div>
                  <div className="text-[10px] text-neutral-800 font-bold uppercase tracking-wider pt-1">
                    === STRUK SLIP GAJI BORONGAN ===
                  </div>
                  <div className="text-[10px] text-neutral-800 font-bold">Periode: {slip.period}</div>
                </div>

                <div className="py-2.5 border-b border-dashed border-neutral-400 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-neutral-700">No Slip:</span>
                    <span className="font-bold text-neutral-950">{slipSerialNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-700">Karyawan:</span>
                    <span className="font-bold text-neutral-950">{activeStaff.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-700">Role:</span>
                    <span className="font-bold uppercase text-neutral-950">{activeStaff.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-700">Presensi:</span>
                    <span className="text-neutral-950">{slip.daysPresent} Hadir | {slip.daysAbsent} Alpha | {slip.daysLate} Telat</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-700">Tgl Cetak:</span>
                    <span className="text-neutral-950">{new Date().toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Itemized Stasiun */}
                <div className="py-2.5 border-b border-dashed border-neutral-400 space-y-1 text-[11px]">
                  <div className="font-bold text-[10px] text-neutral-900 uppercase">A. PENDAPATAN:</div>
                  <div className="flex justify-between">
                    <span>Gaji Pokok ({slip.daysPresent}x):</span>
                    <span className="font-bold text-neutral-950">Rp {slip.baseSalaryTotal.toLocaleString('id-ID')}</span>
                  </div>

                  {slip.stationCommissions.map((st) => (
                    <div key={st.station} className="flex justify-between text-[10px]">
                      <span>{STATION_LABELS[st.station]?.icon} {st.station} ({st.count} nota):</span>
                      <span className="font-semibold text-neutral-950">
                        {st.totalEarned > 0 ? `+Rp ${st.totalEarned.toLocaleString('id-ID')}` : 'Rp 0'}
                      </span>
                    </div>
                  ))}

                  {slip.customerTipsTotal > 0 && (
                    <div className="flex justify-between text-emerald-900 font-bold">
                      <span>Tip Bintang 5:</span>
                      <span>+Rp {slip.customerTipsTotal.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-neutral-950 pt-1 border-t border-dotted border-neutral-400">
                    <span>Subtotal Kotor:</span>
                    <span>Rp {grossEarnings.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Potongan */}
                <div className="py-2.5 border-b border-dashed border-neutral-400 space-y-1 text-[11px]">
                  <div className="font-bold text-[10px] text-rose-900 uppercase">B. POTONGAN DENDA:</div>
                  {totalDeductions > 0 ? (
                    <>
                      {slip.daysAbsent > 0 && (
                        <div className="flex justify-between text-rose-800">
                          <span>Alpha ({slip.daysAbsent}x):</span>
                          <span>-Rp {slip.absenceDeductionsTotal.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      {slip.daysLate > 0 && (
                        <div className="flex justify-between text-rose-800">
                          <span>Terlambat ({slip.daysLate}x):</span>
                          <span>-Rp {slip.lateDeductionsTotal.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-emerald-900 text-[10px] font-bold">Nol Denda (100% On-Time)</div>
                  )}
                  <div className="flex justify-between font-bold text-rose-900 pt-1 border-t border-dotted border-neutral-400">
                    <span>Total Potongan:</span>
                    <span>-Rp {totalDeductions.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="py-3 border-b-2 border-neutral-900 space-y-1">
                  <div className="flex justify-between text-sm font-black">
                    <span>TAKE HOME PAY:</span>
                    <span className="text-emerald-900 text-base font-black">Rp {slip.netTakeHomePay.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="text-[10px] text-neutral-800 italic leading-tight font-medium">
                    {terbilangRupiah(slip.netTakeHomePay)}
                  </div>
                  <div className="text-[10px] text-emerald-900 font-bold pt-1">
                    STATUS: [LUNAS / VERIFIED]
                  </div>
                </div>

                {/* QR Struk */}
                <div className="pt-3 text-center space-y-2">
                  {qrCodeDataUrl && (
                    <img
                      src={qrCodeDataUrl}
                      alt="Thermal QR Code"
                      className="w-20 h-20 mx-auto border border-neutral-400 p-1 bg-white rounded"
                    />
                  )}
                  <div className="text-[9px] text-neutral-600 font-mono">
                    Simpan struk ini sebagai bukti resmi.<br />
                    Terima kasih atas kerja keras Anda!
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Action Controls (Hidden on Print) */}
        <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-neutral-950" />
              <span>Cetak / Print Nota</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-4 py-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-bold text-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Kirim WhatsApp Staf</span>
            </button>

            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              title="Salin Rincian Slip Gaji ke Clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                openDopaminePayday(activeStaff.id);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-neutral-950" />
              <span>Sensasi Dopamine Gaji 🎰</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-xs font-semibold transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
