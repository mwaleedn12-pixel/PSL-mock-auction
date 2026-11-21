"use client";

import React from "react";
import { Player } from "@/types/auction";
import { formatPKR } from "@/lib/rules";
import { getCricinfoUrl, getCricbuzzUrl } from "@/lib/cricinfo";
import {
  X,
  ExternalLink,
  Shield,
  Award,
  Globe,
  UserCheck,
  TrendingUp,
  Activity,
  Flame,
  Zap,
  Sparkles,
  AlertCircle,
} from "lucide-react";

interface PlayerDetailModalProps {
  player: Player | null;
  onClose: () => void;
}

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({ player, onClose }) => {
  if (!player) return null;

  const categoryStyles: Record<string, { bg: string; text: string; border: string; badge: string }> = {
    Platinum: {
      bg: "bg-purple-950/80",
      text: "text-purple-300",
      border: "border-purple-500/50",
      badge: "from-purple-600 to-indigo-600 text-white",
    },
    Diamond: {
      bg: "bg-cyan-950/80",
      text: "text-cyan-300",
      border: "border-cyan-500/50",
      badge: "from-cyan-600 to-blue-600 text-white",
    },
    Gold: {
      bg: "bg-amber-950/80",
      text: "text-amber-300",
      border: "border-amber-500/50",
      badge: "from-amber-500 to-yellow-600 text-slate-950",
    },
    Silver: {
      bg: "bg-slate-800/80",
      text: "text-slate-300",
      border: "border-slate-500/40",
      badge: "from-slate-600 to-slate-700 text-white",
    },
    Emerging: {
      bg: "bg-emerald-950/80",
      text: "text-emerald-300",
      border: "border-emerald-500/50",
      badge: "from-emerald-500 to-teal-600 text-slate-950",
    },
    Supplementary: {
      bg: "bg-blue-950/80",
      text: "text-blue-300",
      border: "border-blue-500/50",
      badge: "from-blue-600 to-indigo-700 text-white",
    },
  };

  const catStyle = categoryStyles[player.category] || categoryStyles.Gold;
  const cricbuzzUrl = getCricbuzzUrl(player);
  const cricinfoUrl = getCricinfoUrl(player);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow header accents */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 pb-3 border-b border-slate-800 flex items-center justify-between relative z-10 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r ${catStyle.badge} shadow`}>
              ★ {player.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700">
              {player.primaryRole}
            </span>
            {player.isUnder23 && player.isUncapped && (
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                ★ U-23 Uncapped
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto relative z-10">
          {/* Hero Profile Row */}
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl bg-slate-950 flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={player.photoUrl}
                alt={player.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait-lg-webp/prd/assets/players/generic/colored/69957.png";
                }}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">{player.name}</h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                {player.isOverseas ? (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                    <Globe className="w-3.5 h-3.5" /> Overseas ({player.nationality})
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    <UserCheck className="w-3.5 h-3.5" /> Pakistan (Domestic)
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Age: {player.age} yrs
                </span>
                {player.lastPSLTeam && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                    PSL 11: {player.lastPSLTeam}
                  </span>
                )}
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-mono">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5">
                  <span className="text-slate-400">Base Price: </span>
                  <span className="font-bold text-white">{formatPKR(player.basePrice)}</span>
                </div>
                {player.status === "sold" && (
                  <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl px-3 py-1.5">
                    <span className="text-emerald-400">Sold: </span>
                    <span className="font-bold text-emerald-300">{formatPKR(player.soldPrice || 0)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Authentic T20 Career Statistics */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" /> T20 Career Statistics
              </span>
              <span className="text-[10px] text-slate-500">Authentic T20 Records</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Matches</span>
                <span className="text-lg font-mono font-black text-white">{player.stats?.matches || "—"}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Runs Scored</span>
                <span className="text-lg font-mono font-black text-emerald-400">{player.stats?.runs ?? "—"}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Batting Avg</span>
                <span className="text-lg font-mono font-black text-cyan-400">{player.stats?.battingAverage ?? "—"}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Strike Rate</span>
                <span className="text-lg font-mono font-black text-amber-400">{player.stats?.strikeRate ?? "—"}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Wickets Taken</span>
                <span className="text-lg font-mono font-black text-purple-400">{player.stats?.wickets ?? "—"}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Economy Rate</span>
                <span className="text-lg font-mono font-black text-sky-400">{player.stats?.economyRate ?? "—"}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Bowling Avg</span>
                <span className="text-lg font-mono font-black text-slate-300">{player.stats?.bowlingAverage ?? "—"}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">100s / 50s</span>
                <span className="text-lg font-mono font-black text-amber-300">
                  {player.stats?.hundreds ?? 0} / {player.stats?.fifties ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* External Profiles & Access Notice */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
              External Cricket Profiles & Records
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Working Cricbuzz Profile */}
              <a
                href={cricbuzzUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 hover:bg-emerald-900/40 text-emerald-300 hover:text-white transition-all group shadow-md"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <span className="font-black text-sm block">Cricbuzz Profile</span>
                    <span className="text-[10px] text-emerald-400/80 font-medium">100% Unrestricted & Verified</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* ESPNcricinfo with ISP warning */}
              <a
                href={cricinfoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/40 hover:bg-blue-900/40 text-blue-300 hover:text-white transition-all group shadow-md"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <div>
                    <span className="font-black text-sm block">ESPNcricinfo Profile</span>
                    <span className="text-[10px] text-blue-400/80 font-medium">Akamai EdgeSuite Protected</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            {/* Explanatory Info Note for the user */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] text-slate-400">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Network Notice:</strong> Agar aapke browser me ESPNcricinfo open karne par <em>&quot;Access Denied (errors.edgesuite.net)&quot;</em> error aaye, tu iska matlab aapke local ISP IP ko Akamai CDN ne restrict kiya hua hai. Aise me <strong>Cricbuzz</strong> use karein ya VPN connect karein.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end relative z-10">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
