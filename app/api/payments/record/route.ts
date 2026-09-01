import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { generateId, detectCardType } from "@/lib/utils";
import { addRecord, listRecords } from "@/lib/paymentStore";
import type { PaymentRecord, PaymentMethod, PaymentStatus } from "@/lib/types";

export async function GET() {
  const data = listRecords();
  return NextResponse.json({
    success: true,
    count: data.length,
    data,
    message: "Sandbox payment records. Persist these documents to MongoDB in production.",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      invoiceNumber,
      amount,
      currency = "BDT",
      method,
      user,
      plan,
      details,
    } = body;

    if (!method || amount == null || !invoiceNumber) {
      return NextResponse.json(
        { success: false, message: "method, amount, and invoiceNumber are required" },
        { status: 400 }
      );
    }

    const processingFee = 0;
    const totalAmount = Number(amount) + processingFee;

    const enrichedDetails = { ...(details || {}) };
    if (method === "card" && details?.cardNumber) {
      enrichedDetails.cardType = detectCardType(details.cardNumber);
      const cn = String(details.cardNumber).replace(/\s/g, "");
      enrichedDetails.cardNumber = `****${cn.slice(-4)}`;
      enrichedDetails.cvv = "***";
    }
    if ((method === "bkash" || method === "nagad") && details?.pin) {
      enrichedDetails.pin = "****";
    }

    const now = new Date().toISOString();
    const status: PaymentStatus = "success";

    const record: PaymentRecord = {
      paymentId: generateId("pay"),
      sessionId: sessionId || generateId("ses"),
      invoiceNumber,
      amount: Number(amount),
      currency,
      method: method as PaymentMethod,
      user,
      plan,
      status,
      details: enrichedDetails,
      processingFee,
      totalAmount,
      gatewayResponse: {
        sandbox: true,
        transactionRef: generateId("txn"),
        processedAt: now,
      },
      createdAt: now,
      updatedAt: now,
      completedAt: now,
      isSandbox: true,
    };

    addRecord(record);

    return NextResponse.json({
      success: true,
      data: record,
      mongodbDocument: record,
      message: "Payment recorded successfully in sandbox. Use mongodbDocument for MongoDB insertOne().",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message, message: "Payment processing failed" },
      { status: 500 }
    );
  }
}
