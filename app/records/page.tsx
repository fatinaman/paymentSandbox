"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PaymentRecord } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function RecordsPage() {
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/payments/record")
      .then((r) => r.json())
      .then((json) => setRecords(json.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex-grow w-full max-w-5xl mx-auto px-4 md:px-8 py-10">
      <h1 className="text-headline-lg text-on-surface mb-2">Sandbox payment records</h1>
      <p className="text-body-md text-on-surface-variant mb-8">
        These documents are stored locally so you can copy them into MongoDB later.
      </p>
      {loading ? (
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      ) : records.length === 0 ? (
        <p className="text-on-surface-variant">No payments yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {records
            .slice()
            .reverse()
            .map((r) => (
              <Link
                key={r.paymentId}
                href={`/success?paymentId=${r.paymentId}`}
                className="bg-white rounded-xl border border-surface-container-highest p-4 hover:border-primary-container transition flex justify-between gap-4"
              >
                <div>
                  <p className="font-semibold text-on-surface">{r.paymentId}</p>
                  <p className="text-sm text-on-surface-variant">
                    {r.user?.name} · #{r.invoiceNumber} · {r.method}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">{formatCurrency(r.totalAmount, r.currency)}</p>
                  <p className="text-sm text-tertiary">{r.status}</p>
                </div>
              </Link>
            ))}
        </div>
      )}
    </main>
  );
}
