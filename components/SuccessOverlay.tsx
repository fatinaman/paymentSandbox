"use client";

import type { PaymentRecord } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface SuccessOverlayProps {
  record: PaymentRecord;
  onContinue: () => void;
}

export default function SuccessOverlay({ record, onContinue }: SuccessOverlayProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center border border-surface-container-highest">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-tertiary-fixed flex items-center justify-center">
          <span className="material-symbols-outlined text-tertiary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>
        <h2 className="text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">Payment Successful</h2>
        <p className="text-body-md text-on-surface-variant mb-6">
          {formatCurrency(record.totalAmount, record.currency)} has been processed for invoice #{record.invoiceNumber}.
        </p>
        <p className="text-label-sm text-on-surface-variant mb-6">
          Sandbox transaction {record.gatewayResponse?.transactionRef as string}
        </p>
        <button
          type="button"
          onClick={onContinue}
          className="w-full bg-primary-container hover:bg-primary text-on-primary font-semibold h-12 rounded-full transition"
        >
          View payment JSON
        </button>
      </div>
    </div>
  );
}
