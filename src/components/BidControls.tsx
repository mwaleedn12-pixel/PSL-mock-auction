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
  Sparkles,
  Users,
} from "lucide-react";

export const BidControls: React.FC = () => {
  const {
    role,
    activeFranchise,
    authenticatedFranchiseId,
    switchRoleDirectly,
    franchises,
    players,
    currentPlayer,
    highestBid,
    franchiseStatuses,
    auctionStatus,
    isTimerRunning,
    startAuction,
    resumeAuction,
    placeBid,
    skipCurrentPlayer,
    outCurrentPlayer,
  } = useAuction();

  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [adminSelectedTeamId, setAdminSelectedTeamId] = useState<string>(franchises[0]?.id || "iu");
  const [showCustomBid, setShowCustomBid] = useState(false);
  const [customBidAmount, setCustomBidAmount] = useState<number | "">("");

  // Determine which franchise is acting
  const currentActingFranchise =
    role === "team_owner"
      ? activeFranchise
      : role === "admin"
        ? franchises.find((f) => f.id === adminSelectedTeamId)
        : undefined;

  // Franchise squad & quota metrics
  const currentSquad = currentActingFranchise
    ? players.filter((p) => p.soldToFranchiseId === currentActingFranchise.id)
    : [];
  const currentOverseas = currentSquad.filter((p) => p.isOverseas);
  const spentPurse = currentActingFranchise
    ? currentActingFranchise.initialPurse - currentActingFranchise.remainingPurse
    : 0;
  const minSlotsRequired = currentActingFranchise
    ? Math.max(0, currentActingFranchise.minSquadSize - currentSquad.length)
    : 0;
  const maxOverseasAllowed = currentActingFranchise?.maxOverseas || 7;
  const overseasSlotsLeft = Math.max(0, maxOverseasAllowed - currentOverseas.length);

  // Spectator View
  if (role === "spectator" || !currentActingFranchise) {
    return (
      <>
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-center shadow-xl space-y-4">
          <ShieldAlert className="w-9 h-9 text-amber-400 mx-auto" />
          <div>
            <h4 className="text-white font-black text-base">Spectator Mode (Read-Only)</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              You are viewing the live auction broadcast. To place bids and manage squads, log in or switch to a franchise below.
            </p>
          </div>

          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-400 block mb-2">
              ⚡ 1-Click Quick Bidding: Select any franchise to test bids
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {franchises.map((f) => (
                <button
                  key={f.id}
                  onClick={() => switchRoleDirectly("team_owner", f.id)}
                  style={{ borderColor: `${f.primaryColor}88` }}
                  className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border text-xs font-bold text-slate-200 hover:text-white flex items-center gap-2 justify-center transition-all hover:scale-[1.02]"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: f.primaryColor }}
                  />
                  <span>{f.shortName}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <LogIn className="w-4 h-4" /> Enter Team Passkey / Admin Login
            </button>
          </div>
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

      {/* Real-time Franchise Owner Key Metrics Ledger */}
      <div className="mt-3.5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/90 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Purse</span>
          <span className="font-black text-white">{formatPKR(currentActingFranchise.initialPurse)}</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Spent</span>
          <span className="font-black text-slate-300">{formatPKR(spentPurse)}</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Squad Quota</span>
          <span className="font-black text-emerald-400">
            {currentSquad.length} / {currentActingFranchise.maxSquadSize}
          </span>
        </div>
        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Min Left to 16</span>
          <span className={`font-black ${minSlotsRequired > 0 ? "text-amber-400" : "text-emerald-400"}`}>
            {minSlotsRequired > 0 ? `${minSlotsRequired} needed` : "Quota Met"}
          </span>
        </div>
        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 col-span-1 sm:col-span-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Overseas Slots Left</span>
          <span className="font-bold text-cyan-400">
            {overseasSlotsLeft} left ({currentOverseas.length}/{maxOverseasAllowed})
          </span>
        </div>
        <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 col-span-1 sm:col-span-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">RTM Cards</span>
          <span className="font-bold text-amber-300 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> {currentActingFranchise.rtmCardsLeft ?? 2} Remaining
          </span>
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
        <div className="mt-3.5 p-3 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center gap-2 text-xs text-red-300 font-semibold animate-shake">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{bidError}</span>
        </div>
      )}
      {bidSuccess && (
        <div className="mt-3.5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center gap-2 text-xs text-emerald-300 font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{bidSuccess}</span>
        </div>
      )}

      {/* Main Bid Action Button */}
      <div className="mt-4">
        {auctionStatus !== "Live" && (
          <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
            <span className="text-amber-300 font-bold">
              ⚠️ Auction is currently {auctionStatus.toLowerCase()}.
            </span>
            <button
              onClick={auctionStatus === "Paused" ? resumeAuction : startAuction}
              className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black hover:bg-emerald-400 transition-colors"
            >
              {auctionStatus === "Paused" ? "Resume Auction" : "Start Live Auction"}
            </button>
          </div>
        )}
        <button
          disabled={auctionStatus !== "Live" || isOut || isLeading}
          onClick={() => handlePlaceBid(nextBidAmount)}
          className={`w-full py-4 px-6 rounded-2xl font-black text-base uppercase tracking-wider flex items-center justify-between transition-all duration-200 shadow-xl ${
            isLeading
              ? "bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 cursor-not-allowed opacity-90"
              : isOut
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                : auctionStatus !== "Live"
                  ? "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700"
                  : "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-emerald-500/25 active:scale-[0.99] cursor-pointer"
          }`}
        >
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5" />
            <span>
              {isLeading
                ? "You Hold Highest Bid"
                : isOut
                  ? "Out from this Player"
                  : auctionStatus !== "Live"
                    ? `Ready to Bid (${formatPKR(nextBidAmount)})`
                    : `Place Bid (${formatPKR(nextBidAmount)})`}
            </span>
          </div>
          {!isLeading && !isOut && (
            <span className="text-xs bg-slate-950/30 px-2.5 py-1 rounded-lg font-mono font-bold">
              +{formatPKR(nextMinIncrement || currentPlayer?.basePrice || 0)}
            </span>
          )}
        </button>
      </div>

      {/* Quick Increments */}
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

      {/* Custom Bid Input Option */}
      {!isOut && !isLeading && auctionStatus === "Live" && (
        <div className="mt-2.5">
          {!showCustomBid ? (
            <button
              onClick={() => setShowCustomBid(true)}
              className="text-xs text-slate-400 hover:text-emerald-400 underline font-semibold transition-colors block text-center w-full"
            >
              + Enter custom bid amount
            </button>
          ) : (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-700/80 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-bold">Custom Bid Amount (PKR):</span>
                <button
                  onClick={() => setShowCustomBid(false)}
                  className="text-slate-500 hover:text-white"
                >
                  ✕ Close
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder={`Min ${nextBidAmount}`}
                  value={customBidAmount}
                  onChange={(e) => setCustomBidAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => {
                    if (typeof customBidAmount === "number" && customBidAmount >= nextBidAmount) {
                      handlePlaceBid(customBidAmount);
                      setShowCustomBid(false);
                      setCustomBidAmount("");
                    } else {
                      setBidError(`Custom bid must be at least ${formatPKR(nextBidAmount)}!`);
                    }
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase rounded-lg shrink-0"
                >
                  Bid
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skip and Out Controls */}
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
        PSL Official Increments &amp; Reserve Purse rules validated on server.
      </p>
    </div>
  );
};
