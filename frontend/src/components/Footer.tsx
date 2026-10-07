"use client";

import React from "react";
import Link from "next/link";
import { Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#F7F7F7] border-t border-[#EBEBEB] text-neutral-600 text-xs mt-auto">
      <div className="max-w-[2520px] mx-auto px-4 sm:px-8 xl:px-16 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-gray-200">
          <div>
            <h4 className="font-bold text-neutral-900 mb-3 text-sm">Support</h4>
            <ul className="space-y-2.5">
              <li><Link href="/" className="hover:underline">Help Center</Link></li>
              <li><Link href="/" className="hover:underline">AirCover protection</Link></li>
              <li><Link href="/" className="hover:underline">Anti-discrimination</Link></li>
              <li><Link href="/" className="hover:underline">Disability support</Link></li>
              <li><Link href="/" className="hover:underline">Cancellation options</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-3 text-sm">Hosting</h4>
            <ul className="space-y-2.5">
              <li><Link href="/host" className="hover:underline">Airbnb your home</Link></li>
              <li><Link href="/host" className="hover:underline">AirCover for Hosts</Link></li>
              <li><Link href="/host" className="hover:underline">Hosting resources</Link></li>
              <li><Link href="/host" className="hover:underline">Community forum</Link></li>
              <li><Link href="/host" className="hover:underline">Hosting responsibly</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-3 text-sm">Airbnb</h4>
            <ul className="space-y-2.5">
              <li><Link href="/" className="hover:underline">Newsroom</Link></li>
              <li><Link href="/" className="hover:underline">New features</Link></li>
              <li><Link href="/" className="hover:underline">Careers</Link></li>
              <li><Link href="/" className="hover:underline">Investors</Link></li>
              <li><Link href="/" className="hover:underline">Gift cards</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-3 text-sm">SDE Assignment</h4>
            <ul className="space-y-2.5">
              <li><span className="text-neutral-500">Tech: Next.js + FastAPI + SQLite</span></li>
              <li><span className="text-neutral-500">Interactive Maps & Availability Calendar</span></li>
              <li><span className="text-neutral-500">Host CRUD & Reservations Analytics</span></li>
              <li><span className="text-neutral-500">Reviews & Wishlists persistence</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span>© 2026 Airbnb Clone</span>
            <span>•</span>
            <Link href="/" className="hover:underline">Privacy</Link>
            <span>•</span>
            <Link href="/" className="hover:underline">Terms</Link>
            <span>•</span>
            <Link href="/" className="hover:underline">Sitemap</Link>
          </div>

          <div className="flex items-center gap-4 font-semibold text-neutral-800">
            <div className="flex items-center gap-1.5 cursor-pointer hover:underline">
              <Globe className="w-4 h-4" />
              <span>English (US)</span>
            </div>
            <div className="cursor-pointer hover:underline">
              <span>$ USD</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
