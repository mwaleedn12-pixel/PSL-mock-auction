"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Cloud,
  RefreshCw,
  UserCheck,
  BarChart3,
  Users,
  LogOut,
  Home,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    role,
    activeFranchise,
    auctionStatus,
    currentPlayer,
    highestBid,
    timer,
    isCloudConnected,
    themeMode,
    logoutToSpectator,
  } = useAuction();

  const isDark = themeMode === "broadcast_dark";
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Role-based navigation links
  const adminLinks = [
    { href: "/auction", label: "Live Auction", icon: Gavel },
    { href: "/franchise", label: "Franchises", icon: Shield },
    { href: "/squads", label: "Squads & XI", icon: UserCheck },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin", label: "Admin Room", icon: Sliders },
  ];

  const ownerLinks = [
    { href: "/auction", label: "Live Auction", icon: Gavel },
    { href: "/franchise", label: "Franchises", icon: Shield },
    { href: "/squads", label: "Squads & XI", icon: UserCheck },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  const spectatorLinks = [
    { href: "/auction", label: "Live Auction", icon: Gavel },
    { href: "/franchise", label: "Franchises", icon: Shield },
    { href: "/squads", label: "Squads", icon: UserCheck },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  const navLinks =
    role === "admin" ? adminLinks : role === "team_owner" ? ownerLinks : spectatorLinks;

  const handleLogout = () => {
    logoutToSpectator();
    router.push("/");
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b shadow-sm transition-colors ${
          isDark
            ? "bg-slate-950/95 border-slate-800 text-white"
            : "bg-white/95 border-slate-200 text-slate-900"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-3">
            {/* Brand Logo */}
            <Link href="/auction" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-emerald-500/30 shadow-sm group-hover:scale-105 transition-transform bg-emerald-950 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/psl-brand.jpg"
                  alt="HBL PSL"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="hidden sm:block">
                <span
                  className={`font-black text-sm tracking-tight ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  HBL PSL 12{" "}
                  <span className="text-emerald-500 font-extrabold">Auction</span>
                </span>
              </div>
            </Link>

            {/* Navigation Links - role filtered */}
            <nav className="hidden md:flex items-center gap-0.5">
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

            {/* Live Ticker if live */}
            {currentPlayer && auctionStatus === "Live" && (
              <div
                className={`hidden lg:flex items-center gap-2 rounded-full px-3 py-1 text-xs border ${
                  isDark
                    ? "bg-red-950/60 border-red-800/50 text-red-300"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                <span className="text-[11px] opacity-70">On Block:</span>
                <span className="font-black text-[11px]">{currentPlayer.name}</span>
                <span className="font-mono font-black text-[11px] text-amber-400">
                  {highestBid ? formatPKR(highestBid.amount) : formatPKR(currentPlayer.basePrice)}
                </span>
                <span className="font-mono font-black text-[11px] text-red-400">{timer}s</span>
              </div>
            )}

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Cloud Sync */}
              {isCloudConnected ? (
                <div
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-400 text-[10px] font-black"
                  title="Connected to Supabase Realtime"
                >
                  <Cloud className="w-3 h-3 animate-pulse" />
                  <span className="hidden lg:inline">Live</span>
                </div>
              ) : (
                <div
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 text-[10px] font-bold"
                  title="Local cross-tab sync"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span className="hidden lg:inline">Local</span>
                </div>
              )}

              {/* Role Pill */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-black border ${
                  role === "admin"
                    ? "bg-amber-950/80 text-amber-400 border-amber-700/50"
                    : role === "team_owner" && activeFranchise
                    ? "bg-emerald-950/80 text-emerald-400 border-emerald-700/50"
                    : isDark
                    ? "bg-slate-900 text-slate-400 border-slate-700"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {role === "admin" ? (
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                ) : role === "team_owner" && activeFranchise ? (
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-black shrink-0"
                    style={{ backgroundColor: activeFranchise.primaryColor }}
                  >
                    {activeFranchise.shortName.substring(0, 2)}
                  </div>
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">
                  {role === "admin"
                    ? "Admin"
                    : role === "team_owner" && activeFranchise
                    ? `${activeFranchise.shortName}`
                    : "Viewer"}
                </span>
              </div>

              {/* Logout / Home button */}
              <button
                onClick={handleLogout}
                title="Go to Home / Logout"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-colors ${
                  isDark
                    ? "border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                    : "border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Home</span>
              </button>

              {/* Audio Sound Toggle */}
              <AudioToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal kept for backward compat */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};
