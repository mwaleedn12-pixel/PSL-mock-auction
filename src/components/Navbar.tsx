"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuction } from "@/context/AuctionContext";
import { AudioToggle } from "./AudioToggle";
import { AuthModal } from "./AuthModal";
import { formatPKR } from "@/lib/rules";
import {
  Gavel,
  Shield,
  Sliders,
  Crown,
  Eye,
  LogIn,
  Key,
  Cloud,
  RefreshCw,
  UserCheck,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const {
    role,
    activeFranchise,
    auctionStatus,
    currentPlayer,
    highestBid,
    timer,
    isCloudConnected,
    themeMode,
  } = useAuction();

  const isDark = themeMode === "broadcast_dark";
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const navLinks = [
    { href: "/auction", label: "Live Auction", icon: Gavel },
    { href: "/join", label: "Select Team", icon: Shield },
    { href: "/franchise", label: "Franchises", icon: Shield },
    { href: "/squads", label: "Squads & XI", icon: UserCheck },
    { href: "/analytics", label: "Analytics", icon: Crown },
    { href: "/admin", label: "Admin Room", icon: Sliders },
  ];

  return (
    <>
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b shadow-sm transition-colors ${
        isDark ? "bg-slate-950/95 border-slate-800 text-white" : "bg-white/95 border-slate-200 text-slate-900"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Brand Logo - Official HBL PSL Branding */}
            <Link href="/auction" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-emerald-500/30 shadow-sm group-hover:scale-105 transition-transform bg-emerald-950 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/psl-brand.jpg"
                  alt="HBL PSL"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`font-black text-base tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                    HBL PSL 12 <span className="text-emerald-500 font-extrabold">Auction</span>
                  </span>
                </div>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-colors ${
                      isActive
                        ? isDark
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm"
                        : isDark
                          ? "text-slate-400 hover:text-white hover:bg-slate-900"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Live Ticker preview if live */}
            {currentPlayer && auctionStatus === "Live" && (
              <div className="hidden lg:flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-full px-3.5 py-1 text-xs">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-slate-500 text-[11px]">On Block:</span>
                <span className="font-black text-slate-900">{currentPlayer.name}</span>
                <span className="text-slate-300">|</span>
                <span className="text-emerald-700 font-black font-mono">
                  {highestBid ? formatPKR(highestBid.amount) : formatPKR(currentPlayer.basePrice)}
                </span>
                <span className="bg-red-100 text-red-700 font-mono font-black px-1.5 py-0.2 rounded text-[11px]">
                  {timer}s
                </span>
              </div>
            )}

            {/* Right Side: Cloud Pill, Role Pill, Audio */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Cloud Sync Status Pill */}
              {isCloudConnected ? (
                <div
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-300 text-cyan-800 text-[11px] font-black shadow-sm"
                  title="Connected to Supabase Realtime Cloud (Synchronized across all internet devices)"
                >
                  <Cloud className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
                  <span>Supabase Live</span>
                </div>
              ) : (
                <div
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold"
                  title="Local cross-tab synchronization active. Add Supabase keys to Vercel for global sync."
                >
                  <RefreshCw className="w-3 h-3 text-slate-500" />
                  <span>Local Sync</span>
                </div>
              )}

              {/* Role Indicator Button -> Opens Auth Modal */}
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                  role === "admin"
                    ? "bg-amber-50 text-amber-900 border-amber-300 shadow-sm"
                    : role === "team_owner" && activeFranchise
                    ? "bg-emerald-50 text-emerald-900 border-emerald-300 shadow-sm"
                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                }`}
              >
                {role === "admin" ? (
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                ) : role === "team_owner" && activeFranchise ? (
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white font-black"
                    style={{ backgroundColor: activeFranchise.primaryColor }}
                  >
                    {activeFranchise.shortName.substring(0, 2)}
                  </div>
                ) : (
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>
                  {role === "admin"
                    ? "👑 Admin"
                    : role === "team_owner" && activeFranchise
                    ? `${activeFranchise.shortName} (${activeFranchise.ownerName || "Owner"})`
                    : "Viewer"}
                </span>
              </button>

              {/* Audio Sound Toggle */}
              <AudioToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Role / Authentication Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};
