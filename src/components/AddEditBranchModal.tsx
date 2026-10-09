import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Branch } from '../types';
import { Store, Building2, MapPin, Phone, Sparkles, Check, X, Image as ImageIcon, Crown } from 'lucide-react';

interface AddEditBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchToEdit?: Branch | null;
}

const PRESET_BRANCH_IMAGES = [
  {
    label: 'Modern Flagship Workshop',
    url: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Industrial Laundry Arcade',
    url: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Eco Laundromat Studio',
    url: 'https://images.unsplash.com/photo-1521656693074-0ef32e80a5d5?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Urban Express Laundry Hub',
    url: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=600&q=80',
  },
];

export const AddEditBranchModal: React.FC<AddEditBranchModalProps> = ({
  isOpen,
  onClose,
  branchToEdit,
}) => {
  const { addBranch, updateBranch, branches } = useApp();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isPusat, setIsPusat] = useState(false);
  const [imageUrl, setImageUrl] = useState(PRESET_BRANCH_IMAGES[0].url);
  const [isCustomImage, setIsCustomImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isEditMode = Boolean(branchToEdit);

  useEffect(() => {
    if (branchToEdit) {
      setName(branchToEdit.name);
      setCode(branchToEdit.code);
      setAddress(branchToEdit.address);
      setPhone(branchToEdit.phone);
      setIsPusat(Boolean(branchToEdit.isPusat));
      setImageUrl(branchToEdit.image || PRESET_BRANCH_IMAGES[0].url);
      setIsCustomImage(
        Boolean(branchToEdit.image && !PRESET_BRANCH_IMAGES.some((p) => p.url === branchToEdit.image))
      );
    } else {
      setName('');
      setCode('');
      setAddress('');
      setPhone('0812-8899-770' + (branches.length + 1));
      setIsPusat(branches.length === 0);
      setImageUrl(PRESET_BRANCH_IMAGES[branches.length % PRESET_BRANCH_IMAGES.length].url);
      setIsCustomImage(false);
    }
    setErrorMsg('');
  }, [branchToEdit, isOpen, branches.length]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditMode && (!code || code.length <= 4)) {
      const generated = val
        .replace(/[^A-Za-z]/g, '')
        .substring(0, 3)
        .toUpperCase();
      setCode(generated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama cabang outlet wajib diisi!');
      return;
    }

    const cleanCode = (code.trim() || name.replace(/[^A-Za-z]/g, '').substring(0, 3)).toUpperCase();

    if (isEditMode && branchToEdit) {
      const res = updateBranch(branchToEdit.id, {
        name: name.trim(),
        code: cleanCode,
        address: address.trim() || 'Alamat cabang belum diatur',
        phone: phone.trim() || '0812-8899-7701',
        isPusat,
        image: imageUrl.trim() || PRESET_BRANCH_IMAGES[0].url,
      });

      if (!res.success) {
        setErrorMsg(res.message);
        return;
      }
    } else {
      const res = addBranch({
        name: name.trim(),
        code: cleanCode,
        address: address.trim() || 'Alamat cabang belum diatur',
        phone: phone.trim() || '0812-8899-7701',
        isPusat,
        image: imageUrl.trim() || PRESET_BRANCH_IMAGES[0].url,
      });

      if (!res.success) {
        setErrorMsg(res.message);
        return;
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-xl bg-slate-900 border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight">
                {isEditMode ? 'Edit Informasi Cabang Outlet' : 'Buka / Tambah Cabang Outlet Baru'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditMode
                  ? 'Perbarui alamat, kontak, atau status cabang outlet'
                  : 'Daftarkan cabang fisik baru untuk ekspansi jaringan laundry Anda'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Nama Cabang & Kode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-amber-400" />
                <span>Nama Cabang Outlet</span>
                <span className="text-rose-400">*</span>
              </label>
              <input
                id="input-branch-name"
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Contoh: LaundryHub Bintaro Sektor 9"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white text-sm placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span>Kode Singkatan</span>
                <span className="text-[10px] text-slate-400">(3-4 huruf)</span>
              </label>
              <input
                id="input-branch-code"
                type="text"
                maxLength={5}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="KMG"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white font-mono font-bold text-sm uppercase placeholder:text-slate-500 text-center"
              />
            </div>
          </div>

          {/* Nomor WhatsApp & Status Pusat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>No. WhatsApp Cabang</span>
              </label>
              <input
                id="input-branch-phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812-8899-7702"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white text-sm placeholder:text-slate-500 font-mono"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label
                htmlFor="input-branch-ispusat"
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  isPusat
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                    : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <input
                  id="input-branch-ispusat"
                  type="checkbox"
                  checked={isPusat}
                  onChange={(e) => setIsPusat(e.target.checked)}
                  className="rounded border-slate-600 text-amber-500 focus:ring-amber-500 w-4 h-4"
                />
                <div className="text-left">
                  <div className="text-xs font-bold flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>Jadikan Cabang Pusat</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Workshop sentral / kantor utama</div>
                </div>
              </label>
            </div>
          </div>

          {/* Alamat Fisik Lengkap */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Alamat Lengkap Outlet</span>
            </label>
            <textarea
              id="input-branch-address"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Contoh: Ruko Bintaro Jaya Sektor 9 Blok H-12, Tangerang Selatan"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white text-sm placeholder:text-slate-500"
            />
          </div>

          {/* Foto Outlet Laundromat */}
          <div className="space-y-2 pt-1 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
                <span>Foto Tampilan Outlet</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomImage(!isCustomImage)}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                {isCustomImage ? 'Pilih Template Foto' : 'Gunakan Custom URL'}
              </button>
            </div>

            {isCustomImage ? (
              <input
                id="input-branch-image-custom"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 focus:border-cyan-500 text-white text-xs font-mono"
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_BRANCH_IMAGES.map((preset, idx) => {
                  const isSelected = imageUrl === preset.url;
                  return (
                    <div
                      key={idx}
                      onClick={() => setImageUrl(preset.url)}
                      className={`relative rounded-xl overflow-hidden border cursor-pointer aspect-video group transition-all ${
                        isSelected
                          ? 'border-amber-500 ring-2 ring-amber-500/50 scale-[1.02]'
                          : 'border-slate-700 opacity-70 hover:opacity-100 hover:border-slate-500'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-1.5">
                        <span className="text-[9px] font-bold text-white truncate">{preset.label}</span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-amber-500 text-slate-950 p-0.5 rounded-full shadow">
                          <Check className="w-3 h-3 font-bold" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Info & Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Multi-cabang terintegrasi kasir POS & stok</span>
            </div>

            <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Batal
              </button>
              <button
                id="btn-save-branch-submit"
                type="submit"
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-extrabold shadow-glow-amber transition-all flex items-center justify-center gap-1.5"
              >
                <Store className="w-4 h-4" />
                <span>{isEditMode ? 'Simpan Perubahan' : 'Luncurkan Cabang Baru'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
