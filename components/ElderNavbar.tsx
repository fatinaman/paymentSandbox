"use client";

import Link from "next/link";

const TABS = [
  { key: "profile", label: "Profile", href: "#" },
  { key: "visits", label: "Visit History", href: "#" },
  { key: "wellbeing", label: "Wellbeing History", href: "#" },
  { key: "subscriptions", label: "Subscriptions", href: "/" },
];

export default function ElderNavbar({ active = "subscriptions" }: { active?: string }) {
  return (
    <nav className="w-full flex items-center justify-between px-6 md:px-10 py-4 bg-white border-b border-gray-100 shadow-sm z-50">
      <Link href="/" className="flex items-center gap-3">
        <img src="/assets/Shonge Achi logo.png" alt="Shonge Achi Logo" className="w-10 h-10 object-contain" />
        <span className="text-xl font-semibold text-brand-teal">Shonge Achi</span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={`text-sm font-medium transition ${
              active === tab.key
                ? "text-brand-teal border-b-2 border-brand-teal pb-1"
                : "text-gray-600 hover:text-brand-teal"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-full hover:bg-gray-50 transition" title="Notifications" type="button">
          <span className="material-symbols-outlined text-gray-600">notifications</span>
        </button>
        <button
          className="px-5 py-2 rounded-full border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          type="button"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}
