"use client";

import React, { useState, useEffect } from "react";
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
  Clock,
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
  const [remainingSeconds, setRemainingSeconds] = useState<number>(30);

  useEffect(() => {
    if (!rtmState || !rtmState.active || !rtmState.expiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((rtmState.expiresAt! - Date.now()) / 1000));
      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (rtmState.stage === "prompt_rtm") {
          declineRtmInitial();
        } else if (rtmState.stage === "rtm_decision") {
          declineRtmFinal();
        }
      }
    }, 250);

    return () => clearInterval(interval);
  }, [rtmState, declineRtmInitial, declineRtmFinal]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border-2 border-amber-400 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Top Header Badge */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> RIGHT TO MATCH (RTM)
            </span>
          </div>
          {isAdmin && (
            <button
              onClick={cancelRtm}
              className="text-xs text-slate-500 hover:text-red-600 font-semibold transition-colors"
            >
              Cancel RTM (Admin Override)
            </button>
          )}
        </div>

        {/* 30-Second RTM Expiry Clock Bar */}
        <div className="my-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 relative z-10 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 animate-spin" />
              <span className="text-amber-900 font-black uppercase tracking-wider text-[11px]">RTM Decision Clock:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-base font-mono font-black ${
                remainingSeconds <= 5 ? "text-red-600 animate-pulse" : "text-amber-800"
              }`}>
                {remainingSeconds}s remaining
              </span>
              <span className="text-[10px] text-amber-700 font-medium hidden sm:inline">(Auto-declines at 0s)</span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-2.5 w-full h-2 bg-amber-200/60 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                remainingSeconds <= 5
                  ? "bg-red-500 animate-pulse shadow-sm shadow-red-500/50"
                  : "bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, (remainingSeconds / 30) * 100))}%` }}
            />
          </div>
        </div>

        {/* Player & Bidding Summary Card */}
        <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-4 relative z-10">
          {player?.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={player.photoUrl}
              alt={player.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover object-top border border-slate-200 shadow-sm shrink-0 bg-white"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait-lg-webp/prd/assets/players/generic/colored/69957.png";
              }}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 truncate">{player?.name}</h3>
              <span className="text-[10px] bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded">
                {player?.category}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Previous Franchise: <strong className="text-slate-900">{originalTeam?.name || "Original Team"}</strong>
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
              <span className="text-slate-600">
                Current Winning Bid:{" "}
                <strong className="text-emerald-700 font-bold">{formatPKR(rtmState.initialBidAmount)}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">
                Leading Franchise: <strong className="text-slate-900">{highestBidderTeam?.name}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* STAGE 1: Prompt Original Franchise to Exercise RTM */}
        {rtmState.stage === "prompt_rtm" && (
          <div className="space-y-4 relative z-10 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
              <ShieldAlert className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <h4 className="text-base sm:text-lg font-black text-slate-900">
                {originalTeam?.name} holds Right to Match!
              </h4>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                {highestBidderTeam?.name} holds the leading bid of{" "}
                <strong className="text-amber-800">{formatPKR(rtmState.initialBidAmount)}</strong>. Would{" "}
                {originalTeam?.name} like to exercise their Right to Match card ({originalTeam?.rtmCardsLeft ?? 2}{" "}
                remaining)?
              </p>
            </div>

            {isOriginalTeamOwner || isAdmin ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={exerciseRtm}
                  className="py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" /> Exercise RTM (Match Player)
                </button>
                <button
                  onClick={declineRtmInitial}
                  className="py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-300 transition-all"
                >
                  <XCircle className="w-4 h-4 text-slate-500" /> Decline RTM (Let Go)
                </button>
              </div>
            ) : (
              <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-600">
                  Waiting for <strong className="text-slate-900">{originalTeam?.name}</strong> to decide on Right to
                  Match...
                </p>
              </div>
            )}
          </div>
        )}

        {/* STAGE 2: Highest Bidder Raises Final Price */}
        {rtmState.stage === "awaiting_raise" && (
          <div className="space-y-4 relative z-10 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h4 className="text-base sm:text-lg font-black text-slate-900">
                RTM Exercised! Final Price Raise by {highestBidderTeam?.name}
              </h4>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                {originalTeam?.name} exercised RTM. Now, {highestBidderTeam?.name} gets ONE final chance to set a
                revised bid amount.
              </p>
            </div>

            {isHighestBidderOwner || isAdmin ? (
              <form onSubmit={handleRaiseSubmit} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Enter Revised Final Price (PKR):</span>
                    <span className="text-[11px] text-amber-700 font-semibold">
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
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono font-bold text-base focus:outline-none focus:border-emerald-500 shadow-2xs"
                  />
                  {typeof customRaiseAmount === "number" && customRaiseAmount > 0 && (
                    <p className="text-xs text-emerald-700 font-bold mt-1">
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
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 border border-slate-200 transition-colors"
                    >
                      +{formatPKR(inc)}
                    </button>
                  ))}
                </div>

                {raiseError && (
                  <p className="text-xs font-semibold text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200">
                    {raiseError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full mt-2 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all"
                >
                  Submit Revised Final Bid
                </button>
              </form>
            ) : (
              <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-600">
                  Waiting for <strong className="text-slate-900">{highestBidderTeam?.name}</strong> to enter their final
                  revised price...
                </p>
              </div>
            )}
          </div>
        )}

        {/* STAGE 3: Original Franchise Final Match Decision */}
        {rtmState.stage === "rtm_decision" && (
          <div className="space-y-4 relative z-10 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
              <Gavel className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <h4 className="text-base sm:text-lg font-black text-slate-900">
                Final Match Decision for {originalTeam?.name}
              </h4>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                {highestBidderTeam?.name} raised the price to{" "}
                <strong className="text-amber-800 font-bold">
                  {formatPKR(rtmState.revisedBidAmount || 0)}
                </strong>
                . Does {originalTeam?.name} agree to match this amount and sign {player?.name}?
              </p>
            </div>

            {isOriginalTeamOwner || isAdmin ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={acceptRtmFinal}
                  className="py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" /> Match &amp; Sign for {formatPKR(rtmState.revisedBidAmount || 0)}
                </button>
                <button
                  onClick={declineRtmFinal}
                  className="py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-300 transition-all"
                >
                  <XCircle className="w-4 h-4 text-slate-500" /> Decline (Sell to {highestBidderTeam?.shortName})
                </button>
              </div>
            ) : (
              <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-600">
                  Waiting for <strong className="text-slate-900">{originalTeam?.name}</strong> to accept or decline the
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
