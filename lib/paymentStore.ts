import fs from "fs";
import path from "path";
import type { PaymentRecord } from "@/lib/types";

const filePath = path.join(process.cwd(), "data", "payments.json");

function ensureDir() {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function listRecords(): PaymentRecord[] {
  try {
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addRecord(record: PaymentRecord): PaymentRecord {
  const records = listRecords();
  records.push(record);
  ensureDir();
  fs.writeFileSync(filePath, JSON.stringify(records, null, 2), "utf8");
  return record;
}

export function getRecord(paymentId: string): PaymentRecord | undefined {
  return listRecords().find((r) => r.paymentId === paymentId);
}
