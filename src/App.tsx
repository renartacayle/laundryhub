import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { RoleSwitcherBar } from './components/RoleSwitcherBar';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { KasirPOS } from './pages/KasirPOS';
import { ProduksiKanban } from './pages/ProduksiKanban';
import { KurirDashboard } from './pages/KurirDashboard';
import { PelangganPortal } from './pages/PelangganPortal';
import { AgenDropshipDashboard } from './pages/AgenDropshipDashboard';

const MainLayout: React.FC = () => {
  const { currentRole } = useApp();

  // Active sub-tab state
  const [activeTab, setActiveTab] = useState<string>('owner-overview');

  // When role changes, switch to default tab for that role
  useEffect(() => {
    switch (currentRole) {
      case 'owner':
        setActiveTab('owner-overview');
        break;
      case 'agen':
        setActiveTab('agen-pos');
        break;
      case 'kasir':
        setActiveTab('kasir-pos');
        break;
      case 'produksi':
        setActiveTab('prod-kanban');
        break;
      case 'kurir':
        setActiveTab('kurir-tasks');
        break;
      case 'pelanggan':
        setActiveTab('cust-tracking');
        break;
    }
  }, [currentRole]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background Glow Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />
      </div>

      {/* Top 1-Click Role Switcher */}
      <RoleSwitcherBar />

      {/* Main Topbar Navigation */}
      <Navbar />

      {/* Content Area with Collapsible Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-x-hidden min-h-[calc(100vh-130px)]">
          {currentRole === 'owner' && <OwnerDashboard currentSubTab={activeTab} />}
          {currentRole === 'agen' && <AgenDropshipDashboard currentSubTab={activeTab} />}
          {currentRole === 'kasir' && <KasirPOS currentSubTab={activeTab} />}
          {currentRole === 'produksi' && <ProduksiKanban currentSubTab={activeTab} />}
          {currentRole === 'kurir' && <KurirDashboard currentSubTab={activeTab} />}
          {currentRole === 'pelanggan' && <PelangganPortal currentSubTab={activeTab} />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
