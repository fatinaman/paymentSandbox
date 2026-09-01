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

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

function CardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, loading } = usePaymentSession();
  const qs = sessionQueryString(searchParams);

  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [record, setRecord] = useState<PaymentRecord | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const digits = cardNumber.replace(/\s/g, "");
    if (digits.length < 13) {
      setError("Please enter a valid card number.");
      return;
    }
    if (expiryDate.length !== 5) {
      setError("Please enter a valid expiry date (MM/YY).");
      return;
    }
    if (cvv.length < 3) {
      setError("Please enter a valid CVV.");
      return;
    }
    if (!cardHolderName.trim()) {
      setError("Please enter the cardholder name.");
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
        method: "card",
        user: session.user,
        plan: session.plan,
        details: { cardNumber, expiryDate, cvv, cardHolderName: cardHolderName.trim() },
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
    <main className="flex-grow w-full flex items-center justify-center p-4 md:p-8">
      {record && (
        <SuccessOverlay
          record={record}
          onContinue={() => router.push(successHref(record.paymentId, searchParams))}
        />
      )}
      <div className="w-full max-w-lg mx-auto">
        <Link href={`/${qs}`} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand-teal mb-4">
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Payment
        </Link>
        <header className="text-center mb-8">
          <h1 className="text-headline-lg-mobile md:text-headline-lg text-primary mb-2">Secure Checkout</h1>
          <p className="text-body-md text-on-surface-variant flex items-center justify-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              lock
            </span>
            Shonge Achi Secure Sandbox Environment
          </p>
        </header>
        <div className="bg-white rounded-2xl p-6 border border-[#EAE6D1] shadow-[0px_8px_24px_rgba(0,0,0,0.04)] relative overflow-hidden">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-surface-variant">
            <div>
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Total Amount</p>
              <p className="text-title-md text-on-surface">{formatCurrency(session.amount, session.currency)}.00</p>
              <p className="text-label-sm text-on-surface-variant mt-1">
                {session.user.name} · #{session.invoiceNumber}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <img src="/assets/visa logo.png" alt="Visa" className="h-8 object-contain" />
              <img src="/assets/mastercard logo.png" alt="Mastercard" className="h-8 object-contain" />
            </div>
          </div>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-1">
              <label className="block font-bold text-label-bold text-on-surface" htmlFor="cardNumber">
                Card Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
                  <span className="material-symbols-outlined">credit_card</span>
                </span>
                <input
                  className="secure-input block w-full pl-10 pr-3 py-3 text-body-md text-on-surface placeholder-outline-variant"
                  id="cardNumber"
                  maxLength={19}
                  name="cardNumber"
                  placeholder="0000 0000 0000 0000"
                  required
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block font-bold text-label-bold text-on-surface" htmlFor="expiryDate">
                  Expiry Date
                </label>
                <input
                  className="secure-input block w-full px-3 py-3 text-body-md text-on-surface placeholder-outline-variant text-center"
                  id="expiryDate"
                  maxLength={5}
                  name="expiryDate"
                  placeholder="MM/YY"
                  required
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiry(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-label-bold text-on-surface" htmlFor="cvv">
                  CVV
                </label>
                <input
                  className="secure-input block w-full px-3 py-3 text-body-md text-on-surface placeholder-outline-variant text-center tracking-widest"
                  id="cvv"
                  maxLength={4}
                  name="cvv"
                  placeholder="•••"
                  required
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block font-bold text-label-bold text-on-surface" htmlFor="cardName">
                Name on Card
              </label>
              <input
                className="secure-input block w-full px-3 py-3 text-body-md text-on-surface placeholder-outline-variant uppercase"
                id="cardName"
                name="cardName"
                placeholder="Cardholder Name"
                required
                type="text"
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-error">{error}</p>}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link
                href={`/${qs}`}
                className="flex-1 sm:flex-none px-8 h-12 rounded-full border border-outline-variant font-bold text-label-bold text-outline hover:bg-surface-container flex items-center justify-center"
              >
                Cancel
              </Link>
              <button
                className="flex-1 bg-primary hover:bg-primary-container text-on-primary text-title-md py-4 rounded-full flex items-center justify-center gap-2 h-12 shadow-sm active:scale-[0.98] disabled:opacity-80"
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
                    <span className="material-symbols-outlined">lock</span>
                    Pay {formatCurrency(session.amount, session.currency)}.00
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        <p className="mt-8 text-center text-label-sm text-on-surface-variant">
          This is a sandbox environment. <strong className="text-error">Do not use real card details.</strong>
        </p>
      </div>
    </main>
  );
}

export default function CardPage() {
  return (
    <Suspense
      fallback={
        <main className="flex-grow flex items-center justify-center py-24">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
        </main>
      }
    >
      <CardInner />
    </Suspense>
  );
}
