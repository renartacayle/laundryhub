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
import { DemoTutorialModal } from './components/DemoTutorialModal';
import { TutorialGuideBanner } from './components/TutorialGuideBanner';
import { OrderStatusModal } from './components/OrderStatusModal';
import { QrScannerModal } from './components/QrScannerModal';
import { StaffAttendanceModal } from './components/StaffAttendanceModal';
import { DopaminePaydayModal } from './components/DopaminePaydayModal';
import { AiGarmentScannerModal } from './components/AiGarmentScannerModal';
import { PromoGamificationModal } from './components/PromoGamificationModal';
import { WhatsAppBotModal } from './components/WhatsAppBotModal';
import { SalarySlipModal } from './components/SalarySlipModal';

const MainLayout: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    activeTutorial,
    tutorialStep,
    isDemoTutorialModalOpen,
    setIsDemoTutorialModalOpen,
    activeGmailAccount,
    orders,
    trackingModalOrder,
    openTrackingModal,
    closeTrackingModal,
    isQrScannerOpen,
    setIsQrScannerOpen,
    isAttendanceModalOpen,
    setIsAttendanceModalOpen,
    isDopaminePaydayOpen,
    closeDopaminePayday,
    dopaminePaydayStaffId,
    isAiScannerOpen,
    setIsAiScannerOpen,
    aiScannerTargetOrderId,
    isGamificationModalOpen,
    setIsGamificationModalOpen,
    isWhatsAppBotOpen,
    setIsWhatsAppBotOpen,
    whatsAppBotOrder,
    isSalarySlipModalOpen,
    closeSalarySlipModal,
    salarySlipStaffId,
  } = useApp();

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

  // Auto-open OrderStatusModal if URL query param ?nota= or ?invoice= is provided
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const notaQuery = params.get('nota') || params.get('invoice');
      if (notaQuery) {
        openTrackingModal(notaQuery);
      }
    }
  }, [orders]);

  // Auto-prompt Demo Tutorial on initial visit if guest
  useEffect(() => {
    const tutorialSeen = localStorage.getItem('lh_demo_tutorial_seen');
    if (!tutorialSeen && !activeGmailAccount) {
      setIsDemoTutorialModalOpen(true);
      localStorage.setItem('lh_demo_tutorial_seen', 'true');
    }
  }, [activeGmailAccount, setIsDemoTutorialModalOpen]);

  // Synchronize step-by-step interactive tutorial with tabs and roles
  useEffect(() => {
    if (!activeTutorial) return;

    if (activeTutorial === 'owner') {
      setCurrentRole('owner');
      if (tutorialStep === 0) {
        setActiveTab('owner-overview');
        setMobileTab('stats');
      } else if (tutorialStep === 1) {
        setActiveTab('owner-staff');
        setMobileTab('staff');
      } else if (tutorialStep === 2) {
        setActiveTab('owner-overview');
        setMobileTab('progress');
      } else if (tutorialStep === 3) {
        setActiveTab('owner-overview');
        setMobileTab('stats');
      } else if (tutorialStep === 4) {
        setActiveTab('owner-overview');
        setMobileTab('stats');
      }
    } else if (activeTutorial === 'pekerja') {
      if (tutorialStep === 0) {
        setCurrentRole('kasir');
        setActiveTab('kasir-pos');
        setMobileTab('kasir');
      } else {
        setCurrentRole('produksi');
        setActiveTab('prod-kanban');
        setMobileTab('progress');
      }
    } else if (activeTutorial === 'pelanggan') {
      setCurrentRole('pelanggan');
      if (tutorialStep <= 2) {
        setActiveTab('cust-tracking');
      } else if (tutorialStep === 3) {
        setActiveTab('cust-history');
      } else if (tutorialStep === 4) {
        setActiveTab('cust-wallet');
      }
    }
  }, [activeTutorial, tutorialStep]);

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

      {/* Top 1-Click Role Switcher (Hidden: fully unified into Sidebar) */}
      <div className="hidden">
        <RoleSwitcherBar />
      </div>

      {/* Main Topbar Navigation (Visible on mobile only; on desktop the unified Sidebar is the single navigation) */}
      <div className="md:hidden">
        <Navbar />
      </div>

      {/* Content Area with Single Unified Left Sidebar on Desktop */}
      <div className="flex-1 flex w-full relative z-10 overflow-x-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-x-hidden min-h-screen w-full max-w-full">
          {/* Mobile Direct View (md:hidden) */}
          <div className="md:hidden w-full">
            {currentRole === 'pelanggan' ? (
              <PelangganPortal currentSubTab={activeTab} />
            ) : currentRole === 'kurir' ? (
              <KurirDashboard currentSubTab={activeTab} />
            ) : currentRole === 'agen' ? (
              <AgenDropshipDashboard currentSubTab={activeTab} />
            ) : (
              <>
                {mobileTab === 'stats' && <OwnerDashboard currentSubTab="owner-stats" />}
                {mobileTab === 'staff' && <OwnerDashboard currentSubTab="owner-staff" />}
                {mobileTab === 'progress' && <ProduksiKanban currentSubTab="prod-kanban" />}
                {mobileTab === 'kasir' && <KasirPOS currentSubTab="kasir-pos" />}
                {mobileTab === 'settings' && <MobileSettingsView />}
              </>
            )}
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

      {/* Floating Step-by-Step Interactive Tutorial Guide Banner */}
      <TutorialGuideBanner />

      {/* Interactive Demo Tutorial Selection Modal (Owner, Pekerja, Pelanggan) */}
      <DemoTutorialModal
        isOpen={isDemoTutorialModalOpen}
        onClose={() => setIsDemoTutorialModalOpen(false)}
      />

      {/* Live Order Status & Tracking Modal (Public Guest, Worker Action, Owner Matrix) */}
      <OrderStatusModal
        isOpen={!!trackingModalOrder}
        onClose={closeTrackingModal}
        order={trackingModalOrder}
      />

      {/* In-App Camera QR Scanner Modal */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
      />

      {/* Staff Online Attendance & Piece-Rate Payroll Modal */}
      <StaffAttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
      />

      {/* Dopamine Payday Jackpot Experience Modal */}
      <DopaminePaydayModal
        isOpen={isDopaminePaydayOpen}
        onClose={closeDopaminePayday}
        staffId={dopaminePaydayStaffId}
      />

      {/* 1. AI Garment & Stain Inspection Scanner Modal */}
      <AiGarmentScannerModal
        isOpen={isAiScannerOpen}
        onClose={() => setIsAiScannerOpen(false)}
        orderId={aiScannerTargetOrderId}
      />

      {/* 2. Owner-Configurable Lucky Spin Wheel & Scratch Card Gamification */}
      <PromoGamificationModal
        isOpen={isGamificationModalOpen}
        onClose={() => setIsGamificationModalOpen(false)}
      />

      {/* 3. WhatsApp Auto-Pilot Bot & Smart Notification Engine */}
      <WhatsAppBotModal
        isOpen={isWhatsAppBotOpen}
        onClose={() => setIsWhatsAppBotOpen(false)}
        order={whatsAppBotOrder}
      />

      {/* 4. Official & Thermal Salary Slip (Nota Gaji Karyawan) */}
      <SalarySlipModal
        isOpen={isSalarySlipModalOpen}
        onClose={closeSalarySlipModal}
        staffId={salarySlipStaffId}
      />
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
