"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { PaymentRecord } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { sessionQueryString } from "@/lib/query";

function SuccessInner() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  const returnUrl = searchParams.get("returnUrl");
  const qs = sessionQueryString(searchParams);
  const [record, setRecord] = useState<PaymentRecord | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!paymentId) {
      setError("Missing paymentId.");
      return;
    }
    fetch(`/api/payments/record/${paymentId}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) throw new Error(json.message || "Not found");
        setRecord(json.data);
      })
      .catch((e) => setError((e as Error).message));
  }, [paymentId]);

  async function copyJson() {
    if (!record) return;
    await navigator.clipboard.writeText(JSON.stringify(record, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (error) {
    return (
      <main className="flex-grow flex items-center justify-center p-8">
        <p className="text-error">{error}</p>
      </main>
    );
  }

  if (!record) {
    return (
      <main className="flex-grow flex items-center justify-center py-24">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </main>
    );
  }

  return (
    <main className="flex-grow flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl bg-white rounded-2xl border border-surface-container-highest shadow-[0_8px_24px_rgba(0,0,0,0.04)] p-6 md:p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>
          <div>
            <h1 className="text-headline-lg-mobile md:text-headline-lg text-on-surface">Payment Successful</h1>
            <p className="text-body-md text-on-surface-variant mt-1">
              {formatCurrency(record.totalAmount, record.currency)} · {record.method.toUpperCase()} · #
              {record.invoiceNumber}
            </p>
          </div>
        </div>

        <p className="text-label-sm text-on-surface-variant mb-2">
          MongoDB document (use with <code>insertOne()</code>)
        </p>
        <pre className="bg-surface-container-low rounded-xl p-4 overflow-auto text-sm text-on-surface max-h-[420px] border border-surface-container-highest">
          {JSON.stringify(record, null, 2)}
        </pre>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={copyJson}
            className="px-6 h-11 rounded-full bg-primary-container text-on-primary font-semibold hover:bg-primary"
          >
            {copied ? "Copied" : "Copy JSON"}
          </button>
          <Link
            href="/records"
            className="px-6 h-11 rounded-full border border-outline-variant text-on-surface flex items-center font-semibold hover:bg-surface-container"
          >
            View all records
          </Link>
          {returnUrl ? (
            <a
              href={`${returnUrl}${returnUrl.includes("?") ? "&" : "?"}paymentId=${record.paymentId}&status=success`}
              className="px-6 h-11 rounded-full border border-outline-variant text-on-surface flex items-center font-semibold hover:bg-surface-container"
            >
              Return to app
            </a>
          ) : (
            <Link
              href={`/${qs}`}
              className="px-6 h-11 rounded-full border border-outline-variant text-on-surface flex items-center font-semibold hover:bg-surface-container"
            >
              New payment
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex-grow flex items-center justify-center py-24">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
        </main>
      }
    >
      <SuccessInner />
    </Suspense>
  );
}
