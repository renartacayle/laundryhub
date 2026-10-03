import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DropshipSupplyItem } from '../types';
import {
  TrendingUp,
  DollarSign,
  Package,
  Users,
  AlertTriangle,
  Building2,
  FileText,
  Coins,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  RefreshCw,
  Award,
  Layers,
  BarChart3,
  Calendar,
  CalendarDays,
  Percent,
  Download,
  CheckCircle2,
  Store,
  Truck,
  ShoppingBag,
  UserPlus,
  ExternalLink,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { CoinTopupModal } from '../components/CoinTopupModal';

interface OwnerDashboardProps {
  currentSubTab?: string;
}

// 12 Months Data (2026)
export const MONTHLY_STATS_2026 = [
  { month: 'Januari', code: 'Jan', omzet: 42500000, beban: 16150000, laba: 26350000, margin: 62.0, orders: 840, weightKg: 2890, growthMoM: 0 },
  { month: 'Februari', code: 'Feb', omzet: 45200000, beban: 17176000, laba: 28024000, margin: 62.0, orders: 890, weightKg: 3080, growthMoM: 6.4 },
  { month: 'Maret', code: 'Mar', omzet: 51800000, beban: 19684000, laba: 32116000, margin: 62.0, orders: 1020, weightKg: 3520, growthMoM: 14.6 },
  { month: 'April (Lebaran)', code: 'Apr', omzet: 63500000, beban: 23500000, laba: 40000000, margin: 63.0, orders: 1250, weightKg: 4320, growthMoM: 22.6 },
  { month: 'Mei', code: 'Mei', omzet: 48900000, beban: 18580000, laba: 30320000, margin: 62.0, orders: 960, weightKg: 3310, growthMoM: -23.0 },
  { month: 'Juni', code: 'Jun', omzet: 53200000, beban: 20216000, laba: 32984000, margin: 62.0, orders: 1050, weightKg: 3620, growthMoM: 8.8 },
  { month: 'Juli', code: 'Jul', omzet: 57400000, beban: 21812000, laba: 35588000, margin: 62.0, orders: 1130, weightKg: 3910, growthMoM: 7.9 },
  { month: 'Agustus', code: 'Agu', omzet: 59100000, beban: 22458000, laba: 36642000, margin: 62.0, orders: 1160, weightKg: 4020, growthMoM: 3.0 },
  { month: 'September', code: 'Sep', omzet: 58300000, beban: 22154000, laba: 36146000, margin: 62.0, orders: 1145, weightKg: 3970, growthMoM: -1.4 },
  { month: 'Oktober (Aktif)', code: 'Okt', omzet: 61500000, beban: 23370000, laba: 38130000, margin: 62.0, orders: 1210, weightKg: 4180, growthMoM: 5.5 },
  { month: 'November (Est)', code: 'Nov', omzet: 62800000, beban: 23864000, laba: 38936000, margin: 62.0, orders: 1235, weightKg: 4270, growthMoM: 2.1 },
  { month: 'Desember (Est)', code: 'Des', omzet: 69200000, beban: 25600000, laba: 43600000, margin: 63.0, orders: 1360, weightKg: 4700, growthMoM: 10.2 },
];

// Multi-Year Data (2024, 2025, 2026)
export const YEARLY_STATS = [
  {
    year: '2024',
    omzet: 342500000,
    beban: 137000000,
    laba: 205500000,
    margin: 60.0,
    orders: 7850,
    weightKg: 28400,
    growthYoY: 0,
    kemang: 198000000,
    bintaro: 144500000,
    tebet: 0,
  },
  {
    year: '2025',
    omzet: 512800000,
    beban: 194864000,
    laba: 317936000,
    margin: 62.0,
    orders: 11200,
    weightKg: 40300,
    growthYoY: 49.7,
    kemang: 245000000,
    bintaro: 182800000,
    tebet: 85000000,
  },
  {
    year: '2026 (YTD + Est)',
    omzet: 673400000,
    beban: 255892000,
    laba: 417508000,
    margin: 62.0,
    orders: 13250,
    weightKg: 47790,
    growthYoY: 31.3,
    kemang: 298400000,
    bintaro: 221000000,
    tebet: 154000000,
  },
];

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ currentSubTab = 'owner-overview' }) => {
  const {
    branches,
    orders,
    inventory,
    users,
    auditLogs,
    tokenCoins,
    updateInventoryStock,
    dropshipAgents,
    dropshipSupplies,
    dropshipSupplyOrders,
    withdrawalRequests,
    approveWithdrawal,
    registerDropshipAgent,
    orderDropshipSupplies,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'branches' | 'inventory' | 'staff' | 'audit' | 'dropship' | 'supplies'>(
    currentSubTab === 'owner-stats'
      ? 'stats'
      : currentSubTab === 'owner-branches'
      ? 'branches'
      : currentSubTab === 'owner-inventory'
      ? 'inventory'
      : currentSubTab === 'owner-staff'
      ? 'staff'
      : currentSubTab === 'owner-audit'
      ? 'audit'
      : currentSubTab === 'owner-dropship'
      ? 'dropship'
      : currentSubTab === 'owner-supplies'
      ? 'supplies'
      : 'overview'
  );

  React.useEffect(() => {
    if (currentSubTab === 'owner-stats') setActiveTab('stats');
    else if (currentSubTab === 'owner-branches') setActiveTab('branches');
    else if (currentSubTab === 'owner-inventory') setActiveTab('inventory');
    else if (currentSubTab === 'owner-staff') setActiveTab('staff');
    else if (currentSubTab === 'owner-audit') setActiveTab('audit');
    else if (currentSubTab === 'owner-dropship') setActiveTab('dropship');
    else if (currentSubTab === 'owner-supplies') setActiveTab('supplies');
    else setActiveTab('overview');
  }, [currentSubTab]);

  const [isCoinModalOpen, setIsCoinModalOpen] = useState(false);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');

  // Dropship Modals & Forms
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);
  const [isOrderSuppliesOpen, setIsOrderSuppliesOpen] = useState(false);
  const [agentLinkCopied, setAgentLinkCopied] = useState<string | null>(null);

  const [newAgentForm, setNewAgentForm] = useState({
    name: '',
    ownerName: '',
    phone: '',
    address: '',
    branchId: branches[0]?.id || 'br-kemang',
    commissionPercent: 25,
    bankName: 'BCA',
    accountNumber: '',
    accountName: '',
  });

  const [supplyOrderForm, setSupplyOrderForm] = useState({
    itemId: dropshipSupplies[0]?.id || 'sup-1',
    quantity: 1,
    destinationType: 'branch' as 'branch' | 'agent',
    destinationId: branches[0]?.id || 'br-kemang',
    recipientName: '',
    recipientPhone: '',
    destinationAddress: '',
    cargoCourier: 'JNE Trucking (JTR)',
  });

  const handleRegisterAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentForm.name || !newAgentForm.ownerName || !newAgentForm.phone) {
      alert('Harap lengkapi nama agen, pemilik, dan nomor telepon.');
      return;
    }
    registerDropshipAgent({
      name: newAgentForm.name,
      ownerName: newAgentForm.ownerName,
      phone: newAgentForm.phone,
      address: newAgentForm.address || 'Alamat Mitra',
      branchId: newAgentForm.branchId,
      commissionPercent: Number(newAgentForm.commissionPercent) || 25,
      status: 'active',
      bankAccount: {
        bank: newAgentForm.bankName,
        accountNumber: newAgentForm.accountNumber || '1234567890',
        accountName: newAgentForm.accountName || newAgentForm.ownerName,
      },
    });
    setIsAddAgentOpen(false);
    setNewAgentForm({
      name: '',
      ownerName: '',
      phone: '',
      address: '',
      branchId: branches[0]?.id || 'br-kemang',
      commissionPercent: 25,
      bankName: 'BCA',
      accountNumber: '',
      accountName: '',
    });
  };

  const handleOrderSupplies = (e: React.FormEvent) => {
    e.preventDefault();
    const item = dropshipSupplies.find((s) => s.id === supplyOrderForm.itemId) || dropshipSupplies[0];
    if (!item) return;

    let destName = '';
    let address = supplyOrderForm.destinationAddress;
    let recName = supplyOrderForm.recipientName;
    let recPhone = supplyOrderForm.recipientPhone;

    if (supplyOrderForm.destinationType === 'branch') {
      const b = branches.find((br) => br.id === supplyOrderForm.destinationId);
      destName = b?.name || 'Cabang Workshop';
      if (!address) address = b?.address || '';
      if (!recName) recName = `Admin ${b?.name || 'Cabang'}`;
      if (!recPhone) recPhone = b?.phone || '081299998888';
    } else {
      const a = dropshipAgents.find((ag) => ag.id === supplyOrderForm.destinationId);
      destName = a?.name || 'Mitra Drop Point';
      if (!address) address = a?.address || '';
      if (!recName) recName = a?.ownerName || 'Pemilik Mitra';
      if (!recPhone) recPhone = a?.phone || '081299998888';
    }

    orderDropshipSupplies(
      item.id,
      Number(supplyOrderForm.quantity) || 1,
      destName,
      recName,
      recPhone,
      address,
      supplyOrderForm.cargoCourier
    );

    setIsOrderSuppliesOpen(false);
  };

  // Overview Chart period toggle: 7days vs monthly vs yearly
  const [overviewPeriod, setOverviewPeriod] = useState<'7days' | 'monthly' | 'yearly'>('7days');

  // Stats tab view toggle: monthly vs yearly
  const [statsViewMode, setStatsViewMode] = useState<'monthly' | 'yearly'>('monthly');

  // Aggregated Financial Metrics
  const filteredOrders = selectedBranchFilter === 'all'
    ? orders
    : orders.filter((o) => o.branchId === selectedBranchFilter);

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.finalPrice, 0);
  const totalCompletedOrders = filteredOrders.filter((o) => o.currentStatus === 'selesai').length;
  const totalActiveOrders = filteredOrders.filter((o) => o.currentStatus !== 'selesai').length;
  const estimatedCost = Math.round(totalRevenue * 0.38);
  const estimatedNetProfit = totalRevenue - estimatedCost;

  // Chart Data: 7-Days
  const revenueChartData7Days = [
    { name: 'Senin', omzet: 1250000, laba: 775000, pesanan: 18 },
    { name: 'Selasa', omzet: 1420000, laba: 880400, pesanan: 22 },
    { name: 'Rabu', omzet: 1680000, laba: 1041600, pesanan: 26 },
    { name: 'Kamis', omzet: 1530000, laba: 948600, pesanan: 23 },
    { name: 'Jumat', omzet: 2100000, laba: 1302000, pesanan: 32 },
    { name: 'Sabtu', omzet: 2850000, laba: 1767000, pesanan: 44 },
    { name: 'Minggu', omzet: 3100000, laba: 1922000, pesanan: 48 },
  ];

  // Category Distribution
  const categoryChartData = [
    { name: 'Cuci Kiloan', value: 68, color: '#06b6d4' },
    { name: 'Bed Cover & Selimut', value: 16, color: '#8b5cf6' },
    { name: 'Jas & Formal Dry Clean', value: 9, color: '#f59e0b' },
    { name: 'Sepatu & Tas', value: 7, color: '#10b981' },
  ];

  // Branch Performance
  const branchPerformance = branches.map((branch) => {
    const bOrders = orders.filter((o) => o.branchId === branch.id);
    const rev = bOrders.reduce((sum, o) => sum + o.finalPrice, 0);
    const weight = bOrders.reduce((sum, o) => sum + o.weightKg, 0);
    return {
      id: branch.id,
      name: branch.name,
      code: branch.code,
      ordersCount: bOrders.length,
      revenue: rev,
      totalWeightKg: Number(weight.toFixed(1)),
    };
  });

  const lowStockItems = inventory.filter((i) => i.stock <= i.minStockWarning);

  // Totals for monthly stats
  const totalOmzet2026 = MONTHLY_STATS_2026.reduce((acc, m) => acc + m.omzet, 0);
  const totalLaba2026 = MONTHLY_STATS_2026.reduce((acc, m) => acc + m.laba, 0);
  const totalOrders2026 = MONTHLY_STATS_2026.reduce((acc, m) => acc + m.orders, 0);
  const avgOmzetPerMonth = Math.round(totalOmzet2026 / 12);

  return (
    <div className="space-y-6">
      {/* Top Owner Header & Sub-nav */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow-glow-amber'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Ringkasan Eksekutif</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'stats'
                ? 'bg-amber-500 text-slate-950 shadow-glow-amber'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-amber-500/30'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Statistik Bulanan & Tahunan</span>
          </button>
          <button
            onClick={() => setActiveTab('branches')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'branches'
                ? 'bg-amber-500 text-slate-950 shadow-glow-amber'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Multi-Cabang (3 Outlet)</span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'bg-amber-500 text-slate-950 shadow-glow-amber'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Monitoring Stok ({lowStockItems.length} Alert)</span>
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'staff'
                ? 'bg-amber-500 text-slate-950 shadow-glow-amber'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Karyawan & Komisi</span>
          </button>
          <button
            onClick={() => setActiveTab('dropship')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'dropship'
                ? 'bg-amber-500 text-slate-950 shadow-glow-amber'
                : 'bg-slate-800/80 text-teal-300 hover:bg-slate-800 border border-teal-500/30'
            }`}
          >
            <Store className="w-4 h-4 text-teal-400" />
            <span>Kemitraan Dropship ({dropshipAgents.length} Mitra)</span>
            {withdrawalRequests.filter((w) => w.status === 'pending').length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-rose-500 text-white font-extrabold animate-pulse">
                {withdrawalRequests.filter((w) => w.status === 'pending').length} Payout
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('supplies')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'supplies'
                ? 'bg-amber-500 text-slate-950 shadow-glow-amber'
                : 'bg-slate-800/80 text-cyan-300 hover:bg-slate-800 border border-cyan-500/30'
            }`}
          >
            <Truck className="w-4 h-4 text-cyan-400" />
            <span>Pasokan Dropship B2B</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-amber-500 text-slate-950 shadow-glow-amber'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit Log</span>
          </button>
        </div>

        {/* Branch Filter dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Filter Outlet:</span>
          <select
            value={selectedBranchFilter}
            onChange={(e) => setSelectedBranchFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold"
          >
            <option value="all">Semua Cabang (Konsolidasi)</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="p-4 rounded-2xl glass-card border border-amber-500/30 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Omzet Konsolidasi</span>
                <span className="flex items-center text-emerald-400 font-bold text-[11px]">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +18.4%
                </span>
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                Rp {totalRevenue.toLocaleString('id-ID')}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Total dari {filteredOrders.length} transaksi tercatat
              </div>
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
            </div>

            {/* Estimated Net Profit */}
            <div className="p-4 rounded-2xl glass-card border border-emerald-500/30 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Estimasi Laba Bersih</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                  Margin ~62%
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                Rp {estimatedNetProfit.toLocaleString('id-ID')}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Beban op. deterjen & utilitas ~Rp {estimatedCost.toLocaleString('id-ID')}
              </div>
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
            </div>

            {/* Active vs Completed Orders */}
            <div className="p-4 rounded-2xl glass-card border border-cyan-500/30 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Order Dalam Alur</span>
                <span className="text-cyan-400 font-bold">{totalCompletedOrders} Selesai</span>
              </div>
              <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
                {totalActiveOrders} Pesanan
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Berada di status Cuci, Kering, Setrika, atau Antar
              </div>
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
            </div>

            {/* Token / Coin Balance */}
            <div className="p-4 rounded-2xl glass-card border border-purple-500/30 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Saldo Token Koin</span>
                <button
                  onClick={() => setIsCoinModalOpen(true)}
                  className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[10px] font-bold transition-colors"
                >
                  + Top Up
                </button>
              </div>
              <div className="text-2xl font-black text-purple-400 font-mono mt-1">
                {tokenCoins.toLocaleString('id-ID')}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Mencukupi untuk ~{tokenCoins} nota transaksi lagi
              </div>
              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
            </div>
          </div>

          {/* Low Stock Warning Banner if any */}
          {lowStockItems.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Peringatan: {lowStockItems.length} Bahan Operasional Menipis!
                  </h4>
                  <p className="text-[11px] text-rose-200/80">
                    {lowStockItems.map((i) => `${i.name} (Sisa ${i.stock} ${i.unit})`).join(', ')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('inventory')}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors"
              >
                Lihat & Reorder Stok
              </button>
            </div>
          )}

          {/* Charts Row with Interactive Time Period Switcher */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Revenue Trend Chart */}
            <div className="lg:col-span-8 p-5 rounded-3xl glass-panel border border-slate-800 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {overviewPeriod === '7days' && 'Tren Pendapatan Harian (7 Hari Terakhir)'}
                    {overviewPeriod === 'monthly' && 'Grafik Tren Bulanan (12 Bulan 2026)'}
                    {overviewPeriod === 'yearly' && 'Grafik Pertumbuhan Tahunan (2024 - 2026 YoY)'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {overviewPeriod === '7days' && 'Volume transaksi dan ritme harian outlet'}
                    {overviewPeriod === 'monthly' && 'Performa omzet setiap bulan sepanjang tahun 2026'}
                    {overviewPeriod === 'yearly' && 'Pertumbuhan total revenue multi-tahun'}
                  </p>
                </div>

                {/* Period Pills Toggle */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px]">
                  <button
                    onClick={() => setOverviewPeriod('7days')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      overviewPeriod === '7days'
                        ? 'bg-amber-500 text-slate-950 shadow-glow-amber'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    7 Hari
                  </button>
                  <button
                    onClick={() => setOverviewPeriod('monthly')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      overviewPeriod === 'monthly'
                        ? 'bg-amber-500 text-slate-950 shadow-glow-amber'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    12 Bulan
                  </button>
                  <button
                    onClick={() => setOverviewPeriod('yearly')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      overviewPeriod === 'yearly'
                        ? 'bg-amber-500 text-slate-950 shadow-glow-amber'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Tahunan (YoY)
                  </button>
                </div>
              </div>

              {/* Render Selected Period Chart */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {overviewPeriod === '7days' ? (
                    <AreaChart data={revenueChartData7Days} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="omzetGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis
                        stroke="#64748b"
                        tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                        formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')}`, 'Omzet']}
                      />
                      <Area
                        type="monotone"
                        dataKey="omzet"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#omzetGradient)"
                      />
                    </AreaChart>
                  ) : overviewPeriod === 'monthly' ? (
                    <AreaChart data={MONTHLY_STATS_2026} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="monthGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="code" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis
                        stroke="#64748b"
                        tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                        formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')}`, 'Omzet Bulanan']}
                      />
                      <Area
                        type="monotone"
                        dataKey="omzet"
                        stroke="#06b6d4"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#monthGradient)"
                      />
                    </AreaChart>
                  ) : (
                    <BarChart data={YEARLY_STATS} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis
                        stroke="#64748b"
                        tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                        formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')}`, 'Omzet Tahunan']}
                      />
                      <Bar dataKey="omzet" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="laba" fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                <span>Klik tab <strong>"Statistik Bulanan & Tahunan"</strong> untuk tabel lengkap & breakdown per cabang.</span>
                <button
                  onClick={() => setActiveTab('stats')}
                  className="text-amber-400 hover:underline font-bold"
                >
                  Buka Laporan Penuh &rarr;
                </button>
              </div>
            </div>

            {/* Service Category Pie Chart */}
            <div className="lg:col-span-4 p-5 rounded-3xl glass-panel border border-slate-800 space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Distribusi Pendapatan Layanan</h3>
                <p className="text-xs text-slate-400">Proporsi Kiloan vs Satuan & Dry Clean</p>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                      formatter={(v: any) => [`${v}%`, 'Pangsa']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                {categoryChartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-300 text-[11px]">{item.name}</span>
                    </div>
                    <span className="font-bold text-white font-mono">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DEDICATED STATISTIK BULANAN & TAHUNAN TAB */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Header Banner & Switcher */}
          <div className="p-5 rounded-3xl glass-panel border border-amber-500/30 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Pusat Statistik & Laporan Keuangan Eksekutif
                  </h3>
                  <p className="text-xs text-slate-400">
                    Analisis performa pendapatan bulanan 2026 dan komparasi pertumbuhan tahunan (YoY)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setStatsViewMode('monthly')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    statsViewMode === 'monthly'
                      ? 'bg-amber-500 text-slate-950 shadow-glow-amber'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Statistik Bulanan (12 Bulan 2026)</span>
                </button>
                <button
                  onClick={() => setStatsViewMode('yearly')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    statsViewMode === 'yearly'
                      ? 'bg-amber-500 text-slate-950 shadow-glow-amber'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>Komparasi Tahunan (YoY: 2024-2026)</span>
                </button>
              </div>

              <button
                onClick={() => {
                  alert('Laporan keuangan berhasil diexport ke format CSV / PDF untuk rekap akuntansi.');
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-colors"
                title="Download Laporan"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Export Laporan</span>
              </button>
            </div>
          </div>

          {/* VIEW A: STATISTIK BULANAN */}
          {statsViewMode === 'monthly' && (
            <div className="space-y-6">
              {/* Monthly Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl glass-card border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Omzet 2026 (YTD + Est)</span>
                  <div className="text-xl font-black text-amber-400 font-mono mt-1">
                    Rp {totalOmzet2026.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-bold">
                    <ArrowUpRight className="w-3 h-3" /> +31.3% vs Tahun 2025
                  </div>
                </div>

                <div className="p-4 rounded-2xl glass-card border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Rata-Rata Omzet / Bulan</span>
                  <div className="text-xl font-black text-cyan-400 font-mono mt-1">
                    Rp {avgOmzetPerMonth.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Dari 12 siklus bulan operasional</div>
                </div>

                <div className="p-4 rounded-2xl glass-card border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Bulan Teramai (Peak Season)</span>
                  <div className="text-xl font-black text-purple-400 mt-1">
                    Desember (Est)
                  </div>
                  <div className="text-[10px] text-amber-300 mt-1 font-mono">
                    Rp 69.200.000 (1.360 nota)
                  </div>
                </div>

                <div className="p-4 rounded-2xl glass-card border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Laba Bersih 2026</span>
                  <div className="text-xl font-black text-emerald-400 font-mono mt-1">
                    Rp {totalLaba2026.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Margin Rata-rata 62.1%</div>
                </div>
              </div>

              {/* Monthly Bar / Area Chart (Omzet vs Beban vs Laba) */}
              <div className="p-5 rounded-3xl glass-panel border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Komposisi Keuangan Bulanan: Omzet, Beban Operasional & Laba</h4>
                    <p className="text-xs text-slate-400">Perbandingan pemasukan kotor terhadap pengeluaran deterjen, listrik, & laba bersih</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-amber-500" />
                      <span className="text-slate-300">Omzet</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-emerald-500" />
                      <span className="text-slate-300">Laba Bersih</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-rose-500" />
                      <span className="text-slate-300">Beban Op.</span>
                    </div>
                  </div>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MONTHLY_STATS_2026} margin={{ top: 15, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="code" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis
                        stroke="#64748b"
                        tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                        formatter={(val: any, name: any) => [
                          `Rp ${Number(val).toLocaleString('id-ID')}`,
                          name === 'omzet' ? 'Omzet' : name === 'laba' ? 'Laba Bersih' : 'Beban Operasional',
                        ]}
                      />
                      <Bar dataKey="omzet" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="laba" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="beban" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Breakdown Table */}
              <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden space-y-2">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">Tabel Rincian Laporan Bulanan (Januari - Desember 2026)</h4>
                  <span className="text-xs text-slate-400">Satuan Mata Uang: Rupiah (IDR)</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/70 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">Bulan</th>
                        <th className="p-3.5">Omzet Kotor</th>
                        <th className="p-3.5">Beban Operasional</th>
                        <th className="p-3.5">Laba Bersih</th>
                        <th className="p-3.5">Margin (%)</th>
                        <th className="p-3.5">Jumlah Nota</th>
                        <th className="p-3.5">Total Bobot</th>
                        <th className="p-3.5 text-right">Pertumbuhan MoM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {MONTHLY_STATS_2026.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5 font-sans font-bold text-white">{m.month}</td>
                          <td className="p-3.5 font-bold text-amber-300">
                            Rp {m.omzet.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3.5 text-rose-300">
                            Rp {m.beban.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3.5 font-bold text-emerald-400">
                            Rp {m.laba.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3.5 text-slate-300">{m.margin}%</td>
                          <td className="p-3.5 text-slate-200">{m.orders} Nota</td>
                          <td className="p-3.5 text-cyan-300">{m.weightKg.toLocaleString()} kg</td>
                          <td className="p-3.5 text-right font-bold">
                            {m.growthMoM === 0 ? (
                              <span className="text-slate-500">-</span>
                            ) : m.growthMoM > 0 ? (
                              <span className="text-emerald-400">+{m.growthMoM}%</span>
                            ) : (
                              <span className="text-rose-400">{m.growthMoM}%</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-950/90 font-mono font-bold text-xs border-t-2 border-slate-700">
                      <tr>
                        <td className="p-3.5 font-sans text-white">TOTAL 2026</td>
                        <td className="p-3.5 text-amber-400">Rp {totalOmzet2026.toLocaleString('id-ID')}</td>
                        <td className="p-3.5 text-rose-400">Rp {(totalOmzet2026 - totalLaba2026).toLocaleString('id-ID')}</td>
                        <td className="p-3.5 text-emerald-400">Rp {totalLaba2026.toLocaleString('id-ID')}</td>
                        <td className="p-3.5 text-white">62.1%</td>
                        <td className="p-3.5 text-white">{totalOrders2026.toLocaleString()} Nota</td>
                        <td className="p-3.5 text-cyan-400">
                          {MONTHLY_STATS_2026.reduce((acc, i) => acc + i.weightKg, 0).toLocaleString()} kg
                        </td>
                        <td className="p-3.5 text-right text-emerald-400">+31.3% YoY</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW B: KOMPARASI TAHUNAN (YoY) */}
          {statsViewMode === 'yearly' && (
            <div className="space-y-6">
              {/* Yearly KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl glass-card border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Pertumbuhan Tahunan (CAGR)</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                    +40.2% / thn
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Ekspansi dari 1 ke 3 cabang outlet</div>
                </div>

                <div className="p-4 rounded-2xl glass-card border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Omzet Akumulatif (3 Thn)</span>
                  <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                    Rp 1.52 Milyar
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Periode tahun 2024 - 2026</div>
                </div>

                <div className="p-4 rounded-2xl glass-card border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Pakaian Dicuci</span>
                  <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
                    116.490 kg
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Setara ~32.300 nota cucian</div>
                </div>

                <div className="p-4 rounded-2xl glass-card border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Ekspansi Outlet Aktif</span>
                  <div className="text-2xl font-black text-purple-400 font-mono mt-1">
                    3 Outlet
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Kemang, Bintaro Sektor 7, & Tebet</div>
                </div>
              </div>

              {/* Multi-Year Branch Contribution Chart */}
              <div className="p-5 rounded-3xl glass-panel border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Komparasi Pertumbuhan Omzet per Cabang (2024 - 2026)</h4>
                    <p className="text-xs text-slate-400">Perkembangan kontribusi pendapatan dari tiap outlet dari tahun ke tahun</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-amber-500" />
                      <span className="text-slate-300">Kemang (Pusat)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-cyan-500" />
                      <span className="text-slate-300">Bintaro Sek. 7</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-purple-500" />
                      <span className="text-slate-300">Tebet</span>
                    </div>
                  </div>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={YEARLY_STATS} margin={{ top: 15, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis
                        stroke="#64748b"
                        tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                        formatter={(val: any, name: any) => [
                          `Rp ${Number(val).toLocaleString('id-ID')}`,
                          name === 'kemang' ? 'Kemang' : name === 'bintaro' ? 'Bintaro' : 'Tebet',
                        ]}
                      />
                      <Bar dataKey="kemang" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="bintaro" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="tebet" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Yearly Table */}
              <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden space-y-2">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">Tabel Evaluasi Kinerja Multi-Tahun</h4>
                  <span className="text-xs text-slate-400">Satuan Mata Uang: Rupiah (IDR)</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/70 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">Tahun</th>
                        <th className="p-3.5">Omzet Konsolidasi</th>
                        <th className="p-3.5">Pertumbuhan YoY</th>
                        <th className="p-3.5">Laba Bersih</th>
                        <th className="p-3.5">Margin (%)</th>
                        <th className="p-3.5">Total Nota</th>
                        <th className="p-3.5">Total Tonase (kg)</th>
                        <th className="p-3.5">Kemang</th>
                        <th className="p-3.5">Bintaro</th>
                        <th className="p-3.5">Tebet</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {YEARLY_STATS.map((y, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5 font-sans font-bold text-white">{y.year}</td>
                          <td className="p-3.5 font-bold text-amber-300">
                            Rp {y.omzet.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3.5 font-bold text-emerald-400">
                            {y.growthYoY === 0 ? '-' : `+${y.growthYoY}%`}
                          </td>
                          <td className="p-3.5 font-bold text-emerald-400">
                            Rp {y.laba.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3.5 text-slate-300">{y.margin}%</td>
                          <td className="p-3.5 text-slate-200">{y.orders.toLocaleString()}</td>
                          <td className="p-3.5 text-cyan-300">{y.weightKg.toLocaleString()} kg</td>
                          <td className="p-3.5 text-slate-300">Rp {(y.kemang / 1000000).toFixed(1)}jt</td>
                          <td className="p-3.5 text-slate-300">Rp {(y.bintaro / 1000000).toFixed(1)}jt</td>
                          <td className="p-3.5 text-slate-300">
                            {y.tebet > 0 ? `Rp ${(y.tebet / 1000000).toFixed(1)}jt` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. MULTI-CABANG TAB */}
      {activeTab === 'branches' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl glass-card border border-slate-700/80">
            <h3 className="text-sm font-bold text-white">Komparasi Performa 3 Cabang Outlet</h3>
            <p className="text-xs text-slate-400">
              Bandingkan omzet penjualan, total tonase cucian, dan volume transaksi per cabang
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {branchPerformance.map((bp) => (
              <div
                key={bp.id}
                className="p-5 rounded-3xl glass-panel border border-slate-700 hover:border-amber-500/50 transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {bp.code}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{bp.name}</h4>
                  <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                    Rp {bp.revenue.toLocaleString('id-ID')}
                  </div>
                  <span className="text-[11px] text-slate-400">Total Omzet Transaksi</span>
                </div>

                <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/60">
                    <span className="text-[10px] text-slate-400 block">Total Pesanan:</span>
                    <span className="font-bold text-white font-mono text-sm">{bp.ordersCount} Nota</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60">
                    <span className="text-[10px] text-slate-400 block">Total Bobot:</span>
                    <span className="font-bold text-cyan-400 font-mono text-sm">{bp.totalWeightKg} kg</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MONITORING STOK TAB */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Monitoring Stok Bahan Baku & Perlengkapan</h3>
              <p className="text-xs text-slate-400">
                Peringatan otomatis saat stok deterjen, parfum, atau plastik jinjing menipis
              </p>
            </div>
            <button
              onClick={() => alert('Fitur reorder bahan baku supplier dikirim ke WhatsApp Purchasing!')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-glow-amber"
            >
              + Reorder Massal ke Supplier
            </button>
          </div>

          <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Nama Barang</th>
                    <th className="p-3.5">Kategori</th>
                    <th className="p-3.5">Outlet Cabang</th>
                    <th className="p-3.5">Sisa Stok</th>
                    <th className="p-3.5">Batas Minimum</th>
                    <th className="p-3.5">Status Alert</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {inventory.map((item) => {
                    const isLow = item.stock <= item.minStockWarning;
                    const branch = branches.find((b) => b.id === item.branchId);
                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-bold text-white">{item.name}</td>
                        <td className="p-3.5 uppercase text-[10px] text-slate-400 font-semibold">
                          {item.category}
                        </td>
                        <td className="p-3.5 text-slate-300">{branch?.name || item.branchId}</td>
                        <td className="p-3.5 font-mono font-bold text-sm">
                          <span className={isLow ? 'text-rose-400' : 'text-emerald-400'}>
                            {item.stock} {item.unit}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400 font-mono">
                          {item.minStockWarning} {item.unit}
                        </td>
                        <td className="p-3.5">
                          {isLow ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 w-max">
                              <AlertTriangle className="w-3 h-3" /> Menipis
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 w-max">
                              Aman
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              const add = prompt(`Tambah stok untuk ${item.name} (jumlah ${item.unit}):`, '10');
                              if (add) {
                                const qty = parseFloat(add);
                                if (!isNaN(qty)) {
                                  updateInventoryStock(item.id, item.stock + qty);
                                }
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                          >
                            + Tambah Stok
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. KARYAWAN & KOMISI TAB */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl glass-card border border-slate-700/80">
            <h3 className="text-sm font-bold text-white">Manajemen Karyawan & Automasi Komisi</h3>
            <p className="text-xs text-slate-400">
              Sistem menghitung komisi secara otomatis per kilogram (cuci/setrika) dan per item pakaian yang selesai dikerjakan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {users.map((u) => {
              const branch = branches.find((b) => b.id === u.branchId);
              return (
                <div
                  key={u.id}
                  className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{u.name}</h4>
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-bold uppercase bg-slate-800 text-slate-300">
                        {u.role}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <div>Penempatan: <strong className="text-slate-300">{branch?.code}</strong></div>
                    <div>Rate Komisi: <span className="font-mono text-cyan-300">Rp {u.commissionRateKg}/kg</span></div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Total Komisi Terakumulasi:</span>
                    <span className="text-xs font-black font-mono text-amber-400">
                      Rp {u.totalCommissionEarned.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. AUDIT LOG TAB */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl glass-card border border-slate-700/80">
            <h3 className="text-sm font-bold text-white">Riwayat Audit Log & Forensik Operasional</h3>
            <p className="text-xs text-slate-400">
              Merekam setiap aktivitas pesanan, perubahan status, penyalaan mesin IoT, dan pengeluaran token
            </p>
          </div>

          <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Waktu</th>
                    <th className="p-3.5">Pelaksana</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Aksi</th>
                    <th className="p-3.5">Detail Aktivitas</th>
                    <th className="p-3.5">Outlet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                      <td className="p-3.5 font-bold text-white whitespace-nowrap">{log.actorName}</td>
                      <td className="p-3.5 uppercase font-bold text-slate-300">{log.actorRole}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-300">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 font-sans text-slate-300 text-xs">{log.details}</td>
                      <td className="p-3.5 text-slate-400 uppercase">{log.branchId.replace('br-', '')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. JARINGAN KEMITRAAN DROPSHIP TAB */}
      {activeTab === 'dropship' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-5 rounded-2xl glass-card border border-teal-500/30 bg-gradient-to-r from-teal-950/40 via-slate-900/60 to-emerald-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  <Store className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Jaringan Kemitraan Dropship Laundry (Mitra Drop Point)
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-500/20 text-teal-300 border border-teal-500/40">
                      Sistem Multi-Titik Tanpa Mesin
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Warung, konter pulsa, dan rumah kost mengumpulkan cucian warga, kurir workshop menjemput secara terjadwal, dan komisi agen 20–30% dihitung otomatis per transaksi.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsAddAgentOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all self-start md:self-center whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Daftarkan Mitra Baru</span>
            </button>
          </div>

          {/* Dropship KPI Metrics */}
          {(() => {
            const totalDropshipOrders = orders.filter((o) => o.isDropship).length;
            const totalDropshipRevenue = orders.filter((o) => o.isDropship).reduce((sum, o) => sum + o.finalPrice, 0);
            const totalDropshipKg = dropshipAgents.reduce((sum, a) => sum + a.totalWeightKg, 0);
            const totalCommissionEarnedAll = dropshipAgents.reduce((sum, a) => sum + a.totalEarned, 0);
            const pendingWithdrawals = withdrawalRequests.filter((w) => w.status === 'pending');
            const pendingWithdrawalAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl glass-card border border-teal-500/30">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Mitra Drop Point Aktif</span>
                    <Store className="w-4 h-4 text-teal-400" />
                  </div>
                  <div className="text-2xl font-black text-teal-300 font-mono mt-1">
                    {dropshipAgents.length} Lokasi
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Terhubung ke workshop Kemang, Bintaro, Tebet
                  </div>
                </div>

                <div className="p-4 rounded-2xl glass-card border border-emerald-500/30">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Omzet dari Agen Dropship</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                    Rp {totalDropshipRevenue.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {totalDropshipOrders} order • {totalDropshipKg.toFixed(1)} kg cucian
                  </div>
                </div>

                <div className="p-4 rounded-2xl glass-card border border-amber-500/30">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Total Komisi Dibayarkan</span>
                    <Coins className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                    Rp {totalCommissionEarnedAll.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Rata-rata bagi hasil 25% untuk mitra
                  </div>
                </div>

                <div className="p-4 rounded-2xl glass-card border border-rose-500/30">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Pengajuan Payout Tertunda</span>
                    <Clock className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-2xl font-black text-rose-400 font-mono mt-1">
                    Rp {pendingWithdrawalAmount.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-rose-300 font-bold mt-1">
                    {pendingWithdrawals.length} permintaan siap transfer
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Section 1: Daftar Mitra Agen Dropship */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Store className="w-4 h-4 text-teal-400" />
                  Daftar Mitra Agen / Drop Point Terdaftar
                </h4>
                <p className="text-xs text-slate-400">
                  Semua outlet tanpa mesin yang bermitra dengan workshop pusat LAUNDRYHUB
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dropshipAgents.map((agent) => {
                const branch = branches.find((b) => b.id === agent.branchId);
                const isCopied = agentLinkCopied === agent.id;

                return (
                  <div
                    key={agent.id}
                    className="p-5 rounded-2xl glass-card border border-slate-700/80 hover:border-teal-500/50 transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm font-bold text-white">{agent.name}</h5>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 uppercase">
                              {agent.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            PIC: <span className="text-slate-200 font-semibold">{agent.ownerName}</span>
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          {agent.commissionPercent}% Komisi
                        </span>
                      </div>

                      <div className="mt-3 space-y-1.5 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{agent.address}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                          <span className="text-slate-400">Workshop Pengampu:</span>
                          <span className="font-semibold text-cyan-300">{branch?.name || agent.branchId}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Rekening Payout:</span>
                          <span className="font-mono text-slate-300">
                            {agent.bankAccount.bank} • {agent.bankAccount.accountNumber} ({agent.bankAccount.accountName})
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                        <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800">
                          <div className="text-[10px] text-slate-400">Total Order</div>
                          <div className="text-xs font-bold text-white mt-0.5">{agent.totalOrdersCount}</div>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800">
                          <div className="text-[10px] text-slate-400">Volume Cucian</div>
                          <div className="text-xs font-bold text-white mt-0.5">{agent.totalWeightKg} kg</div>
                        </div>
                        <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20">
                          <div className="text-[10px] text-teal-400 font-medium">Saldo Dompet</div>
                          <div className="text-xs font-black text-teal-300 mt-0.5">
                            Rp {(agent.walletBalance / 1000).toFixed(0)}k
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                      <a
                        href={`https://wa.me/${agent.phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(
                          agent.ownerName
                        )},%20kami%20dari%20Workshop%20Pusat%20LAUNDRYHUB`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-all"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>WhatsApp PIC</span>
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText?.(
                            `https://laundryhub.app/agen-pos?agentId=${agent.id}`
                          );
                          setAgentLinkCopied(agent.id);
                          setTimeout(() => setAgentLinkCopied(null), 2500);
                        }}
                        className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-all ${
                          isCopied
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border-teal-500/30'
                        }`}
                        title="Salin Link Akses Portal POS Agen"
                      >
                        {isCopied ? <CheckCircle className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Tersalin!' : 'Link POS'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Antrean Pencairan Komisi Mitra */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  Pengajuan Pencairan Komisi Mitra (Withdrawal Settlement)
                </h4>
                <p className="text-xs text-slate-400">
                  Daftar permohonan transfer saldo dompet komisi agen ke rekening bank / e-wallet
                </p>
              </div>
            </div>

            <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/70 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">ID & Waktu</th>
                      <th className="p-3.5">Mitra Agen</th>
                      <th className="p-3.5">Nominal Payout</th>
                      <th className="p-3.5">Rekening Bank Tujuan</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Aksi Owner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {withdrawalRequests.map((req) => {
                      const isPending = req.status === 'pending';
                      return (
                        <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5 whitespace-nowrap">
                            <div className="font-bold text-white">{req.id}</div>
                            <div className="text-[10px] text-slate-400 font-sans">{req.requestedAt}</div>
                          </td>
                          <td className="p-3.5 font-sans whitespace-nowrap">
                            <div className="font-bold text-white">{req.agentName}</div>
                            <div className="text-[10px] text-slate-400">ID Agen: {req.agentId}</div>
                          </td>
                          <td className="p-3.5 font-black text-amber-400 text-xs whitespace-nowrap">
                            Rp {req.amount.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3.5 font-sans">
                            <span className="font-bold text-slate-200">{req.bank}</span> •{' '}
                            <span className="font-mono text-cyan-300">{req.accountNumber}</span>
                            <div className="text-[10px] text-slate-400">a/n {req.accountName}</div>
                          </td>
                          <td className="p-3.5">
                            {isPending ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                                Menunggu Transfer
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                Ditransfer ({req.processedAt?.substring(11, 16) || 'Selesai'})
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right font-sans">
                            {isPending ? (
                              <button
                                onClick={() => approveWithdrawal(req.id)}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 ml-auto"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Transfer Sekarang</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-medium">
                                Lunas via Online Banking
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 3: Skema Operasional & Alur Kemitraan */}
          <div className="p-5 rounded-2xl glass-card border border-slate-800 bg-slate-900/40">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              SOP Alur Bisnis Dropship Laundry Terintegrasi
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px]">1</span>
                  Drop Point Menerima
                </div>
                <p className="text-slate-400 text-[11px]">
                  Warga membawa pakaian ke mitra warung/kos. Agen menimbang berat & input pesanan lewat POS Agen tanpa perlu punya mesin.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-purple-400 font-bold">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px]">2</span>
                  Kurir Pusat Menjemput
                </div>
                <p className="text-slate-400 text-[11px]">
                  Tugas kurir terbit otomatis. Kurir workshop menjemput kantong laundry bermerek invoice barcode menuju workshop pusat.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-orange-400 font-bold">
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center text-[10px]">3</span>
                  Workshop Cuci & Packing
                </div>
                <p className="text-slate-400 text-[11px]">
                  Pusat mencuci, mengeringkan dengan mesin IoT, menyetrika uap, dan membungkus rapi sesuai standar higienis LAUNDRYHUB.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">4</span>
                  Komisi Otomatis Cair
                </div>
                <p className="text-slate-400 text-[11px]">
                  Komisi 25% langsung bertambah di dompet mitra dan 75% masuk ke omzet workshop. Agen dapat mengajukan payout kapan saja.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. MARKETPLACE PASOKAN DROPSHIP B2B TAB */}
      {activeTab === 'supplies' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-5 rounded-2xl glass-card border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-blue-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <Truck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Marketplace Pasokan Grosir B2B Dropship
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      Direct from Manufacturer
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pabrik & supplier resmi mengirim deterjen, parfum, plastik, dan peralatan langsung ke cabang outlet atau titik mitra dropship dengan kargo terpercaya tanpa perlu gudang besar.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOrderSuppliesOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all self-start md:self-center whitespace-nowrap"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>+ Pesan Kargo Pasokan Baru</span>
            </button>
          </div>

          {/* Catalog & Procurement Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl glass-card border border-cyan-500/30">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Katalog Bahan Baku Pabrik</span>
                <Package className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-cyan-300 font-mono mt-1">
                {dropshipSupplies.length} SKU Resmi
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Deterjen, parfum, plastik kemasan & mesin
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-blue-500/30">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Pengiriman Kargo Aktif</span>
                <Truck className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-blue-300 font-mono mt-1">
                {dropshipSupplyOrders.filter((o) => o.status !== 'sampai').length} Resi Berjalan
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                JNE Trucking & SiCepat Cargo
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-emerald-500/30">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Estimasi Penghematan Grosir</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                ~43% Hemat
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Banding harga eceran distributor lokal
              </div>
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-cyan-400" />
              Katalog Pasokan Dropship B2B (Pabrik Langsung ke Cabang / Agen)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dropshipSupplies.map((item) => {
                const savingsPercent = Math.round(
                  ((item.suggestedRetailPrice - item.wholesalePrice) / item.suggestedRetailPrice) * 100
                );

                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl glass-card border border-slate-700/80 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                          {item.category}
                        </span>
                        <span className="text-amber-400 text-xs font-bold flex items-center gap-1">
                          ★ {item.rating}
                        </span>
                      </div>

                      <div className="mt-2.5">
                        <h5 className="text-sm font-bold text-white">{item.name}</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Supplier: <span className="text-slate-300 font-medium">{item.supplierName}</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Pricing Box */}
                      <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs text-slate-400">Harga Pabrik (B2B):</span>
                          <span className="text-base font-black text-cyan-400 font-mono">
                            Rp {item.wholesalePrice.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Harga Normal Eceran:</span>
                          <span className="line-through">
                            Rp {item.suggestedRetailPrice.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
                          <span className="text-emerald-400 font-bold">Hemat Modal: {savingsPercent}%</span>
                          <span className="text-slate-400 font-mono">Min. {item.minOrder} {item.unit}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-cyan-400" />
                        {item.deliveryEstimate}
                      </span>
                      <button
                        onClick={() => {
                          setSupplyOrderForm((prev) => ({
                            ...prev,
                            itemId: item.id,
                            quantity: item.minOrder,
                          }));
                          setIsOrderSuppliesOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs border border-cyan-500/40 transition-all flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Pesan Dropship</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Tracking Kargo Ekspedisi */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-cyan-400" />
              Monitoring Resi Pengiriman Kargo Pasokan Pabrik
            </h4>

            <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/70 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">No Order & Tanggal</th>
                      <th className="p-3.5">Item Pasokan</th>
                      <th className="p-3.5">Kuantiti & Total</th>
                      <th className="p-3.5">Tujuan & Penerima</th>
                      <th className="p-3.5">Kargo & No Resi</th>
                      <th className="p-3.5">Status Pengiriman</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {dropshipSupplyOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="font-bold text-white">{ord.orderNo}</div>
                          <div className="text-[10px] text-slate-400 font-sans">{ord.orderDate}</div>
                        </td>
                        <td className="p-3.5 font-sans whitespace-nowrap">
                          <div className="font-bold text-white">{ord.itemName}</div>
                          <div className="text-[10px] text-slate-400">Est. Tiba: {ord.estimatedArrival}</div>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="font-bold text-slate-300">{ord.quantity} Unit</div>
                          <div className="text-cyan-400 font-bold">Rp {ord.totalPrice.toLocaleString('id-ID')}</div>
                        </td>
                        <td className="p-3.5 font-sans">
                          <div className="font-bold text-white">{ord.destinationBranchOrAgent}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">{ord.destinationAddress}</div>
                          <div className="text-[10px] text-slate-400">PIC: {ord.recipientName} ({ord.recipientPhone})</div>
                        </td>
                        <td className="p-3.5 font-sans whitespace-nowrap">
                          <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-cyan-400" />
                            {ord.cargoCourier}
                          </div>
                          <div className="font-mono text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 mt-1 inline-block">
                            {ord.trackingNumber}
                          </div>
                        </td>
                        <td className="p-3.5">
                          {ord.status === 'sampai' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              Sampai di Lokasi
                            </span>
                          ) : ord.status === 'dikirim' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1 w-max">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                              Sedang Dikirim Kargo
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Diproses Pabrik
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Pendaftaran Mitra Agen Baru */}
      {isAddAgentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">Daftarkan Mitra Agen Drop Point Baru</h3>
              </div>
              <button
                onClick={() => setIsAddAgentOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterAgent} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Nama Titik / Toko Agen</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Drop Point Warung Berkah Bu Siti"
                    value={newAgentForm.name}
                    onChange={(e) => setNewAgentForm({ ...newAgentForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Nama Pemilik / PIC</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Siti Rahmawati"
                    value={newAgentForm.ownerName}
                    onChange={(e) => setNewAgentForm({ ...newAgentForm, ownerName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">No. WhatsApp / HP</label>
                  <input
                    type="tel"
                    required
                    placeholder="0812xxxxxxxx"
                    value={newAgentForm.phone}
                    onChange={(e) => setNewAgentForm({ ...newAgentForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Persentase Komisi (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="50"
                    value={newAgentForm.commissionPercent}
                    onChange={(e) => setNewAgentForm({ ...newAgentForm, commissionPercent: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Alamat Lengkap Titik Drop Point</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Jl. Kemang Timur No. 12, RT 04/RW 03, Jakarta Selatan"
                  value={newAgentForm.address}
                  onChange={(e) => setNewAgentForm({ ...newAgentForm, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Workshop Pusat Pengampu</label>
                <select
                  value={newAgentForm.branchId}
                  onChange={(e) => setNewAgentForm({ ...newAgentForm, branchId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500 font-medium"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.address})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-300">Rekening Bank untuk Pencairan Komisi:</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Bank / E-Wallet</label>
                    <select
                      value={newAgentForm.bankName}
                      onChange={(e) => setNewAgentForm({ ...newAgentForm, bankName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    >
                      <option value="BCA">BCA</option>
                      <option value="Mandiri">Mandiri</option>
                      <option value="BRI">BRI</option>
                      <option value="BNI">BNI</option>
                      <option value="GoPay">GoPay</option>
                      <option value="OVO">OVO</option>
                      <option value="Dana">Dana</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Nomor Rekening</label>
                    <input
                      type="text"
                      placeholder="8820192831"
                      value={newAgentForm.accountNumber}
                      onChange={(e) => setNewAgentForm({ ...newAgentForm, accountNumber: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Atas Nama Rekening</label>
                    <input
                      type="text"
                      placeholder="Siti Rahmawati"
                      value={newAgentForm.accountName}
                      onChange={(e) => setNewAgentForm({ ...newAgentForm, accountName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddAgentOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold shadow-lg shadow-teal-500/20"
                >
                  Simpan Mitra Dropship
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Pesan Pasokan Dropship B2B */}
      {isOrderSuppliesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Order Pasokan Bahan Baku Kargo (Dropship B2B)</h3>
              </div>
              <button
                onClick={() => setIsOrderSuppliesOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOrderSupplies} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Pilih Produk Pasokan Pabrik</label>
                <select
                  value={supplyOrderForm.itemId}
                  onChange={(e) => setSupplyOrderForm({ ...supplyOrderForm, itemId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-bold"
                >
                  {dropshipSupplies.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — Rp {s.wholesalePrice.toLocaleString('id-ID')} / {s.unit} ({s.supplierName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Jumlah Kuantiti</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={supplyOrderForm.quantity}
                    onChange={(e) => setSupplyOrderForm({ ...supplyOrderForm, quantity: Math.max(1, Number(e.target.value)) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Kurir Kargo / Ekspedisi</label>
                  <select
                    value={supplyOrderForm.cargoCourier}
                    onChange={(e) => setSupplyOrderForm({ ...supplyOrderForm, cargoCourier: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="JNE Trucking (JTR)">JNE Trucking (JTR) — Darat</option>
                    <option value="SiCepat Cargo">SiCepat Cargo — Cepat</option>
                    <option value="Dakota Cargo">Dakota Cargo — Ekonomis</option>
                    <option value="Baraka Sarana Tama">Baraka Sarana Tama — Muatan Berat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Tipe Tujuan Pengiriman</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSupplyOrderForm({
                        ...supplyOrderForm,
                        destinationType: 'branch',
                        destinationId: branches[0]?.id || 'br-kemang',
                      })
                    }
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                      supplyOrderForm.destinationType === 'branch'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Cabang Outlet Laundry
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSupplyOrderForm({
                        ...supplyOrderForm,
                        destinationType: 'agent',
                        destinationId: dropshipAgents[0]?.id || 'agent-siti',
                      })
                    }
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                      supplyOrderForm.destinationType === 'agent'
                        ? 'bg-teal-500/20 border-teal-500 text-teal-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Titik Agen Drop Point
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  {supplyOrderForm.destinationType === 'branch' ? 'Pilih Cabang Outlet' : 'Pilih Mitra Agen Dropship'}
                </label>
                <select
                  value={supplyOrderForm.destinationId}
                  onChange={(e) => setSupplyOrderForm({ ...supplyOrderForm, destinationId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-medium"
                >
                  {supplyOrderForm.destinationType === 'branch'
                    ? branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} — {b.address}
                        </option>
                      ))
                    : dropshipAgents.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.ownerName}) — {a.address}
                        </option>
                      ))}
                </select>
              </div>

              {/* Price Calculation Summary */}
              {(() => {
                const item = dropshipSupplies.find((s) => s.id === supplyOrderForm.itemId) || dropshipSupplies[0];
                const totalWholesale = (item ? item.wholesalePrice : 0) * supplyOrderForm.quantity;
                const totalRetailMarket = (item ? item.suggestedRetailPrice : 0) * supplyOrderForm.quantity;
                const savings = totalRetailMarket - totalWholesale;

                return (
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Harga Grosir Pabrik x {supplyOrderForm.quantity} unit:</span>
                      <span className="font-mono text-white">Rp {totalWholesale.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Ongkos Kirim Kargo Terpadu:</span>
                      <span className="text-emerald-400 font-bold">FREE B2B CARGO SUBSIDY</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800 font-bold">
                      <span className="text-white">Total Tagihan Pemesanan:</span>
                      <span className="text-cyan-400 font-mono text-sm">Rp {totalWholesale.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-medium">
                      ★ Anda menghemat Rp {savings.toLocaleString('id-ID')} dibanding pembelian eceran!
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOrderSuppliesOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20"
                >
                  Konfirmasi & Kirim Kargo Dropship
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coin Topup Modal */}
      <CoinTopupModal isOpen={isCoinModalOpen} onClose={() => setIsCoinModalOpen(false)} />
    </div>
  );
};
