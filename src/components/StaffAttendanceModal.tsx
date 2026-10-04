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
  Navigation,
  Compass,
  Radio,
  RotateCcw,
  RefreshCw,
  Flame,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StaffAttendance } from '../types';
import { soundEngine } from '../utils/audio';

interface StaffAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Outlet Geofence Coordinates per Branch
const OUTLET_COORDINATES: Record<string, { name: string; lat: number; lng: number }> = {
  'br-kemang': { name: 'Outlet Workshop Kemang (HQ)', lat: -6.260718, lng: 106.815610 },
  'br-tebet': { name: 'Outlet Tebet Express Hub', lat: -6.226830, lng: 106.858200 },
  'br-bintaro': { name: 'Outlet Bintaro Sektor 9', lat: -6.281850, lng: 106.721400 },
};

// Haversine Distance Formula in Meters
const calculateDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth radius in metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

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
    openDopaminePayday,
    currentBranchId,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'absen' | 'riwayat' | 'aturan'>('absen');
  const [selectedStaffId, setSelectedStaffId] = useState<string>(currentUser.id);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  // GPS Geolocation States
  const [gpsMode, setGpsMode] = useState<'device' | 'simulated_in' | 'simulated_out'>('simulated_in');
  const [gpsStatus, setGpsStatus] = useState<'locating' | 'valid' | 'out_of_range' | 'denied' | 'error'>('valid');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number; accuracy: number }>({
    lat: -6.260760,
    lng: 106.815660,
    accuracy: 4,
  });
  const [distanceMeters, setDistanceMeters] = useState<number>(8);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [ownerOverrideGps, setOwnerOverrideGps] = useState<boolean>(false);

  // Editable settings for owner
  const [baseSalaryInput, setBaseSalaryInput] = useState<number>(payrollSettings.dailyBaseSalary);
  const [absenceDeductionInput, setAbsenceDeductionInput] = useState<number>(payrollSettings.absenceDeductionPerDay);
  const [lateDeductionInput, setLateDeductionInput] = useState<number>(payrollSettings.lateDeductionPerIncident);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Target Outlet for Geofencing
  const targetOutlet =
    OUTLET_COORDINATES[currentUser.branchId] ||
    OUTLET_COORDINATES[currentBranchId] ||
    OUTLET_COORDINATES['br-kemang'];

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

  // Recalculate distance whenever mode or target outlet changes
  const updateGpsLocation = (mode: 'device' | 'simulated_in' | 'simulated_out') => {
    setGpsMode(mode);

    if (mode === 'simulated_in') {
      const simulatedLat = targetOutlet.lat + 0.00004;
      const simulatedLng = targetOutlet.lng + 0.00003;
      const dist = calculateDistanceMeters(simulatedLat, simulatedLng, targetOutlet.lat, targetOutlet.lng);
      setUserCoords({ lat: simulatedLat, lng: simulatedLng, accuracy: 4 });
      setDistanceMeters(dist || 6);
      setGpsStatus('valid');
      setIsLocating(false);
    } else if (mode === 'simulated_out') {
      const simulatedLat = targetOutlet.lat + 0.0042;
      const simulatedLng = targetOutlet.lng + 0.0035;
      const dist = calculateDistanceMeters(simulatedLat, simulatedLng, targetOutlet.lat, targetOutlet.lng);
      setUserCoords({ lat: simulatedLat, lng: simulatedLng, accuracy: 14 });
      setDistanceMeters(dist || 520);
      setGpsStatus('out_of_range');
      setIsLocating(false);
    } else if (mode === 'device') {
      fetchRealDeviceGps();
    }
  };

  const fetchRealDeviceGps = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsStatus('error');
      alert('Browser atau perangkat ini tidak mendukung sensor GPS Geolocation.');
      return;
    }

    setIsLocating(true);
    setGpsStatus('locating');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);
        const dist = calculateDistanceMeters(lat, lng, targetOutlet.lat, targetOutlet.lng);

        setUserCoords({ lat, lng, accuracy: acc });
        setDistanceMeters(dist);
        setIsLocating(false);

        if (dist <= 50) {
          setGpsStatus('valid');
        } else {
          setGpsStatus('out_of_range');
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('GPS Geolocation error:', err);
        if (err.code === 1) {
          setGpsStatus('denied');
          alert('Izin akses lokasi GPS ditolak oleh browser. Silakan aktifkan izin lokasi di pengaturan browser.');
        } else {
          setGpsStatus('error');
          alert('Gagal mendeteksi sinyal GPS satelit. Menggunakan mode simulasi outlet.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

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

  const isGpsValid = distanceMeters <= 50;
  const canClockIn = isGpsValid || (currentRole === 'owner' && ownerOverrideGps);

  const handleClockIn = () => {
    if (!canClockIn) {
      alert(
        `Lokasi GPS Ditolak: Anda berjarak ${distanceMeters} meter dari outlet ${targetOutlet.name}! Batas radius adalah 50 meter.`
      );
      return;
    }

    const res = recordClockIn(
      activeStaff.id,
      capturedPhoto || undefined,
      notes,
      {
        latitude: userCoords.lat,
        longitude: userCoords.lng,
        distanceMeters,
        gpsAccuracy: userCoords.accuracy,
        isGpsVerified: isGpsValid,
        locationAddress: `${targetOutlet.name} (GPS ${distanceMeters}m - ${isGpsValid ? 'Valid' : 'Bypass Owner'})`,
      }
    );

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
                <h3 className="font-bold text-lg leading-tight">Absen Online GPS & Slip Gaji Borongan</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-emerald-100 flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  Live Satelit GPS
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                Pencatatan presensi radius 50m outlet, denda alpha/telat, & komisi borongan 5 stasiun
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

              {/* Live Clock & Worker Card */}
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
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                          isGpsValid
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        Radius GPS: {isGpsValid ? `Valid (${distanceMeters}m)` : `Luar Area (${distanceMeters}m)`}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">{targetOutlet.name}</p>
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

                {/* Quick Monthly Take-Home Pay Preview with Dopamine Trigger */}
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/60 rounded-3xl border border-emerald-100 dark:border-slate-700 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Slip Gaji Borongan
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">Bulan Ini</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      Rp {salarySlip.netTakeHomePay.toLocaleString('id-ID')}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Estimasi bersih setelah potongan & borongan
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span>Gaji Pokok ({salarySlip.daysPresent}x hadir):</span>
                      <span className="font-semibold">Rp {salarySlip.baseSalaryTotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-teal-600 dark:text-teal-400 font-medium">
                      <span>Borongan 5 Stasiun:</span>
                      <span className="font-bold">+Rp {salarySlip.totalStationEarnings.toLocaleString('id-ID')}</span>
                    </div>
                    {salarySlip.customerTipsTotal > 0 && (
                      <div className="flex justify-between text-pink-600 dark:text-pink-400 font-medium">
                        <span>Tip Pelanggan:</span>
                        <span className="font-bold">+Rp {salarySlip.customerTipsTotal.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                  </div>

                  {/* Dopamine Payday Button */}
                  <button
                    onClick={() => openDopaminePayday(activeStaff.id)}
                    className="mt-3 w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-glow-amber transition-all flex items-center justify-center gap-1.5 animate-pulse"
                  >
                    <span>🎰 Sensasi Gaji Dopamine Cuan!</span>
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                  </button>
                </div>
              </div>

              {/* Real GPS Geolocation & Radar Card */}
              <div
                className={`p-4 rounded-3xl border transition-all ${
                  isGpsValid
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-xl relative ${
                        isGpsValid ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                      }`}
                    >
                      <Navigation className="w-4 h-4" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Verifikasi Titik Lokasi GPS Geofencing</span>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            isGpsValid
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
                          }`}
                        >
                          {isGpsValid ? '● DALAM RADIUS OUTLET (VALID)' : '● DI LUAR RADIUS (TERTOLAK)'}
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                        Target: <span className="font-semibold">{targetOutlet.name}</span> • Toleransi: Maksimal 50 Meter
                      </p>
                    </div>
                  </div>

                  {/* Mode GPS Selector (Satelit Asli vs Simulasi Toko vs Luar Toko) */}
                  <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => updateGpsLocation('simulated_in')}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                        gpsMode === 'simulated_in'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                      title="Simulasi staf berada tepat di dalam toko laundry (8m)"
                    >
                      🟢 Demo: Di Toko (8m)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateGpsLocation('simulated_out')}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                        gpsMode === 'simulated_out'
                          ? 'bg-rose-600 text-white shadow'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                      title="Simulasi staf mencoba absen dari luar area / rumah (480m)"
                    >
                      🔴 Demo: Luar (480m)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateGpsLocation('device')}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 ${
                        gpsMode === 'device'
                          ? 'bg-cyan-600 text-white shadow'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                      title="Gunakan koordinat satelit GPS asli dari perangkat HP / Laptop"
                    >
                      <Radio className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>🛰️ Satelit Asli</span>
                    </button>
                  </div>
                </div>

                {/* Radar Metrics & Coordinates Bar */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Jarak ke Outlet</p>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span
                        className={`text-xl font-black font-mono ${
                          isGpsValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {distanceMeters}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">meter (Maks: 50m)</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Koordinat Satelit Perangkat</p>
                    <p className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                      {userCoords.lat.toFixed(6)}, {userCoords.lng.toFixed(6)}
                    </p>
                    <p className="text-[9px] text-slate-400">Akurasi Sinyal: ±{userCoords.accuracy} meter</p>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Status Geofence Toko</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <span
                        className={`text-xs font-bold ${
                          isGpsValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isGpsValid ? '✓ Berada di Toko' : '✗ Terlalu Jauh'}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateGpsLocation(gpsMode)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500"
                        title="Perbarui Sinyal GPS"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Owner Override Option if outside area */}
                {!isGpsValid && currentRole === 'owner' && (
                  <div className="mt-2.5 p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
                    <span className="flex items-center gap-1.5 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Owner Mode: Izinkan absen darurat di luar radius GPS?</span>
                    </span>
                    <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ownerOverrideGps}
                        onChange={(e) => setOwnerOverrideGps(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Bypass GPS</span>
                    </label>
                  </div>
                )}
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
                        disabled={(!canClockIn && !todayRecord) || (!!todayRecord && todayRecord.clockInTime !== '-')}
                        className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                          todayRecord && todayRecord.clockInTime !== '-'
                            ? 'bg-slate-400 text-white cursor-not-allowed'
                            : !canClockIn
                            ? 'bg-rose-600/70 text-white cursor-not-allowed hover:bg-rose-600'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>
                          {todayRecord && todayRecord.clockInTime !== '-'
                            ? 'Sudah Absen Masuk Hari Ini'
                            : !canClockIn
                            ? `Di Luar Radius GPS (${distanceMeters}m > 50m)`
                            : 'Absen Masuk Sekarang'}
                        </span>
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
                      * Toleransi keterlambatan pukul 08:15 WIB. Radius geofence GPS wajib berada &lt; 50m dari outlet.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RIWAYAT & LOG KEHADIRAN DENGAN GPS BADGE */}
          {activeTab === 'riwayat' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Daftar Presensi Karyawan LaundryHub (GPS Terverifikasi)
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
                      <th className="p-3">Lokasi GPS</th>
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
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              item.isGpsVerified !== false
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/40'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300/40'
                            }`}
                          >
                            <MapPin className="w-2.5 h-2.5" />
                            <span>{item.distanceMeters ? `${item.distanceMeters}m` : '8m'} GPS</span>
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
