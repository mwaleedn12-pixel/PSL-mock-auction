"use client";

import React, { useEffect, useState } from "react";
import { useAuction } from "@/context/AuctionContext";
import { formatPKR } from "@/lib/rules";
import { Gavel, CheckCircle2, XCircle, Sparkles, Trophy, X } from "lucide-react";

export const AuctionAnnouncementOverlay: React.FC = () => {
  const { announcementOverlay, dismissAnnouncementOverlay } = useAuction();
  const [countdown, setCountdown] = useState<number>(4);

  useEffect(() => {
    if (!announcementOverlay) {
      setCountdown(4);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [announcementOverlay]);

  if (!announcementOverlay) return null;

  const { type, player, franchise, amount } = announcementOverlay;
  const isSold = type === "sold";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      {/* Background Animated Halos */}
      <div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-30 pointer-events-none animate-pulse"
        style={{ backgroundColor: franchise?.primaryColor || (isSold ? "#10b981" : "#ef4444") }}
      />

      <div
        className={`relative w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden border-2 text-center transition-all transform scale-100 animate-scaleUp ${
          isSold
            ? "bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-amber-400/80 shadow-amber-500/20"
            : "bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-red-500/80 shadow-red-500/20"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dismiss Button */}
        <button
          onClick={dismissAnnouncementOverlay}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors z-20"
          title="Dismiss announcement"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Celebration Badge */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {isSold ? (
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30 animate-bounce">
              <Trophy className="w-4 h-4 fill-current" /> OFFICIAL SALE CONFIRMED 🔨
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40 shadow-lg">
              <XCircle className="w-4 h-4" /> LOT PASSED UNSOLD
            </span>
          )}
        </div>

        {/* Giant Hammer / Status Icon */}
        <div className="relative my-3 flex justify-center">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl border-2 ${
              isSold
                ? "bg-amber-500/20 border-amber-400 text-amber-400 animate-wiggle"
                : "bg-red-500/20 border-red-400 text-red-400"
            }`}
          >
            <Gavel className="w-10 h-10" />
          </div>
        </div>

        {/* Main Title & Status */}
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase mt-2">
          {isSold ? "SOLD!" : "UNSOLD"}
        </h2>

        {/* Player Spotlight Info */}
        <div className="my-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-4 text-left">
          {player.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={player.photoUrl}
              alt={player.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover object-top border border-slate-700 shadow-md shrink-0 bg-slate-900"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait-lg-webp/prd/assets/players/generic/colored/69957.png";
              }}
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl sm:text-2xl font-black text-white truncate">{player.name}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
              <span className="px-2 py-0.5 rounded font-black bg-slate-800 text-amber-300 border border-slate-700">
                {player.category}
              </span>
              <span className="text-slate-400">{player.primaryRole}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{player.nationality}</span>
            </div>
          </div>
        </div>

        {/* Winning Franchise & Final Price Banner (If Sold) */}
        {isSold && franchise && amount && (
          <div className="space-y-3">
            <div
              className="p-4 rounded-2xl border text-center shadow-lg relative overflow-hidden"
              style={{
                borderColor: `${franchise.primaryColor}88`,
                backgroundColor: `${franchise.primaryColor}1a`,
              }}
            >
              <div className="flex items-center justify-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white shadow"
                  style={{ backgroundColor: franchise.primaryColor }}
                >
                  {franchise.shortName}
                </div>
                <h4 className="text-lg font-black text-white tracking-tight">{franchise.name}</h4>
              </div>

              <div className="mt-2">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                  Final Hammer Price
                </span>
                <p className="text-3xl sm:text-4xl font-black font-mono text-amber-400 tracking-tight mt-0.5">
                  {formatPKR(amount)}
                </p>
              </div>

              {player.wasRtmUsed && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Sparkles className="w-3.5 h-3.5" /> Right to Match (RTM) Card Used
                </div>
              )}
            </div>
          </div>
        )}

        {/* Auto-advance Countdown Indicator */}
        <div className="mt-6 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
          <span>Advancing to next lot in {countdown}s...</span>
          <button
            onClick={dismissAnnouncementOverlay}
            className="text-emerald-400 hover:text-emerald-300 font-bold underline transition-colors"
          >
            Advance Now →
          </button>
        </div>
      </div>
    </div>
  );
};
