import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  Calendar,
  DollarSign,
  MapPin,
  TrendingUp,
  X,
  Settings,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  FileText,
  User,
  Coffee,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StaffAttendance } from '../types';
import { soundEngine } from '../utils/audio';

interface StaffAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StaffAttendanceModal: React.FC<StaffAttendanceModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    currentRole,
    users,
    attendances,
    payrollSettings,
    updatePayrollSettings,
    recordClockIn,
    recordClockOut,
    recordAbsence,
    calculateStaffSalarySlip,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'absen' | 'riwayat' | 'aturan'>('absen');
  const [selectedStaffId, setSelectedStaffId] = useState<string>(currentUser.id);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  // Editable settings for owner
  const [baseSalaryInput, setBaseSalaryInput] = useState<number>(payrollSettings.dailyBaseSalary);
  const [absenceDeductionInput, setAbsenceDeductionInput] = useState<number>(payrollSettings.absenceDeductionPerDay);
  const [lateDeductionInput, setLateDeductionInput] = useState<number>(payrollSettings.lateDeductionPerIncident);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour12: false }));
      setCurrentDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update selected staff when current user changes
  useEffect(() => {
    setSelectedStaffId(currentUser.id);
  }, [currentUser.id]);

  // Camera handling for selfie
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 480, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Failed to access camera for selfie', err);
      setCameraActive(false);
      alert('Tidak dapat mengakses kamera. Menggunakan foto profil default untuk absensi.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 320, 320);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedPhoto(dataUrl);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isOpen) return null;

  // Selected staff data & today's attendance
  const activeStaff = users.find((u) => u.id === selectedStaffId) || currentUser;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendances.find((a) => a.userId === activeStaff.id && a.date === todayStr);
  const salarySlip = calculateStaffSalarySlip(activeStaff.id);

  const handleClockIn = () => {
    const res = recordClockIn(activeStaff.id, capturedPhoto || undefined, notes);
    if (!res.success) {
      alert(res.message);
    } else {
      setCapturedPhoto(null);
      setNotes('');
    }
  };

  const handleClockOut = () => {
    const res = recordClockOut(activeStaff.id);
    if (!res.success) {
      alert(res.message);
    }
  };

  const handleSavePayrollSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updatePayrollSettings({
      dailyBaseSalary: baseSalaryInput,
      absenceDeductionPerDay: absenceDeductionInput,
      lateDeductionPerIncident: lateDeductionInput,
    });
    alert('Aturan gaji pokok dan potongan ketidakhadiran berhasil diperbarui!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 rounded-2xl shadow-inner">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-tight">Absen Online & Slip Gaji Borongan</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-emerald-100">
                  Live GPS Verified
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                Pencatatan kehadiran, potongan tidak masuk, & kalkulasi komisi per stasiun nota
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4">
          <button
            onClick={() => setActiveTab('absen')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'absen'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-800/80 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Clock In / Absen</span>
          </button>
          <button
            onClick={() => setActiveTab('riwayat')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'riwayat'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-800/80 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Log Kehadiran & Borongan ({attendances.length})</span>
          </button>
          {currentRole === 'owner' && (
            <button
              onClick={() => setActiveTab('aturan')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'aturan'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-800/80 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Aturan Potongan Gaji (Owner)</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: ABSEN SEKARANG */}
          {activeTab === 'absen' && (
            <div className="space-y-5">
              {/* Staff Selector (if owner, can select any staff; otherwise shows self) */}
              {currentRole === 'owner' && (
                <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      Pilih Staf (Mode Owner):
                    </span>
                  </div>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="text-xs py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 font-semibold text-slate-800 dark:text-slate-100"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Live Clock Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-300">{currentDate}</p>
                      <h2 className="text-4xl font-extrabold font-mono tracking-tight text-white mt-1">
                        {currentTime || '08:00:00'}
                      </h2>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        Radius GPS: Valid (8m)
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">Outlet Workshop Kemang</p>
                    </div>
                  </div>

                  {/* Worker Badge */}
                  <div className="mt-4 pt-4 border-t border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={activeStaff.avatar}
                        alt={activeStaff.name}
                        className="w-10 h-10 rounded-full border-2 border-emerald-400 object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-white">{activeStaff.name}</h4>
                        <p className="text-xs text-slate-300 capitalize">
                          Role: <span className="font-semibold text-emerald-400">{activeStaff.role}</span>
                        </p>
                      </div>
                    </div>
                    <div>
                      {todayRecord ? (
                        <div className="text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-extrabold capitalize ${
                              todayRecord.status === 'hadir'
                                ? 'bg-emerald-500 text-white'
                                : todayRecord.status === 'terlambat'
                                ? 'bg-amber-500 text-white'
                                : 'bg-rose-500 text-white'
                            }`}
                          >
                            ● {todayRecord.status.toUpperCase()}
                          </span>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Masuk: {todayRecord.clockInTime}
                            {todayRecord.clockOutTime ? ` | Pulang: ${todayRecord.clockOutTime}` : ''}
                          </p>
                        </div>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300">
                          Belum Absen Hari Ini
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Monthly Take-Home Pay Preview */}
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/60 rounded-3xl border border-emerald-100 dark:border-slate-700 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Slip Gaji Borongan
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">Bulan Ini</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      Rp {salarySlip.netTakeHomePay.toLocaleString('id-ID')}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Estimasi bersih setelah potongan & borongan
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs space-y-1">
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Gaji Pokok ({salarySlip.daysPresent}x hadir):</span>
                      <span className="font-semibold">Rp {salarySlip.baseSalaryTotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-teal-600 dark:text-teal-400 font-medium">
                      <span>Komisi Borongan Stasiun:</span>
                      <span className="font-bold">+Rp {salarySlip.totalStationEarnings.toLocaleString('id-ID')}</span>
                    </div>
                    {salarySlip.absenceDeductionsTotal > 0 && (
                      <div className="flex justify-between text-rose-500 font-medium">
                        <span>Potongan Alpha ({salarySlip.daysAbsent}x):</span>
                        <span className="font-bold">-Rp {salarySlip.absenceDeductionsTotal.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {salarySlip.lateDeductionsTotal > 0 && (
                      <div className="flex justify-between text-amber-500 font-medium">
                        <span>Potongan Terlambat ({salarySlip.daysLate}x):</span>
                        <span className="font-bold">-Rp {salarySlip.lateDeductionsTotal.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons & Selfie Verification Section */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  Foto Bukti Selfie & Catatan Kehadiran
                </h4>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {/* Selfie Preview or Camera Box */}
                  <div className="w-36 h-36 rounded-2xl bg-slate-200 dark:bg-slate-700 overflow-hidden relative flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 shrink-0">
                    {capturedPhoto ? (
                      <div className="relative w-full h-full">
                        <img src={capturedPhoto} alt="Selfie" className="w-full h-full object-cover" />
                        <button
                          onClick={() => setCapturedPhoto(null)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full text-[10px]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : cameraActive ? (
                      <div className="relative w-full h-full">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        <button
                          onClick={capturePhoto}
                          className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold shadow"
                        >
                          Jepret Foto
                        </button>
                      </div>
                    ) : (
                      <div className="text-center p-2">
                        <Camera className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                        <button
                          onClick={startCamera}
                          className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                        >
                          Buka Kamera
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Notes & Actions */}
                  <div className="flex-1 w-full space-y-3">
                    <input
                      type="text"
                      placeholder="Catatan kehadiran (opsional, misal: shift pagi, izin terlambat 10m)..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleClockIn}
                        disabled={!!todayRecord && todayRecord.clockInTime !== '-'}
                        className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>{todayRecord ? 'Sudah Absen Masuk' : 'Absen Masuk Sekarang'}</span>
                      </button>

                      <button
                        onClick={handleClockOut}
                        disabled={!todayRecord || !!todayRecord.clockOutTime}
                        className="py-3 px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <Coffee className="w-4 h-4" />
                        <span>{todayRecord?.clockOutTime ? 'Sudah Pulang' : 'Absen Pulang'}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      * Toleransi keterlambatan pukul 08:15 WIB. Melebihi jam tersebut dikenakan potongan keterlambatan otomatis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RIWAYAT & LOG KEHADIRAN */}
          {activeTab === 'riwayat' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Daftar Presensi Karyawan LaundryHub
                </h4>
                {currentRole === 'owner' && (
                  <button
                    onClick={() => {
                      const date = prompt('Tanggal (YYYY-MM-DD):', todayStr);
                      if (!date) return;
                      const staffName = prompt('Pilih Staf:', activeStaff.name);
                      const target = users.find((u) => u.name.toLowerCase().includes(staffName?.toLowerCase() || '')) || activeStaff;
                      const reason = prompt('Alasan / Keterangan:', 'Tanpa kabar');
                      recordAbsence(target.id, date, 'alpha', reason || undefined);
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Tandai Alpha / Izin</span>
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">Staf</th>
                      <th className="p-3">Tanggal</th>
                      <th className="p-3">Jam Masuk</th>
                      <th className="p-3">Jam Pulang</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Foto Bukti</th>
                      <th className="p-3">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {attendances.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          {item.userName}
                        </td>
                        <td className="p-3 font-mono">{item.date}</td>
                        <td className="p-3 font-mono">{item.clockInTime}</td>
                        <td className="p-3 font-mono">{item.clockOutTime || '-'}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              item.status === 'hadir'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : item.status === 'terlambat'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : item.status === 'izin'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {item.selfieUrl ? (
                            <img
                              src={item.selfieUrl}
                              alt="Selfie"
                              className="w-7 h-7 rounded-lg object-cover border border-slate-300 dark:border-slate-600"
                            />
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-500 dark:text-slate-400">
                          {item.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ATURAN POTONGAN GAJI (KHUSUS OWNER) */}
          {activeTab === 'aturan' && currentRole === 'owner' && (
            <form onSubmit={handleSavePayrollSettings} className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold">Konfigurasi Gaji Pokok & Pengurangan Gaji</p>
                  <p className="mt-0.5 text-amber-700 dark:text-amber-300">
                    Sistem akan otomatis memotong take-home pay staf jika tercatat tidak hadir (alpha) atau terlambat,
                    dan menambahkan komisi borongan stasiun per nota yang berhasil diselesaikan dengan foto bukti.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Gaji Pokok Harian (Rp / Hari Hadir)
                  </label>
                  <input
                    type="number"
                    value={baseSalaryInput}
                    onChange={(e) => setBaseSalaryInput(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-800 dark:text-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Diberikan setiap hari staf masuk kerja</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
                    Pengurangan Gaji per Tidak Masuk (Rp / Hari)
                  </label>
                  <input
                    type="number"
                    value={absenceDeductionInput}
                    onChange={(e) => setAbsenceDeductionInput(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700 rounded-xl text-sm font-bold text-rose-600 dark:text-rose-400"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Potongan otomatis jika status Alpha</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
                    Pengurangan Gaji Terlambat (Rp / Kali)
                  </label>
                  <input
                    type="number"
                    value={lateDeductionInput}
                    onChange={(e) => setLateDeductionInput(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl text-sm font-bold text-amber-600 dark:text-amber-400"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Potongan jika clock-in lewat 08:15</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Aturan Penggajian</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
