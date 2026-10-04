import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  X,
  Upload,
  Search,
  AlertCircle,
  Zap,
  CheckCircle2,
  RefreshCw,
  QrCode,
  Smartphone,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { soundEngine } from '../utils/audio';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess?: (invoiceNo: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const { openTrackingModal } = useApp();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualInvoice, setManualInvoice] = useState<string>('');
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);

  // Extract invoice number from string or URL
  const extractInvoiceNo = (text: string): string => {
    const trimmed = text.trim();
    // Check if URL with ?nota= or ?invoice=
    try {
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        const url = new URL(trimmed);
        const nota = url.searchParams.get('nota') || url.searchParams.get('invoice');
        if (nota) return nota.toUpperCase();
      }
    } catch {
      // Not a valid URL
    }
    // Match common LH patterns e.g. LH-KMG-2610-001 or general text
    const match = trimmed.match(/LH-[A-Za-z0-9-]+/i);
    if (match) return match[0].toUpperCase();
    return trimmed.toUpperCase();
  };

  const handleDetectedCode = (code: string) => {
    const invoiceNo = extractInvoiceNo(code);
    setScannedResult(invoiceNo);
    soundEngine.playScanBeep();

    // Stop camera stream immediately
    stopCamera();

    setTimeout(() => {
      onClose();
      if (onScanSuccess) {
        onScanSuccess(invoiceNo);
      } else {
        openTrackingModal(invoiceNo);
      }
    }, 900);
  };

  const startCamera = async () => {
    setCameraError(null);
    setScannedResult(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Kamera tidak didukung pada browser ini.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      streamRef.current = stream;
      setHasCameraPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        requestAnimationFrame(tickScan);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setHasCameraPermission(false);
      setCameraError(err.message || 'Izin kamera ditolak atau perangkat kamera tidak tersedia.');
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const tickScan = () => {
    if (!videoRef.current || !canvasRef.current || scannedResult) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          handleDetectedCode(code.data);
          return;
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(tickScan);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    try {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = (track.getCapabilities && (track.getCapabilities() as any)) || {};
      if (capabilities.torch) {
        await (track as any).applyConstraints({
          advanced: [{ torch: !torchOn }],
        });
        setTorchOn(!torchOn);
      }
    } catch (err) {
      console.warn('Flashlight error:', err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height);
          setIsProcessingFile(false);
          if (code && code.data) {
            handleDetectedCode(code.data);
          } else {
            alert('Tidak ditemukan QR code yang valid pada gambar tersebut. Silakan coba gambar lain atau masukkan nomor nota.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInvoice.trim()) return;
    handleDetectedCode(manualInvoice.trim());
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white/20 rounded-xl">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">In-App QR Scanner</h3>
              <p className="text-xs text-teal-100">Scan QR Nota Laundry untuk tracking seketika</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Camera Screen */}
        <div className="relative bg-black flex-1 min-h-[280px] max-h-[360px] flex items-center justify-center overflow-hidden">
          {hasCameraPermission === false || cameraError ? (
            <div className="p-6 text-center text-slate-300 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-white text-sm mb-1">Akses Kamera Terkendala</h4>
              <p className="text-xs text-slate-400 mb-4 max-w-xs">
                {cameraError || 'Kamera tidak dapat diakses pada browser ini. Anda dapat mengunggah foto QR nota atau mengetik nomor nota.'}
              </p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Coba Akses Lagi</span>
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Viewfinder Framing Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* Dark vignettes */}
                <div className="absolute inset-0 bg-black/40" />

                {/* Clear Scan Target Box */}
                <div className="relative w-64 h-64 border-2 border-teal-400/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] flex items-center justify-center overflow-hidden">
                  {/* Corner Guides */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-teal-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-teal-400 rounded-br-lg" />

                  {/* Red/Teal Animated Laser Beam */}
                  <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_#ef4444] animate-bounce" />

                  {/* Scanned Success Feedback Animation */}
                  {scannedResult && (
                    <div className="absolute inset-0 bg-emerald-600/90 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-in zoom-in-95 duration-200">
                      <CheckCircle2 className="w-12 h-12 text-white mb-2 animate-bounce" />
                      <p className="font-extrabold text-sm tracking-wider">BERHASIL TERDETEKSI!</p>
                      <p className="text-xs font-mono font-bold bg-white/20 px-3 py-1 rounded-full mt-1">
                        {scannedResult}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Camera Action Buttons (Flashlight) */}
              <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                <button
                  onClick={toggleTorch}
                  title="Flashlight"
                  className={`p-2.5 rounded-full backdrop-blur-md transition-all ${
                    torchOn ? 'bg-amber-400 text-slate-900' : 'bg-black/60 text-white/80 hover:text-white'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Action Controls & Alternative Options */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/90 space-y-3">
          {/* Quick Demo Action: Scan Example Order */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span className="flex items-center gap-1 font-medium">
              <QrCode className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Scan QR di struk nota cetak atau HP
            </span>
            <button
              onClick={() => handleDetectedCode('LH-KMG-2610-001')}
              className="text-teal-600 dark:text-teal-400 hover:underline font-semibold"
            >
              Coba Nota Demo
            </button>
          </div>

          {/* Form Manual Invoice Input */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Atau ketik nomor nota (misal LH-KMG-2610-004)"
                value={manualInvoice}
                onChange={(e) => setManualInvoice(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              type="submit"
              disabled={!manualInvoice.trim()}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Cari
            </button>
          </form>

          {/* Upload QR Image Fallback */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <label className="cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-2">
              <Upload className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Unggah Gambar / Foto QR</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isProcessingFile}
              />
            </label>
            {isProcessingFile && (
              <span className="text-[11px] text-teal-600 font-medium animate-pulse">
                Memproses gambar...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
