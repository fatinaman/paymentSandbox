import { NextResponse } from "next/server";
import { getRecord } from "@/lib/paymentStore";

export async function GET(_req: Request, { params }: { params: { paymentId: string } }) {
  const record = getRecord(params.paymentId);
  if (!record) {
    return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: record, mongodbDocument: record });
}
