import type { PaymentSession } from "./types";

export const DEMO_PAYMENT_SESSION: PaymentSession = {
  sessionId: "ses_" + Math.random().toString(36).slice(2, 10),
  invoiceNumber: "INV-2024-001",
  amount: 1500,
  currency: "BDT",
  user: {
    id: "usr_1001",
    name: "M. Rahman",
    email: "m.rahman@example.com",
    phone: "01700000000",
  },
  plan: {
    id: "plan_monthly_standard",
    name: "Monthly Subscription",
    description: "Standard monthly care subscription",
  },
  status: "pending",
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
};

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function formatCurrency(amount: number, currency: string = "BDT"): string {
  const symbol = currency === "BDT" ? "৳" : "$";
  return `${symbol} ${amount.toLocaleString("en-BD", { minimumFractionDigits: 0 })}`;
}

export function detectCardType(cardNumber: string): "Visa" | "Mastercard" | "Unknown" {
  const num = cardNumber.replace(/\s/g, "");
  if (/^4/.test(num)) return "Visa";
  if (/^5[1-5]|^2[2-7]/.test(num)) return "Mastercard";
  return "Unknown";
}

export function maskCardNumber(cardNumber: string): string {
  const num = cardNumber.replace(/\s/g, "");
  if (num.length < 4) return num;
  const last4 = num.slice(-4);
  return `**** **** **** ${last4}`;
}

export function maskPhone(number: string): string {
  if (number.length < 6) return number;
  const first4 = number.slice(0, 4);
  const last4 = number.slice(-4);
  return `${first4}****${last4}`;
}
