import type { PaymentRecord } from "@/lib/types";

export async function recordPayment(body: Record<string, unknown>): Promise<{
  success: boolean;
  data?: PaymentRecord;
  mongodbDocument?: PaymentRecord;
  message?: string;
}> {
  const res = await fetch("/api/payments/record", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}
