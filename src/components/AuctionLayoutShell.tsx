"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuction } from "@/context/AuctionContext";
import { Navbar } from "./Navbar";

export const AuctionLayoutShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { themeMode } = useAuction();
  const pathname = usePathname();
  const isDark = themeMode === "broadcast_dark";

  // Landing page gets fullscreen treatment — no navbar/footer
  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 selection:bg-emerald-500 selection:text-white ${
        isDark ? "bg-[#070b14] text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
      style={{
        backgroundImage: isDark
          ? "radial-gradient(at 0% 0%, rgba(0, 168, 89, 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(245, 158, 11, 0.12) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(0, 168, 89, 0.1) 0px, transparent 60%)"
          : "radial-gradient(at 0% 0%, rgba(0, 168, 89, 0.08) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(245, 158, 11, 0.06) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(0, 168, 89, 0.05) 0px, transparent 60%)",
        backgroundAttachment: "fixed",
      }}
    >
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {children}
      </main>
      <footer
        className={`border-t py-4 text-center text-xs shadow-inner transition-colors ${
          isDark ? "border-slate-800/80 bg-slate-950/80 text-slate-400" : "border-slate-200 bg-white text-slate-500"
        }`}
      >
        <p className={`font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
          HBL PSL 12 Live Mock Auction Arena
        </p>
        <p className={`text-[11px] mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          Live Real-Time Multi-Device Virtual Player Auction &amp; Franchise Squad Management
        </p>
      </footer>
    </div>
  );
};
