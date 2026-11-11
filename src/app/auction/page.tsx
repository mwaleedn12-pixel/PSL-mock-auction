"use client";

import React, { useState } from "react";
import { useAuction } from "@/context/AuctionContext";
import { PlayerCard } from "@/components/PlayerCard";
import { CountdownTimer } from "@/components/CountdownTimer";
import { BidControls } from "@/components/BidControls";
import { formatPKR } from "@/lib/rules";
import {
  Gavel,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  CheckCircle,
  XCircle,
  Shield,
  Clock,
  Flame,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Eye,
  Bookmark,
  Volume2,
} from "lucide-react";

export default function LiveAuctionArenaPage() {
  const {
    role,
    auctionStatus,
    players,
    currentPlayer,
    currentPlayerIndex,
    currentBids,
    highestBid,
    franchises,
    franchiseStatuses,
    startAuction,
    pauseAuction,
    resumeAuction,
    finalizePlayer,
    goToNextPlayer,
    goToPreviousPlayer,
    selectPlayerForAuction,
    startRoundTwo,
    toggleWatchlist,
    watchlists,
    activeFranchise,
  } = useAuction();

  const [activeTab, setActiveTab] = useState<"bids" | "franchises" | "queue">("bids");

  const upcomingPlayers = players.filter((p) => p.status === "upcoming");
  const unsoldPlayers = players.filter((p) => p.status === "unsold");

  const isCurrentWatchlisted =
    activeFranchise &&
    currentPlayer &&
    watchlists.some((w) => w.franchiseId === activeFranchise.id && w.playerId === currentPlayer.id);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Arena Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-red-400">
              Live Broadcast Arena
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">
              Player {currentPlayerIndex + 1} of {players.length}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
            PSL 12 Live Player Auction
          </h1>
        </div>

        {/* Watchlist toggle & Arena Quick Actions */}
        <div className="flex items-center gap-2">
          {activeFranchise && currentPlayer && (
            <button
              onClick={() => toggleWatchlist(activeFranchise.id, currentPlayer.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                isCurrentWatchlisted
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isCurrentWatchlisted ? "fill-amber-400" : ""}`} />
              <span>{isCurrentWatchlisted ? "Watchlisted" : "Add to Watchlist"}</span>
            </button>
          )}

          {unsoldPlayers.length > 0 && auctionStatus !== "Live" && (
            <button
              onClick={startRoundTwo}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Start Round 2 ({unsoldPlayers.length} Unsold)
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Player Showcase (Left) + Auction Engine & Bidding Controls (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Player Presentation Card */}
        <div className="lg:col-span-7 space-y-4">
          <PlayerCard
            player={currentPlayer}
            highestBidAmount={highestBid?.amount}
            winningFranchiseName={highestBid?.franchiseName}
          />

          {/* Franchise Participation Real-Time Matrix */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Franchise Participation Status</span>
              <span className="text-[11px] text-slate-500 font-normal">Auto-sell triggers when all others OUT</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {franchises.map((f) => {
                const status = franchiseStatuses[f.id] || "active";
                const isLeading = highestBid && highestBid.franchiseId === f.id;
                const squad = players.filter((p) => p.soldToFranchiseId === f.id);
                const isFull = squad.length >= f.maxSquadSize;

                return (
                  <div
                    key={f.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                      isLeading
                        ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-bold"
                        : status === "out"
                        ? "bg-red-950/20 border-red-900/40 text-red-400/80 opacity-70"
                        : status === "skipped"
                        ? "bg-amber-950/20 border-amber-900/40 text-amber-400"
                        : "bg-slate-950/60 border-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: f.primaryColor }}
                      />
                      <span className="truncate">{f.shortName}</span>
                    </div>

                    <span className="text-[10px] font-black uppercase">
                      {isLeading
                        ? "👑 BID"
                        : isFull
                        ? "FULL"
                        : status === "out"
                        ? "OUT"
                        : status === "skipped"
                        ? "PASS"
                        : "ACTIVE"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Clock, Live Highest Bid, Bidding Controls, Stream */}
        <div className="lg:col-span-5 space-y-4">
          {/* Synchronized Server Countdown Clock */}
          <CountdownTimer />

          {/* Current Highest Bid Highlight */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-1">
              {highestBid ? "Leading Bidder" : "Starting Price"}
            </span>

            {highestBid ? (
              <div>
                <h3 className="text-3xl font-black text-amber-400 tracking-tight">
                  {formatPKR(highestBid.amount)}
                </h3>
                <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor:
                        franchises.find((f) => f.id === highestBid.franchiseId)?.primaryColor || "#10b981",
                    }}
                  />
                  <span className="text-xs font-black text-white">{highestBid.franchiseName}</span>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold text-slate-200">
                  {currentPlayer ? formatPKR(currentPlayer.basePrice) : "PKR 0"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Awaiting opening bid from franchise</p>
              </div>
            )}
          </div>

          {/* Interactive Bidding Controls for Active Franchise */}
          <BidControls />

          {/* Tabs: Live Bid Stream, Queue, Franchise Purse */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-3 text-xs font-bold">
              <button
                onClick={() => setActiveTab("bids")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === "bids"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Bid History ({currentBids.length})
              </button>
              <button
                onClick={() => setActiveTab("queue")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === "queue"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Next Up ({upcomingPlayers.length})
              </button>
              <button
                onClick={() => setActiveTab("franchises")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === "franchises"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Team Purses
              </button>
            </div>

            {/* Tab: Bid History */}
            {activeTab === "bids" && (
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {currentBids.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 py-4">No bids placed for this player yet.</p>
                ) : (
                  [...currentBids].reverse().map((bid, i) => (
                    <div
                      key={bid.id}
                      className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                        i === 0
                          ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300 font-bold"
                          : "bg-slate-950/50 border-slate-800/80 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500 text-[10px]">
                          {new Date(bid.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <span>{bid.franchiseName}</span>
                      </div>
                      <span className="font-mono font-bold">{formatPKR(bid.amount)}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab: Upcoming Queue */}
            {activeTab === "queue" && (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {upcomingPlayers.slice(0, 8).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => selectPlayerForAuction(p.id)}
                    className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {p.category}
                      </span>
                      <span className="font-bold text-white">{p.name}</span>
                    </div>
                    <span className="text-slate-400 font-mono">{formatPKR(p.basePrice)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Team Purses */}
            {activeTab === "franchises" && (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {franchises.map((f) => {
                  const squad = players.filter((p) => p.soldToFranchiseId === f.id);
                  return (
                    <div
                      key={f.id}
                      className="p-2 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: f.primaryColor }} />
                        <span className="font-bold text-white">{f.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-amber-400 block">{formatPKR(f.remainingPurse)}</span>
                        <span className="text-[10px] text-slate-500">{squad.length}/{f.maxSquadSize} players</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Bottom Auction Controller Bar */}
      {role === "admin" && (
        <div className="mt-8 bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Admin Manual Override:
            </span>
            <button
              onClick={() => finalizePlayer(true)}
              disabled={auctionStatus !== "Live"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-colors disabled:opacity-40"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Sell to Current Bidder
            </button>
            <button
              onClick={() => finalizePlayer(false)}
              disabled={auctionStatus !== "Live"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-colors disabled:opacity-40"
            >
              <XCircle className="w-3.5 h-3.5" /> Mark Unsold
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousPlayer}
              disabled={currentPlayerIndex === 0}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 transition-colors"
              title="Previous Player"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {auctionStatus === "Live" ? (
              <button
                onClick={pauseAuction}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
              >
                <Pause className="w-4 h-4" /> Pause Auction
              </button>
            ) : (
              <button
                onClick={auctionStatus === "Paused" ? resumeAuction : startAuction}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow"
              >
                <Play className="w-4 h-4 fill-slate-950" /> {auctionStatus === "Paused" ? "Resume Auction" : "Start Live Bidding"}
              </button>
            )}

            <button
              onClick={goToNextPlayer}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 text-xs font-bold transition-colors"
              title="Skip / Next Player"
            >
              <span>Next Player</span>
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

