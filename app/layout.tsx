import type { Metadata } from "next";
import ElderNavbar from "@/components/ElderNavbar";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shonge Achi - Payment Gateway",
  description: "Sandboxed Bangladesh payment gateway for subscriptions (bKash, Nagad, Card).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-surface antialiased">
        <ElderNavbar active="subscriptions" />
        <div className="flex-grow flex flex-col">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
