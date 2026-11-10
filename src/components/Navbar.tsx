"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuction } from "@/context/AuctionContext";
import { AudioToggle } from "./AudioToggle";
import { formatPKR } from "@/lib/rules";
import {
  Gavel,
  Shield,
  Users,
  Database,
  FileSpreadsheet,
  ArrowLeftRight,
  BarChart3,
  FileText,
  Sliders,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const {
    role,
    setRole,
    franchises,
    selectedFranchiseId,
    setSelectedFranchiseId,
    activeFranchise,
    auctionStatus,
    currentPlayer,
    highestBid,
    timer,
    startAuction,
    pauseAuction,
    resumeAuction,
  } = useAuction();

  const navLinks = [
    { href: "/auction", label: "Live Arena", icon: Gavel },
    { href: "/franchise", label: "My Franchise", icon: Shield },
    { href: "/squads", label: "Squads & XI", icon: Users },
    { href: "/players", label: "Players", icon: Database },
    { href: "/import", label: "Import Centre", icon: FileSpreadsheet },
    { href: "/trade", label: "Trade Centre", icon: ArrowLeftRight },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/reports", label: "Reports & Export", icon: FileText },
    { href: "/admin", label: "Admin Panel", icon: Sliders },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-emerald-950/80 shadow-2xl">
      {/* Top Bar: Brand, Live Ticker, Role & Franchise Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Season Tag */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-amber-500 p-[2px] shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-emerald-400 text-lg tracking-wider">
                PSL
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">
                  PSL <span className="text-amber-400">12</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Mock Auction
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Automated Auction Management Platform</p>
            </div>
          </Link>

          {/* Center: Live Auction Status & Active Player ticker */}
          <div className="hidden md:flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-full px-4 py-1.5 shadow-inner">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  auctionStatus === "Live"
                    ? "bg-red-500 animate-ping"
                    : auctionStatus === "Paused"
                    ? "bg-amber-400"
                    : "bg-emerald-400"
                }`}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {auctionStatus}
              </span>
            </div>

            {currentPlayer && auctionStatus === "Live" && (
              <div className="flex items-center gap-2 pl-3 border-l border-slate-700/80 text-xs">
                <span className="text-slate-400">On Block:</span>
                <span className="font-semibold text-emerald-400">{currentPlayer.name}</span>
                <span className="text-slate-500">|</span>
                <span className="text-amber-400 font-medium">
                  {highestBid ? formatPKR(highestBid.amount) : formatPKR(currentPlayer.basePrice)}
                </span>
                <span className="bg-red-500/20 border border-red-500/40 text-red-400 font-mono font-bold px-1.5 py-0.2 rounded text-[11px]">
                  {timer}s
                </span>
              </div>
            )}
          </div>

          {/* Right Controls: Role, Franchise Picker, Sound, Admin quick action */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Admin Live control buttons */}
            {role === "super_admin" && (
              <div className="hidden lg:flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
                {auctionStatus === "Live" ? (
                  <button
                    onClick={pauseAuction}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded border border-amber-500/30 transition-colors"
                  >
                    <Pause className="w-3.5 h-3.5" /> Pause
                  </button>
                ) : (
                  <button
                    onClick={auctionStatus === "Paused" ? resumeAuction : startAuction}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded border border-emerald-500/30 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" /> {auctionStatus === "Paused" ? "Resume" : "Start"}
                  </button>
                )}
              </div>
            )}

            {/* Franchise Simulator Selector */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
              <span className="text-[11px] text-slate-400 hidden xl:inline">Team:</span>
              <select
                value={selectedFranchiseId}
                onChange={(e) => setSelectedFranchiseId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
              >
                {franchises.map((f) => (
                  <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                    {f.shortName} - {f.name} ({formatPKR(f.remainingPurse)})
                  </option>
                ))}
              </select>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
              <span className="text-[11px] text-slate-400 hidden xl:inline">Role:</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-emerald-400 focus:outline-none cursor-pointer"
              >
                <option value="super_admin" className="bg-slate-900 text-white">Super Admin</option>
                <option value="franchise_owner" className="bg-slate-900 text-white">Franchise Owner</option>
                <option value="co_owner" className="bg-slate-900 text-white">Co-Owner</option>
                <option value="spectator" className="bg-slate-900 text-white">Spectator</option>
              </select>
            </div>

            {/* Audio Toggle */}
            <AudioToggle />
          </div>
        </div>
      </div>

      {/* Bottom Nav Links Bar */}
      <nav className="border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2 py-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
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
  );
};
