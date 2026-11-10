"use client";

import React from "react";
import Link from "next/link";
import { useAuction } from "@/context/AuctionContext";
import { formatPKR } from "@/lib/rules";
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
  XCircle,
  Clock,
} from "lucide-react";

export default function HomePage() {
  const {
    franchises,
    players,
    auctionStatus,
    currentPlayer,
    highestBid,
    timer,
    setSelectedFranchiseId,
  } = useAuction();

  const totalPlayers = players.length;
  const soldPlayers = players.filter((p) => p.status === "sold" || p.status === "retained" || p.status === "direct_signing");
  const unsoldPlayers = players.filter((p) => p.status === "unsold");
  const remainingPlayers = players.filter((p) => p.status === "upcoming");
  const totalSpent = franchises.reduce((acc, f) => acc + (f.initialPurse - f.remainingPurse), 0);

  const topSoldPlayer = [...players]
    .filter((p) => p.status === "sold" && p.soldPrice)
    .sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0))[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero PSL Broadcast Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950/60 border border-emerald-500/30 p-8 sm:p-10 shadow-2xl">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Official Mock Auction Engine
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            PSL 12 Automated Mock <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400 bg-clip-text text-transparent">
              Auction Management Platform
            </span>
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Real-time automated bidding engine for Pakistan Super League 12. Complete with synchronized countdowns,
            franchise purse enforcement, multi-format player document extraction, playing XI builder, and live reports.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/auction"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
            >
              <Gavel className="w-4 h-4" /> Enter Live Auction Arena
            </Link>
            <Link
              href="/admin"
              className="px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-bold text-sm flex items-center gap-2 transition-colors"
            >
              Admin Control Panel <ArrowRight className="w-4 h-4 text-emerald-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Live Auction Pulse Card (if active) */}
      {currentPlayer && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentPlayer.photoUrl}
              alt={currentPlayer.name}
              className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-500/60 shadow"
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
                Base: {formatPKR(currentPlayer.basePrice)} • {currentPlayer.nationality}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right">
              <span className="text-xs text-slate-400 font-semibold block">Current Highest Bid</span>
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

      {/* Top 4 Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Registered</span>
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-white">{totalPlayers}</p>
          <p className="text-xs text-slate-500 mt-1">{remainingPlayers.length} upcoming in queue</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Players Sold</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400">{soldPlayers.length}</p>
          <p className="text-xs text-slate-500 mt-1">{unsoldPlayers.length} currently unsold</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Spent</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">{formatPKR(totalSpent)}</p>
          <p className="text-xs text-slate-500 mt-1">Across all 6 franchises</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Top Buy</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          {topSoldPlayer ? (
            <div>
              <p className="text-lg font-black text-white truncate">{topSoldPlayer.name}</p>
              <p className="text-xs text-purple-400 font-bold">{formatPKR(topSoldPlayer.soldPrice || 0)}</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-bold text-slate-500">Auction In Progress</p>
              <p className="text-xs text-slate-600">No sales finalized yet</p>
            </div>
          )}
        </div>
      </div>

      {/* 6 Franchise Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" /> PSL 12 Franchises
          </h2>
          <span className="text-xs text-slate-400">Click any franchise to open its dashboard</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {franchises.map((f) => {
            const squad = players.filter((p) => p.soldToFranchiseId === f.id);
            const overseas = squad.filter((p) => p.isOverseas).length;
            const spentPercent = ((f.initialPurse - f.remainingPurse) / f.initialPurse) * 100;

            return (
              <div
                key={f.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-md transition-all hover:scale-[1.01] group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base shadow"
                        style={{ backgroundColor: f.primaryColor }}
                      >
                        {f.shortName}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-white text-base group-hover:text-emerald-400 transition-colors">
                          {f.name}
                        </h3>
                        <p className="text-xs text-slate-400">Owner: {f.ownerName}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                      {squad.length}/{f.maxSquadSize}
                    </span>
                  </div>

                  {/* Purse Status */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Remaining Purse</span>
                      <span className="font-bold text-amber-400">{formatPKR(f.remainingPurse)}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full"
                        style={{ width: `${Math.min(100, spentPercent)}%` }}
                      />
                    </div>
                  </div>

                  {/* Squad Stats Breakdown */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-center text-xs">
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Squad</span>
                      <span className="font-bold text-white">{squad.length} / {f.minSquadSize} min</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Overseas</span>
                      <span className="font-bold text-blue-400">{overseas} / {f.maxOverseas} max</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <Link
                    href="/franchise"
                    onClick={() => setSelectedFranchiseId(f.id)}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    View Team Dashboard <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/squads"
                    onClick={() => setSelectedFranchiseId(f.id)}
                    className="text-[11px] text-slate-400 hover:text-white"
                  >
                    Playing XI
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
