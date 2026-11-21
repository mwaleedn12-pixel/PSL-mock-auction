"use client";

import React, { useState } from "react";
import { useAuction } from "@/context/AuctionContext";
import { formatPKR, getNextMinimumIncrement } from "@/lib/rules";
import {
  Gavel,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Sparkles,
  Coins,
  Crown,
} from "lucide-react";

export const RtmModal: React.FC = () => {
  const {
    role,
    activeFranchise,
    franchises,
    players,
    rtmState,
    exerciseRtm,
    declineRtmInitial,
    submitRtmRaise,
    acceptRtmFinal,
    declineRtmFinal,
    cancelRtm,
  } = useAuction();

  const [customRaiseAmount, setCustomRaiseAmount] = useState<number | "">("");
  const [raiseError, setRaiseError] = useState<string | null>(null);

  if (!rtmState || !rtmState.active) return null;

  const player = players.find((p) => p.id === rtmState.playerId);
  const originalTeam = franchises.find((f) => f.id === rtmState.originalFranchiseId);
  const highestBidderTeam = franchises.find((f) => f.id === rtmState.highestBidderFranchiseId);

  const isOriginalTeamOwner = role === "team_owner" && activeFranchise?.id === rtmState.originalFranchiseId;
  const isHighestBidderOwner = role === "team_owner" && activeFranchise?.id === rtmState.highestBidderFranchiseId;
  const isAdmin = role === "admin";

  const currentMinIncrement = getNextMinimumIncrement(rtmState.initialBidAmount);
  const suggestedMinRaise = rtmState.initialBidAmount + currentMinIncrement;

  const handleQuickAdd = (incrementAmount: number) => {
    const currentBase = typeof customRaiseAmount === "number" ? customRaiseAmount : rtmState.initialBidAmount;
    setCustomRaiseAmount(currentBase + incrementAmount);
    setRaiseError(null);
  };

  const handleRaiseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRaiseError(null);
    const amountToSubmit = typeof customRaiseAmount === "number" ? customRaiseAmount : suggestedMinRaise;
    const res = submitRtmRaise(amountToSubmit);
    if (!res.success) {
      setRaiseError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div
          className="absolute -top-32 -left-32 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: originalTeam?.primaryColor || "#eab308" }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: highestBidderTeam?.primaryColor || "#059669" }}
        />

        {/* Top Header Badge */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> RIGHT TO MATCH (RTM)
            </span>
          </div>
          {isAdmin && (
            <button
              onClick={cancelRtm}
              className="text-xs text-slate-500 hover:text-red-400 font-semibold transition-colors"
            >
              Cancel RTM (Admin Override)
            </button>
          )}
        </div>

        {/* Player & Bidding Summary Card */}
        <div className="my-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-4 relative z-10">
          {player?.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={player.photoUrl}
              alt={player.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover object-top border border-slate-700 shadow-md shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait-lg-webp/prd/assets/players/generic/colored/69957.png";
              }}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-white truncate">{player?.name}</h3>
              <span className="text-[10px] bg-slate-800 text-amber-300 font-bold px-2 py-0.5 rounded">
                {player?.category}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Previous Franchise: <strong className="text-white">{originalTeam?.name || "Original Team"}</strong>
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
              <span className="text-slate-400">
                Current Winning Bid:{" "}
                <strong className="text-emerald-400 font-bold">{formatPKR(rtmState.initialBidAmount)}</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">
                Leading Franchise: <strong className="text-white">{highestBidderTeam?.name}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* STAGE 1: Prompt Original Franchise to Exercise RTM */}
        {rtmState.stage === "prompt_rtm" && (
          <div className="space-y-4 relative z-10 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-center">
              <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <h4 className="text-base sm:text-lg font-black text-white">
                {originalTeam?.name} holds Right to Match!
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                {highestBidderTeam?.name} holds the leading bid of{" "}
                <strong className="text-amber-300">{formatPKR(rtmState.initialBidAmount)}</strong>. Would{" "}
                {originalTeam?.name} like to exercise their Right to Match card ({originalTeam?.rtmCardsLeft ?? 2}{" "}
                remaining)?
              </p>
            </div>

            {isOriginalTeamOwner || isAdmin ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={exerciseRtm}
                  className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" /> Exercise RTM (Match Player)
                </button>
                <button
                  onClick={declineRtmInitial}
                  className="py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 transition-all"
                >
                  <XCircle className="w-4 h-4 text-slate-400" /> Decline RTM (Let Go)
                </button>
              </div>
            ) : (
              <div className="text-center py-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400">
                  Waiting for <strong className="text-white">{originalTeam?.name}</strong> to decide on Right to
                  Match...
                </p>
              </div>
            )}
          </div>
        )}

        {/* STAGE 2: Highest Bidder Raises Final Price */}
        {rtmState.stage === "awaiting_raise" && (
          <div className="space-y-4 relative z-10 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-center">
              <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-base sm:text-lg font-black text-white">
                RTM Exercised! Final Price Raise by {highestBidderTeam?.name}
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                {originalTeam?.name} exercised RTM. Now, {highestBidderTeam?.name} gets ONE final chance to set a
                revised bid amount.
              </p>
            </div>

            {isHighestBidderOwner || isAdmin ? (
              <form onSubmit={handleRaiseSubmit} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Enter Revised Final Price (PKR):</span>
                    <span className="text-[11px] text-amber-400 font-semibold">
                      Must be &gt; {formatPKR(rtmState.initialBidAmount)}
                    </span>
                  </label>
                  <input
                    type="number"
                    value={customRaiseAmount}
                    onChange={(e) => {
                      setCustomRaiseAmount(e.target.value === "" ? "" : Number(e.target.value));
                      setRaiseError(null);
                    }}
                    placeholder={`e.g. ${suggestedMinRaise}`}
                    min={rtmState.initialBidAmount + 1}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold text-base focus:outline-none focus:border-emerald-500"
                  />
                  {typeof customRaiseAmount === "number" && customRaiseAmount > 0 && (
                    <p className="text-xs text-emerald-400 font-bold mt-1">
                      Formatted: {formatPKR(customRaiseAmount)}
                    </p>
                  )}
                </div>

                {/* Quick Increment Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-500 font-semibold">Quick add:</span>
                  {[250000, 500000, 1000000, 2500000, 5000000].map((inc) => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => handleQuickAdd(inc)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    >
                      +{formatPKR(inc)}
                    </button>
                  ))}
                </div>

                {raiseError && (
                  <p className="text-xs font-semibold text-red-400 bg-red-950/40 p-2.5 rounded-xl border border-red-800">
                    {raiseError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all"
                >
                  Submit Revised Final Bid
                </button>
              </form>
            ) : (
              <div className="text-center py-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400">
                  Waiting for <strong className="text-white">{highestBidderTeam?.name}</strong> to enter their final
                  revised price...
                </p>
              </div>
            )}
          </div>
        )}

        {/* STAGE 3: Original Franchise Final Match Decision */}
        {rtmState.stage === "rtm_decision" && (
          <div className="space-y-4 relative z-10 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-center">
              <Gavel className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <h4 className="text-base sm:text-lg font-black text-white">
                Final Match Decision for {originalTeam?.name}
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                {highestBidderTeam?.name} raised the price to{" "}
                <strong className="text-amber-300 font-bold">
                  {formatPKR(rtmState.revisedBidAmount || 0)}
                </strong>
                . Does {originalTeam?.name} agree to match this amount and sign {player?.name}?
              </p>
            </div>

            {isOriginalTeamOwner || isAdmin ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={acceptRtmFinal}
                  className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" /> Match &amp; Sign for {formatPKR(rtmState.revisedBidAmount || 0)}
                </button>
                <button
                  onClick={declineRtmFinal}
                  className="py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 transition-all"
                >
                  <XCircle className="w-4 h-4 text-slate-400" /> Decline (Sell to {highestBidderTeam?.shortName})
                </button>
              </div>
            ) : (
              <div className="text-center py-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400">
                  Waiting for <strong className="text-white">{originalTeam?.name}</strong> to accept or decline the
                  match price...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
