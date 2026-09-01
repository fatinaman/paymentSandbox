"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePaymentSession } from "@/lib/usePaymentSession";
import { formatCurrency } from "@/lib/utils";
import { withQuery } from "@/lib/query";
import type { PaymentMethod } from "@/lib/types";

function GatewayInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, loading, isDemo } = usePaymentSession();
  const [method, setMethod] = useState<PaymentMethod>("bkash");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!session) return;
    const routes: Record<PaymentMethod, string> = {
      bkash: "/pay/bkash",
      nagad: "/pay/nagad",
      card: "/pay/card",
    };
    router.push(withQuery(routes[method], searchParams));
  }

  if (loading || !session) {
    return (
      <main className="flex-grow flex items-center justify-center py-24">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </main>
    );
  }

  return (
    <main className="flex-grow flex items-center justify-center py-12 px-4 md:px-8">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 flex flex-col gap-2">
          <div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col gap-6 h-full shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-surface-container-highest">
            <div>
              <h2 className="text-title-md text-on-surface mb-2">Payment Summary</h2>
              <p className="text-body-md text-on-surface-variant">
                Review your transaction details before proceeding.
              </p>
              {isDemo && (
                <p className="mt-2 text-label-sm text-primary">Using demo session data (API not connected).</p>
              )}
            </div>
            <div className="flex-grow flex flex-col gap-4">
              <div className="bg-surface-container rounded-lg p-4 flex flex-col gap-1">
                <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Plan</span>
                <span className="text-title-md text-on-surface">{session.plan.name}</span>
              </div>
              <div className="bg-surface-container rounded-lg p-4 flex flex-col gap-1">
                <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">User</span>
                <span className="text-body-lg text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  {session.user.name}
                </span>
              </div>
              <div className="bg-surface-container rounded-lg p-4 flex flex-col gap-1">
                <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Invoice</span>
                <span className="text-body-md text-on-surface">#{session.invoiceNumber}</span>
              </div>
            </div>
            <div className="mt-auto pt-6 border-t border-surface-container-highest">
              <div className="flex justify-between items-end mb-2">
                <span className="text-body-md text-on-surface-variant">Subtotal</span>
                <span className="text-body-md text-on-surface">{formatCurrency(session.amount, session.currency)}</span>
              </div>
              <div className="flex justify-between items-end mb-4">
                <span className="text-body-md text-on-surface-variant">Processing Fee</span>
                <span className="text-body-md text-on-surface">{formatCurrency(0, session.currency)}</span>
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-surface-container">
                <span className="text-body-lg text-on-surface-variant">Total Amount</span>
                <span className="text-headline-lg text-primary">{formatCurrency(session.amount, session.currency)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-8 flex flex-col">
          <div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col gap-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-surface-container-highest">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-3xl">security</span>
              <h2 className="text-headline-lg-mobile md:text-headline-lg text-on-surface">Select Payment Method</h2>
            </div>
            <p className="text-body-md text-on-surface-variant">
              Choose your preferred secure payment option. You will be redirected to a dedicated sandbox environment.
            </p>

            <form className="flex flex-col gap-4" onSubmit={onSubmit}>
              <label className="relative cursor-pointer group">
                <input
                  checked={method === "bkash"}
                  className="payment-radio peer sr-only"
                  name="payment_method"
                  type="radio"
                  value="bkash"
                  onChange={() => setMethod("bkash")}
                />
                <div className="w-full border-2 border-surface-container-highest rounded-xl p-4 flex items-center gap-4 transition-all duration-200 hover:border-primary-container bg-surface-container-lowest">
                  <div className="radio-indicator relative w-6 h-6 rounded-full border-2 border-outline-variant flex-shrink-0 transition-colors" />
                  <div className="w-16 h-12 flex items-center justify-center">
                    <img src="/assets/bkash Logo.png" alt="bKash Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                  <span className="text-title-md text-on-surface flex-grow">bKash Wallet</span>
                  <span className="text-label-sm text-bkash-pink font-bold bg-pink-50 px-3 py-1 rounded-full">
                    Popular
                  </span>
                </div>
              </label>

              <label className="relative cursor-pointer group">
                <input
                  checked={method === "nagad"}
                  className="payment-radio peer sr-only"
                  name="payment_method"
                  type="radio"
                  value="nagad"
                  onChange={() => setMethod("nagad")}
                />
                <div className="w-full border-2 border-surface-container-highest rounded-xl p-4 flex items-center gap-4 transition-all duration-200 hover:border-primary-container bg-surface-container-lowest">
                  <div className="radio-indicator relative w-6 h-6 rounded-full border-2 border-outline-variant flex-shrink-0 transition-colors" />
                  <div className="w-16 h-12 flex items-center justify-center">
                    <img src="/assets/nagad Logo.png" alt="Nagad Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                  <span className="text-title-md text-on-surface flex-grow">Nagad Account</span>
                </div>
              </label>

              <label className="relative cursor-pointer group">
                <input
                  checked={method === "card"}
                  className="payment-radio peer sr-only"
                  name="payment_method"
                  type="radio"
                  value="card"
                  onChange={() => setMethod("card")}
                />
                <div className="w-full border-2 border-surface-container-highest rounded-xl p-4 flex items-center gap-4 transition-all duration-200 hover:border-primary-container bg-surface-container-lowest">
                  <div className="radio-indicator relative w-6 h-6 rounded-full border-2 border-outline-variant flex-shrink-0 transition-colors" />
                  <div className="w-16 h-12 flex items-center justify-center">
                    <span className="material-symbols-outlined text-5xl text-outline">credit_card</span>
                  </div>
                  <span className="text-title-md text-on-surface flex-grow">Card Payment</span>
                </div>
              </label>

              <div className="mt-4 pt-6 border-t border-surface-container-highest flex flex-col sm:flex-row justify-end gap-3">
                <button
                  className="px-8 h-12 rounded-full border border-outline-variant font-bold text-label-bold text-outline hover:bg-surface-container transition-colors"
                  type="button"
                  onClick={() => router.refresh()}
                >
                  Cancel
                </button>
                <button
                  className="bg-[#008b94] hover:bg-primary text-on-primary text-title-md h-12 px-8 rounded-full transition-all duration-200 shadow-[0_4px_12px_rgba(0,139,148,0.2)] hover:shadow-[0_6px_16px_rgba(0,139,148,0.3)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  type="submit"
                >
                  <span className="material-symbols-outlined">arrow_forward</span>
                  Proceed to Pay {formatCurrency(session.amount, session.currency)}
                </button>
              </div>
            </form>

            <div className="flex flex-wrap justify-center gap-4 mt-4 opacity-60">
              <span className="text-label-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                256-bit SSL Secure
              </span>
              <span className="text-label-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">autorenew</span>
                Instant Activation
              </span>
              <span className="text-label-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">support_agent</span>
                24/7 Support
              </span>
            </div>

            <div className="bg-error-container text-on-error-container p-3 rounded-lg text-center text-label-sm flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">warning</span>
              Sandbox Environment - No real funds will be deducted.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <main className="flex-grow flex items-center justify-center py-24">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
        </main>
      }
    >
      <GatewayInner />
    </Suspense>
  );
}
