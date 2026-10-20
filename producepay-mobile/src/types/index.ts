import type { NavigatorScreenParams } from '@react-navigation/native';

// ─── Models ──────────────────────────────────────────────────

export type User = {
  id: string;
  username: string;
  fullName: string;
  phone: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'CLERK';
  active: boolean;
  lastLoginAt?: string;
};

export type FarmerSnapshot = {
  code: string;
  name: string;
  phone: string;
  location?: string;
};

export type Farmer = {
  id: string;
  code: string;
  name: string;
  phone: string;
  email?: string;
  location: string;
  farmSizeAcres?: number;
  active: boolean;
};

export type Delivery = {
  id: string;
  code: string;
  farmer: string;
  farmerSnapshot: FarmerSnapshot;
  weightKg: number;
  ratePerKg: number;
  totalKes: number;
  collectedAt: string;
  recordedBy: string;
  notes?: string;
};

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';

export type Payment = {
  id: string;
  receiptNo: string;
  delivery: string | Delivery;
  farmer: string;
  farmerSnapshot: FarmerSnapshot & { weightKg?: number; ratePerKg?: number };
  amountKes: number;
  status: PaymentStatus;
  method?: 'MPESA' | 'CASH' | 'BANK';
  reference?: string;
  paidAt?: string;
  createdAt: string;
};

export type Settings = {
  organisation: {
    orgName: string;
    shortName: string;
    phone: string;
    email: string;
    physicalAddress: string;
    postalAddress: string;
  };
  business: {
    ratePerKg: number;
    currency: string;
    weightUnit: string;
    minDeliveryWeightKg: number;
    maxDeliveryWeightKg: number;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    notifyFarmerOnDelivery: boolean;
    notifyFarmerOnPayment: boolean;
    notifyManagersOnWeeklyReport: boolean;
    weeklyReportDay: number;
    weeklyReportHour: number;
  };
  receipts: {
    prefix: string;
    footerNote: string;
  };
};

// ─── API Responses ───────────────────────────────────────────

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// ─── Navigation ──────────────────────────────────────────────

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Deliveries: NavigatorScreenParams<DeliveriesStackParamList>;
  Payments: NavigatorScreenParams<PaymentsStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type HomeStackParamList = {
  Dashboard: undefined;
  Reports: undefined;
};

export type DeliveriesStackParamList = {
  DeliveryList: undefined;
  NewDelivery: undefined;
  DeliveryDetail: { id: string };
};

export type PaymentsStackParamList = {
  PaymentList: undefined;
  PaymentDetail: { id: string };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  SyncStatus: undefined;
  Users: undefined;
  Settings: undefined;
};