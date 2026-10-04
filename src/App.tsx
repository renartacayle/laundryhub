import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { RoleSwitcherBar } from './components/RoleSwitcherBar';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav, MobileTab } from './components/BottomNav';
import { MobileSettingsView } from './components/MobileSettingsView';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { KasirPOS } from './pages/KasirPOS';
import { ProduksiKanban } from './pages/ProduksiKanban';
import { KurirDashboard } from './pages/KurirDashboard';
import { PelangganPortal } from './pages/PelangganPortal';
import { AgenDropshipDashboard } from './pages/AgenDropshipDashboard';
import { LiveSocialProofToast } from './components/LiveSocialProofToast';
import { StickyConversionBar } from './components/StickyConversionBar';
import { LandingPageModal } from './components/LandingPageModal';
import { IntroductionModal } from './components/IntroductionModal';

const MainLayout: React.FC = () => {
  const { currentRole, setCurrentRole } = useApp();

  // Active sub-tab state for Desktop Sidebar
  const [activeTab, setActiveTab] = useState<string>('owner-overview');
  // Active mobile tab state for 5-icon bottom navigation
  const [mobileTab, setMobileTab] = useState<MobileTab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as MobileTab;
      if (['stats', 'staff', 'progress', 'kasir', 'settings'].includes(tabParam)) {
        return tabParam;
      }
    }
    return 'stats';
  });

  const [isLandingModalOpen, setIsLandingModalOpen] = useState(false);
  const [isIntroOpen, setIsIntroOpen] = useState(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('nointro')) {
      return false;
    }
    return localStorage.getItem('lh_intro_seen') !== 'true';
  });

  // Global listener to re-open intro anytime
  useEffect(() => {
    const handleOpenIntro = () => setIsIntroOpen(true);
    window.addEventListener('lh_open_intro', handleOpenIntro);
    return () => window.removeEventListener('lh_open_intro', handleOpenIntro);
  }, []);

  // When role changes (e.g. on desktop), switch to default tab for that role
  useEffect(() => {
    switch (currentRole) {
      case 'owner':
        setActiveTab('owner-overview');
        break;
      case 'operator':
        setActiveTab('kasir-pos');
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

  // Synchronize mobile tabs with role & dashboard subtab
  const handleMobileTabChange = (tab: MobileTab) => {
    setMobileTab(tab);
    if (tab === 'stats') {
      setCurrentRole('owner');
      setActiveTab('owner-stats');
    } else if (tab === 'staff') {
      setCurrentRole('owner');
      setActiveTab('owner-staff');
    } else if (tab === 'progress') {
      setCurrentRole('produksi');
      setActiveTab('prod-kanban');
    } else if (tab === 'kasir') {
      setCurrentRole('kasir');
      setActiveTab('kasir-pos');
    } else if (tab === 'settings') {
      setCurrentRole('owner');
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FD] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200 w-full max-w-full overflow-x-hidden">
      {/* Background Glow Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />
      </div>

      {/* Top 1-Click Role Switcher (Hidden on mobile to eliminate clutter) */}
      <RoleSwitcherBar />

      {/* Main Topbar Navigation (With Laundry Photo, Name, and Pindah Laundry on mobile) */}
      <Navbar />

      {/* Content Area with Collapsible Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10 overflow-x-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-x-hidden min-h-[calc(100vh-120px)] w-full max-w-full">
          {/* Mobile Direct 5-Pillar View (md:hidden) */}
          <div className="md:hidden w-full">
            {mobileTab === 'stats' && <OwnerDashboard currentSubTab="owner-stats" />}
            {mobileTab === 'staff' && <OwnerDashboard currentSubTab="owner-staff" />}
            {mobileTab === 'progress' && <ProduksiKanban currentSubTab="prod-kanban" />}
            {mobileTab === 'kasir' && <KasirPOS currentSubTab="kasir-pos" />}
            {mobileTab === 'settings' && <MobileSettingsView />}
          </div>

          {/* Desktop Multi-Role View (hidden md:block) */}
          <div className="hidden md:block w-full">
            {currentRole === 'owner' && <OwnerDashboard currentSubTab={activeTab} />}
            {currentRole === 'operator' && (
              activeTab.startsWith('prod-')
                ? <ProduksiKanban currentSubTab={activeTab} />
                : <KasirPOS currentSubTab={activeTab} />
            )}
            {currentRole === 'agen' && <AgenDropshipDashboard currentSubTab={activeTab} />}
            {currentRole === 'kasir' && <KasirPOS currentSubTab={activeTab} />}
            {currentRole === 'produksi' && <ProduksiKanban currentSubTab={activeTab} />}
            {currentRole === 'kurir' && <KurirDashboard currentSubTab={activeTab} />}
            {currentRole === 'pelanggan' && <PelangganPortal currentSubTab={activeTab} />}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation (5 core icons: Statistik, Karyawan, Progress, Kasir POS, Setting) */}
      <BottomNav
        activeMobileTab={mobileTab}
        setActiveMobileTab={handleMobileTabChange}
      />

      {/* High-Traffic Social Proof Toast (Desktop & Tablet only to avoid mobile clutter) */}
      <div className="hidden sm:block">
        <LiveSocialProofToast onOpenShowcase={() => setIsLandingModalOpen(true)} />
      </div>

      {/* High-Converting Sticky Bottom Conversion Bar (Hidden on mobile to avoid overlapping BottomNav) */}
      <div className="hidden md:block">
        {currentRole !== 'kasir' && (
          <StickyConversionBar onOpenShowcase={() => setIsLandingModalOpen(true)} />
        )}
      </div>

      {/* Landing Page Showcase Modal */}
      <LandingPageModal isOpen={isLandingModalOpen} onClose={() => setIsLandingModalOpen(false)} />

      {/* Interactive Introduction / Onboarding Modal */}
      <IntroductionModal isOpen={isIntroOpen} onClose={() => setIsIntroOpen(false)} />
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
