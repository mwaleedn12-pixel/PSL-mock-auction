"use client";

import React from "react";
import { Player } from "@/types/auction";
import { formatPKR } from "@/lib/rules";
import { Globe, UserCheck, Shield, Award, Flame, Activity } from "lucide-react";

interface PlayerCardProps {
  player: Player | null;
  highestBidAmount?: number;
  winningFranchiseName?: string;
  isLarge?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  highestBidAmount,
  winningFranchiseName,
  isLarge = true,
}) => {
  if (!player) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-[350px]">
        <Shield className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
        <p className="text-base font-semibold">No Player Currently on Block</p>
        <p className="text-xs text-slate-600 mt-1">Select an upcoming player from the list or start the auction.</p>
      </div>
    );
  }

  const categoryStyles: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    Platinum: {
      bg: "bg-purple-950/60",
      text: "text-purple-300",
      border: "border-purple-500/50",
      glow: "shadow-purple-500/20",
    },
    Diamond: {
      bg: "bg-cyan-950/60",
      text: "text-cyan-300",
      border: "border-cyan-500/50",
      glow: "shadow-cyan-500/20",
    },
    Gold: {
      bg: "bg-amber-950/60",
      text: "text-amber-300",
      border: "border-amber-500/50",
      glow: "shadow-amber-500/20",
    },
    Silver: {
      bg: "bg-slate-800/80",
      text: "text-slate-300",
      border: "border-slate-500/40",
      glow: "shadow-slate-500/10",
    },
    Emerging: {
      bg: "bg-emerald-950/60",
      text: "text-emerald-300",
      border: "border-emerald-500/50",
      glow: "shadow-emerald-500/20",
    },
    Supplementary: {
      bg: "bg-blue-950/60",
      text: "text-blue-300",
      border: "border-blue-500/50",
      glow: "shadow-blue-500/20",
    },
  };

  const catStyle = categoryStyles[player.category] || categoryStyles.Gold;
  const currentVal = highestBidAmount || player.basePrice;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl transition-all duration-300 ${catStyle.glow}`}
    >
      {/* Top Banner with Category Glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badges */}
      <div className="p-4 sm:p-6 pb-2 flex items-center justify-between gap-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${catStyle.bg} ${catStyle.text} ${catStyle.border} shadow-sm`}
          >
            ★ {player.category}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {player.primaryRole}
          </span>
          {player.auctionRound && player.auctionRound > 1 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Round 2 (Re-Auction)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          {player.isOverseas ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
              <Globe className="w-3.5 h-3.5" /> Overseas ({player.nationality})
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              <UserCheck className="w-3.5 h-3.5" /> Local (Pakistan)
            </span>
          )}
        </div>
      </div>

      {/* Main Player Visual & Bio */}
      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Photo Container */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-slate-950 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={player.photoUrl}
              alt={player.name}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-2 left-2 right-2 text-center">
              <span className="text-[11px] font-semibold text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-800">
                Age: {player.age} yrs
              </span>
            </div>
          </div>
        </div>

        {/* Player Details & Pricing */}
        <div className="md:col-span-7 flex flex-col justify-between h-full space-y-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              {player.name}
              {player.isRetained && (
                <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded font-bold">
                  RETAINED
                </span>
              )}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
              <span>🏏 Batting: <strong className="text-slate-200">{player.battingStyle}</strong></span>
              <span>⚡ Bowling: <strong className="text-slate-200">{player.bowlingStyle}</strong></span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="grid grid-cols-2 gap-3 bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Base Price</p>
              <p className="text-lg font-bold text-slate-300 mt-0.5">{formatPKR(player.basePrice)}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-amber-400 font-bold flex items-center justify-end gap-1">
                <Flame className="w-3.5 h-3.5" /> Current Bid
              </p>
              <p className="text-2xl font-black text-amber-400 mt-0.5">
                {formatPKR(currentVal)}
              </p>
              {winningFranchiseName && (
                <p className="text-[11px] text-emerald-400 font-bold mt-0.5 truncate">
                  Leading: {winningFranchiseName}
                </p>
              )}
            </div>
          </div>

          {/* Career Stats Pills */}
          {player.stats && (
            <div className="bg-slate-950/50 rounded-2xl p-3 border border-slate-800/60">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>PSL Career Highlights</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                  <span className="block text-[10px] text-slate-500 font-semibold">Matches</span>
                  <span className="font-bold text-white">{player.stats.matches}</span>
                </div>
                {player.stats.runs !== undefined && (
                  <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                    <span className="block text-[10px] text-slate-500 font-semibold">Runs</span>
                    <span className="font-bold text-emerald-400">{player.stats.runs}</span>
                  </div>
                )}
                {player.stats.strikeRate !== undefined && (
                  <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                    <span className="block text-[10px] text-slate-500 font-semibold">Strike Rate</span>
                    <span className="font-bold text-amber-400">{player.stats.strikeRate}</span>
                  </div>
                )}
                {player.stats.wickets !== undefined && (
                  <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                    <span className="block text-[10px] text-slate-500 font-semibold">Wickets</span>
                    <span className="font-bold text-cyan-400">{player.stats.wickets}</span>
                  </div>
                )}
                {player.stats.economyRate !== undefined && (
                  <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                    <span className="block text-[10px] text-slate-500 font-semibold">Economy</span>
                    <span className="font-bold text-teal-400">{player.stats.economyRate}</span>
                  </div>
                )}
                {player.stats.catches !== undefined && (
                  <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                    <span className="block text-[10px] text-slate-500 font-semibold">Catches</span>
                    <span className="font-bold text-indigo-400">{player.stats.catches}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

