"use client";

import React, { useState } from "react";
import { useAuction } from "@/context/AuctionContext";
import { formatPKR } from "@/lib/rules";
import { PlayingXIModal } from "@/components/PlayingXIModal";
import { PlayerDetailModal } from "@/components/PlayerDetailModal";
import { Player } from "@/types/auction";
import {
  Shield,
  Coins,
  Users,
  Award,
  Globe,
  Sparkles,
  TrendingDown,
  TrendingUp,
  History,
  Activity,
  CheckCircle,
  Clock,
  UserCheck,
} from "lucide-react";

export default function FranchiseDashboardPage() {
  const {
    role,
    authenticatedFranchiseId,
    activeFranchise,
    franchises,
    players,
    eventLogs,
    themeMode,
    savePlayingXI,
  } = useAuction();

  // Selected franchise to view (defaults to authenticated franchise or first team)
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>(
    authenticatedFranchiseId || franchises[0]?.id || "iu"
  );
  const [isXIModalOpen, setIsXIModalOpen] = useState(false);
  const [inspectingPlayer, setInspectingPlayer] = useState<Player | null>(null);

  const franchise = franchises.find((f) => f.id === selectedFranchiseId) || franchises[0];

  // Squad metrics
  const squad = players.filter((p) => p.soldToFranchiseId === franchise.id);
  const domesticPlayers = squad.filter((p) => !p.isOverseas);
  const overseasPlayers = squad.filter((p) => p.isOverseas);
  const u23Players = squad.filter((p) => p.isUnder23 && p.isUncapped);

  // Composition metrics
  const batters = squad.filter((p) => p.primaryRole === "Batter");
  const bowlers = squad.filter((p) => p.primaryRole === "Bowler");
  const fastBowlers = squad.filter(
    (p) => p.primaryRole === "Bowler" && p.bowlingStyle.toLowerCase().includes("fast")
  );
  const spinners = squad.filter(
    (p) =>
      p.primaryRole === "Bowler" &&
      (p.bowlingStyle.toLowerCase().includes("spin") ||
        p.bowlingStyle.toLowerCase().includes("break") ||
        p.bowlingStyle.toLowerCase().includes("orthodox"))
  );
  const allrounders = squad.filter((p) => p.primaryRole === "All-Rounder");
  const keepers = squad.filter((p) => p.primaryRole === "Wicketkeeper");

  // Financial calculations
  const totalSpent = franchise.initialPurse - franchise.remainingPurse;
  const spentPercent = (totalSpent / franchise.initialPurse) * 100;
  const remainingBudgetPercent = (franchise.remainingPurse / franchise.initialPurse) * 100;

  const domesticSpending = domesticPlayers.reduce(
    (sum, p) => sum + (p.soldPrice || p.basePrice || 0),
    0
  );
  const overseasSpending = overseasPlayers.reduce(
    (sum, p) => sum + (p.soldPrice || p.basePrice || 0),
    0
  );

  const sortedByPrice = [...squad].sort(
    (a, b) => (b.soldPrice || b.basePrice || 0) - (a.soldPrice || a.basePrice || 0)
  );
  const mostExpensive = sortedByPrice[0] || null;
  const cheapest = sortedByPrice[sortedByPrice.length - 1] || null;
  const avgPurchasePrice =
    squad.length > 0
      ? squad.reduce((sum, p) => sum + (p.soldPrice || p.basePrice || 0), 0) / squad.length
      : 0;

  // Franchise-specific transaction history
  const franchiseTransactions = eventLogs.filter(
    (log) => log.franchiseId === franchise.id || (log.description && log.description.includes(franchise.name))
  );

  const isDark = themeMode !== "stadium_light";

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* 1. All-Franchise Switcher Strip */}
      <div className={`p-2 rounded-2xl border flex items-center gap-2 overflow-x-auto no-scrollbar ${
        isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200 shadow-sm"
      }`}>
        <span className={`text-[11px] font-bold uppercase tracking-wider px-2 shrink-0 ${
          isDark ? "text-slate-400" : "text-slate-500"
        }`}>
          Select Franchise:
        </span>
        {franchises.map((f) => {
          const isSelected = f.id === franchise.id;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedFranchiseId(f.id)}
              style={{
                borderColor: isSelected ? f.primaryColor : undefined,
                backgroundColor: isSelected ? `${f.primaryColor}22` : undefined,
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 ${
                isSelected
                  ? "border-2 shadow-sm font-black"
                  : isDark
                  ? "border-slate-800 bg-slate-950/60 text-slate-300 hover:text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:text-slate-900"
              }`}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: f.primaryColor }}
              />
              <span>{f.name}</span>
              {f.ownerName && (
                <span className={`text-[10px] font-medium opacity-75 hidden sm:inline`}>
                  ({f.ownerName})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Franchise Master Header Banner */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border shadow-xl relative overflow-hidden transition-all ${
          isDark ? "bg-slate-900/90 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-sm"
        }`}
      >
        <div
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: franchise.primaryColor }}
        />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-black text-white text-2xl sm:text-3xl shadow-xl shrink-0"
              style={{ backgroundColor: franchise.primaryColor }}
            >
              {franchise.shortName}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {franchise.city}, Pakistan
                </span>
                <span className="text-slate-500">•</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  franchise.isClaimed
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                }`}>
                  {franchise.isClaimed ? `Claimed by ${franchise.ownerName}` : "Open Franchise"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight mt-1">
                {franchise.name}
              </h1>
              <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Franchise Owner: <strong className={isDark ? "text-slate-200" : "text-slate-900"}>{franchise.ownerName || "Unassigned"}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsXIModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-colors shadow-lg shadow-emerald-600/25"
            >
              <Users className="w-4 h-4" /> Playing XI ({franchise.playingXI?.length || 0}/11)
            </button>
          </div>
        </div>

        {/* 3. Core Financial & Squad Quota Metrics Grid */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-950/70 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Remaining Purse
            </span>
            <p className="text-2xl sm:text-3xl font-black text-amber-500 font-mono mt-1">
              {formatPKR(franchise.remainingPurse)}
            </p>
            <div className={`w-full h-1.5 rounded-full mt-2 overflow-hidden ${isDark ? "bg-slate-900" : "bg-slate-200"}`}>
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${Math.max(0, remainingBudgetPercent)}%` }}
              />
            </div>
            <span className={`text-[10px] mt-1 block font-mono ${isDark ? "text-slate-500" : "text-slate-600"}`}>
              {remainingBudgetPercent.toFixed(1)}% of total budget remaining
            </span>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-950/70 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Total Spent
            </span>
            <p className={`text-2xl sm:text-3xl font-black font-mono mt-1 ${isDark ? "text-white" : "text-slate-900"}`}>
              {formatPKR(totalSpent)}
            </p>
            <span className={`text-[10px] mt-1 block font-mono ${isDark ? "text-slate-500" : "text-slate-600"}`}>
              {spentPercent.toFixed(1)}% of PKR 45.00 Cr purse
            </span>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-950/70 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Squad Size ({franchise.minSquadSize}-{franchise.maxSquadSize})
            </span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-500 font-mono mt-1">
              {squad.length} / {franchise.maxSquadSize}
            </p>
            <span className={`text-[10px] mt-1 block ${isDark ? "text-slate-500" : "text-slate-600"}`}>
              {Math.max(0, franchise.minSquadSize - squad.length)} slots needed to reach minimum
            </span>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-950/70 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              RTM Cards & Overseas
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-black text-amber-500 flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> {franchise.rtmCardsLeft ?? 2} RTM
              </span>
              <span className="text-sm font-bold text-cyan-500">
                {overseasPlayers.length}/{franchise.maxOverseas} Overseas
              </span>
            </div>
            <span className={`text-[10px] mt-1 block ${isDark ? "text-slate-500" : "text-slate-600"}`}>
              Domestic: {domesticPlayers.length} • U-23: {u23Players.length}/2
            </span>
          </div>
        </div>
      </div>

      {/* 4. Squad Composition Breakdown & Financial Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Composition Cards (Left Column) */}
        <div className={`lg:col-span-6 p-6 rounded-3xl border shadow-sm space-y-4 ${
          isDark ? "bg-slate-900/90 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
        }`}>
          <div className="pb-3 border-b border-slate-800/80 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" /> Squad Role Composition
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Positional breakdown across batting, pace, spin, all-round, and wicketkeeping.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {squad.length} Total
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center text-xs">
            <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <span className={`block text-[10px] font-bold uppercase ${isDark ? "text-slate-400" : "text-slate-500"}`}>🏏 Batters</span>
              <p className="text-2xl font-black mt-1 font-mono">{batters.length}</p>
            </div>

            <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <span className={`block text-[10px] font-bold uppercase ${isDark ? "text-slate-400" : "text-slate-500"}`}>⚡ Fast Bowlers</span>
              <p className="text-2xl font-black mt-1 font-mono text-cyan-400">{fastBowlers.length || bowlers.length}</p>
            </div>

            <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <span className={`block text-[10px] font-bold uppercase ${isDark ? "text-slate-400" : "text-slate-500"}`}>🌀 Spinners</span>
              <p className="text-2xl font-black mt-1 font-mono text-purple-400">{spinners.length}</p>
            </div>

            <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <span className={`block text-[10px] font-bold uppercase ${isDark ? "text-slate-400" : "text-slate-500"}`}>★ All-Rounders</span>
              <p className="text-2xl font-black mt-1 font-mono text-amber-400">{allrounders.length}</p>
            </div>

            <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <span className={`block text-[10px] font-bold uppercase ${isDark ? "text-slate-400" : "text-slate-500"}`}>🧤 Wicketkeepers</span>
              <p className="text-2xl font-black mt-1 font-mono text-emerald-400">{keepers.length}</p>
            </div>

            <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <span className={`block text-[10px] font-bold uppercase ${isDark ? "text-slate-400" : "text-slate-500"}`}>🌍 Overseas</span>
              <p className="text-2xl font-black mt-1 font-mono text-sky-400">{overseasPlayers.length}</p>
            </div>
          </div>
        </div>

        {/* Financial Analytics & Signings Showcase (Right Column) */}
        <div className={`lg:col-span-6 p-6 rounded-3xl border shadow-sm space-y-4 ${
          isDark ? "bg-slate-900/90 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
        }`}>
          <div className="pb-3 border-b border-slate-800/80">
            <h3 className="text-base font-black flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" /> Advanced Financial Analytics
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Acquisition distribution, spending efficiency, and signing valuation metrics.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <span className={`text-[10px] font-bold uppercase block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Most Expensive Signing
              </span>
              <p className="font-black text-sm text-amber-400 truncate mt-0.5">
                {mostExpensive ? mostExpensive.name : "None yet"}
              </p>
              <span className="font-mono font-bold text-xs">
                {mostExpensive ? formatPKR(mostExpensive.soldPrice || mostExpensive.basePrice) : "—"}
              </span>
            </div>

            <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <span className={`text-[10px] font-bold uppercase block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Average Purchase Price
              </span>
              <p className="font-black text-sm text-emerald-400 font-mono mt-0.5">
                {squad.length > 0 ? formatPKR(avgPurchasePrice) : "—"}
              </p>
              <span className={`text-[10px] ${isDark ? "text-slate-500" : "text-slate-600"}`}>Across {squad.length} buys</span>
            </div>

            <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <span className={`text-[10px] font-bold uppercase block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Cheapest Signing
              </span>
              <p className="font-black text-sm text-cyan-400 truncate mt-0.5">
                {cheapest ? cheapest.name : "None yet"}
              </p>
              <span className="font-mono font-bold text-xs">
                {cheapest ? formatPKR(cheapest.soldPrice || cheapest.basePrice) : "—"}
              </span>
            </div>

            <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
              <span className={`text-[10px] font-bold uppercase block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Domestic vs Overseas Spend
              </span>
              <p className="font-mono font-bold text-xs mt-0.5 text-emerald-400">
                Dom: {formatPKR(domesticSpending)}
              </p>
              <p className="font-mono font-bold text-xs text-sky-400">
                Ovs: {formatPKR(overseasSpending)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Complete Squad Roster Table */}
      <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
        isDark ? "bg-slate-900/90 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <h3 className="text-base font-black">Official Squad Players ({squad.length})</h3>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Click any player to inspect verified career stats, Cricinfo profile, and category history.
            </p>
          </div>
        </div>

        {squad.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-10">
            No players purchased yet. Players won in the live auction will appear here immediately.
          </p>
        ) : (
          <div className="overflow-x-auto border border-slate-800/80 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className={`font-bold ${isDark ? "bg-slate-950 text-slate-400" : "bg-slate-100 text-slate-600"}`}>
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Player</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Nationality</th>
                  <th className="p-3">Purchase Price</th>
                  <th className="p-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-medium ${isDark ? "divide-slate-800/60" : "divide-slate-100"}`}>
                {squad.map((p, idx) => (
                  <tr
                    key={p.id}
                    onClick={() => setInspectingPlayer(p)}
                    className={`cursor-pointer transition-colors ${
                      isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.photoUrl}
                          alt={p.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait-lg-webp/prd/assets/players/generic/colored/69957.png";
                          }}
                          className="w-8 h-8 rounded-lg object-cover object-top border border-slate-700 shrink-0 bg-slate-950"
                        />
                        <span className="font-bold">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-800 text-amber-300 border border-slate-700">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-3">{p.primaryRole}</td>
                    <td className="p-3">
                      {p.isOverseas ? (
                        <span className="text-cyan-400 font-semibold">Overseas ({p.nationality})</span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">Domestic</span>
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-400">
                      {formatPKR(p.soldPrice || p.basePrice)}
                    </td>
                    <td className="p-3 text-right">
                      <button className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold">
                        View Profile →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Franchise Transaction History */}
      <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
        isDark ? "bg-slate-900/90 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
      }`}>
        <div className="pb-3 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-500" /> Auction Transaction Log
            </h3>
            <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Audited chronological log of every bid, win, trade, and retention for {franchise.name}.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">{franchiseTransactions.length} Events</span>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
          {franchiseTransactions.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-6">No recorded transactions for this franchise yet.</p>
          ) : (
            franchiseTransactions.map((tx) => (
              <div
                key={tx.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                  isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-slate-500 text-[10px] shrink-0">
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="truncate">{tx.description}</span>
                </div>
                {tx.amount && (
                  <span className="font-mono font-bold text-amber-400 shrink-0">{formatPKR(tx.amount)}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Playing XI Modal */}
      <PlayingXIModal
        franchise={franchise}
        allPlayers={players}
        isOpen={isXIModalOpen}
        onClose={() => setIsXIModalOpen(false)}
        onSave={(playerIds, cId, vcId) => savePlayingXI(franchise.id, playerIds, cId, vcId)}
      />

      {/* Inspect Player Profile Modal */}
      {inspectingPlayer && (
        <PlayerDetailModal player={inspectingPlayer} onClose={() => setInspectingPlayer(null)} />
      )}
    </div>
  );
}
