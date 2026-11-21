"use client";

import React from "react";
import { useAuction } from "@/context/AuctionContext";
import { formatPKR } from "@/lib/rules";
import {
  Coins,
  Users,
  Globe,
  Sparkles,
  Shield,
  TrendingDown,
  CheckCircle,
  Clock,
  LogOut,
} from "lucide-react";

export const FranchiseComparisonMatrix: React.FC = () => {
  const {
    franchises,
    players,
    highestBid,
    franchiseStatuses,
    activeFranchise,
    settings,
  } = useAuction();

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" /> All Franchise Statistics &amp; Purse Ledgers
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time financial purse, squad quotas, overseas limits, and RTM allocations.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold">Min Squad:</span>
          <span className="bg-slate-800 text-emerald-400 font-bold px-2 py-0.5 rounded">
            {settings.minSquadSize} Players
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 font-semibold">Max Squad:</span>
          <span className="bg-slate-800 text-amber-400 font-bold px-2 py-0.5 rounded">
            {settings.maxSquadSize} Players
          </span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 font-bold border-b border-slate-800">
            <tr>
              <th className="py-3 px-3">Franchise</th>
              <th className="py-3 px-3">Remaining Purse</th>
              <th className="py-3 px-3">Spent</th>
              <th className="py-3 px-3 text-center">Squad</th>
              <th className="py-3 px-3 text-center">Min Slots Left</th>
              <th className="py-3 px-3 text-center">Overseas Left</th>
              <th className="py-3 px-3 text-center">U-23 (Min 2)</th>
              <th className="py-3 px-3 text-center">RTM Cards</th>
              <th className="py-3 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {franchises.map((f) => {
              const squad = players.filter((p) => p.soldToFranchiseId === f.id);
              const overseasCount = squad.filter((p) => p.isOverseas).length;
              const u23Count = squad.filter((p) => p.isUnder23 && p.isUncapped).length;
              const spent = f.initialPurse - f.remainingPurse;
              const spentPercent = (spent / f.initialPurse) * 100;
              const minSlotsRequired = Math.max(0, f.minSquadSize - squad.length);
              const maxOverseasAllowed = f.maxOverseas || 7;
              const overseasSlotsLeft = Math.max(0, maxOverseasAllowed - overseasCount);

              const isMe = activeFranchise?.id === f.id;
              const isLeading = highestBid && highestBid.franchiseId === f.id;
              const currentStatus = franchiseStatuses[f.id] || "active";

              return (
                <tr
                  key={f.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    isMe ? "bg-emerald-950/20 font-semibold" : ""
                  }`}
                >
                  {/* Franchise Identity */}
                  <td className="py-3 px-3 flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white shadow-sm shrink-0"
                      style={{ backgroundColor: f.primaryColor }}
                    >
                      {f.shortName}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-white font-bold">{f.name}</span>
                        {isMe && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 rounded">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-normal">{f.ownerName}</span>
                    </div>
                  </td>

                  {/* Remaining Purse */}
                  <td className="py-3 px-3">
                    <span className="font-bold text-amber-400 text-sm">{formatPKR(f.remainingPurse)}</span>
                    <div className="w-24 bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${Math.max(0, 100 - spentPercent)}%` }}
                      />
                    </div>
                  </td>

                  {/* Spent Purse */}
                  <td className="py-3 px-3 text-slate-400">
                    <span>{formatPKR(spent)}</span>
                    <span className="block text-[10px] text-slate-500">{spentPercent.toFixed(1)}%</span>
                  </td>

                  {/* Squad Count */}
                  <td className="py-3 px-3 text-center">
                    <span className="font-bold text-white">
                      {squad.length} / {f.maxSquadSize}
                    </span>
                  </td>

                  {/* Min Slots Left to Reach Min 16 */}
                  <td className="py-3 px-3 text-center">
                    {minSlotsRequired > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {minSlotsRequired} needed
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Quota met
                      </span>
                    )}
                  </td>

                  {/* Overseas Slots Left */}
                  <td className="py-3 px-3 text-center">
                    <span className="text-cyan-400 font-bold">
                      {overseasSlotsLeft} left ({overseasCount}/{maxOverseasAllowed})
                    </span>
                  </td>

                  {/* Uncapped U23 Compliance */}
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`font-bold ${
                        u23Count >= 2 ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {u23Count} / 2
                    </span>
                  </td>

                  {/* RTM Cards */}
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      <Sparkles className="w-3 h-3" /> {f.rtmCardsLeft ?? 2}
                    </span>
                  </td>

                  {/* Current Table Status */}
                  <td className="py-3 px-3 text-right">
                    {isLeading ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/40 animate-pulse">
                        <CheckCircle className="w-3 h-3" /> Leading
                      </span>
                    ) : currentStatus === "out" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/40">
                        <LogOut className="w-3 h-3" /> Out
                      </span>
                    ) : currentStatus === "skipped" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                        Skipped
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-semibold">Active</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
