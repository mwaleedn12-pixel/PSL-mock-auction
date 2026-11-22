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
              className="text-slate-200"
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
                  ? "text-amber-500 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                  : isTimerRunning
                  ? "text-emerald-500 drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                  : "text-slate-300"
              }`}
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`font-mono font-black text-sm leading-none ${
                isUrgent
                  ? "text-red-600 animate-pulse"
                  : isWarning
                  ? "text-amber-600"
                  : isTimerRunning
                  ? "text-slate-900"
                  : "text-slate-400"
              }`}
            >
              {timer}s
            </span>
            <span className="text-[8px] font-bold text-slate-400 uppercase">clock</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden p-5 rounded-3xl border transition-all duration-300 shadow-sm ${
        isUrgent
          ? "bg-red-50 border-red-300 shadow-red-500/10 animate-shake"
          : isWarning
          ? "bg-amber-50 border-amber-300 shadow-amber-500/10"
          : isTimerRunning
          ? "bg-white border-emerald-300 shadow-emerald-500/10"
          : "bg-white border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-xl border ${
              isUrgent
                ? "bg-red-100 border-red-300 text-red-600 animate-pulse"
                : isTimerRunning
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-slate-100 border-slate-200 text-slate-500"
            }`}
          >
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
              Official Auction Clock
            </span>
            <span
              className={`text-xs font-bold ${
                isUrgent
                  ? "text-red-600 animate-pulse"
                  : isTimerRunning
                  ? "text-emerald-700"
                  : "text-amber-700"
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
              className="text-slate-100"
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
                  ? "text-amber-500 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                  : isTimerRunning
                  ? "text-emerald-600 drop-shadow-[0_0_6px_rgba(5,150,105,0.5)]"
                  : "text-slate-300"
              }`}
              fill="transparent"
            />
          </svg>

          {/* Large Seconds Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`font-mono font-black text-2xl tracking-tighter leading-none ${
                isUrgent
                  ? "text-red-600 scale-110"
                  : isWarning
                  ? "text-amber-600"
                  : isTimerRunning
                  ? "text-slate-900"
                  : "text-slate-400"
              }`}
            >
              {timer.toString().padStart(2, "0")}
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">sec</span>
          </div>
        </div>
      </div>

      {/* Dynamic Linear Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-4 border border-slate-200">
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
      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-medium">
        <span>Reset Rule: +15s on bid, +10s in last 5s</span>
        {isUrgent && (
          <span className="text-red-600 font-black flex items-center gap-1 animate-bounce">
            <AlertTriangle className="w-3.5 h-3.5" /> Going Once...
          </span>
        )}
      </div>
    </div>
  );
};
