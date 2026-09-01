import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { DEMO_PAYMENT_SESSION, generateId } from "@/lib/utils";

function buildDemo(searchParams: URLSearchParams) {
  const amountRaw = searchParams.get("amount");
  const amount = amountRaw ? Number(amountRaw) : DEMO_PAYMENT_SESSION.amount;
  return {
    ...DEMO_PAYMENT_SESSION,
    sessionId: searchParams.get("sessionId") || generateId("ses"),
    invoiceNumber:
      searchParams.get("invoice") || searchParams.get("invoiceNumber") || DEMO_PAYMENT_SESSION.invoiceNumber,
    amount: Number.isFinite(amount) ? amount : DEMO_PAYMENT_SESSION.amount,
    user: {
      ...DEMO_PAYMENT_SESSION.user,
      id: searchParams.get("userId") || DEMO_PAYMENT_SESSION.user.id,
      name: searchParams.get("userName") || searchParams.get("user") || DEMO_PAYMENT_SESSION.user.name,
    },
    plan: {
      ...DEMO_PAYMENT_SESSION.plan,
      name:
        searchParams.get("planName") ||
        searchParams.get("subscription") ||
        searchParams.get("plan") ||
        DEMO_PAYMENT_SESSION.plan.name,
    },
    createdAt: new Date().toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const externalUrl = process.env.PAYMENT_SESSION_API_URL;

  if (externalUrl) {
    try {
      const url = new URL(externalUrl);
      searchParams.forEach((value, key) => url.searchParams.set(key, value));
      const res = await fetch(url.toString(), { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        return NextResponse.json({
          success: true,
          data: json.data ?? json,
          message: "Session loaded from PAYMENT_SESSION_API_URL.",
          isDemo: false,
        });
      }
    } catch {
      // Fall through to demo session.
    }
  }

  return NextResponse.json({
    success: true,
    data: buildDemo(searchParams),
    message: "Demo session loaded. Set PAYMENT_SESSION_API_URL when a real backend is ready.",
    isDemo: true,
  });
}
