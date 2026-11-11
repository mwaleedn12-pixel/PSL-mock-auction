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
  Users,
  Database,
  BarChart3,
  Sliders,
  Crown,
  Eye,
  LogIn,
  Key,
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
    settings,
  } = useAuction();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Simplified and merged main hubs (as requested by user)
  const navLinks = [
    { href: "/auction", label: "Live Arena", icon: Gavel },
    { href: "/squads", label: "Squads & Teams", icon: Shield },
    { href: "/players", label: "Player Centre", icon: Database },
    { href: "/analytics", label: "Reports & Stats", icon: BarChart3 },
    ...(role === "admin"
      ? [{ href: "/admin", label: "Admin Room", icon: Sliders }]
      : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-emerald-950/80 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Brand Logo & Preset Tag */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-amber-500 p-[2px] shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-emerald-400 text-lg tracking-wider">
                  PSL
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-base tracking-tight">
                    PSL <span className="text-amber-400">Mock Auction</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {settings.rulePreset === "PSL11" ? "PSL 11 Rules" : "PSL 12 Framework"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">Automated Multi-Franchise Auction Manager</p>
              </div>
            </Link>

            {/* Live Ticker preview if live */}
            {currentPlayer && auctionStatus === "Live" && (
              <div className="hidden lg:flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-full px-4 py-1.5 shadow-inner text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-slate-400">On Block:</span>
                <span className="font-bold text-emerald-400">{currentPlayer.name}</span>
                <span className="text-slate-500">|</span>
                <span className="text-amber-400 font-bold font-mono">
                  {highestBid ? formatPKR(highestBid.amount) : formatPKR(currentPlayer.basePrice)}
                </span>
                <span className="bg-red-500/20 text-red-400 font-mono font-bold px-1.5 py-0.2 rounded text-[11px]">
                  {timer}s
                </span>
              </div>
            )}

            {/* Right Side: Role Badge, Login Trigger, Audio */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Role Indicator Button -> Opens Auth Modal */}
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  role === "admin"
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm shadow-amber-500/10"
                    : role === "team_owner" && activeFranchise
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-500/10"
                    : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                }`}
              >
                {role === "admin" ? (
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                ) : role === "team_owner" ? (
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>
                  {role === "admin"
                    ? "Super Admin"
                    : role === "team_owner" && activeFranchise
                    ? `${activeFranchise.shortName} Owner`
                    : "Spectator (Public)"}
                </span>
                <span className="text-[10px] opacity-60">| Switch</span>
              </button>

              {/* Audio Toggle */}
              <AudioToggle />
            </div>
          </div>
        </div>

        {/* Streamlined Main Hubs Bar (4 clean sections) */}
        <nav className="border-t border-slate-800/80 bg-slate-950/70 overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-3 py-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/10"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};
