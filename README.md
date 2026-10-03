# LAUNDRYHUB — Unified Laundry Management Ecosystem

Aplikasi web & mobile responsif modern all-in-one untuk manajemen usaha laundry terpadu (tanpa aplikasi terpisah). Menyatukan 5 peran pengguna ke dalam **satu platform terintegrasi**:
1. 👑 **Owner** (Aksen Emas / Amber)
2. 🖥️ **Kasir POS** (Aksen Cyan / Sky)
3. 🧺 **Produksi Workshop** (Aksen Orange)
4. 🛵 **Kurir Delivery** (Aksen Violet / Purple)
5. 👤 **Pelanggan Member** (Aksen Emerald / Mint)

---

## 🚀 Fitur Unggulan

### 1. 1-Click Role Switcher Bar
Bilah switch role interaktif di bagian atas aplikasi untuk mendemokan atau berpindah peran (Owner, Kasir, Produksi, Kurir, Pelanggan) secara instan tanpa perlu logout/login ulang.

### 2. POS Kasir Kecepatan Tinggi
- Penimbangan kiloan manual & tombol preset bobot (3kg, 5kg, 7kg, 10kg, 15kg).
- Layanan Kiloan (Cuci Kering, Cuci Setrika, Setrika Saja, Express 4 Jam +50%).
- Layanan Satuan & Dry Clean (Bed Cover, Jas/Blazer, Sneakers, Tas, Gaun Kebaya, Boneka).
- Pilihan aroma parfum (Sakura Blossom, Sweet Lavender, Ocean Fresh, Snappy Red, Fresh Baby, Akasia Woody).
- Keranjang belanja, diskon manual, dan multi-pembayaran (Tunai + kalkulator kembalian, QRIS Dinamis dengan timer, Transfer Bank, Saldo Deposit Pelanggan, Piutang).
- Cetak Struk Thermal otentik 58/80mm (`window.print()`).
- Generator notifikasi WhatsApp otomatis via `https://wa.me/` dengan template pesan siap kirim.

### 3. Dashboard Owner & Eksekutif
- Laporan finansial omzet, beban operasional, dan laba bersih dengan grafik interaktif Recharts.
- Komparasi 3 outlet (Kemang Pusat, Bintaro Sektor 7, Tebet).
- Monitoring stok bahan baku (Deterjen, Parfum, Plastik Jinjing, Hanger) dengan alert stok menipis.
- Perhitungan komisi karyawan otomatis per kilogram dan per potong pakaian.
- Saldo token koin dengan modal top-up instan (1 nota = potong 1 koin).
- Audit log forensik aktivitas sistem.

### 4. Kanban Produksi (Workshop)
- Workflow 6 status alur: `Antrean` → `Cuci` → `Kering` → `Setrika` → `Packing` → `Siap Ambil/Diantar`.
- Drag & Drop dan tombol 1-klik lanjut alur.
- Timestamp dan nama PIC (karyawan aktif) tercatat otomatis di setiap tahapan.
- Sambungan langsung ke mesin cuci/pengering IoT.

### 5. IoT Machine Control (Snapbridge Simulator)
- Panel kendali 5 unit mesin (3 Washer + 2 Dryer).
- **Anti-Fraud Shield**: Mesin cuci/pengering hanya dapat diaktifkan jika terdapat Order ID valid yang sesuai statusnya.
- Timer hitung mundur (*live countdown*) detik per detik dan indikator kWh energi listrik.

### 6. Dashboard Kurir
- Antrean penjemputan (*pickup*) dan pengantaran (*delivery*).
- Simulasi peta rute GPS dan waypoint koordinat.
- Alur status kurir (*Dijemput* → *Dalam Perjalanan* → *Diantar* → *Selesai*).
- Modal konfirmasi pembayaran COD tunai di tempat.

### 7. Portal Pelanggan (Member)
- Live tracking status cucian dengan progress bar bertahap.
- Dompet saldo deposit dan poin loyalitas (tukar voucher hadiah).
- Unduh dan cetak ulang nota digital.
- Formulir pemesanan penjemputan cucian ke rumah.

---

## 🛠️ Stack Teknologi
- **Frontend Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Glassmorphism + Gradient Palette
- **Icons**: Lucide React
- **Data Visualizations**: Recharts
- **Celebration Effects**: Canvas Confetti
- **Storage**: Offline-First LocalStorage Persistence

---

## 💻 Cara Menjalankan Aplikasi
```bash
# Masuk ke direktori
cd /home/rena/.gemini/antigravity/scratch/laundryhub

# Install dependencies (jika belum)
npm install

# Jalankan server development
npm run dev -- --port 3000

# Build untuk produksi
npm run build
```
Buka browser di: `http://localhost:3000`
