"use client";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/app/lib/session";
import NotificationBell from "@/app/components/NotificationBell";

const TABS = [
  { key: "profile", label: "Profile" },
  { key: "visits", label: "Visit History" },
  { key: "wellbeing", label: "Wellbeing History" },
  { key: "checkers", label: "Checkers" },
];

export default function ElderNavbar({ elderId, active }) {
  return (
    <nav className="w-full flex items-center justify-between px-10 py-4 bg-white border-b border-gray-100 shadow-sm">
      <Link href="/dashboard" className="flex items-center gap-3">
        <Image src="/logo.png" alt="Shonge Achi Logo" width={40} height={40} />
        <span className="text-xl font-semibold text-[#2a7a5a]">Shonge Achi</span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/elder/${elderId}/${tab.key}`}
            className={`text-sm font-medium transition ${
              active === tab.key
                ? "text-[#2a7a5a] border-b-2 border-[#2a7a5a] pb-1"
                : "text-gray-600 hover:text-[#2a7a5a]"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="px-5 py-2 rounded-full border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}