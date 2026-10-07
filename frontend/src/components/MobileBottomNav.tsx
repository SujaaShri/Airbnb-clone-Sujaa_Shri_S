"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Heart, Briefcase, Home } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { wishlistIds } = useApp();

  const links = [
    { href: "/", label: "Explore", icon: Search },
    { href: "/wishlists", label: "Wishlists", icon: Heart, badge: wishlistIds.size },
    { href: "/trips", label: "Trips", icon: Briefcase },
    { href: "/host", label: "Hosting", icon: Home },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 py-2 px-6 flex items-center justify-around shadow-lg">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors relative ${
              isActive ? "text-[#FF385C]" : "text-neutral-500 hover:text-black"
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              {Boolean(link.badge && link.badge > 0) && (
                <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[#FF385C] text-white text-[9px] flex items-center justify-center font-bold">
                  {link.badge}
                </span>
              )}
            </div>
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
