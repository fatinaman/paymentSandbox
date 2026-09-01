export type PaymentMethod = "bkash" | "nagad" | "card";

export type PaymentStatus = "pending" | "processing" | "success" | "failed";

export interface UserInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface PlanInfo {
  id: string;
  name: string;
  description?: string;
}

export interface PaymentSession {
  sessionId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  user: UserInfo;
  plan: PlanInfo;
  status: PaymentStatus;
  createdAt: string;
  expiresAt?: string;
}

export interface BkashDetails {
  walletNumber: string;
  pin: string;
  transactionId?: string;
}

export interface NagadDetails {
  accountNumber: string;
  pin: string;
  transactionId?: string;
}

export interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolderName: string;
  cardType?: "Visa" | "Mastercard" | "Unknown";
}

export interface PaymentRecord {
  _id?: string;
  paymentId: string;
  sessionId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  user: UserInfo;
  plan: PlanInfo;
  status: PaymentStatus;
  details: BkashDetails | NagadDetails | CardDetails | Record<string, unknown>;
  processingFee: number;
  totalAmount: number;
  gatewayResponse?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  isSandbox: boolean;
}
