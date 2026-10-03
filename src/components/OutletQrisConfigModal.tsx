import React, { useState, useEffect } from 'react';
import { X, Upload, CheckCircle2, Store, Trash2, RefreshCw, AlertCircle, Sparkles, Image as ImageIcon } from 'lucide-react';
import { getOutletQrisConfig, saveOutletQrisConfig, resetOutletQrisConfig, OutletQrisConfig } from '../utils/outletQris';

interface OutletQrisConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchName?: string;
}

export const OutletQrisConfigModal: React.FC<OutletQrisConfigModalProps> = ({
  isOpen,
  onClose,
  branchName,
}) => {
  const [config, setConfig] = useState<OutletQrisConfig>(getOutletQrisConfig());
  const [merchantName, setMerchantName] = useState(config.merchantName);
  const [merchantCity, setMerchantCity] = useState(config.merchantCity);
  const [nmid, setNmid] = useState(config.nmid);
  const [imagePreview, setImagePreview] = useState(config.imageUrl);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getOutletQrisConfig();
      setConfig(current);
      setMerchantName(current.merchantName || branchName || 'LAUNDRYHUB EXPRESS');
      setMerchantCity(current.merchantCity || 'JAKARTA');
      setNmid(current.nmid || 'ID1020023910291');
      setImagePreview(current.imageUrl || '');
      setIsSuccess(false);
    }
  }, [isOpen, branchName]);

  if (!isOpen) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file gambar (PNG, JPG, JPEG, WebP).');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 3 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveOutletQrisConfig({
      merchantName: merchantName.trim() || 'LAUNDRYHUB EXPRESS',
      merchantCity: merchantCity.trim() || 'JAKARTA',
      nmid: nmid.trim() || 'ID1020023910291',
      imageUrl: imagePreview,
      isCustomized: true,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    if (confirm('Kembalikan QRIS ke pengaturan default sistem?')) {
      resetOutletQrisConfig();
      const def = getOutletQrisConfig();
      setMerchantName(def.merchantName);
      setMerchantCity(def.merchantCity);
      setNmid(def.nmid);
      setImagePreview('');
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Pengaturan QRIS Outlet Toko</h3>
              <p className="text-[11px] text-slate-400">Terima pembayaran cucian langsung ke rekening outlet Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Banner */}
        <div className="px-6 pt-4">
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Model 1: Uang Cucian 100% Hak Warung Anda</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Saat pelanggan scan QRIS ini di kasir, uang pembayaran langsung masuk ke rekening bank/e-wallet warung Anda.
              Biaya pemakaian nota (Rp 25 - Rp 50 / nota) dibayar terpisah lewat menu Beli Koin.
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {isSuccess && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>QRIS Outlet berhasil disimpan dan langsung aktif di kasir!</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Nama Merchant / Nama Warung Laundry:
            </label>
            <input
              type="text"
              required
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="Contoh: BERKAH LAUNDRY KEMANG"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Kota Outlet:</label>
              <input
                type="text"
                value={merchantCity}
                onChange={(e) => setMerchantCity(e.target.value)}
                placeholder="Contoh: SEMARANG"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">NMID (Opsional):</label>
              <input
                type="text"
                value={nmid}
                onChange={(e) => setNmid(e.target.value)}
                placeholder="ID10200..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* QR Image Upload Section */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              Upload Gambar / Foto QRIS Toko Anda:
            </label>

            {imagePreview ? (
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-700 flex flex-col items-center gap-2.5">
                <div className="w-44 h-44 bg-white rounded-xl p-2 flex items-center justify-center overflow-hidden border border-slate-600">
                  <img
                    src={imagePreview}
                    alt="Preview QRIS Toko"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold transition-colors flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Ganti Gambar</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setImagePreview('')}
                    className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-950/60 group">
                <div className="p-3 rounded-full bg-slate-800 group-hover:bg-emerald-500/20 text-slate-400 group-hover:text-emerald-400 transition-colors mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="font-bold text-white text-xs block">
                  Pilih file gambar QRIS toko Anda
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  Screenshot dari BCA, Mandiri, GoPay, ShopeePay, OVO, Dana, dll (PNG / JPG maks 3MB)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition-all shadow-glow-emerald flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan QRIS Outlet</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset ke Default</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
