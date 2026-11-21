"use client";

import React from "react";
import { useAuction } from "@/context/AuctionContext";
import { Clock, AlertTriangle, Flame } from "lucide-react";

interface CountdownTimerProps {
  compact?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ compact = false }) => {
  const { timer, isTimerRunning, auctionStatus, settings } = useAuction();

  const maxSeconds = settings.defaultTimerSeconds || 30;
  const progressPercent = Math.min(100, Math.max(0, (timer / maxSeconds) * 100));
  const isUrgent = timer <= 5 && isTimerRunning;
  const isWarning = timer <= 10 && !isUrgent && isTimerRunning;

  // SVG circular calculations
  const radius = compact ? 22 : 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
            <circle
              cx="30"
              cy="30"
              r={radius}
              stroke="currentColor"
              strokeWidth="5"
              className="text-slate-800"
              fill="transparent"
            />
            <circle
              cx="30"
              cy="30"
              r={radius}
              stroke="currentColor"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-1000 ease-linear ${
                isUrgent
                  ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                  : isWarning
                  ? "text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                  : isTimerRunning
                  ? "text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                  : "text-slate-600"
              }`}
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`font-mono font-black text-sm leading-none ${
                isUrgent
                  ? "text-red-400 animate-pulse"
                  : isWarning
                  ? "text-amber-400"
                  : isTimerRunning
                  ? "text-white"
                  : "text-slate-500"
              }`}
            >
              {timer}s
            </span>
            <span className="text-[8px] font-bold text-slate-500 uppercase">clock</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden p-5 rounded-3xl border transition-all duration-300 shadow-2xl ${
        isUrgent
          ? "bg-red-950/50 border-red-500 shadow-red-500/30 animate-shake"
          : isWarning
          ? "bg-amber-950/40 border-amber-500/70 shadow-amber-500/20"
          : isTimerRunning
          ? "bg-slate-900/90 border-emerald-500/40 shadow-emerald-500/10"
          : "bg-slate-900/60 border-slate-800"
      }`}
    >
      {/* Background Glow */}
      <div
        className={`absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl pointer-events-none transition-colors duration-500 ${
          isUrgent
            ? "bg-red-500/30"
            : isTimerRunning
            ? "bg-emerald-500/15"
            : "bg-slate-700/10"
        }`}
      />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-xl border ${
              isUrgent
                ? "bg-red-500/20 border-red-500/40 text-red-400 animate-pulse"
                : isTimerRunning
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
          >
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              Official Auction Clock
            </span>
            <span
              className={`text-xs font-bold ${
                isUrgent
                  ? "text-red-400 animate-pulse"
                  : isTimerRunning
                  ? "text-emerald-400"
                  : "text-amber-400"
              }`}
            >
              {auctionStatus === "Live"
                ? isTimerRunning
                  ? isUrgent
                    ? "⚠️ Gavel Hammer Final Call!"
                    : "Bidding Open"
                  : timer === 0
                  ? "Finalizing Bids..."
                  : "Bidding Active"
                : auctionStatus === "Paused"
                ? "Auction Paused"
                : "Auction Ready"}
            </span>
          </div>
        </div>

        {/* Circular Radial Countdown Gauge */}
        <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 90 90">
            {/* Background Circle */}
            <circle
              cx="45"
              cy="45"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              className="text-slate-800"
              fill="transparent"
            />
            {/* Animated Progress Circle */}
            <circle
              cx="45"
              cy="45"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-1000 ease-linear ${
                isUrgent
                  ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                  : isWarning
                  ? "text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                  : isTimerRunning
                  ? "text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                  : "text-slate-600"
              }`}
              fill="transparent"
            />
          </svg>

          {/* Large Seconds Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`font-mono font-black text-2xl tracking-tighter leading-none ${
                isUrgent
                  ? "text-red-400 scale-110"
                  : isWarning
                  ? "text-amber-400"
                  : isTimerRunning
                  ? "text-white"
                  : "text-slate-500"
              }`}
            >
              {timer.toString().padStart(2, "0")}
            </span>
            <span className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">sec</span>
          </div>
        </div>
      </div>

      {/* Dynamic Linear Bar */}
      <div className="w-full bg-slate-950/80 h-2 rounded-full overflow-hidden mt-4 border border-slate-800/80">
        <div
          className={`h-full transition-all duration-1000 ease-linear rounded-full ${
            isUrgent
              ? "bg-red-500 animate-pulse"
              : isWarning
              ? "bg-gradient-to-r from-amber-500 to-red-500"
              : "bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Footer Status Indicators */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-medium">
        <span>Reset Rule: +15s on bid, +10s in last 5s</span>
        {isUrgent && (
          <span className="text-red-400 font-black flex items-center gap-1 animate-bounce">
            <AlertTriangle className="w-3.5 h-3.5" /> Going Once...
          </span>
        )}
      </div>
    </div>
  );
};
