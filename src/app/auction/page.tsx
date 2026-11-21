"use client";

import React, { useState } from "react";
import { useAuction } from "@/context/AuctionContext";
import { PlayerCard } from "@/components/PlayerCard";
import { CountdownTimer } from "@/components/CountdownTimer";
import { BidControls } from "@/components/BidControls";
import { UpcomingQueueShowcase } from "@/components/UpcomingQueueShowcase";
import { FranchiseComparisonMatrix } from "@/components/FranchiseComparisonMatrix";
import { RtmModal } from "@/components/RtmModal";
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
  Copy,
  Check,
  Shuffle,
  Users,
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
    reEnterUnsoldPlayers,
    shuffleUpcomingPlayers,
    toggleWatchlist,
    watchlists,
    activeFranchise,
    settings,
  } = useAuction();

  const [activeTab, setActiveTab] = useState<"bids" | "franchises" | "queue" | "wishlist">("bids");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const upcomingPlayers = players.filter((p) => p.status === "upcoming");
  const unsoldPlayers = players.filter((p) => p.status === "unsold");

  const isCurrentWatchlisted =
    activeFranchise &&
    currentPlayer &&
    watchlists.some((w) => w.franchiseId === activeFranchise.id && w.playerId === currentPlayer.id);

  const myWatchlist = activeFranchise
    ? watchlists.filter((w) => w.franchiseId === activeFranchise.id)
    : [];

  const handleCopyLink = (type: "team" | "spectator") => {
    if (typeof window === "undefined") return;
    const origin = window.location.origin;
    let url = `${origin}/auction`;
    if (type === "team" && activeFranchise) {
      url = `${origin}/auction?join=${activeFranchise.privatePasskey}`;
    } else if (type === "spectator") {
      url = `${origin}/auction?role=spectator`;
    }
    navigator.clipboard.writeText(url);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Right to Match (RTM) Modal Overlay */}
      <RtmModal />

      {/* Live Broadcast Ticker Bar */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-amber-950/70 border border-emerald-500/30 p-2.5 px-4 shadow-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span className="font-black text-white uppercase tracking-wider text-[11px]">LIVE BROADCAST FEED:</span>
        </div>
        <div className="text-slate-300 font-medium truncate max-w-xl text-[11px]">
          {highestBid ? (
            <span>
              🔥 Leading Bid: <strong className="text-amber-400 font-mono font-bold">{formatPKR(highestBid.amount)}</strong> by <strong className="text-emerald-400 font-bold">{highestBid.franchiseName}</strong> on <strong className="text-white">{currentPlayer?.name}</strong>
            </span>
          ) : currentPlayer ? (
            <span>
              Now on Block: <strong className="text-emerald-300">{currentPlayer.name}</strong> • Base: <strong className="text-amber-400 font-mono">{formatPKR(currentPlayer.basePrice)}</strong> ({currentPlayer.category})
            </span>
          ) : (
            <span>Welcome to the PSL 12 Live Virtual Player Auction Room!</span>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[10px] font-mono">
          <span>8 FRANCHISES</span>
          <span>•</span>
          <span>RTM ENABLED</span>
        </div>
      </div>

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
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-amber-400 font-semibold">
              Order: {settings.playerOccurrenceOrder === "random" ? "Random Pot Draw" : "Sequential Order"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
            PSL 12 Live Player Auction
          </h1>
        </div>

        {/* Shareable Invite Links & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {activeFranchise && (
            <button
              onClick={() => handleCopyLink("team")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700 text-slate-200 hover:text-white transition-colors"
              title="Copy private invite link for this franchise"
            >
              {copiedLink === "team" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedLink === "team" ? "Link Copied!" : "My Team Link"}</span>
            </button>
          )}

          <button
            onClick={() => handleCopyLink("spectator")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700 text-slate-200 hover:text-white transition-colors"
            title="Copy public read-only spectator stream link"
          >
            {copiedLink === "spectator" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedLink === "spectator" ? "Spectator Link Copied!" : "Spectator Link"}</span>
          </button>

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
              <span>{isCurrentWatchlisted ? "Watchlisted" : "Add to Wishlist"}</span>
            </button>
          )}

          {role === "admin" && (
            <button
              onClick={shuffleUpcomingPlayers}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Shuffle upcoming players randomly for a live draw"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-400" /> Shuffle Order
            </button>
          )}

          {unsoldPlayers.length > 0 && auctionStatus !== "Live" && (
            <button
              onClick={() => reEnterUnsoldPlayers([], 0)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-Auction Unsold ({unsoldPlayers.length})
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
                        ? "bg-amber-950/20 border-amber-900/40 text-amber-400/80"
                        : "bg-slate-950/50 border-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: f.primaryColor }}
                      />
                      <span className="truncate">{f.shortName}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isLeading ? (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-black">
                          BID
                        </span>
                      ) : status === "out" ? (
                        <span className="text-[10px] text-red-400 font-bold">OUT</span>
                      ) : status === "skipped" ? (
                        <span className="text-[10px] text-amber-400 font-bold">PASS</span>
                      ) : isFull ? (
                        <span className="text-[10px] text-slate-500">FULL</span>
                      ) : (
                        <span className="text-[10px] text-slate-400">IN</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Engine, Countdown, Bids, Controls */}
        <div className="lg:col-span-5 space-y-4">
          {/* Synchronized Countdown Timer */}
          <CountdownTimer />

          {/* Leading Bidder Live Highlight Card */}
          <div
            className={`rounded-3xl p-5 shadow-2xl relative overflow-hidden transition-all duration-300 border ${
              highestBid
                ? "bg-slate-900/95 border-emerald-500/60 shadow-emerald-500/10"
                : "bg-slate-900/90 border-slate-800"
            }`}
          >
            {highestBid && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
            )}
            <div className="flex items-center justify-between relative z-10">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                  Current Highest Bid
                </span>
                <p className="text-3xl sm:text-4xl font-black text-amber-400 mt-1 font-mono tracking-tight">
                  {highestBid ? formatPKR(highestBid.amount) : "No Bids Placed"}
                </p>
                {highestBid ? (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-slate-300 font-bold">
                      Leading Team:{" "}
                      <span className="text-emerald-400 font-black underline decoration-emerald-500/50">
                        {highestBid.franchiseName}
                      </span>
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">
                    Opening bid starts at base price: {currentPlayer ? formatPKR(currentPlayer.basePrice) : "PKR 0"}
                  </p>
                )}
              </div>
              <div
                className={`p-3.5 rounded-2xl border transition-colors ${
                  highestBid
                    ? "bg-emerald-500/20 border-emerald-500/40 text-amber-400 animate-pulse"
                    : "bg-slate-950 border-slate-800 text-slate-600"
                }`}
              >
                <Gavel className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Interactive Bidding & Franchise Controls */}
          <BidControls />

          {/* Tabbed Live Box: Bids History, Next Up, Team Purses, My Wishlist */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl">
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl mb-3 text-xs font-bold">
              <button
                onClick={() => setActiveTab("bids")}
                className={`flex-1 py-1.5 rounded-lg transition-colors ${
                  activeTab === "bids"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Bids ({currentBids.length})
              </button>
              <button
                onClick={() => setActiveTab("queue")}
                className={`flex-1 py-1.5 rounded-lg transition-colors ${
                  activeTab === "queue"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Next Up ({upcomingPlayers.length})
              </button>
              <button
                onClick={() => setActiveTab("franchises")}
                className={`flex-1 py-1.5 rounded-lg transition-colors ${
                  activeTab === "franchises"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Purses
              </button>
              {activeFranchise && (
                <button
                  onClick={() => setActiveTab("wishlist")}
                  className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                    activeTab === "wishlist"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Bookmark className="w-3 h-3" /> Wishlist ({myWatchlist.length})
                </button>
              )}
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
                {upcomingPlayers.slice(0, 10).map((p) => (
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

            {/* Tab: My Wishlist */}
            {activeTab === "wishlist" && activeFranchise && (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {myWatchlist.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 py-4">
                    Your wishlist is empty. Click bookmark on any player to add them.
                  </p>
                ) : (
                  myWatchlist.map((w) => {
                    const wp = players.find((p) => p.id === w.playerId);
                    if (!wp) return null;
                    const isSoldToMe = wp.soldToFranchiseId === activeFranchise.id;
                    return (
                      <div
                        key={w.playerId}
                        className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Bookmark className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                          <span className="font-bold text-white truncate">{wp.name}</span>
                          <span className="text-[10px] text-slate-400">({wp.category})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-300">{formatPKR(wp.basePrice)}</span>
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                              isSoldToMe
                                ? "bg-emerald-500/20 text-emerald-400"
                                : wp.status === "sold"
                                ? "bg-red-500/20 text-red-400"
                                : wp.status === "unsold"
                                ? "bg-slate-800 text-slate-400"
                                : "bg-cyan-500/20 text-cyan-400"
                            }`}
                          >
                            {isSoldToMe ? "Signed" : wp.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ALL FRANCHISES LIVE COMPARISON & FINANCIAL MATRIX */}
      <FranchiseComparisonMatrix />

      {/* Upcoming Player Queue with Kit Pictures & PSL / T20 Stats */}
      <UpcomingQueueShowcase />

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
