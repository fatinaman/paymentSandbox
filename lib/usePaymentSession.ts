"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { PaymentSession } from "@/lib/types";
import { DEMO_PAYMENT_SESSION, generateId } from "@/lib/utils";
import { parseAmount } from "@/lib/query";

export interface UsePaymentSessionResult {
  session: PaymentSession | null;
  loading: boolean;
  error: string | null;
  isDemo: boolean;
  refresh: () => Promise<void>;
}

export function usePaymentSession(): UsePaymentSessionResult {
  const searchParams = useSearchParams();
  const [session, setSession] = useState<PaymentSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(true);

  const amount = parseAmount(searchParams.get("amount"));
  const invoice = searchParams.get("invoice") || searchParams.get("invoiceNumber") || undefined;
  const userName = searchParams.get("userName") || searchParams.get("user") || undefined;
  const userId = searchParams.get("userId") || undefined;
  const planName =
    searchParams.get("planName") || searchParams.get("subscription") || searchParams.get("plan") || undefined;
  const sessionId = searchParams.get("sessionId") || undefined;

  const fetchSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (amount != null) params.set("amount", String(amount));
      if (invoice) params.set("invoice", invoice);
      if (userName) params.set("userName", userName);
      if (userId) params.set("userId", userId);
      if (planName) params.set("planName", planName);
      if (sessionId) params.set("sessionId", sessionId);

      const res = await fetch(`/api/payments/session?${params.toString()}`);
      if (!res.ok) throw new Error("API unreachable");
      const json = await res.json();
      if (json?.success) {
        setSession(json.data);
        setIsDemo(!!json.isDemo);
      } else {
        throw new Error(json?.message || "Invalid response");
      }
    } catch (e) {
      const fallback: PaymentSession = {
        ...DEMO_PAYMENT_SESSION,
        sessionId: sessionId || generateId("ses"),
        invoiceNumber: invoice || DEMO_PAYMENT_SESSION.invoiceNumber,
        amount: amount ?? DEMO_PAYMENT_SESSION.amount,
        user: {
          ...DEMO_PAYMENT_SESSION.user,
          id: userId || DEMO_PAYMENT_SESSION.user.id,
          name: userName || DEMO_PAYMENT_SESSION.user.name,
        },
        plan: {
          ...DEMO_PAYMENT_SESSION.plan,
          name: planName || DEMO_PAYMENT_SESSION.plan.name,
        },
        createdAt: new Date().toISOString(),
      };
      setSession(fallback);
      setIsDemo(true);
      setError((e as Error).message || "Using fallback demo data");
    } finally {
      setLoading(false);
    }
  }, [amount, invoice, userName, userId, planName, sessionId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return { session, loading, error, isDemo, refresh: fetchSession };
}
