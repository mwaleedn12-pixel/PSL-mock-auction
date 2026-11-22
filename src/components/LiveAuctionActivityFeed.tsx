"use client";

import React from "react";
import { useAuction } from "@/context/AuctionContext";
import { formatPKR } from "@/lib/rules";
import { Activity, Flame, Gavel, CheckCircle2, XCircle, TrendingUp, Sparkles } from "lucide-react";

export const LiveAuctionActivityFeed: React.FC<{ maxItems?: number }> = ({ maxItems = 10 }) => {
  const { eventLogs, highestBid, currentPlayer } = useAuction();

  // Reverse logs to get most recent at the top
  const recentLogs = [...eventLogs].reverse().slice(0, maxItems);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" /> Live Auction Activity Feed
          </h4>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Realtime Broadcast</span>
      </div>

      {/* Dynamic current leader status marquee */}
      {highestBid && (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-slate-300 font-semibold">
              <strong className="text-emerald-400 font-black">{highestBid.franchiseName}</strong> is leading for{" "}
              <strong className="text-white">{currentPlayer?.name}</strong>!
            </span>
          </div>
          <span className="font-mono font-black text-amber-400">{formatPKR(highestBid.amount)}</span>
        </div>
      )}

      {/* Chronological Event Log Feed */}
      <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 text-xs">
        {recentLogs.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-4">Waiting for live bids or auction events...</p>
        ) : (
          recentLogs.map((log) => {
            const isSold = log.type === "sold";
            const isUnsold = log.type === "unsold";
            const isBid = log.type === "bid";
            const isRtm = log.type === "rtm";

            return (
              <div
                key={log.id}
                className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                  isSold
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-bold"
                    : isUnsold
                    ? "bg-red-950/40 border-red-500/40 text-red-300 font-bold"
                    : isRtm
                    ? "bg-amber-950/40 border-amber-500/40 text-amber-300 font-bold"
                    : "bg-slate-950/60 border-slate-800 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-slate-500 text-[10px] shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  <div className="truncate">
                    {isSold ? (
                      <span className="flex items-center gap-1 truncate text-emerald-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="uppercase font-black text-[11px] truncate">{log.description}</span>
                      </span>
                    ) : isUnsold ? (
                      <span className="flex items-center gap-1 truncate text-red-400">
                        <XCircle className="w-3 h-3 text-red-400 shrink-0" />
                        <span className="uppercase font-black text-[11px] truncate">{log.description}</span>
                      </span>
                    ) : isRtm ? (
                      <span className="flex items-center gap-1 truncate text-amber-400">
                        <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">{log.description}</span>
                      </span>
                    ) : (
                      <span className="truncate">
                        <strong className="text-white font-bold">{log.franchiseName}</strong> bid{" "}
                        <strong className="text-amber-400 font-mono font-bold">
                          {log.amount ? formatPKR(log.amount) : ""}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>

                {log.amount && !isSold && !isUnsold && (
                  <span className="font-mono font-black text-amber-400 text-[11px] shrink-0">
                    {formatPKR(log.amount)}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
