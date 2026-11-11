"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuction } from "@/context/AuctionContext";
import { formatPKR } from "@/lib/rules";
import { AuthModal } from "@/components/AuthModal";
import {
  Gavel,
  Shield,
  Users,
  Database,
  BarChart3,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  Crown,
  Eye,
  Key,
} from "lucide-react";

export default function HomePage() {
  const {
    role,
    franchises,
    players,
    auctionStatus,
    currentPlayer,
    highestBid,
    timer,
    settings,
  } = useAuction();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const totalPlayers = players.length;
  const soldPlayers = players.filter((p) => p.status === "sold" || p.status === "retained" || p.status === "direct_signing");
  const unsoldPlayers = players.filter((p) => p.status === "unsold");
  const totalSpent = franchises.reduce((acc, f) => acc + (f.initialPurse - f.remainingPurse), 0);

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Streamlined Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950/70 border border-emerald-500/30 p-8 sm:p-10 shadow-2xl">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Virtual Auction Platform
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              Preset: {settings.rulePreset === "PSL11" ? "PSL 11 Official Rules" : "PSL 12 Announced Framework"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            PSL 12 Mock Auction <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400 bg-clip-text text-transparent">
              Management Platform
            </span>
          </h1>

          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Real-time player auction for Pakistan Super League franchises. Complete with synchronized countdowns,
            franchise passkeys, 4 base-price brackets, Under-23 player mandates, and official budget restrictions.
          </p>

          {/* Clean Main Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/auction"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
            >
              <Gavel className="w-4 h-4" /> Enter Live Auction Arena
            </Link>

            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-5 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm flex items-center gap-2 transition-colors shadow"
            >
              <Key className="w-4 h-4 text-amber-400" />
              <span>
                {role === "team_owner"
                  ? "Team Owner Dashboard"
                  : role === "admin"
                  ? "Admin Control Panel"
                  : "Join as Team Owner / Login"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Auction Pulse Card (if active player exists) */}
      {currentPlayer && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentPlayer.photoUrl}
              alt={currentPlayer.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/60 shadow"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {currentPlayer.category}
                </span>
                <span className="text-xs text-slate-400">{currentPlayer.primaryRole}</span>
              </div>
              <h3 className="text-xl font-black text-white mt-1">{currentPlayer.name}</h3>
              <p className="text-xs text-slate-400">
                Base Price: {formatPKR(currentPlayer.basePrice)} • {currentPlayer.nationality}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right">
              <span className="text-xs text-slate-400 font-semibold block">Leading Bid</span>
              <span className="text-2xl font-black text-amber-400">
                {highestBid ? formatPKR(highestBid.amount) : formatPKR(currentPlayer.basePrice)}
              </span>
              {highestBid && (
                <span className="text-xs text-emerald-400 block font-bold">
                  By {highestBid.franchiseName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
              <Clock className="w-4 h-4 text-red-400 animate-spin" />
              <span className="font-mono text-xl font-black text-red-400">{timer}s</span>
            </div>

            <Link
              href="/auction"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors shadow"
            >
              Bid Now
            </Link>
          </div>
        </div>
      )}

      {/* 4 Clean Main Hub Cards (Merged as requested) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/auction"
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
            <Gavel className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors">
            Live Arena
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Server countdown timer, live bids, pass/out controls, and audio cues.
          </p>
        </Link>

        <Link
          href="/squads"
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-white group-hover:text-blue-400 transition-colors">
            Squads & Playing XI
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Interactive pitch builder, 3-4 overseas validation, and Under-23 check.
          </p>
        </Link>

        <Link
          href="/players"
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-white group-hover:text-purple-400 transition-colors">
            Player Centre & Import
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Player database, document extraction (Excel/CSV), and trade deals.
          </p>
        </Link>

        <Link
          href="/analytics"
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors">
            Reports & Analytics
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Visual spending charts, franchise comparison, Excel and PDF export.
          </p>
        </Link>
      </div>

      {/* 8 Official PSL Franchises Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" /> Official PSL Franchises ({franchises.length})
            </h2>
            <p className="text-xs text-slate-400">
              Standard Salary Purse: PKR 45 Crore per franchise (qualifying increase to 50.5 Cr).
            </p>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">Select any franchise to view roster</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {franchises.map((f) => {
            const squad = players.filter((p) => p.soldToFranchiseId === f.id);
            const overseas = squad.filter((p) => p.isOverseas).length;

            return (
              <Link
                key={f.id}
                href="/squads"
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-md transition-all hover:scale-[1.01] group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm shadow"
                        style={{ backgroundColor: f.primaryColor }}
                      >
                        {f.shortName}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">
                          {f.name}
                        </h4>
                        <p className="text-[10px] text-slate-400">{f.city}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                      {squad.length}/{f.maxSquadSize}
                    </span>
                  </div>

                  <div className="mt-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                    <span className="text-slate-400">Purse Left:</span>
                    <span className="font-mono font-bold text-amber-400">{formatPKR(f.remainingPurse)}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Overseas: <strong className="text-blue-400">{overseas}</strong></span>
                  <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-bold">
                    View Roster <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
