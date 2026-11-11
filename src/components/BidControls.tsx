"use client";

import React, { useState } from "react";
import { useAuction } from "@/context/AuctionContext";
import { formatPKR, getNextMinimumIncrement } from "@/lib/rules";
import { AuthModal } from "./AuthModal";
import {
  Gavel,
  Slash,
  LogOut,
  AlertCircle,
  CheckCircle,
  Coins,
  ShieldAlert,
  LogIn,
} from "lucide-react";

export const BidControls: React.FC = () => {
  const {
    role,
    activeFranchise,
    authenticatedFranchiseId,
    franchises,
    currentPlayer,
    highestBid,
    franchiseStatuses,
    auctionStatus,
    isTimerRunning,
    placeBid,
    skipCurrentPlayer,
    outCurrentPlayer,
  } = useAuction();

  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [adminSelectedTeamId, setAdminSelectedTeamId] = useState<string>(franchises[0]?.id || "iu");

  // Determine which franchise is acting
  const currentActingFranchise =
    role === "team_owner"
      ? activeFranchise
      : role === "admin"
      ? franchises.find((f) => f.id === adminSelectedTeamId)
      : undefined;

  // Spectator View
  if (role === "spectator" || !currentActingFranchise) {
    return (
      <>
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-center shadow-xl">
          <ShieldAlert className="w-9 h-9 text-amber-400 mx-auto mb-2" />
          <h4 className="text-white font-black text-base">Spectator Mode (Read-Only)</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            You are watching the live auction stream. To place bids, participate in auctions, and manage squads, log in with your private team passkey.
          </p>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <LogIn className="w-4 h-4" /> Join as Team Owner / Admin
          </button>
        </div>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </>
    );
  }

  const isLeading = Boolean(highestBid && highestBid.franchiseId === currentActingFranchise.id);
  const myStatus = franchiseStatuses[currentActingFranchise.id] || "active";
  const isOut = myStatus === "out";
  const isSkipped = myStatus === "skipped";

  const nextMinIncrement = highestBid ? getNextMinimumIncrement(highestBid.amount) : 0;
  const nextBidAmount = highestBid ? highestBid.amount + nextMinIncrement : (currentPlayer?.basePrice || 0);

  const handlePlaceBid = (customAmount?: number) => {
    setBidError(null);
    setBidSuccess(null);
    const result = placeBid(currentActingFranchise.id, customAmount);
    if (!result.success) {
      setBidError(result.message);
    } else {
      setBidSuccess(result.message);
      setTimeout(() => setBidSuccess(null), 3000);
    }
  };

  const handleSkip = () => {
    setBidError(null);
    skipCurrentPlayer(currentActingFranchise.id);
  };

  const handleOut = () => {
    setBidError(null);
    if (isLeading) {
      setBidError("Leading franchise cannot withdraw while holding the highest bid!");
      return;
    }
    outCurrentPlayer(currentActingFranchise.id);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Franchise Status Ribbon */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-md"
            style={{ backgroundColor: currentActingFranchise.primaryColor }}
          >
            {currentActingFranchise.shortName}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-white">{currentActingFranchise.name}</h4>
              {role === "admin" && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 rounded">
                  Admin Simulator
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Purse: <strong className="text-amber-400 font-bold">{formatPKR(currentActingFranchise.remainingPurse)}</strong></span>
            </div>
          </div>
        </div>

        {/* Current status pill */}
        <div>
          {isLeading ? (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
              <CheckCircle className="w-3.5 h-3.5" /> LEADING BIDDER
            </span>
          ) : isOut ? (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-red-500/20 text-red-400 border border-red-500/40">
              <LogOut className="w-3.5 h-3.5" /> WITHDRAWN (OUT)
            </span>
          ) : isSkipped ? (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Slash className="w-3.5 h-3.5" /> PASSED / SKIPPED
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
              ELIGIBLE TO BID
            </span>
          )}
        </div>
      </div>

      {/* Admin Simulator Team Selector if role is admin */}
      {role === "admin" && (
        <div className="mt-3 flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-semibold">Admin Bid As:</span>
          <select
            value={adminSelectedTeamId}
            onChange={(e) => setAdminSelectedTeamId(e.target.value)}
            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
          >
            {franchises.map((f) => (
              <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                {f.shortName} - {f.name} ({formatPKR(f.remainingPurse)})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Feedback Messages */}
      {bidError && (
        <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center gap-2 text-xs text-red-300 font-semibold animate-shake">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{bidError}</span>
        </div>
      )}
      {bidSuccess && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center gap-2 text-xs text-emerald-300 font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{bidSuccess}</span>
        </div>
      )}

      {/* Main Bid Action Button */}
      <div className="mt-4">
        <button
          disabled={auctionStatus !== "Live" || !isTimerRunning || isOut || isLeading}
          onClick={() => handlePlaceBid(nextBidAmount)}
          className={`w-full py-4 px-6 rounded-2xl font-black text-base uppercase tracking-wider flex items-center justify-between transition-all duration-200 shadow-xl ${
            isLeading
              ? "bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 cursor-not-allowed opacity-90"
              : isOut
              ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              : auctionStatus !== "Live" || !isTimerRunning
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-emerald-500/25 active:scale-[0.99]"
          }`}
        >
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5" />
            <span>
              {isLeading
                ? "You Hold Highest Bid"
                : isOut
                ? "Out from this Player"
                : `Place Bid (${formatPKR(nextBidAmount)})`}
            </span>
          </div>
          {!isLeading && !isOut && auctionStatus === "Live" && (
            <span className="text-xs bg-slate-950/30 px-2.5 py-1 rounded-lg font-mono font-bold">
              +{formatPKR(nextMinIncrement || currentPlayer?.basePrice || 0)}
            </span>
          )}
        </button>
      </div>

      {/* Quick Increments based on Section 5 rules */}
      {!isOut && !isLeading && auctionStatus === "Live" && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            onClick={() => handlePlaceBid(nextBidAmount + 250000)}
            className="py-2 px-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 transition-colors"
          >
            +{formatPKR(250000)} (2.5L)
          </button>
          <button
            onClick={() => handlePlaceBid(nextBidAmount + 500000)}
            className="py-2 px-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-xs font-bold text-amber-300 transition-colors"
          >
            +{formatPKR(500000)} (5L)
          </button>
          <button
            onClick={() => handlePlaceBid(nextBidAmount + 1000000)}
            className="py-2 px-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-xs font-bold text-emerald-300 transition-colors"
          >
            +{formatPKR(1000000)} (10L)
          </button>
        </div>
      )}

      {/* Skip and Out Controls (Section 13) */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3">
        <button
          disabled={auctionStatus !== "Live" || isOut || isSkipped || isLeading}
          onClick={handleSkip}
          title="Temporarily pass bidding on this player (can rejoin before finalization)"
          className="py-2.5 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Slash className="w-3.5 h-3.5 text-amber-400" />
          <span>Skip / Pass</span>
        </button>

        <button
          disabled={auctionStatus !== "Live" || isOut || isLeading}
          onClick={handleOut}
          title="Permanently withdraw from this player's auction"
          className="py-2.5 px-3 rounded-xl bg-red-950/30 hover:bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <LogOut className="w-3.5 h-3.5 text-red-400" />
          <span>Out / Withdraw</span>
        </button>
      </div>

      <p className="text-[10px] text-slate-500 text-center mt-3">
        PSL Official Increments & Reserve Purse rules validated on server.
      </p>
    </div>
  );
};
