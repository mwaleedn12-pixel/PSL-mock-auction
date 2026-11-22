"use client";

import React, { useState } from "react";
import { Player } from "@/types/auction";
import { formatPKR } from "@/lib/rules";
import {
  Globe,
  UserCheck,
  Shield,
  Award,
  Flame,
  Activity,
  Sparkles,
  ExternalLink,
  Zap,
  TrendingUp,
  Info,
} from "lucide-react";
import { PlayerDetailModal } from "./PlayerDetailModal";

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
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  if (!player) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-[380px] shadow-sm">
        <Shield className="w-14 h-14 text-slate-300 mb-3 animate-pulse" />
        <p className="text-lg font-bold text-slate-700">No Player Currently on Block</p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Select an upcoming player from the queue or start the live auction from the controls.
        </p>
      </div>
    );
  }

  const categoryStyles: Record<string, { bg: string; text: string; border: string; glow: string; badge: string }> = {
    Platinum: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      glow: "border-purple-300 shadow-purple-500/10",
      badge: "from-purple-600 to-indigo-600 text-white",
    },
    Diamond: {
      bg: "bg-cyan-50",
      text: "text-cyan-800",
      border: "border-cyan-200",
      glow: "border-cyan-300 shadow-cyan-500/10",
      badge: "from-cyan-600 to-teal-600 text-white",
    },
    Gold: {
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
      glow: "border-amber-300 shadow-amber-500/10",
      badge: "from-amber-500 to-yellow-600 text-slate-950 font-black",
    },
    Silver: {
      bg: "bg-slate-50",
      text: "text-slate-700",
      border: "border-slate-200",
      glow: "border-slate-300 shadow-slate-500/10",
      badge: "from-slate-600 to-slate-700 text-white",
    },
    Emerging: {
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      border: "border-emerald-200",
      glow: "border-emerald-300 shadow-emerald-500/10",
      badge: "from-emerald-500 to-teal-600 text-slate-950 font-black",
    },
    Supplementary: {
      bg: "bg-blue-50",
      text: "text-blue-800",
      border: "border-blue-200",
      glow: "border-blue-300 shadow-blue-500/10",
      badge: "from-blue-600 to-indigo-700 text-white",
    },
  };

  const catStyle = categoryStyles[player.category] || categoryStyles.Gold;
  const currentVal = highestBidAmount || player.basePrice;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-md transition-all duration-300 ${catStyle.glow}`}
    >
      {/* Top Broadcast Spotlight Ribbon */}
      <div className="px-5 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-white">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-black uppercase tracking-wider text-slate-100 text-[11px]">
            CURRENTLY ON AUCTION BLOCK
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
          <span>Lot No. #{player.id.replace(/\D/g, "") || "1"}</span>
        </div>
      </div>

      {/* Category & Status Header */}
      <div className="p-4 sm:p-5 pb-3 flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r ${catStyle.badge} shadow-sm`}
          >
            ★ {player.category}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white text-slate-800 border border-slate-200 shadow-xs">
            {player.primaryRole}
          </span>

          {/* Under-23 Tag */}
          {player.isUnder23 && player.isUncapped && (
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
              ★ Uncapped U-23
            </span>
          )}

          {player.auctionRound && player.auctionRound > 1 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Round {player.auctionRound} (Re-Auction)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          {player.isOverseas ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-bold">
              <Globe className="w-3.5 h-3.5 text-blue-600" /> Overseas ({player.nationality})
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Domestic (Pakistan)
            </span>
          )}
        </div>
      </div>

      {/* Main Player Visual & Bio */}
      <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Photo Container: Clickable to In-App Profile & Authentic Stats Modal */}
        <div className="md:col-span-5 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            title={`Click to view ${player.name}'s verified career profile & authentic stats`}
            className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-2 border-slate-200 hover:border-emerald-500 shadow-md bg-slate-100 group cursor-pointer block transition-all text-left"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={player.photoUrl}
              alt={player.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait-lg-webp/prd/assets/players/generic/colored/69957.png";
              }}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-90" />

            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span className="bg-white/95 text-emerald-800 border border-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl backdrop-blur-md">
                <Info className="w-3.5 h-3.5 text-emerald-600" /> View Profile & Stats
              </span>
            </div>

            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-center px-1">
              <span className="text-[11px] font-bold text-white bg-slate-900/80 px-2 py-0.5 rounded-full border border-white/20">
                Age: {player.age} yrs
              </span>
              {player.lastPSLTeam && (
                <span className="text-[10px] font-bold text-amber-300 bg-slate-900/80 px-2 py-0.5 rounded-full border border-white/20 truncate max-w-[130px]">
                  {player.lastPSLTeam}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Player Details & Pricing */}
        <div className="md:col-span-7 flex flex-col justify-between h-full space-y-4">
          <div>
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="group/name inline-flex items-center gap-2 hover:text-emerald-700 transition-colors text-left"
              title={`View ${player.name}'s verified career profile & stats`}
            >
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 group-hover/name:text-emerald-700 tracking-tight flex items-center gap-2 transition-colors">
                {player.name}
                <Info className="w-4 h-4 text-emerald-600 opacity-80 group-hover/name:opacity-100 transition-opacity" />
                {player.isRetained && (
                  <span className="text-xs bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded font-black">
                    RETAINED
                  </span>
                )}
              </h2>
            </button>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-600">
              <span>🏏 Batting: <strong className="text-slate-800">{player.battingStyle}</strong></span>
              <span>⚡ Bowling: <strong className="text-slate-800">{player.bowlingStyle}</strong></span>
            </div>
          </div>

          {/* Pricing Box with Light Stadium Accents */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Base Price</p>
              <p className="text-lg font-black text-slate-800 mt-0.5 font-mono">{formatPKR(player.basePrice)}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-amber-600 font-bold flex items-center justify-end gap-1">
                <Flame className="w-3.5 h-3.5" /> Current Bid
              </p>
              <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-0.5 font-mono">
                {formatPKR(currentVal)}
              </p>
              {winningFranchiseName && (
                <p className="text-[11px] text-emerald-700 font-bold mt-0.5 truncate flex items-center justify-end gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Leading: {winningFranchiseName}
                </p>
              )}
            </div>
          </div>

          {/* PSL Career Stats vs T20 Career Stats Showcase */}
          {player.stats && (
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {player.statsType === "PSL"
                      ? "Official PSL Career Highlights"
                      : "Overall T20 / International Highlights"}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                    player.statsType === "PSL"
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-blue-100 text-blue-800 border-blue-300"
                  }`}
                >
                  {player.statsType === "PSL" ? "PSL Stats" : "T20 Stats"}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="block text-[10px] text-slate-500 font-semibold">Matches</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">{player.stats.matches}</span>
                </div>

                {player.stats.runs !== undefined && (
                  <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="block text-[10px] text-slate-500 font-semibold">Runs</span>
                    <span className="font-bold text-emerald-700 font-mono text-sm">{player.stats.runs}</span>
                  </div>
                )}

                {player.stats.strikeRate !== undefined && (
                  <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="block text-[10px] text-slate-500 font-semibold">Strike Rate</span>
                    <span className="font-bold text-amber-700 font-mono text-sm">{player.stats.strikeRate}</span>
                  </div>
                )}

                {player.stats.battingAverage !== undefined && (
                  <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="block text-[10px] text-slate-500 font-semibold">Average</span>
                    <span className="font-bold text-cyan-700 font-mono text-sm">{player.stats.battingAverage}</span>
                  </div>
                )}

                {player.stats.wickets !== undefined && (
                  <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="block text-[10px] text-slate-500 font-semibold">Wickets</span>
                    <span className="font-bold text-cyan-700 font-mono text-sm">{player.stats.wickets}</span>
                  </div>
                )}

                {player.stats.economyRate !== undefined && (
                  <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="block text-[10px] text-slate-500 font-semibold">Economy</span>
                    <span className="font-bold text-teal-700 font-mono text-sm">{player.stats.economyRate}</span>
                  </div>
                )}

                {player.stats.highestScore !== undefined && (
                  <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="block text-[10px] text-slate-500 font-semibold">Highest</span>
                    <span className="font-bold text-purple-700 font-mono text-sm">{player.stats.highestScore}</span>
                  </div>
                )}

                {player.stats.bestBowling !== undefined && (
                  <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="block text-[10px] text-slate-500 font-semibold">Best</span>
                    <span className="font-bold text-indigo-700 font-mono text-sm">{player.stats.bestBowling}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verified Player Profile & Authentic Stats Modal */}
      {isProfileModalOpen && (
        <PlayerDetailModal player={player} onClose={() => setIsProfileModalOpen(false)} />
      )}
    </div>
  );
};
