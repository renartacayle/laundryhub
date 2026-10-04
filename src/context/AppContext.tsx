import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  User,
  Customer,
  Branch,
  Order,
  InventoryItem,
  MachineIoT,
  AuditLog,
  CourierTask,
  NotificationItem,
  OrderStatus,
  DropshipAgent,
  DropshipSupplyItem,
  DropshipSupplyOrder,
  WithdrawalRequest,
  StationCommissionRates,
  StationClaim,
  ClothesItem,
  CustomerReview,
  StaffAttendance,
  PayrollSettings,
  StaffSalarySlip,
  WorkerStationStat,
  GamificationSettings,
  AiGarmentInspection,
  DigitalScaleReading,
} from '../types';
import { soundEngine } from '../utils/audio';
import { Language, Translations, translations } from '../utils/i18n';
import { Currency } from '../utils/currency';
import {
  INITIAL_BRANCHES,
  INITIAL_USERS,
  INITIAL_CUSTOMERS,
  ALL_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_MACHINES,
  INITIAL_COURIER_TASKS,
  INITIAL_AUDIT_LOGS,
  INITIAL_DROPSHIP_AGENTS,
  INITIAL_DROPSHIP_SUPPLIES,
  INITIAL_DROPSHIP_SUPPLY_ORDERS,
  INITIAL_WITHDRAWAL_REQUESTS,
  INITIAL_ATTENDANCE,
  DEFAULT_PAYROLL_SETTINGS,
  DEFAULT_GAMIFICATION_SETTINGS,
} from '../data/seedData';

interface AppContextType {
  // Theme & Role
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  currentCustomer: Customer;
  setCurrentCustomer: (customer: Customer) => void;
  currentBranchId: string;
  setCurrentBranchId: (branchId: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  toggleDarkMode: () => void;
  isOnline: boolean;

  // i18n & Multi-Currency
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  t: Translations;

  // Business State
  tokenCoins: number;
  topupCoins: (amount: number) => void;
  branches: Branch[];
  users: User[];
  customers: Customer[];
  orders: Order[];
  inventory: InventoryItem[];
  machines: MachineIoT[];
  courierTasks: CourierTask[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];

  // Dropship Ecosystem State
  dropshipAgents: DropshipAgent[];
  dropshipSupplies: DropshipSupplyItem[];
  dropshipSupplyOrders: DropshipSupplyOrder[];
  withdrawalRequests: WithdrawalRequest[];
  currentAgentId: string;
  setCurrentAgentId: (id: string) => void;
  currentAgent: DropshipAgent;

  // Actions
  createOrder: (order: Omit<Order, 'id' | 'invoiceNo' | 'createdAt' | 'statusTimestamps'>) => Order;
  createAgentDropshipOrder: (orderData: Omit<Order, 'id' | 'invoiceNo' | 'createdAt' | 'statusTimestamps'>, agentId: string) => Order;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, picUser?: User) => void;
  startIotMachine: (machineId: string, orderId: string, durationMinutes?: number) => { success: boolean; message: string };
  stopIotMachine: (machineId: string) => void;
  updateInventoryStock: (itemId: string, newStock: number) => void;
  updateCourierTaskStatus: (taskId: string, status: CourierTask['status'], amountCollected?: number) => void;
  topupCustomerDeposit: (customerId: string, amount: number) => void;
  addCustomer: (customerData: Omit<Customer, 'id' | 'totalOrdersCount'>) => Customer;
  markNotificationRead: (notifId: string) => void;
  resetAllData: () => void;

  // Dropship Actions
  requestAgentWithdrawal: (agentId: string, amount: number) => { success: boolean; message: string };
  approveWithdrawal: (withdrawalId: string) => void;
  registerDropshipAgent: (agentData: Omit<DropshipAgent, 'id' | 'walletBalance' | 'totalEarned' | 'totalOrdersCount' | 'totalWeightKg' | 'createdAt'>) => DropshipAgent;
  orderDropshipSupplies: (
    itemId: string,
    quantity: number,
    destinationBranchOrAgent: string,
    recipientName: string,
    recipientPhone: string,
    destinationAddress: string,
    cargoCourier?: string
  ) => DropshipSupplyOrder;

  // Worker & Gmail Auth Management
  activeGmailAccount: string | null;
  isGoogleAuthModalOpen: boolean;
  setIsGoogleAuthModalOpen: (open: boolean) => void;
  loginWithGmail: (email: string, name?: string, avatar?: string) => { success: boolean; user?: User; role?: Role; message: string };
  logoutGmail: () => void;
  addWorker: (workerData: Omit<User, 'id' | 'totalCommissionEarned'>) => User;
  removeWorker: (userId: string) => void;
  updateWorker: (userId: string, data: Partial<User>) => void;

  // Clothes Detailing & Sortir
  updateOrderClothesDetails: (
    orderId: string,
    clothesDetails: ClothesItem[],
    sortingNotes?: string,
    totalPieces?: number
  ) => void;

  // Multi-Worker Station Claim & Piece-Rate System
  stationRates: StationCommissionRates;
  updateStationRates: (rates: StationCommissionRates) => void;
  claimStationTask: (orderId: string, station: OrderStatus, worker?: User) => void;
  unclaimStationTask: (orderId: string) => void;
  completeStationTask: (
    orderId: string,
    station: OrderStatus,
    worker: User,
    photoProof: string,
    notes?: string,
    clothesDetails?: ClothesItem[],
    sortingNotes?: string
  ) => { success: boolean; commissionEarned: number; message: string };

  // Step-by-Step Interactive Tutorial & Demo System
  activeTutorial: 'owner' | 'pekerja' | 'pelanggan' | null;
  tutorialStep: number;
  startTutorial: (role: 'owner' | 'pekerja' | 'pelanggan') => void;
  nextTutorialStep: () => void;
  prevTutorialStep: () => void;
  exitTutorial: () => void;
  isDemoTutorialModalOpen: boolean;
  setIsDemoTutorialModalOpen: (open: boolean) => void;

  // Live Tracking & Order Status Modal (Guest, Worker, Owner)
  trackingModalOrder: Order | null;
  openTrackingModal: (invoiceOrId: string) => void;
  closeTrackingModal: () => void;

  // Camera QR Scanner Modal
  isQrScannerOpen: boolean;
  setIsQrScannerOpen: (open: boolean) => void;

  // Dopamine Customer Review & Rating System
  addOrderReview: (orderId: string, review: CustomerReview) => void;

  // Online Staff Attendance & Payroll System
  attendances: StaffAttendance[];
  payrollSettings: PayrollSettings;
  updatePayrollSettings: (settings: PayrollSettings) => void;
  recordClockIn: (
    userId: string,
    selfieUrl?: string,
    notes?: string,
    gpsData?: {
      latitude: number;
      longitude: number;
      distanceMeters: number;
      gpsAccuracy: number;
      isGpsVerified: boolean;
      locationAddress?: string;
    }
  ) => { success: boolean; message: string };
  recordClockOut: (userId: string) => { success: boolean; message: string };
  recordAbsence: (userId: string, date: string, status: 'alpha' | 'izin', notes?: string) => void;
  calculateStaffSalarySlip: (userId: string, period?: string) => StaffSalarySlip;
  isAttendanceModalOpen: boolean;
  setIsAttendanceModalOpen: (open: boolean) => void;

  // Dopamine Payday Jackpot Experience
  isDopaminePaydayOpen: boolean;
  setIsDopaminePaydayOpen: (open: boolean) => void;
  dopaminePaydayStaffId: string | null;
  openDopaminePayday: (staffId?: string) => void;
  closeDopaminePayday: () => void;

  // Salary Slip (Nota Gaji) Modal
  isSalarySlipModalOpen: boolean;
  setIsSalarySlipModalOpen: (open: boolean) => void;
  salarySlipStaffId: string | null;
  openSalarySlipModal: (staffId?: string) => void;
  closeSalarySlipModal: () => void;

  // 1. AI Garment & Stain Scanner
  isAiScannerOpen: boolean;
  setIsAiScannerOpen: (open: boolean) => void;
  aiScannerTargetOrderId: string | null;
  openAiScanner: (orderId?: string) => void;
  saveAiInspection: (orderId: string, inspection: AiGarmentInspection) => void;

  // 2. WhatsApp Auto-Pilot Bot & Notification Engine
  isWhatsAppBotOpen: boolean;
  setIsWhatsAppBotOpen: (open: boolean) => void;
  whatsAppBotOrder: Order | null;
  openWhatsAppBot: (order: Order) => void;

  // 3. Owner Configurable Promo Gamification (Lucky Spin & Scratch Card)
  gamificationSettings: GamificationSettings;
  updateGamificationSettings: (settings: GamificationSettings) => void;
  isGamificationModalOpen: boolean;
  setIsGamificationModalOpen: (open: boolean) => void;
  gamificationContext: { orderId?: string; customerName?: string; finalPrice?: number } | null;
  triggerGamification: (context?: { orderId?: string; customerName?: string; finalPrice?: number }) => void;
  recordOrderSpin: (orderId: string, rewardText: string) => void;
  applyGamificationReward: (orderId: string, rewardText: string, discountAmount?: number) => void;

  // 4. Digital Scale USB / Bluetooth Auto-Read
  digitalScaleReading: DigitalScaleReading;
  readDigitalScale: () => number;
}

export const DEFAULT_STATION_RATES: StationCommissionRates = {
  sortir: 150,
  cuci: 300,
  kering: 200,
  setrika: 400,
  packing: 200,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial from localStorage or seed
  const [currentRole, setCurrentRole] = useState<Role>(() => {
    return (localStorage.getItem('lh_role') as Role) || 'owner';
  });

  const [currentBranchId, setCurrentBranchId] = useState<string>(() => {
    return localStorage.getItem('lh_branch') || 'br-kemang';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('lh_dark') === 'true';
  });

  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('lh_lang') as Language) || 'id';
  });

  const [currency, setCurrency] = useState<Currency>(() => {
    return (localStorage.getItem('lh_currency') as Currency) || 'IDR';
  });

  useEffect(() => {
    localStorage.setItem('lh_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('lh_currency', currency);
  }, [currency]);

  const t = translations[language] || translations.id;

  const [tokenCoins, setTokenCoins] = useState<number>(() => {
    const saved = localStorage.getItem('lh_coins');
    return saved ? parseInt(saved, 10) : 1850;
  });

  const [branches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('lh_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('lh_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('lh_orders');
    return saved ? JSON.parse(saved) : ALL_ORDERS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('lh_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [machines, setMachines] = useState<MachineIoT[]>(() => {
    const saved = localStorage.getItem('lh_machines');
    return saved ? JSON.parse(saved) : INITIAL_MACHINES;
  });

  const [courierTasks, setCourierTasks] = useState<CourierTask[]>(() => {
    const saved = localStorage.getItem('lh_courier_tasks');
    return saved ? JSON.parse(saved) : INITIAL_COURIER_TASKS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('lh_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Dropship states
  const [dropshipAgents, setDropshipAgents] = useState<DropshipAgent[]>(() => {
    const saved = localStorage.getItem('lh_dropship_agents');
    return saved ? JSON.parse(saved) : INITIAL_DROPSHIP_AGENTS;
  });

  const [dropshipSupplies] = useState<DropshipSupplyItem[]>(INITIAL_DROPSHIP_SUPPLIES);

  const [dropshipSupplyOrders, setDropshipSupplyOrders] = useState<DropshipSupplyOrder[]>(() => {
    const saved = localStorage.getItem('lh_dropship_orders');
    return saved ? JSON.parse(saved) : INITIAL_DROPSHIP_SUPPLY_ORDERS;
  });

  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(() => {
    const saved = localStorage.getItem('lh_withdrawals');
    return saved ? JSON.parse(saved) : INITIAL_WITHDRAWAL_REQUESTS;
  });

  const [stationRates, setStationRates] = useState<StationCommissionRates>(() => {
    const saved = localStorage.getItem('lh_station_rates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_STATION_RATES, ...parsed };
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_STATION_RATES;
  });

  const [currentAgentId, setCurrentAgentId] = useState<string>('agent-01');

  const currentAgent = dropshipAgents.find((a) => a.id === currentAgentId) || dropshipAgents[0];

  // Online Staff Attendance & Payroll States
  const [attendances, setAttendances] = useState<StaffAttendance[]>(() => {
    const saved = localStorage.getItem('lh_attendances');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  useEffect(() => {
    localStorage.setItem('lh_attendances', JSON.stringify(attendances));
  }, [attendances]);

  const [payrollSettings, setPayrollSettings] = useState<PayrollSettings>(() => {
    const saved = localStorage.getItem('lh_payroll_settings');
    return saved ? JSON.parse(saved) : DEFAULT_PAYROLL_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('lh_payroll_settings', JSON.stringify(payrollSettings));
  }, [payrollSettings]);

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Stok Deterjen Menipis',
      message: 'Stok Deterjen Liquid Konsentrat di Cabang Kemang tersisa 4.5 jerigen (min: 5).',
      type: 'stock',
      timestamp: '15 menit yang lalu',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Washer #1 Sedang Berjalan',
      message: 'Washer LG Titan berjalan untuk invoice LH-KMG-2610-004.',
      type: 'iot',
      timestamp: '35 menit yang lalu',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Order Dropship Masuk',
      message: 'Mitra Drop Point Warung Berkah input order baru senilai Rp 54.000.',
      type: 'dropship',
      timestamp: '40 menit yang lalu',
      read: false,
    },
    {
      id: 'notif-4',
      title: 'Order Express Masuk',
      message: 'Order kilat LH-KMG-2610-002 (Nadia Saphira) target siap jam 18:40.',
      type: 'order',
      timestamp: '1 jam yang lalu',
      read: true,
    },
  ]);

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Active user selection depending on current role
  const [currentUser, setCurrentUser] = useState<User>(() => {
    return users.find((u) => u.role === currentRole) || users[0];
  });

  // Active customer selection for Member portal
  const [currentCustomer, setCurrentCustomer] = useState<Customer>(() => {
    return customers[0];
  });

  // Sync role to user
  useEffect(() => {
    const matchingUser = users.find((u) => u.role === currentRole);
    if (matchingUser) {
      setCurrentUser(matchingUser);
    }
    localStorage.setItem('lh_role', currentRole);
  }, [currentRole, users]);

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('lh_dark', String(isDarkMode));
  }, [isDarkMode]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('lh_coins', String(tokenCoins));
  }, [tokenCoins]);

  useEffect(() => {
    localStorage.setItem('lh_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('lh_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('lh_machines', JSON.stringify(machines));
  }, [machines]);

  useEffect(() => {
    localStorage.setItem('lh_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('lh_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('lh_courier_tasks', JSON.stringify(courierTasks));
  }, [courierTasks]);

  useEffect(() => {
    localStorage.setItem('lh_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('lh_dropship_agents', JSON.stringify(dropshipAgents));
  }, [dropshipAgents]);

  useEffect(() => {
    localStorage.setItem('lh_dropship_orders', JSON.stringify(dropshipSupplyOrders));
  }, [dropshipSupplyOrders]);

  useEffect(() => {
    localStorage.setItem('lh_withdrawals', JSON.stringify(withdrawalRequests));
  }, [withdrawalRequests]);

  useEffect(() => {
    localStorage.setItem('lh_station_rates', JSON.stringify(stationRates));
  }, [stationRates]);

  // IoT Machine Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setMachines((prevMachines) =>
        prevMachines.map((m) => {
          if (m.status === 'running' && m.timerSecondsLeft > 0) {
            const nextTime = m.timerSecondsLeft - 1;
            if (nextTime === 0) {
              return {
                ...m,
                status: 'completed',
                timerSecondsLeft: 0,
              };
            }
            return {
              ...m,
              timerSecondsLeft: nextTime,
            };
          }
          return m;
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const topupCoins = (amount: number) => {
    setTokenCoins((prev) => prev + amount);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: currentUser.name,
      actorRole: currentRole,
      action: 'TOPUP_COIN',
      details: `Top up saldo token +${amount.toLocaleString()} koin via QRIS SpeedCash (RENARTASHOP)`,
      branchId: currentBranchId,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: '💰 Top Up Koin Berhasil Masuk',
      message: `Dana QRIS masuk ke SpeedCash (RENARTASHOP NMID ID1025407037114). Kuota +${amount.toLocaleString('id-ID')} token aktif.`,
      timestamp: 'Baru saja',
      type: 'payment',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Create Standard Order
  const createOrder = (orderData: Omit<Order, 'id' | 'invoiceNo' | 'createdAt' | 'statusTimestamps'>): Order => {
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);
    const branch = branches.find((b) => b.id === (orderData.branchId || currentBranchId)) || branches[0];
    const orderIndex = orders.length + 1;
    const invoiceNo = `LH-${branch.code}-2610-${String(orderIndex).padStart(3, '0')}`;
    const orderId = `ord-${Date.now()}`;

    // Deduct 1 coin
    setTokenCoins((prev) => Math.max(0, prev - 1));

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      invoiceNo,
      createdAt: dateStr,
      statusTimestamps: {
        antrean: {
          time: dateStr,
          picName: currentUser.name,
          picId: currentUser.id,
        },
      },
    };

    // Calculate staff commission
    if (currentUser.role === 'kasir') {
      const commission =
        newOrder.weightKg * currentUser.commissionRateKg +
        newOrder.itemCount * currentUser.commissionRateItem;
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === currentUser.id
            ? { ...u, totalCommissionEarned: u.totalCommissionEarned + commission }
            : u
        )
      );
    }

    // Customer Loyalty Points: 1 point per 1000 Rp
    const pointsEarned = Math.floor(newOrder.finalPrice / 1000);
    setCustomers((prevCustomers) =>
      prevCustomers.map((c) => {
        if (c.id === newOrder.customerId) {
          const newBal =
            newOrder.paymentMethod === 'deposit'
              ? Math.max(0, c.depositBalance - newOrder.finalPrice)
              : c.depositBalance;
          return {
            ...c,
            depositBalance: newBal,
            loyaltyPoints: c.loyaltyPoints + pointsEarned,
            totalOrdersCount: c.totalOrdersCount + 1,
          };
        }
        return c;
      })
    );

    // Auto-create Courier Task if delivery
    if (newOrder.pickupDeliveryType === 'delivery') {
      const newTask: CourierTask = {
        id: `task-${Date.now()}`,
        orderId: newOrder.id,
        invoiceNo: newOrder.invoiceNo,
        customerName: newOrder.customerName,
        customerPhone: newOrder.customerPhone,
        customerAddress: newOrder.customerAddress || 'Alamat Outlet',
        type: 'delivery',
        status: 'pending',
        amountToCollect: newOrder.paymentStatus === 'lunas' ? 0 : newOrder.finalPrice,
        paymentMethod: newOrder.paymentMethod === 'tunai' ? 'COD (Tunai)' : newOrder.paymentMethod,
        notes: newOrder.specialNotes || 'Kirim saat pesanan selesai dipacking',
        createdAt: dateStr,
      };
      setCourierTasks((prev) => [newTask, ...prev]);
    }

    // Audit Log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: dateStr,
      actorName: currentUser.name,
      actorRole: currentRole,
      action: 'CREATE_ORDER',
      details: `Membuat pesanan baru ${invoiceNo} (${newOrder.customerName}) senilai Rp ${newOrder.finalPrice.toLocaleString('id-ID')}`,
      branchId: branch.id,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setAuditLogs((prev) => [newLog, ...prev]);

    return newOrder;
  };

  // Create Dropship Order (From Agent Drop Point)
  const createAgentDropshipOrder = (
    orderData: Omit<Order, 'id' | 'invoiceNo' | 'createdAt' | 'statusTimestamps'>,
    agentId: string
  ): Order => {
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);
    const agent = dropshipAgents.find((a) => a.id === agentId) || dropshipAgents[0];
    const branch = branches.find((b) => b.id === agent.branchId) || branches[0];
    const orderIndex = orders.length + 1;
    const invoiceNo = `DP-${agent.name.substring(11, 14).toUpperCase()}-2610-${String(orderIndex).padStart(3, '0')}`;
    const orderId = `ord-dp-${Date.now()}`;

    // Agent commission calculation (e.g. 25% of final price)
    const commissionEarned = Math.round(orderData.finalPrice * (agent.commissionPercent / 100));

    // Deduct token
    setTokenCoins((prev) => Math.max(0, prev - 1));

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      invoiceNo,
      branchId: agent.branchId,
      createdAt: dateStr,
      isDropship: true,
      agentId: agent.id,
      agentName: agent.name,
      agentCommission: commissionEarned,
      statusTimestamps: {
        antrean: {
          time: dateStr,
          picName: agent.ownerName,
          picId: agent.id,
        },
      },
    };

    // Credit Agent Wallet Balance!
    setDropshipAgents((prev) =>
      prev.map((a) =>
        a.id === agent.id
          ? {
              ...a,
              walletBalance: a.walletBalance + commissionEarned,
              totalEarned: a.totalEarned + commissionEarned,
              totalOrdersCount: a.totalOrdersCount + 1,
              totalWeightKg: Number((a.totalWeightKg + newOrder.weightKg).toFixed(1)),
            }
          : a
      )
    );

    // Auto-create Pickup Task for Central Courier to pickup from the Drop Point
    const pickupTask: CourierTask = {
      id: `task-dp-${Date.now()}`,
      orderId: newOrder.id,
      invoiceNo: newOrder.invoiceNo,
      customerName: `[Drop Point] ${agent.name}`,
      customerPhone: agent.phone,
      customerAddress: agent.address,
      type: 'pickup',
      status: 'pending',
      amountToCollect: 0,
      paymentMethod: 'Drop Point Batch',
      notes: `Jemput kantong laundry dropship (${newOrder.customerName} - ${newOrder.weightKg} kg) ke workshop pusat`,
      createdAt: dateStr,
      isAgentDropPoint: true,
      agentName: agent.name,
    };
    setCourierTasks((prev) => [pickupTask, ...prev]);

    // Audit Log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: dateStr,
      actorName: agent.ownerName,
      actorRole: 'agen',
      action: 'DROPSHIP_ORDER',
      details: `Mitra ${agent.name} membuat order ${invoiceNo} senilai Rp ${newOrder.finalPrice.toLocaleString('id-ID')} (Komisi agen +Rp ${commissionEarned.toLocaleString('id-ID')})`,
      branchId: agent.branchId,
    };

    // Notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Order Dropship Baru Dibuat',
      message: `${agent.name} mengirimkan order ${invoiceNo} (${newOrder.weightKg} kg) untuk dijemput kurir.`,
      type: 'dropship',
      timestamp: 'Baru saja',
      read: false,
      orderId: newOrder.id,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setAuditLogs((prev) => [newLog, ...prev]);
    setNotifications((prev) => [newNotif, ...prev]);

    return newOrder;
  };

  // Advance Order Status
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, picUser?: User) => {
    const actor = picUser || currentUser;
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);

    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          const updatedTimestamps = {
            ...order.statusTimestamps,
            [newStatus]: {
              time: dateStr,
              picName: actor.name,
              picId: actor.id,
            },
          };

          // Commission logic: if finishing setrika or cuci, credit the production worker!
          if (actor.role === 'produksi' && (newStatus === 'kering' || newStatus === 'packing')) {
            const commission =
              order.weightKg * (actor.commissionRateKg || 300) +
              order.itemCount * (actor.commissionRateItem || 500);
            setUsers((prevUsers) =>
              prevUsers.map((u) =>
                u.id === actor.id
                  ? { ...u, totalCommissionEarned: u.totalCommissionEarned + commission }
                  : u
              )
            );
          }

          return {
            ...order,
            currentStatus: newStatus,
            statusTimestamps: updatedTimestamps,
          };
        }
        return order;
      })
    );

    // Audit log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: dateStr,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'UPDATE_STATUS',
      details: `Order #${orderId} dialihkan ke status ${newStatus.toUpperCase()}`,
      branchId: currentBranchId,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Station Rates & Multi-Worker Piece-Rate Methods
  const updateStationRates = (newRates: StationCommissionRates) => {
    setStationRates(newRates);
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: currentUser.name,
      actorRole: currentRole,
      action: 'UPDATE_STATION_RATES',
      details: `Update tarif borongan station: Cuci Rp ${newRates.cuci}/kg, Kering Rp ${newRates.kering}/kg, Setrika Rp ${newRates.setrika}/kg, Packing Rp ${newRates.packing}/kg`,
      branchId: currentBranchId,
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const claimStationTask = (orderId: string, station: OrderStatus, worker?: User) => {
    const targetWorker = worker || currentUser;
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);

    setOrders((prevOrders) =>
      prevOrders.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            currentClaim: {
              station,
              workerId: targetWorker.id,
              workerName: targetWorker.name,
              claimedAt: dateStr,
            },
          };
        }
        return ord;
      })
    );

    const log: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: dateStr,
      actorName: targetWorker.name,
      actorRole: targetWorker.role,
      action: 'CLAIM_STATION',
      details: `${targetWorker.name} mengklaim pengerjaan station ${station.toUpperCase()} untuk order #${orderId}`,
      branchId: currentBranchId,
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const unclaimStationTask = (orderId: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((ord) => {
        if (ord.id === orderId) {
          const { currentClaim, ...rest } = ord;
          return rest;
        }
        return ord;
      })
    );
  };

  const updateOrderClothesDetails = (
    orderId: string,
    clothesDetails: ClothesItem[],
    sortingNotes?: string,
    totalPieces?: number
  ) => {
    const count = totalPieces ?? clothesDetails.reduce((a, b) => a + (b.quantity || 0), 0);
    setOrders((prevOrders) =>
      prevOrders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            clothesDetails,
            sortingNotes,
            totalPieces: count,
          };
        }
        return o;
      })
    );
  };

  const completeStationTask = (
    orderId: string,
    station: OrderStatus,
    worker: User,
    photoProof: string,
    notes?: string,
    clothesDetails?: ClothesItem[],
    sortingNotes?: string
  ): { success: boolean; commissionEarned: number; message: string } => {
    if (!photoProof || photoProof.trim() === '') {
      return {
        success: false,
        commissionEarned: 0,
        message: 'Foto bukti pengerjaan wajib disertakan sebelum menyelesaikan station!',
      };
    }

    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      return { success: false, commissionEarned: 0, message: 'Pesanan tidak ditemukan' };
    }

    // Sequence for advance (now includes sortir)
    const sequence: OrderStatus[] = ['antrean', 'sortir', 'cuci', 'kering', 'setrika', 'packing', 'siap'];
    const curIdx = sequence.indexOf(station);
    const nextStatus: OrderStatus = curIdx >= 0 && curIdx < sequence.length - 1 ? sequence[curIdx + 1] : 'siap';

    // Calculate commission by station rate
    const ratePerKg = stationRates[station as keyof StationCommissionRates] || 200;
    const rawCommission = order.weightKg > 0
      ? Math.round(order.weightKg * ratePerKg)
      : Math.round(order.itemCount * (ratePerKg * 1.5));
    const commissionEarned = Math.max(500, rawCommission);

    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);

    // Update order with photo proof & clear claim
    setOrders((prevOrders) =>
      prevOrders.map((o) => {
        if (o.id === orderId) {
          const updatedTimestamps = {
            ...o.statusTimestamps,
            [station]: {
              time: dateStr,
              picName: worker.name,
              picId: worker.id,
              photoProof,
              commissionEarned,
              stationNotes: notes,
              claimedAt: o.currentClaim?.claimedAt,
            },
          };
          const { currentClaim, ...rest } = o;

          const updatedClothes = clothesDetails && clothesDetails.length > 0 ? clothesDetails : o.clothesDetails;
          const updatedSortNotes = sortingNotes !== undefined && sortingNotes !== '' ? sortingNotes : (notes || o.sortingNotes);
          const updatedPieces = updatedClothes ? updatedClothes.reduce((a, b) => a + (b.quantity || 0), 0) : o.totalPieces;

          return {
            ...rest,
            currentStatus: nextStatus,
            statusTimestamps: updatedTimestamps,
            ...(updatedClothes ? { clothesDetails: updatedClothes } : {}),
            ...(updatedSortNotes ? { sortingNotes: updatedSortNotes } : {}),
            ...(updatedPieces ? { totalPieces: updatedPieces } : {}),
          };
        }
        return o;
      })
    );

    // Credit commission to worker
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.id === worker.id
          ? { ...u, totalCommissionEarned: (u.totalCommissionEarned || 0) + commissionEarned }
          : u
      )
    );

    // Audit log
    const log: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: dateStr,
      actorName: worker.name,
      actorRole: worker.role,
      action: 'COMPLETE_STATION',
      details: `${worker.name} menyelesaikan station ${station.toUpperCase()} order #${order.invoiceNo} (+Rp ${commissionEarned.toLocaleString('id-ID')}) dengan foto bukti valid`,
      branchId: order.branchId,
    };
    setAuditLogs((prev) => [log, ...prev]);

    // Notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `📸 Bukti Foto ${station.toUpperCase()} Diterima`,
      message: `${worker.name} menyelesaikan ${station.toUpperCase()} untuk #${order.invoiceNo}. Komisi +Rp ${commissionEarned.toLocaleString('id-ID')} masuk saldo.`,
      timestamp: 'Baru saja',
      type: 'order',
      read: false,
      orderId: order.id,
    };
    setNotifications((prev) => [notif, ...prev]);

    return {
      success: true,
      commissionEarned,
      message: `Berhasil menyelesaikan station ${station.toUpperCase()}! Komisi Rp ${commissionEarned.toLocaleString('id-ID')} telah dikreditkan ke ${worker.name}.`,
    };
  };

  // Start IoT Machine (Anti-fraud validation!)
  const startIotMachine = (
    machineId: string,
    orderId: string,
    durationMinutes: number = 45
  ): { success: boolean; message: string } => {
    const machine = machines.find((m) => m.id === machineId);
    if (!machine) return { success: false, message: 'Mesin tidak ditemukan' };

    if (machine.status === 'running') {
      return { success: false, message: 'Mesin sedang beroperasi. Tunggu hingga selesai.' };
    }

    if (machine.status === 'maintenance') {
      return { success: false, message: 'Mesin dalam status perbaikan (Maintenance).' };
    }

    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      return {
        success: false,
        message: 'Anti-Fraud Trigger: Mesin HANYA dapat dinyalakan dengan Order ID yang valid!',
      };
    }

    if (machine.type === 'washer' && order.currentStatus !== 'antrean' && order.currentStatus !== 'cuci') {
      return {
        success: false,
        message: `Anti-Fraud Blokir: Order ${order.invoiceNo} berstatus ${order.currentStatus}, bukan antrean cuci!`,
      };
    }

    if (machine.type === 'dryer' && order.currentStatus !== 'cuci' && order.currentStatus !== 'kering') {
      return {
        success: false,
        message: `Anti-Fraud Blokir: Order ${order.invoiceNo} belum selesai dicuci untuk masuk pengering!`,
      };
    }

    const durationSeconds = durationMinutes * 60;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setMachines((prev) =>
      prev.map((m) =>
        m.id === machineId
          ? {
              ...m,
              status: 'running',
              currentOrderId: order.id,
              currentInvoiceNo: order.invoiceNo,
              totalDurationSeconds: durationSeconds,
              timerSecondsLeft: durationSeconds,
              startedAt: nowStr,
              energyKwh: Number((m.energyKwh + (m.type === 'dryer' ? 2.5 : 1.2)).toFixed(1)),
            }
          : m
      )
    );

    if (machine.type === 'washer' && order.currentStatus === 'antrean') {
      updateOrderStatus(order.id, 'cuci');
    } else if (machine.type === 'dryer' && order.currentStatus === 'cuci') {
      updateOrderStatus(order.id, 'kering');
    }

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: nowStr,
      actorName: currentUser.name,
      actorRole: currentRole,
      action: 'START_IOT_MACHINE',
      details: `Menyalakan ${machine.name} untuk order ${order.invoiceNo} (${durationMinutes} menit)`,
      branchId: machine.branchId,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    return {
      success: true,
      message: `Sukses: Modul Snapbridge IoT mengaktifkan ${machine.name} untuk ${order.invoiceNo}`,
    };
  };

  const stopIotMachine = (machineId: string) => {
    setMachines((prev) =>
      prev.map((m) =>
        m.id === machineId
          ? {
              ...m,
              status: 'idle',
              timerSecondsLeft: 0,
              currentOrderId: undefined,
              currentInvoiceNo: undefined,
            }
          : m
      )
    );
  };

  const updateInventoryStock = (itemId: string, newStock: number) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, stock: newStock } : item))
    );
  };

  const updateCourierTaskStatus = (
    taskId: string,
    status: CourierTask['status'],
    amountCollected?: number
  ) => {
    setCourierTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status,
            completedAt: status === 'completed' ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );

    if (status === 'completed' && currentUser.role === 'kurir') {
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === currentUser.id
            ? { ...u, totalCommissionEarned: u.totalCommissionEarned + 3000 }
            : u
        )
      );
    }
  };

  const topupCustomerDeposit = (customerId: string, amount: number) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, depositBalance: c.depositBalance + amount } : c))
    );
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'totalOrdersCount'>): Customer => {
    const newCust: Customer = {
      ...customerData,
      id: `cst-${Date.now()}`,
      totalOrdersCount: 0,
    };
    setCustomers((prev) => [newCust, ...prev]);
    return newCust;
  };

  const markNotificationRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  // Agent Withdrawal Action
  const requestAgentWithdrawal = (
    agentId: string,
    amount: number
  ): { success: boolean; message: string } => {
    const agent = dropshipAgents.find((a) => a.id === agentId);
    if (!agent) return { success: false, message: 'Data agen tidak ditemukan' };
    if (agent.walletBalance < amount) {
      return { success: false, message: 'Saldo komisi Anda tidak mencukupi untuk penarikan ini.' };
    }

    const newReq: WithdrawalRequest = {
      id: `wd-${Date.now()}`,
      agentId: agent.id,
      agentName: agent.name,
      amount,
      bank: agent.bankAccount.bank,
      accountNumber: agent.bankAccount.accountNumber,
      accountName: agent.bankAccount.accountName,
      status: 'pending',
      requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    // Deduct from agent wallet
    setDropshipAgents((prev) =>
      prev.map((a) => (a.id === agent.id ? { ...a, walletBalance: a.walletBalance - amount } : a))
    );

    setWithdrawalRequests((prev) => [newReq, ...prev]);

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: agent.ownerName,
      actorRole: 'agen',
      action: 'WITHDRAW_REQUEST',
      details: `Permintaan penarikan komisi Rp ${amount.toLocaleString('id-ID')} ke ${agent.bankAccount.bank} ${agent.bankAccount.accountNumber}`,
      branchId: agent.branchId,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    return { success: true, message: `Permintaan pencairan dana Rp ${amount.toLocaleString('id-ID')} berhasil diajukan!` };
  };

  const approveWithdrawal = (withdrawalId: string) => {
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setWithdrawalRequests((prev) =>
      prev.map((w) => (w.id === withdrawalId ? { ...w, status: 'transferred', processedAt: dateStr } : w))
    );

    const req = withdrawalRequests.find((w) => w.id === withdrawalId);
    if (req) {
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: dateStr,
        actorName: currentUser.name,
        actorRole: 'owner',
        action: 'WITHDRAW_APPROVED',
        details: `Pencairan komisi mitra ${req.agentName} sebesar Rp ${req.amount.toLocaleString('id-ID')} telah ditransfer`,
        branchId: currentBranchId,
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }
  };

  const registerDropshipAgent = (
    agentData: Omit<DropshipAgent, 'id' | 'walletBalance' | 'totalEarned' | 'totalOrdersCount' | 'totalWeightKg' | 'createdAt'>
  ): DropshipAgent => {
    const newAgent: DropshipAgent = {
      ...agentData,
      id: `agent-${Date.now()}`,
      walletBalance: 0,
      totalEarned: 0,
      totalOrdersCount: 0,
      totalWeightKg: 0,
      createdAt: new Date().toISOString().substring(0, 10),
    };

    setDropshipAgents((prev) => [newAgent, ...prev]);

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: currentUser.name,
      actorRole: 'owner',
      action: 'REGISTER_AGENT',
      details: `Mendaftarkan mitra drop point baru: ${newAgent.name} (${newAgent.ownerName}) dengan komisi ${newAgent.commissionPercent}%`,
      branchId: newAgent.branchId,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    return newAgent;
  };

  const orderDropshipSupplies = (
    itemId: string,
    quantity: number,
    destinationBranchOrAgent: string,
    recipientName: string,
    recipientPhone: string,
    destinationAddress: string,
    cargoCourier?: string
  ): DropshipSupplyOrder => {
    const item = dropshipSupplies.find((s) => s.id === itemId) || dropshipSupplies[0];
    const total = item.wholesalePrice * quantity;
    const now = new Date();
    const est = new Date();
    est.setDate(est.getDate() + 2);

    const newOrder: DropshipSupplyOrder = {
      id: `so-${Date.now()}`,
      orderNo: `DROPSHIP-SUP-2610-${String(dropshipSupplyOrders.length + 1).padStart(2, '0')}`,
      itemId: item.id,
      itemName: item.name,
      quantity,
      totalPrice: total,
      destinationBranchOrAgent,
      recipientName,
      recipientPhone,
      destinationAddress,
      status: 'diproses',
      trackingNumber: `CARGO-EXP-${Math.floor(100000000 + Math.random() * 900000000)}`,
      cargoCourier: cargoCourier || 'JNE Trucking Cargo',
      orderDate: now.toISOString().replace('T', ' ').substring(0, 19),
      estimatedArrival: est.toISOString().replace('T', ' ').substring(0, 19),
    };

    setDropshipSupplyOrders((prev) => [newOrder, ...prev]);

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: now.toISOString().replace('T', ' ').substring(0, 19),
      actorName: currentUser.name,
      actorRole: currentRole,
      action: 'ORDER_SUPPLIES',
      details: `Memesan pasokan bahan baku dropship ${item.name} (${quantity} ${item.unit}) senilai Rp ${total.toLocaleString('id-ID')} ke ${destinationBranchOrAgent}`,
      branchId: currentBranchId,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    return newOrder;
  };

  const [activeGmailAccount, setActiveGmailAccount] = useState<string | null>(() => {
    return localStorage.getItem('lh_active_gmail');
  });
  const [isGoogleAuthModalOpen, setIsGoogleAuthModalOpen] = useState(false);

  // Sync users to localStorage
  useEffect(() => {
    localStorage.setItem('lh_users', JSON.stringify(users));
  }, [users]);

  // Restore active user from saved Gmail on mount
  useEffect(() => {
    const savedGmail = localStorage.getItem('lh_active_gmail');
    if (savedGmail) {
      const matched = users.find((u) => u.email.toLowerCase() === savedGmail.toLowerCase());
      if (matched) {
        setCurrentUser(matched);
        setCurrentRole(matched.role);
        setCurrentBranchId(matched.branchId);
      }
    }
  }, []);

  const loginWithGmail = (email: string, name?: string, avatar?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const matchedUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (matchedUser) {
      const updatedUser: User = {
        ...matchedUser,
        isGmailLinked: true,
        lastLoginAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        name: name || matchedUser.name,
        avatar: avatar || matchedUser.avatar,
      };

      setUsers((prev) => prev.map((u) => (u.id === matchedUser.id ? updatedUser : u)));
      setCurrentUser(updatedUser);
      setCurrentRole(updatedUser.role);
      setCurrentBranchId(updatedUser.branchId);
      setActiveGmailAccount(cleanEmail);
      localStorage.setItem('lh_active_gmail', cleanEmail);
      localStorage.setItem('lh_role', updatedUser.role);

      const branchName = branches.find((b) => b.id === updatedUser.branchId)?.name || 'LaundryHub';
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        actorName: updatedUser.name,
        actorRole: updatedUser.role,
        action: 'LOGIN_GMAIL',
        details: `Berhasil login via Akun Google (${cleanEmail}) sebagai ${updatedUser.role.toUpperCase()} di ${branchName}`,
        branchId: updatedUser.branchId,
      };
      setAuditLogs((prev) => [newLog, ...prev]);

      return {
        success: true,
        user: updatedUser,
        role: updatedUser.role,
        message: `Selamat datang, ${updatedUser.name}! Anda berhasil login sebagai ${updatedUser.role.toUpperCase()} (${branchName}).`,
      };
    }

    // Unregistered Gmail: login as Pelanggan / Guest member
    setActiveGmailAccount(cleanEmail);
    localStorage.setItem('lh_active_gmail', cleanEmail);
    setCurrentRole('pelanggan');
    localStorage.setItem('lh_role', 'pelanggan');

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: name || cleanEmail.split('@')[0],
      actorRole: 'pelanggan',
      action: 'LOGIN_GMAIL_PELANGGAN',
      details: `Login via Akun Google (${cleanEmail}) ke Portal Pelanggan LaundryHub`,
      branchId: currentBranchId,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    return {
      success: true,
      role: 'pelanggan' as Role,
      message: `Akun Google ${cleanEmail} aktif. Anda masuk sebagai Pelanggan. (Minta Owner untuk mendaftarkan email ini jika Anda staf)`,
    };
  };

  const logoutGmail = () => {
    setActiveGmailAccount(null);
    localStorage.removeItem('lh_active_gmail');
  };

  const addWorker = (workerData: Omit<User, 'id' | 'totalCommissionEarned'>): User => {
    const cleanEmail = workerData.email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error(`Email ${cleanEmail} sudah digunakan oleh staf ${existing.name}!`);
    }

    const newWorker: User = {
      ...workerData,
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      totalCommissionEarned: 0,
      isGmailLinked: true,
      invitedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      avatar: workerData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(workerData.name)}`,
    };

    setUsers((prev) => [...prev, newWorker]);

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'TAMBAH_KARYAWAN_GMAIL',
      details: `Owner mendaftarkan staf baru: ${newWorker.name} (${cleanEmail}) role: ${newWorker.role.toUpperCase()} cabang: ${newWorker.branchId}`,
      branchId: newWorker.branchId,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    return newWorker;
  };

  const removeWorker = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));

    if (target) {
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        actorName: currentUser.name,
        actorRole: currentUser.role,
        action: 'HAPUS_KARYAWAN',
        details: `Owner menghapus akses staf: ${target.name} (${target.email})`,
        branchId: target.branchId,
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }
  };

  const updateWorker = (userId: string, data: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...data } : u)));
  };

  // Step-by-Step Interactive Tutorial & Demo System
  const [activeTutorial, setActiveTutorial] = useState<'owner' | 'pekerja' | 'pelanggan' | null>(() => {
    return (localStorage.getItem('lh_active_tutorial') as any) || null;
  });
  const [tutorialStep, setTutorialStep] = useState<number>(() => {
    const saved = localStorage.getItem('lh_tutorial_step');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isDemoTutorialModalOpen, setIsDemoTutorialModalOpen] = useState(false);

  const startTutorial = (role: 'owner' | 'pekerja' | 'pelanggan') => {
    setActiveTutorial(role);
    setTutorialStep(0);
    localStorage.setItem('lh_active_tutorial', role);
    localStorage.setItem('lh_tutorial_step', '0');

    if (role === 'owner') {
      setCurrentRole('owner');
    } else if (role === 'pekerja') {
      setCurrentRole('kasir');
    } else if (role === 'pelanggan') {
      setCurrentRole('pelanggan');
    }
  };

  const nextTutorialStep = () => {
    setTutorialStep((prev) => {
      const next = Math.min(4, prev + 1);
      localStorage.setItem('lh_tutorial_step', String(next));
      if (activeTutorial === 'pekerja') {
        if (next === 0) setCurrentRole('kasir');
        else setCurrentRole('produksi');
      }
      return next;
    });
  };

  const prevTutorialStep = () => {
    setTutorialStep((prev) => {
      const p = Math.max(0, prev - 1);
      localStorage.setItem('lh_tutorial_step', String(p));
      if (activeTutorial === 'pekerja') {
        if (p === 0) setCurrentRole('kasir');
        else setCurrentRole('produksi');
      }
      return p;
    });
  };

  const exitTutorial = () => {
    setActiveTutorial(null);
    setTutorialStep(0);
    localStorage.removeItem('lh_active_tutorial');
    localStorage.removeItem('lh_tutorial_step');
  };

  // Live Tracking Modal State & Handlers
  const [trackingModalOrder, setTrackingModalOrder] = useState<Order | null>(null);

  // Synchronize trackingModalOrder with latest order data if changed in background
  useEffect(() => {
    if (trackingModalOrder) {
      const updated = orders.find(
        (o) => o.id === trackingModalOrder.id || o.invoiceNo === trackingModalOrder.invoiceNo
      );
      if (updated && updated !== trackingModalOrder) {
        setTrackingModalOrder(updated);
      }
    }
  }, [orders, trackingModalOrder]);

  const openTrackingModal = (invoiceOrId: string) => {
    if (!invoiceOrId) return;
    const clean = invoiceOrId.trim().toLowerCase();
    const exact = orders.find(
      (o) => o.id.toLowerCase() === clean || o.invoiceNo.toLowerCase() === clean
    );
    if (exact) {
      setTrackingModalOrder(exact);
      return;
    }
    const partial = orders.find(
      (o) => o.invoiceNo.toLowerCase().includes(clean) || o.customerName.toLowerCase().includes(clean)
    );
    if (partial) {
      setTrackingModalOrder(partial);
      return;
    }
    if (orders.length > 0) {
      setTrackingModalOrder(orders[0]);
    }
  };

  const closeTrackingModal = () => {
    setTrackingModalOrder(null);
    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      const url = new URL(window.location.href);
      if (url.searchParams.has('nota') || url.searchParams.has('invoice')) {
        url.searchParams.delete('nota');
        url.searchParams.delete('invoice');
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
      }
    }
  };

  // Camera QR Scanner Modal State
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  // Dopamine Customer Review & Rating System
  const addOrderReview = (orderId: string, review: CustomerReview) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId || ord.invoiceNo === orderId) {
          return {
            ...ord,
            customerReview: review,
          };
        }
        return ord;
      })
    );

    // Audio & dopamine reward
    if (review.rating >= 4) {
      soundEngine.playDopamineJackpot();
    } else {
      soundEngine.playStationDing();
    }

    // Add Audit Log
    const newLog: AuditLog = {
      id: `log-review-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: review.customerName || 'Pelanggan',
      actorRole: 'pelanggan',
      action: 'CUSTOMER_REVIEW',
      details: `Ulasan bintang ${review.rating}⭐ untuk nota: "${review.feedbackText || 'Puas'}"${review.staffTipAmount ? ` + Tip Staf Rp ${review.staffTipAmount.toLocaleString('id-ID')}` : ''}`,
      branchId: currentBranchId,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    // If there is staff tip, add notification
    if (review.staffTipAmount && review.staffTipAmount > 0) {
      const notif: NotificationItem = {
        id: `notif-tip-${Date.now()}`,
        title: '🎉 Tip Pelanggan Masuk!',
        message: `${review.customerName} memberikan tip Rp ${review.staffTipAmount.toLocaleString('id-ID')} atas hasil cucian bintang ${review.rating}⭐!`,
        timestamp: 'Baru saja',
        type: 'reward',
        read: false,
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // Online Staff Attendance & Payroll Handlers
  const updatePayrollSettings = (settings: PayrollSettings) => {
    setPayrollSettings(settings);
    soundEngine.playStationDing();
  };

  // Dopamine Payday Jackpot Experience State
  const [isDopaminePaydayOpen, setIsDopaminePaydayOpen] = useState(false);
  const [dopaminePaydayStaffId, setDopaminePaydayStaffId] = useState<string | null>(null);

  const openDopaminePayday = (staffId?: string) => {
    setDopaminePaydayStaffId(staffId || currentUser.id);
    setIsDopaminePaydayOpen(true);
    soundEngine.playPaydayCoinShower();
  };

  const closeDopaminePayday = () => {
    setIsDopaminePaydayOpen(false);
  };

  // Salary Slip (Nota Gaji) Modal State
  const [isSalarySlipModalOpen, setIsSalarySlipModalOpen] = useState(false);
  const [salarySlipStaffId, setSalarySlipStaffId] = useState<string | null>(null);

  const openSalarySlipModal = (staffId?: string) => {
    setSalarySlipStaffId(staffId || currentUser.id);
    setIsSalarySlipModalOpen(true);
  };

  const closeSalarySlipModal = () => {
    setIsSalarySlipModalOpen(false);
    setSalarySlipStaffId(null);
  };

  // 1. AI Garment & Stain Scanner State
  const [isAiScannerOpen, setIsAiScannerOpen] = useState(false);
  const [aiScannerTargetOrderId, setAiScannerTargetOrderId] = useState<string | null>(null);

  const openAiScanner = (orderId?: string) => {
    setAiScannerTargetOrderId(orderId || null);
    setIsAiScannerOpen(true);
    soundEngine.playScanBeep();
  };

  const saveAiInspection = (orderId: string, inspection: AiGarmentInspection) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId || o.invoiceNo === orderId) {
          return {
            ...o,
            aiInspection: inspection,
            sortingNotes: o.sortingNotes
              ? `${o.sortingNotes} | [AI Disclaimer]: ${inspection.disclaimerNote}`
              : `[AI Disclaimer]: ${inspection.disclaimerNote}`,
          };
        }
        return o;
      })
    );
    soundEngine.playStationDing();
  };

  // 2. WhatsApp Auto-Pilot Bot State
  const [isWhatsAppBotOpen, setIsWhatsAppBotOpen] = useState(false);
  const [whatsAppBotOrder, setWhatsAppBotOrder] = useState<Order | null>(null);

  const openWhatsAppBot = (order: Order) => {
    setWhatsAppBotOrder(order);
    setIsWhatsAppBotOpen(true);
  };

  // 3. Owner Configurable Promo Gamification State
  const [gamificationSettings, setGamificationSettings] = useState<GamificationSettings>(() => {
    const saved = localStorage.getItem('lh_gamification_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_GAMIFICATION_SETTINGS,
          ...parsed,
        };
      } catch {
        // fallback
      }
    }
    return DEFAULT_GAMIFICATION_SETTINGS;
  });

  const [isGamificationModalOpen, setIsGamificationModalOpen] = useState(false);
  const [gamificationContext, setGamificationContext] = useState<{
    orderId?: string;
    customerName?: string;
    finalPrice?: number;
  } | null>(null);

  const updateGamificationSettings = (settings: GamificationSettings) => {
    setGamificationSettings(settings);
    localStorage.setItem('lh_gamification_settings', JSON.stringify(settings));
    soundEngine.playStationDing();
  };

  const triggerGamification = (context?: { orderId?: string; customerName?: string; finalPrice?: number }) => {
    if (!gamificationSettings.isEnabled) return;
    if (gamificationSettings.triggerEvent === 'min_spend' && context?.finalPrice) {
      if (context.finalPrice < gamificationSettings.minSpendAmount) return;
    }
    setGamificationContext(context || null);
    setIsGamificationModalOpen(true);
    soundEngine.playSpinClick();
  };

  const recordOrderSpin = (orderId: string, rewardText: string) => {
    if (!orderId) return;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId || o.invoiceNo === orderId) {
          return {
            ...o,
            hasClaimedGamification: true,
            gamificationRewardClaimed: rewardText,
            gamificationClaimedAt: nowStr,
            appliedPromoReward: rewardText,
          };
        }
        return o;
      })
    );
  };

  const applyGamificationReward = (orderId: string, rewardText: string, discountAmount?: number) => {
    if (!orderId) return;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId || o.invoiceNo === orderId) {
          const discount = discountAmount || 0;
          const newFinalPrice = Math.max(0, o.finalPrice - discount);
          return {
            ...o,
            hasClaimedGamification: true,
            gamificationRewardClaimed: rewardText,
            gamificationClaimedAt: o.gamificationClaimedAt || nowStr,
            appliedPromoReward: rewardText,
            discount: o.discount + discount,
            finalPrice: newFinalPrice,
          };
        }
        return o;
      })
    );
    soundEngine.playCashChime();
  };

  // 4. Digital Scale Auto-Read State
  const [digitalScaleReading, setDigitalScaleReading] = useState<DigitalScaleReading>({
    weightKg: 4.85,
    isStable: true,
    connectedDevice: 'Scale Bluetooth CAS SW-1R (Port #3)',
    timestamp: 'Live Connected',
  });

  const readDigitalScale = (): number => {
    const weights = [3.65, 4.2, 4.85, 5.1, 5.75, 6.4, 7.25, 8.1];
    const picked = weights[Math.floor(Math.random() * weights.length)];
    setDigitalScaleReading({
      weightKg: picked,
      isStable: true,
      connectedDevice: 'Scale Bluetooth CAS SW-1R (Port #3)',
      timestamp: new Date().toLocaleTimeString('id-ID'),
    });
    soundEngine.playScanBeep();
    return picked;
  };

  const recordClockIn = (
    userId: string,
    selfieUrl?: string,
    notes?: string,
    gpsData?: {
      latitude: number;
      longitude: number;
      distanceMeters: number;
      gpsAccuracy: number;
      isGpsVerified: boolean;
      locationAddress?: string;
    }
  ): { success: boolean; message: string } => {
    const targetUser = users.find((u) => u.id === userId) || currentUser;
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour12: false });

    // Check existing attendance today
    const existing = attendances.find((a) => a.userId === targetUser.id && a.date === todayStr);
    if (existing && existing.clockInTime && existing.clockInTime !== '-') {
      return {
        success: false,
        message: `Karyawan ${targetUser.name} sudah absen masuk hari ini pada ${existing.clockInTime}!`,
      };
    }

    // Determine status: Late if clock in after 08:15
    const parts = nowTime.split(':').map((v) => parseInt(v, 10));
    const isLate = parts[0] > 8 || (parts[0] === 8 && parts[1] > 15);
    const status: 'hadir' | 'terlambat' = isLate ? 'terlambat' : 'hadir';

    const defaultSelfie = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80';

    const locationLabel = gpsData
      ? (gpsData.locationAddress || `Outlet LaundryHub (GPS: ${gpsData.distanceMeters}m - ${gpsData.isGpsVerified ? 'Valid' : 'Luar Radius'})`)
      : 'Outlet LaundryHub (GPS Satelit: 8m - Valid)';

    const newAttendance: StaffAttendance = {
      id: `att-${Date.now()}`,
      userId: targetUser.id,
      userName: targetUser.name,
      userRole: targetUser.role,
      branchId: currentBranchId,
      date: todayStr,
      clockInTime: nowTime,
      selfieUrl: selfieUrl || defaultSelfie,
      status,
      notes: notes || (isLate ? 'Terlambat masuk kerja (> 08:15)' : 'Hadir on-time shift pagi'),
      locationAddress: locationLabel,
      latitude: gpsData?.latitude,
      longitude: gpsData?.longitude,
      distanceMeters: gpsData?.distanceMeters,
      gpsAccuracy: gpsData?.gpsAccuracy,
      isGpsVerified: gpsData?.isGpsVerified ?? true,
    };

    if (existing) {
      setAttendances((prev) => prev.map((a) => (a.id === existing.id ? newAttendance : a)));
    } else {
      setAttendances((prev) => [newAttendance, ...prev]);
    }

    soundEngine.playStationDing();

    // Audit log
    const audit: AuditLog = {
      id: `log-att-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: targetUser.name,
      actorRole: targetUser.role,
      action: 'ABSEN_MASUK_ONLINE',
      details: `Absen masuk online (${status.toUpperCase()}) jam ${nowTime}. Lokasi GPS valid.`,
      branchId: currentBranchId,
    };
    setAuditLogs((prev) => [audit, ...prev]);

    return {
      success: true,
      message: `Absen masuk ${targetUser.name} berhasil! Status: ${status.toUpperCase()} (${nowTime})`,
    };
  };

  const recordClockOut = (userId: string): { success: boolean; message: string } => {
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour12: false });

    const record = attendances.find((a) => a.userId === userId && a.date === todayStr);
    if (!record) {
      return { success: false, message: 'Belum melakukan absen masuk hari ini!' };
    }
    if (record.clockOutTime) {
      return { success: false, message: `Sudah melakukan absen pulang pada ${record.clockOutTime}` };
    }

    setAttendances((prev) =>
      prev.map((a) => (a.id === record.id ? { ...a, clockOutTime: nowTime } : a))
    );

    soundEngine.playCashChime();

    const audit: AuditLog = {
      id: `log-att-out-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: record.userName,
      actorRole: record.userRole,
      action: 'ABSEN_PULANG_ONLINE',
      details: `Absen pulang tercatat pada jam ${nowTime}. Shift selesai.`,
      branchId: currentBranchId,
    };
    setAuditLogs((prev) => [audit, ...prev]);

    return {
      success: true,
      message: `Absen pulang ${record.userName} berhasil dicatat pada ${nowTime}!`,
    };
  };

  const recordAbsence = (userId: string, date: string, status: 'alpha' | 'izin', notes?: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    const existingIndex = attendances.findIndex((a) => a.userId === userId && a.date === date);
    const newRecord: StaffAttendance = {
      id: `att-${Date.now()}`,
      userId: target.id,
      userName: target.name,
      userRole: target.role,
      branchId: target.branchId || currentBranchId,
      date,
      clockInTime: '-',
      status,
      notes: notes || (status === 'alpha' ? 'Tidak masuk tanpa keterangan (Potongan gaji)' : 'Izin tidak masuk kerja'),
    };

    if (existingIndex >= 0) {
      setAttendances((prev) => prev.map((a, idx) => (idx === existingIndex ? newRecord : a)));
    } else {
      setAttendances((prev) => [newRecord, ...prev]);
    }

    soundEngine.playStationDing();

    const audit: AuditLog = {
      id: `log-abs-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'CATAT_KETIDAKHADIRAN',
      details: `Catat status ${status.toUpperCase()} untuk ${target.name} pada ${date}.`,
      branchId: currentBranchId,
    };
    setAuditLogs((prev) => [audit, ...prev]);
  };

  const calculateStaffSalarySlip = (userId: string, period: string = 'Oktober 2026'): StaffSalarySlip => {
    const targetUser = users.find((u) => u.id === userId) || currentUser;

    // Filter attendance for user
    const userAttendances = attendances.filter((a) => a.userId === userId);
    const daysPresent = userAttendances.filter((a) => a.status === 'hadir' || a.status === 'terlambat').length;
    const daysAbsent = userAttendances.filter((a) => a.status === 'alpha').length;
    const daysLate = userAttendances.filter((a) => a.status === 'terlambat').length;

    // Station commission calculations per nota
    const stationTypes: OrderStatus[] = ['sortir', 'cuci', 'kering', 'setrika', 'packing'];
    const stationCommissions: WorkerStationStat[] = stationTypes.map((station) => {
      let count = 0;
      let totalEarned = 0;

      orders.forEach((ord) => {
        const ts = ord.statusTimestamps?.[station];
        if (ts && (ts.picId === userId || (!ts.picId && ts.picName === targetUser.name))) {
          count += 1;
          totalEarned += ts.commissionEarned || 0;
        }
      });

      return {
        station,
        count,
        totalEarned,
      };
    });

    const totalStationEarnings = stationCommissions.reduce((sum, s) => sum + s.totalEarned, 0);

    // Tips from customer reviews for orders completed by this worker
    let customerTipsTotal = 0;
    orders.forEach((ord) => {
      if (ord.customerReview?.staffTipAmount && ord.customerReview.staffTipAmount > 0) {
        // check if user worked on any station in this order
        const workedOnOrder = stationTypes.some((st) => {
          const ts = ord.statusTimestamps?.[st];
          return ts && (ts.picId === userId || ts.picName === targetUser.name);
        });
        if (workedOnOrder) {
          customerTipsTotal += ord.customerReview.staffTipAmount;
        }
      }
    });

    // Deductions & Base
    const baseSalaryTotal = daysPresent * payrollSettings.dailyBaseSalary;
    const absenceDeductionsTotal = daysAbsent * payrollSettings.absenceDeductionPerDay;
    const lateDeductionsTotal = daysLate * payrollSettings.lateDeductionPerIncident;

    // Net take-home pay
    const netTakeHomePay = Math.max(
      0,
      baseSalaryTotal + totalStationEarnings + customerTipsTotal - absenceDeductionsTotal - lateDeductionsTotal
    );

    return {
      userId: targetUser.id,
      userName: targetUser.name,
      role: targetUser.role,
      avatar: targetUser.avatar,
      period,
      daysPresent,
      daysAbsent,
      daysLate,
      baseSalaryRate: payrollSettings.dailyBaseSalary,
      baseSalaryTotal,
      absenceDeductionRate: payrollSettings.absenceDeductionPerDay,
      absenceDeductionsTotal,
      lateDeductionsTotal,
      stationCommissions,
      totalStationEarnings,
      customerTipsTotal,
      netTakeHomePay,
    };
  };

  const resetAllData = () => {
    localStorage.clear();
    setOrders(ALL_ORDERS);
    setCustomers(INITIAL_CUSTOMERS);
    setUsers(INITIAL_USERS);
    setInventory(INITIAL_INVENTORY);
    setMachines(INITIAL_MACHINES);
    setCourierTasks(INITIAL_COURIER_TASKS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setDropshipAgents(INITIAL_DROPSHIP_AGENTS);
    setDropshipSupplyOrders(INITIAL_DROPSHIP_SUPPLY_ORDERS);
    setWithdrawalRequests(INITIAL_WITHDRAWAL_REQUESTS);
    setAttendances(INITIAL_ATTENDANCE);
    setPayrollSettings(DEFAULT_PAYROLL_SETTINGS);
    setTokenCoins(1850);
    setCurrentRole('owner');
    setCurrentBranchId('br-kemang');
    setActiveTutorial(null);
    setTutorialStep(0);
    setTrackingModalOrder(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentUser,
        setCurrentUser,
        currentCustomer,
        setCurrentCustomer,
        currentBranchId,
        setCurrentBranchId,
        isDarkMode,
        setIsDarkMode,
        toggleDarkMode,
        isOnline,
        language,
        setLanguage,
        currency,
        setCurrency,
        t,
        tokenCoins,
        topupCoins,
        branches,
        users,
        customers,
        orders,
        inventory,
        machines,
        courierTasks,
        auditLogs,
        notifications,
        dropshipAgents,
        dropshipSupplies,
        dropshipSupplyOrders,
        withdrawalRequests,
        currentAgentId,
        setCurrentAgentId,
        currentAgent,
        createOrder,
        createAgentDropshipOrder,
        updateOrderStatus,
        updateOrderClothesDetails,
        startIotMachine,
        stopIotMachine,
        updateInventoryStock,
        updateCourierTaskStatus,
        topupCustomerDeposit,
        addCustomer,
        markNotificationRead,
        resetAllData,
        requestAgentWithdrawal,
        approveWithdrawal,
        registerDropshipAgent,
        orderDropshipSupplies,
        activeGmailAccount,
        isGoogleAuthModalOpen,
        setIsGoogleAuthModalOpen,
        loginWithGmail,
        logoutGmail,
        addWorker,
        removeWorker,
        updateWorker,
        stationRates,
        updateStationRates,
        claimStationTask,
        unclaimStationTask,
        completeStationTask,
        activeTutorial,
        tutorialStep,
        startTutorial,
        nextTutorialStep,
        prevTutorialStep,
        exitTutorial,
        isDemoTutorialModalOpen,
        setIsDemoTutorialModalOpen,
        trackingModalOrder,
        openTrackingModal,
        closeTrackingModal,
        isQrScannerOpen,
        setIsQrScannerOpen,
        addOrderReview,
        attendances,
        payrollSettings,
        updatePayrollSettings,
        recordClockIn,
        recordClockOut,
        recordAbsence,
        calculateStaffSalarySlip,
        isAttendanceModalOpen,
        setIsAttendanceModalOpen,
        isDopaminePaydayOpen,
        setIsDopaminePaydayOpen,
        dopaminePaydayStaffId,
        openDopaminePayday,
        closeDopaminePayday,
        isSalarySlipModalOpen,
        setIsSalarySlipModalOpen,
        salarySlipStaffId,
        openSalarySlipModal,
        closeSalarySlipModal,
        isAiScannerOpen,
        setIsAiScannerOpen,
        aiScannerTargetOrderId,
        openAiScanner,
        saveAiInspection,
        isWhatsAppBotOpen,
        setIsWhatsAppBotOpen,
        whatsAppBotOrder,
        openWhatsAppBot,
        gamificationSettings,
        updateGamificationSettings,
        isGamificationModalOpen,
        setIsGamificationModalOpen,
        gamificationContext,
        triggerGamification,
        recordOrderSpin,
        applyGamificationReward,
        digitalScaleReading,
        readDigitalScale,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
