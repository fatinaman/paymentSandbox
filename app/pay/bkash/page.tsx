"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import SuccessOverlay from "@/components/SuccessOverlay";
import { usePaymentSession } from "@/lib/usePaymentSession";
import { recordPayment } from "@/lib/recordPayment";
import { formatCurrency } from "@/lib/utils";
import { sessionQueryString, successHref } from "@/lib/query";
import type { PaymentRecord } from "@/lib/types";

function BkashInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, loading } = usePaymentSession();
  const qs = sessionQueryString(searchParams);

  const [step, setStep] = useState<"number" | "pin">("number");
  const [walletNumber, setWalletNumber] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [record, setRecord] = useState<PaymentRecord | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (step === "number") {
      if (!/^01[0-9]{9}$/.test(walletNumber)) {
        setError("Please enter a valid 11-digit bKash account number.");
        return;
      }
      setStep("pin");
      return;
    }
    if (!/^[0-9]{4,6}$/.test(pin)) {
      setError("Enter your 4–6 digit bKash PIN.");
      return;
    }
    if (!session) return;
    setBusy(true);
    try {
      const json = await recordPayment({
        sessionId: session.sessionId,
        invoiceNumber: session.invoiceNumber,
        amount: session.amount,
        currency: session.currency,
        method: "bkash",
        user: session.user,
        plan: session.plan,
        details: { walletNumber, pin },
      });
      if (!json.success || !json.data) throw new Error(json.message || "Payment failed");
      setRecord(json.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (loading || !session) {
    return (
      <main className="flex-grow flex items-center justify-center py-24">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </main>
    );
  }

  return (
    <main className="flex-grow flex items-center justify-center p-4 md:p-8">
      {record && (
        <SuccessOverlay
          record={record}
          onContinue={() => router.push(successHref(record.paymentId, searchParams))}
        />
      )}
      <div className="w-full max-w-md">
        <Link href={`/${qs}`} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand-teal mb-4">
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Payment
        </Link>
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_8px_24px_rgba(0,0,0,0.04)] border border-surface-container-highest">
          <header className="bg-bkash-pink p-6 flex flex-col items-center justify-center relative min-h-[160px]">
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-sm mb-2">
                <span className="material-symbols-outlined text-primary text-3xl">storefront</span>
              </div>
              <h1 className="text-title-md text-on-primary text-center">Shonge Achi Payments</h1>
              <p className="text-label-sm text-on-primary/90 mt-1">Invoice: #{session.invoiceNumber}</p>
              <div className="mt-4 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <p className="font-bold text-label-bold text-on-primary">
                  Amount: {formatCurrency(session.amount, session.currency)}.00
                </p>
              </div>
            </div>
          </header>

          <section className="p-6 bg-surface-container-lowest">
            <div className="mb-6 text-center">
              <h2 className="text-title-md text-on-surface mb-2">Pay with bKash</h2>
              <p className="text-body-md text-on-surface-variant">
                {step === "number"
                  ? "Sandbox Environment - No real funds will be deducted."
                  : `Confirm PIN for ${walletNumber}`}
              </p>
            </div>
            <form className="space-y-6" onSubmit={onSubmit}>
              {step === "number" ? (
                <div className="space-y-2">
                  <label className="block font-bold text-label-bold text-on-surface" htmlFor="wallet-number">
                    Your bKash Account Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-outline">phone_iphone</span>
                    </div>
                    <input
                      className="block w-full pl-10 pr-3 py-3 border border-surface-container-highest rounded-lg bg-surface-container-lowest text-body-md text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-bkash-pink focus:border-bkash-pink"
                      id="wallet-number"
                      name="wallet-number"
                      pattern="01[0-9]{9}"
                      placeholder="e.g 01XXXXXXXXX"
                      required
                      type="tel"
                      maxLength={11}
                      value={walletNumber}
                      onChange={(e) => setWalletNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    />
                  </div>
                  <p className="text-label-sm text-on-surface-variant flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    11-digit mobile number
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block font-bold text-label-bold text-on-surface" htmlFor="bkash-pin">
                    Enter bKash PIN
                  </label>
                  <input
                    className="block w-full px-3 py-3 border border-surface-container-highest rounded-lg text-center tracking-[0.4em] text-body-lg focus:ring-2 focus:ring-bkash-pink"
                    id="bkash-pin"
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    className="text-label-sm text-bkash-pink"
                    onClick={() => {
                      setStep("number");
                      setPin("");
                    }}
                  >
                    Change number
                  </button>
                </div>
              )}

              {error && <p className="text-sm text-error">{error}</p>}

              <div className="flex items-start gap-3 p-4 bg-surface-container-low rounded-lg">
                <span className="material-symbols-outlined text-primary shrink-0 mt-0.5">gpp_maybe</span>
                <p className="text-label-sm text-on-surface-variant">
                  By proceeding, you agree to the{" "}
                  <a className="text-bkash-pink font-bold hover:underline" href="#">
                    Terms & Conditions
                  </a>{" "}
                  of this sandbox payment gateway.
                </p>
              </div>
              <div className="flex flex-col gap-4 pt-4">
                <button
                  className="w-full bg-bkash-pink text-on-primary font-bold text-label-bold py-4 rounded-full hover:bg-bkash-pink/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-80"
                  type="submit"
                  disabled={busy}
                >
                  {busy ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      Processing...
                    </>
                  ) : (
                    <>
                      {step === "number" ? "Proceed" : "Confirm Payment"}
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </>
                  )}
                </button>
                <Link
                  href={`/${qs}`}
                  className="w-full text-center bg-transparent text-outline font-bold text-label-bold py-4 rounded-full hover:bg-surface-container-low"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </section>

          <footer className="bg-surface-container-low p-4 flex items-center justify-between border-t border-surface-container-highest">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-outline">lock</span>
              <span className="text-label-sm text-outline">Secure Payment</span>
            </div>
            <img className="h-6 object-contain" src="/assets/bkash Logo.png" alt="bKash Logo" />
          </footer>
        </div>
      </div>
    </main>
  );
}

export default function BkashPage() {
  return (
    <Suspense
      fallback={
        <main className="flex-grow flex items-center justify-center py-24">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
        </main>
      }
    >
      <BkashInner />
    </Suspense>
  );
}
