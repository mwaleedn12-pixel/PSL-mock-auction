"use client";

import React from "react";
import { useAuction } from "@/context/AuctionContext";
import { Clock, AlertTriangle } from "lucide-react";

export const CountdownTimer: React.FC = () => {
  const { timer, isTimerRunning, auctionStatus, settings } = useAuction();

  const maxSeconds = settings.defaultTimerSeconds || 15;
  const progressPercent = Math.min(100, Math.max(0, (timer / maxSeconds) * 100));
  const isUrgent = timer <= 5 && isTimerRunning;

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
        isUrgent
          ? "bg-red-950/40 border-red-500/80 shadow-lg shadow-red-500/20 animate-pulse"
          : isTimerRunning
          ? "bg-slate-900/80 border-emerald-500/40 shadow-md shadow-emerald-500/10"
          : "bg-slate-900/50 border-slate-800"
      }`}
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1 text-slate-400">
        <Clock className={`w-3.5 h-3.5 ${isUrgent ? "text-red-400 animate-spin" : "text-emerald-400"}`} />
        <span>Countdown Clock</span>
      </div>

      <div className="flex items-baseline gap-1 my-1">
        <span
          className={`font-mono font-black text-5xl tracking-tight transition-colors ${
            isUrgent
              ? "text-red-400 scale-105"
              : isTimerRunning
              ? "text-emerald-400"
              : "text-slate-500"
          }`}
        >
          {timer.toString().padStart(2, "0")}
        </span>
        <span className="text-xs font-bold text-slate-500 uppercase">sec</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden mt-1 border border-slate-700/50">
        <div
          className={`h-full transition-all duration-1000 ease-linear rounded-full ${
            isUrgent ? "bg-red-500" : "bg-gradient-to-r from-emerald-500 to-amber-400"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between w-full mt-2 text-[11px]">
        <span className="text-slate-500">
          Status:{" "}
          <span className={isTimerRunning ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
            {auctionStatus === "Live" ? (isTimerRunning ? "Bidding Active" : "Finalizing...") : auctionStatus}
          </span>
        </span>
        {isUrgent && (
          <span className="flex items-center gap-1 text-red-400 font-bold animate-bounce">
            <AlertTriangle className="w-3 h-3" /> Last Seconds!
          </span>
        )}
      </div>
    </div>
  );
};

