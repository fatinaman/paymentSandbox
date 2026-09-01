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

function NagadInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, loading } = usePaymentSession();
  const qs = sessionQueryString(searchParams);

  const [step, setStep] = useState<"number" | "pin">("number");
  const [accountNumber, setAccountNumber] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [record, setRecord] = useState<PaymentRecord | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (step === "number") {
      if (!/^01[0-9]{9}$/.test(accountNumber)) {
        setError("Please enter a valid 11-digit Nagad account number.");
        return;
      }
      setStep("pin");
      return;
    }
    if (!/^[0-9]{4,6}$/.test(pin)) {
      setError("Enter your 4–6 digit Nagad PIN.");
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
        method: "nagad",
        user: session.user,
        plan: session.plan,
        details: { accountNumber, pin },
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
        <div className="bg-surface-container-lowest rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.04)] border border-surface-variant overflow-hidden flex flex-col">
          <div className="w-full h-32 flex flex-col items-center justify-center p-6 text-on-surface bg-gradient-to-br from-surface-container-low to-surface-container">
            <img
              src="/assets/nagad Logo.png"
              alt="Nagad Logo"
              className="h-12 w-auto object-contain mb-2"
              style={{ mixBlendMode: "multiply" }}
            />
            <p className="font-bold text-label-bold text-on-surface-variant">Secure Payment Gateway</p>
          </div>
          <div className="bg-surface-container-low p-4 flex justify-between items-center border-b border-surface-variant">
            <div className="flex flex-col">
              <span className="text-label-sm text-on-surface-variant">Merchant</span>
              <span className="text-title-md text-on-surface">Shonge Achi Payments</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-label-sm text-on-surface-variant">Amount</span>
              <span className="text-title-md text-on-surface font-bold">
                {formatCurrency(session.amount, session.currency)}.00
              </span>
            </div>
          </div>
          <div className="p-6 flex flex-col gap-6">
            <div className="text-center mb-2">
              <h2 className="text-title-md text-on-surface">
                {step === "number" ? "Enter your Nagad Account Number" : "Enter your Nagad PIN"}
              </h2>
              <p className="text-body-md text-on-surface-variant mt-1">
                {step === "number" ? "Please enter your 11-digit mobile number" : `Confirm PIN for ${accountNumber}`}
              </p>
            </div>
            <form onSubmit={onSubmit}>
              {step === "number" ? (
                <div className="relative">
                  <label className="block font-bold text-label-bold text-on-surface mb-2" htmlFor="account_number">
                    Account Number
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 material-symbols-outlined text-outline">phone_iphone</span>
                    <input
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-[#ed1c24] focus:border-[#ed1c24]"
                      id="account_number"
                      maxLength={11}
                      placeholder="e.g 01XXXXXXXXX"
                      type="tel"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-label-bold text-on-surface mb-2" htmlFor="nagad-pin">
                    PIN
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-outline-variant text-center tracking-[0.4em] text-body-lg focus:ring-2 focus:ring-[#ed1c24]"
                    id="nagad-pin"
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
                    className="mt-2 text-label-sm text-nagad-red"
                    onClick={() => {
                      setStep("number");
                      setPin("");
                    }}
                  >
                    Change number
                  </button>
                </div>
              )}
              {error && <p className="text-sm text-error mt-3">{error}</p>}
              <div className="flex flex-col gap-4 mt-6">
                <p className="text-label-sm text-center text-on-surface-variant">
                  By proceeding, you agree to the{" "}
                  <a className="text-nagad-red hover:underline font-bold" href="#">
                    Terms and Conditions
                  </a>{" "}
                  of Nagad.
                </p>
                <button
                  className="w-full bg-nagad-red text-white font-bold text-label-bold py-4 rounded-full shadow-md hover:bg-[#c9181e] active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-80"
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
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </>
                  )}
                </button>
                <Link
                  href={`/${qs}`}
                  className="w-full text-center bg-transparent text-outline font-bold text-label-bold py-3 rounded-full border border-outline-variant hover:bg-surface-container-high"
                >
                  Cancel Payment
                </Link>
              </div>
            </form>
          </div>
          <div className="bg-error-container text-on-error-container p-3 text-center text-label-sm flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">warning</span>
            Sandbox Environment - No real funds will be deducted.
          </div>
        </div>
      </div>
    </main>
  );
}

export default function NagadPage() {
  return (
    <Suspense
      fallback={
        <main className="flex-grow flex items-center justify-center py-24">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
        </main>
      }
    >
      <NagadInner />
    </Suspense>
  );
}
