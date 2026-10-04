import React, { useState, useEffect } from 'react';
import { ClothesItem } from '../types';
import {
  X,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Shirt,
  Sparkles,
  ClipboardList,
  Trash2,
  Tag,
} from 'lucide-react';

interface ClothesDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialClothes?: ClothesItem[];
  initialNotes?: string;
  orderInvoiceNo?: string;
  orderCustomerName?: string;
  orderWeightKg?: number;
  onSave: (clothes: ClothesItem[], sortingNotes: string, totalPieces: number) => void;
  readOnly?: boolean;
}

// Preset popular garment types with icons
const DEFAULT_PRESETS: { name: string; icon: string; defaultNote?: string }[] = [
  { name: 'Kaos / Kemeja / Baju Atasan', icon: '👕' },
  { name: 'Celana Panjang / Jeans', icon: '👖' },
  { name: 'Celana Pendek / Kolor', icon: '🩳' },
  { name: 'Pakaian Dalam (CD / Bra / Kaos Kaki)', icon: '🩲' },
  { name: 'Gamis / Gaun / Rok', icon: '👗' },
  { name: 'Jaket / Hoodie / Sweater', icon: '🧥' },
  { name: 'Handuk / Kain Lap', icon: '🛁' },
  { name: 'Sprei / Sarung Bantal', icon: '🛏️' },
  { name: 'Lainnya / Item Khusus', icon: '📦' },
];

const DEFECT_CHIPS = [
  'Noda kerah/ketiak',
  'Warna luntur - pisahkan',
  'Kancing lepas 1',
  'Robek kecil di saku',
  'Saku sudah diperiksa bersih',
  'Bahan sutra/halus (cuci lembut)',
  'Kotor lumpur pekat',
];

export const ClothesDetailModal: React.FC<ClothesDetailModalProps> = ({
  isOpen,
  onClose,
  initialClothes = [],
  initialNotes = '',
  orderInvoiceNo,
  orderCustomerName,
  orderWeightKg,
  onSave,
  readOnly = false,
}) => {
  const [items, setItems] = useState<ClothesItem[]>([]);
  const [sortingNotes, setSortingNotes] = useState<string>('');
  const [customItemName, setCustomItemName] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (initialClothes && initialClothes.length > 0) {
        setItems(JSON.parse(JSON.stringify(initialClothes)));
      } else {
        // Initialize with default template (quantities 0)
        setItems(
          DEFAULT_PRESETS.map((p, idx) => ({
            id: `cl-${idx}-${Date.now()}`,
            name: p.name,
            quantity: 0,
            notes: '',
          }))
        );
      }
      setSortingNotes(initialNotes || '');
    }
  }, [isOpen, initialClothes, initialNotes]);

  if (!isOpen) return null;

  const totalPieces = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const handleQuantityChange = (id: string, delta: number) => {
    if (readOnly) return;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = Math.max(0, item.quantity + delta);
          return { ...item, quantity: next };
        }
        return item;
      })
    );
  };

  const handleItemNoteChange = (id: string, note: string) => {
    if (readOnly) return;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes: note } : item))
    );
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName.trim() || readOnly) return;
    setItems((prev) => [
      ...prev,
      {
        id: `cl-cust-${Date.now()}`,
        name: customItemName.trim(),
        quantity: 1,
        notes: '',
      },
    ]);
    setCustomItemName('');
  };

  const handleAddDefectChip = (chip: string) => {
    if (readOnly) return;
    setSortingNotes((prev) => {
      if (!prev.trim()) return chip;
      if (prev.includes(chip)) return prev;
      return `${prev}, ${chip}`;
    });
  };

  const handleSave = () => {
    // Filter items with quantity > 0, or if empty keep whatever has notes
    const activeItems = items.filter((i) => i.quantity > 0 || (i.notes && i.notes.trim() !== ''));
    onSave(activeItems, sortingNotes.trim(), totalPieces);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <ClipboardList className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Rincian Isi Pakaian & Catatan Sortir</span>
                {orderInvoiceNo && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-800 text-amber-300">
                    {orderInvoiceNo}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                {orderCustomerName ? `Pelanggan: ${orderCustomerName}` : 'Catat jumlah helai baju & kondisi awal pakaian pelanggan'}
                {orderWeightKg ? ` • Berat: ${orderWeightKg} kg` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Quick Counter Summary Banner */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Shirt className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="text-xs text-slate-400 block font-medium">Total Helai Pakaian Tercatat:</span>
                <span className="text-xl font-black text-indigo-300 font-mono">
                  {totalPieces} Pcs / Helai
                </span>
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              Mencegah komplain pakaian tertukar atau hilang di outlet.
            </div>
          </div>

          {/* List of Garment Items */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
              <span>Jenis & Kategori Pakaian</span>
              <span>Jumlah (Pcs) & Catatan Khusus</span>
            </div>

            <div className="space-y-2 max-h-[38vh] overflow-y-auto pr-1">
              {items.map((item) => {
                const preset = DEFAULT_PRESETS.find((p) => p.name === item.name);
                const icon = preset ? preset.icon : '👔';
                const isSelected = item.quantity > 0;

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-slate-800/80 border-indigo-500/50 shadow-sm'
                        : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2.5 min-w-[180px]">
                        <span className="text-xl shrink-0">{icon}</span>
                        <div>
                          <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {item.name}
                          </div>
                          {item.quantity > 0 && (
                            <span className="text-[10px] text-indigo-400 font-mono font-semibold">
                              {item.quantity} potong
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2">
                        {!readOnly && (
                          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.id, -1)}
                              disabled={item.quantity <= 0}
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-10 text-center font-mono font-bold text-sm text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="p-1 rounded-lg text-indigo-400 hover:text-white hover:bg-indigo-600 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        {readOnly && (
                          <span className="font-mono font-black text-sm text-indigo-300 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
                            {item.quantity} pcs
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Specific Item Note (e.g. "Kemeja putih ada noda kerah") */}
                    {(item.quantity > 0 || item.notes) && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/70 flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <input
                          type="text"
                          disabled={readOnly}
                          value={item.notes || ''}
                          onChange={(e) => handleItemNoteChange(item.id, e.target.value)}
                          placeholder="Catatan khusus (misal: 2 kemeja putih noda kerah, robek di saku, dll)"
                          className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-2.5 py-1 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Custom Garment Input */}
          {!readOnly && (
            <form onSubmit={handleAddCustomItem} className="flex gap-2">
              <input
                type="text"
                value={customItemName}
                onChange={(e) => setCustomItemName(e.target.value)}
                placeholder="+ Tambah jenis pakaian lain (misal: Selimut Bulu, Jas Safari, Topi)"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!customItemName.trim()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-white transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah</span>
              </button>
            </form>
          )}

          {/* Sorting / Defect Notes */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Catatan Pemeriksaan Sortir & Kondisi Awal</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Terekam di nota & portal pelanggan</span>
            </div>

            {/* Quick chips */}
            {!readOnly && (
              <div className="flex flex-wrap gap-1.5">
                {DEFECT_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddDefectChip(chip)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-all hover:border-amber-500/40"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            )}

            <textarea
              rows={2}
              disabled={readOnly}
              value={sortingNotes}
              onChange={(e) => setSortingNotes(e.target.value)}
              placeholder="Contoh: Baju 5 pcs (ada 1 kemeja putih bernoda tinta), celana 3 jeans aman, saku sudah dicek tidak ada uang/tisu..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-amber-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium resize-none disabled:opacity-60"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-slate-400">
            {totalPieces > 0 ? (
              <span className="text-indigo-400 font-bold">
                ✓ {totalPieces} helai pakaian siap disimpan ke sistem
              </span>
            ) : (
              <span className="text-slate-500">
                Pilih atau tambahkan jumlah pakaian di atas
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Tutup
            </button>
            {!readOnly && (
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-glow-cyan transition-all flex items-center gap-1.5 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Rincian Pakaian</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
