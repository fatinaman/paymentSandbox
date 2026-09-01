import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-surface-container w-full mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 py-6 max-w-[1440px] mx-auto gap-4">
        <div className="flex items-center gap-2">
          <img src="/assets/Shonge Achi logo.png" alt="Shonge Achi Logo" className="w-8 h-8 object-contain" />
          <span className="font-semibold text-title-md text-primary">Shonge Achi</span>
        </div>
        <p className="text-body-md text-on-surface-variant text-center md:text-left">
          © 2026 Shonge Achi. Dedicated to Elder Care with Love and Reliability.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <a className="text-label-sm text-on-surface-variant hover:underline" href="#">
            Privacy Policy
          </a>
          <a className="text-label-sm text-on-surface-variant hover:underline" href="#">
            Terms of Service
          </a>
          <Link className="text-label-sm text-on-surface-variant hover:underline" href="/records">
            Payment Records
          </Link>
          <a className="text-label-sm text-on-surface-variant hover:underline" href="#">
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
}
