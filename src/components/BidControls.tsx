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
    startAuction,
    resumeAuction,
    placeBid,
    skipCurrentPlayer,
    outCurrentPlayer,
    themeMode,
  } = useAuction();

  const isDark = themeMode === "broadcast_dark";
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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm space-y-4">
          <ShieldAlert className="w-8 h-8 text-amber-500 mx-auto" />
          <div>
            <h4 className="text-slate-900 font-black text-base">Spectator Stream (Read-Only)</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You are watching the live auction. To place bids and manage a franchise, select an available team below.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => switchRoleDirectly("team_owner", "iu")}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <Gavel className="w-4 h-4" />
              <span>⚡ Unlock Bidding as Islamabad United (IU)</span>
            </button>
          </div>

          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-500 block mb-2">
              Or Select Another Franchise to Test:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {franchises.map((f) => (
                <button
                  key={f.id}
                  onClick={() => switchRoleDirectly("team_owner", f.id)}
                  style={{ borderColor: `${f.primaryColor}88` }}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-2 justify-center transition-all"
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
    <div className={`border rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden transition-colors ${
      isDark ? "bg-slate-900/95 border-slate-800 text-white shadow-xl" : "bg-white border-slate-200"
    }`}>
      {/* Franchise Status Ribbon */}
      <div className={`flex items-center justify-between pb-3 border-b ${
        isDark ? "border-slate-800" : "border-slate-100"
      }`}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-sm border border-white/20 shrink-0"
            style={{ backgroundColor: currentActingFranchise.primaryColor }}
          >
            {currentActingFranchise.shortName}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>{currentActingFranchise.name}</h4>
              {role === "admin" && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold px-1.5 rounded">
                  Admin Simulator
                </span>
              )}
            </div>
            <div className={`flex items-center gap-1.5 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>Purse: <strong className="text-emerald-400 font-bold font-mono">{formatPKR(currentActingFranchise.remainingPurse)}</strong></span>
            </div>
          </div>
        </div>

        {/* Current status pill */}
        <div>
          {isLeading ? (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> LEADING BIDDER
            </span>
          ) : isOut ? (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-800 border border-red-300">
              <LogOut className="w-3.5 h-3.5 text-red-600" /> WITHDRAWN (OUT)
            </span>
          ) : isSkipped ? (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
              <Slash className="w-3.5 h-3.5 text-amber-600" /> PASSED / SKIPPED
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              ELIGIBLE TO BID
            </span>
          )}
        </div>
      </div>

      {/* Feedback Messages */}
      {bidError && (
        <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-800 font-semibold animate-shake">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{bidError}</span>
        </div>
      )}
      {bidSuccess && (
        <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-900 font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{bidSuccess}</span>
        </div>
      )}

      {/* Main Bid Action Button (PLACED AT THE TOP FOR IMMEDIATE ACCESS) */}
      <div className="mt-3">
        {auctionStatus !== "Live" && (
          <div className="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
            <span className="text-amber-900 font-bold">
              ⚠️ Auction is currently {auctionStatus.toLowerCase()}.
            </span>
            <button
              onClick={auctionStatus === "Paused" ? resumeAuction : startAuction}
              className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-black hover:bg-emerald-500 transition-colors shadow"
            >
              {auctionStatus === "Paused" ? "Resume Auction" : "Start Live Auction"}
            </button>
          </div>
        )}
        <button
          disabled={auctionStatus !== "Live" || isOut || isLeading}
          onClick={() => handlePlaceBid(nextBidAmount)}
          className={`w-full py-4 px-6 rounded-2xl font-black text-base uppercase tracking-wider flex items-center justify-between transition-all duration-200 shadow ${
            isLeading
              ? "bg-emerald-100 border border-emerald-300 text-emerald-800 cursor-not-allowed opacity-90"
              : isOut
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : auctionStatus !== "Live"
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                  : "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-emerald-600/25 active:scale-[0.99] cursor-pointer"
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
            <span className="text-xs bg-black/20 px-2.5 py-1 rounded-lg font-mono font-bold text-white">
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
            className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors shadow-xs"
          >
            +{formatPKR(250000)} (2.5L)
          </button>
          <button
            onClick={() => handlePlaceBid(nextBidAmount + 500000)}
            className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-amber-700 transition-colors shadow-xs"
          >
            +{formatPKR(500000)} (5L)
          </button>
          <button
            onClick={() => handlePlaceBid(nextBidAmount + 1000000)}
            className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-emerald-700 transition-colors shadow-xs"
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
              className="text-xs text-slate-500 hover:text-emerald-700 underline font-semibold transition-colors block text-center w-full"
            >
              + Enter custom bid amount
            </button>
          ) : (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span className="font-bold">Custom Bid Amount (PKR):</span>
                <button
                  onClick={() => setShowCustomBid(false)}
                  className="text-slate-400 hover:text-slate-700"
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
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-500"
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase rounded-lg shrink-0"
                >
                  Bid
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skip and Out Controls */}
      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2.5">
        <button
          disabled={auctionStatus !== "Live" || isOut || isSkipped || isLeading}
          onClick={handleSkip}
          className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
        >
          <Slash className="w-3.5 h-3.5 text-amber-500" />
          <span>Skip / Pass</span>
        </button>

        <button
          disabled={auctionStatus !== "Live" || isOut || isLeading}
          onClick={handleOut}
          className="py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
        >
          <LogOut className="w-3.5 h-3.5 text-red-600" />
          <span>Out / Withdraw</span>
        </button>
      </div>

      {/* Admin Simulator Selector */}
      {role === "admin" && (
        <div className="mt-3 flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-600 font-semibold">Admin Bid As:</span>
          <select
            value={adminSelectedTeamId}
            onChange={(e) => setAdminSelectedTeamId(e.target.value)}
            className="bg-white border border-slate-200 rounded px-2 py-1 text-slate-900 font-bold focus:outline-none"
          >
            {franchises.map((f) => (
              <option key={f.id} value={f.id}>
                {f.shortName} - {f.name} ({formatPKR(f.remainingPurse)})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
