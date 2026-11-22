"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuction } from "@/context/AuctionContext";
import { PlayerCard } from "@/components/PlayerCard";
import { CountdownTimer } from "@/components/CountdownTimer";
import { BidControls } from "@/components/BidControls";
import { FranchiseComparisonMatrix } from "@/components/FranchiseComparisonMatrix";
import { RtmModal } from "@/components/RtmModal";
import { AuctionAnnouncementOverlay } from "@/components/AuctionAnnouncementOverlay";
import { LiveAuctionActivityFeed } from "@/components/LiveAuctionActivityFeed";
import { AudioToggle } from "@/components/AudioToggle";
import { formatPKR, getNextMinimumIncrement } from "@/lib/rules";
import { getWhatsAppShareUrl, exportAuctionToExcel, exportPlayersToCsv, exportSquadsToCsv } from "@/lib/export";
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
  Share2,
  Copy,
  Check,
  Shuffle,
  Users,
  RotateCcw,
  Bot,
  Sliders,
  Heart,
  MessageSquare,
  FileSpreadsheet,
  Download,
  Send,
  Info,
  ExternalLink,
  ChevronDown,
  Lock,
  PlusCircle,
  Trophy,
  Trash2,
  Sun,
  Moon,
} from "lucide-react";

export default function LiveAuctionArenaPage() {
  const {
    role,
    authenticatedFranchiseId,
    switchRoleDirectly,
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
    reEnterUnsoldPlayers,
    shuffleUpcomingPlayers,
    resetAuction,
    toggleBotBidding,
    botBiddingEnabled,
    toggleWatchlist,
    watchlists,
    activeFranchise,
    settings,
    updateSettings,
    messages,
    sendMessage,
    deleteMessage,
    themeMode,
    toggleThemeMode,
    tradeOffers,
    handleTradeAction,
    proposeTrade,
    eventLogs,
    isCloudConnected,
    rtmState,
  } = useAuction();

  const isDark = themeMode === "broadcast_dark";

  // Top Tabs
  const [activeMainTab, setActiveMainTab] = useState<
    "arena" | "purses" | "squads" | "players" | "rules" | "chat" | "summary"
  >("arena");

  // Chat input state
  const [chatChannel, setChatChannel] = useState<"owners" | "spectators">(
    role === "team_owner" || role === "admin" ? "owners" : "spectators"
  );
  const [chatMessageInput, setChatMessageInput] = useState("");

  // Player search & filter
  const [playerSearchQuery, setPlayerSearchQuery] = useState("");
  const [playerCategoryFilter, setPlayerCategoryFilter] = useState<string>("all");
  const [showOnlyWishlist, setShowOnlyWishlist] = useState(false);

  // Trade Desk form state
  const [tradeTargetFranchiseId, setTradeTargetFranchiseId] = useState<string>("");
  const [tradeOfferedPlayerId, setTradeOfferedPlayerId] = useState<string>("");
  const [tradeRequestedPlayerId, setTradeRequestedPlayerId] = useState<string>("");
  const [tradeCashOffer, setTradeCashOffer] = useState<number | "">("");
  const [tradeSuccessMsg, setTradeSuccessMsg] = useState<string | null>(null);

  // Link copy state
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const upcomingPlayers = players.filter((p) => p.status === "upcoming");
  const unsoldPlayers = players.filter((p) => p.status === "unsold");
  const soldPlayers = players.filter((p) => p.status === "sold");

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
    const url = type === "team" ? `${origin}/join` : `${origin}/auction?role=spectator`;
    navigator.clipboard.writeText(url);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageInput.trim()) return;
    sendMessage(chatChannel, chatMessageInput.trim());
    setChatMessageInput("");
  };

  const handleProposeTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFranchise || !tradeTargetFranchiseId) return;

    proposeTrade({
      fromFranchiseId: activeFranchise.id,
      toFranchiseId: tradeTargetFranchiseId,
      offeredPlayerId: tradeOfferedPlayerId || undefined,
      requestedPlayerId: tradeRequestedPlayerId || undefined,
      offeredCash: typeof tradeCashOffer === "number" ? tradeCashOffer : undefined,
    });

    setTradeSuccessMsg("Trade proposal sent! Awaiting response from target franchise.");
    setTradeOfferedPlayerId("");
    setTradeRequestedPlayerId("");
    setTradeCashOffer("");
    setTimeout(() => setTradeSuccessMsg(null), 4000);
  };

  // Filtered Players for Player List Tab
  const filteredPlayers = players.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(playerSearchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(playerSearchQuery.toLowerCase()) ||
      p.primaryRole.toLowerCase().includes(playerSearchQuery.toLowerCase()) ||
      p.nationality.toLowerCase().includes(playerSearchQuery.toLowerCase());

    const matchesCat = playerCategoryFilter === "all" || p.category === playerCategoryFilter;
    const matchesWishlist =
      !showOnlyWishlist ||
      (activeFranchise && watchlists.some((w) => w.franchiseId === activeFranchise.id && w.playerId === p.id));

    return matchesSearch && matchesCat && matchesWishlist;
  });

  return (
    <div className="space-y-4 animate-fadeIn pb-16">
      {/* Realtime Broadcast Sold / Unsold Celebration Overlay */}
      <AuctionAnnouncementOverlay />

      {/* Right to Match (RTM) Modal Overlay */}
      <RtmModal />

      {/* ======================================================== */}
      {/* 1. TOP HEADER: ACTIVE TEAM COCKPIT BANNER                */}
      {/* ======================================================== */}
      {role === "team_owner" && activeFranchise ? (
        <div className={`border rounded-2xl p-3 px-4 shadow-sm flex flex-wrap items-center justify-between gap-3 transition-colors ${
          isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200"
        }`}>
          {/* Left: Active Franchise, Owner Identity & Financials */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shadow border border-white/20 shrink-0"
              style={{ backgroundColor: activeFranchise.primaryColor }}
            >
              {activeFranchise.shortName}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>{activeFranchise.name}</h2>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  isDark ? "text-emerald-300 bg-emerald-950/60 border-emerald-500/40" : "text-emerald-700 bg-emerald-50 border-emerald-200"
                }`}>
                  🏏 {activeFranchise.ownerName || "Owner"}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                  auctionStatus === "Live"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse"
                    : "bg-amber-100 text-amber-800 border-amber-300"
                }`}>
                  ● {auctionStatus.toUpperCase()}
                </span>
              </div>
              <div className={`flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs mt-0.5 ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}>
                <span>Remaining: <strong className="text-emerald-400 font-mono font-black">{formatPKR(activeFranchise.remainingPurse)}</strong></span>
                <span>Spent: <strong className={`font-mono font-bold ${isDark ? "text-slate-300" : "text-slate-800"}`}>{formatPKR(activeFranchise.initialPurse - activeFranchise.remainingPurse)}</strong></span>
                <span>Squad: <strong className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{players.filter((p) => p.soldToFranchiseId === activeFranchise.id).length}/{activeFranchise.maxSquadSize}</strong></span>
                <span>Overseas: <strong className="text-cyan-400 font-bold">{players.filter((p) => p.soldToFranchiseId === activeFranchise.id && p.isOverseas).length}/{activeFranchise.maxOverseas}</strong></span>
                <span>RTM: <strong className="text-amber-400 font-bold">{activeFranchise.rtmCardsLeft ?? 2} Cards</strong></span>
              </div>
            </div>
          </div>

          {/* Right: Quick Controls, Sound & Wishlist (Bots hidden from owners) */}
          <div className="flex items-center gap-2">
            <AudioToggle />

            <button
              onClick={toggleThemeMode}
              className="p-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
              title={themeMode === "broadcast_dark" ? "Switch to Light Theme" : "Switch to Broadcast Dark Theme"}
            >
              {themeMode === "broadcast_dark" ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
            </button>

            {auctionStatus !== "Live" ? (
              <button
                onClick={auctionStatus === "Paused" ? resumeAuction : startAuction}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{auctionStatus === "Paused" ? "Resume" : "Start"}</span>
              </button>
            ) : (
              <button
                onClick={pauseAuction}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            )}

            {currentPlayer && (
              <button
                onClick={() => toggleWatchlist(activeFranchise.id, currentPlayer.id)}
                className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
                  isCurrentWatchlisted
                    ? "bg-amber-100 text-amber-700 border-amber-300"
                    : "bg-white text-slate-400 border-slate-200 hover:text-slate-700"
                }`}
                title={isCurrentWatchlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart className={`w-3.5 h-3.5 ${isCurrentWatchlisted ? "fill-amber-500 text-amber-500" : ""}`} />
              </button>
            )}
          </div>
        </div>
      ) : role === "admin" ? (
        <div className={`border-2 rounded-2xl p-3 px-4 shadow-sm flex flex-wrap items-center justify-between gap-3 transition-colors ${
          isDark ? "bg-slate-900 border-amber-500/50 text-white" : "bg-white border-amber-300"
        }`}>
          <div className="flex items-center gap-2.5">
            <span className={`p-1 px-2.5 rounded-lg font-black text-xs border ${
              isDark ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-amber-100 text-amber-800 border-amber-300"
            }`}>👑 Super Admin</span>
            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
              auctionStatus === "Live"
                ? "bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse"
                : "bg-amber-100 text-amber-800 border-amber-300"
            }`}>
              ● {auctionStatus.toUpperCase()}
            </span>
            <span className={`text-xs hidden sm:inline ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Lot #{currentPlayerIndex + 1} of {players.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleBotBidding}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                botBiddingEnabled
                  ? "bg-purple-100 border-purple-400 text-purple-900 shadow-sm"
                  : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
              title="Developer Testing Mode: Automated rival bot bidding simulation"
            >
              <Bot className="w-3.5 h-3.5 text-purple-600" />
              <span>Dev Bots: <strong>{botBiddingEnabled ? "ON" : "OFF"}</strong></span>
            </button>

            <AudioToggle />

            <button
              onClick={toggleThemeMode}
              className="p-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
              title={themeMode === "broadcast_dark" ? "Switch to Light Theme" : "Switch to Broadcast Dark Theme"}
            >
              {themeMode === "broadcast_dark" ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
            </button>

            {auctionStatus !== "Live" ? (
              <button
                onClick={auctionStatus === "Paused" ? resumeAuction : startAuction}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{auctionStatus === "Paused" ? "Resume" : "Start Live"}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={pauseAuction}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors"
                >
                  <Pause className="w-3.5 h-3.5" /> Pause
                </button>
                <button
                  onClick={() => finalizePlayer(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Hammer Down (Sell)
                </button>
                <button
                  onClick={() => finalizePlayer(false)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white transition-colors shadow"
                >
                  <XCircle className="w-3.5 h-3.5" /> Unsold
                </button>
                <button
                  onClick={goToNextPlayer}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                >
                  <SkipForward className="w-3.5 h-3.5" /> Next
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-2.5 px-4 shadow-sm flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="font-black text-slate-800 uppercase tracking-wider text-[11px]">LIVE SPECTATOR STREAM</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 font-medium">Player {currentPlayerIndex + 1} of {players.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <AudioToggle />
            <button
              onClick={toggleThemeMode}
              className="p-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
              title={themeMode === "broadcast_dark" ? "Switch to Light Theme" : "Switch to Broadcast Dark Theme"}
            >
              {themeMode === "broadcast_dark" ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
            </button>
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase transition-colors shadow"
            >
              Claim a Team to Bid →
            </Link>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. MAIN NAVIGATION TABS (USER-REQUESTED SUITE)           */}
      {/* ======================================================== */}
      <div className={`flex items-center gap-1.5 p-1.5 border rounded-2xl shadow-sm overflow-x-auto text-xs font-bold no-scrollbar transition-colors ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <button
          onClick={() => setActiveMainTab("arena")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
            activeMainTab === "arena"
              ? "bg-emerald-600 text-white shadow-sm"
              : isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Gavel className="w-3.5 h-3.5" />
          <span>1. Live Bidding Arena</span>
        </button>

        <button
          onClick={() => setActiveMainTab("purses")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
            activeMainTab === "purses"
              ? "bg-emerald-600 text-white shadow-sm"
              : isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>2. Purses &amp; Stats</span>
        </button>

        <button
          onClick={() => setActiveMainTab("squads")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
            activeMainTab === "squads"
              ? "bg-emerald-600 text-white shadow-sm"
              : isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>3. Squads &amp; Trade Desk</span>
        </button>

        <button
          onClick={() => setActiveMainTab("players")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
            activeMainTab === "players"
              ? "bg-emerald-600 text-white shadow-sm"
              : isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>4. Player List &amp; Wishlist ({myWatchlist.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab("rules")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
            activeMainTab === "rules"
              ? "bg-emerald-600 text-white shadow-sm"
              : isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>5. Auction Rules</span>
        </button>

        <button
          onClick={() => setActiveMainTab("chat")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
            activeMainTab === "chat"
              ? "bg-emerald-600 text-white shadow-sm"
              : isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>6. Live Chat ({messages.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab("summary")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
            activeMainTab === "summary"
              ? "bg-emerald-600 text-white shadow-sm"
              : isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>7. Summary &amp; Downloads</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: MAIN LIVE BIDDING ARENA                           */}
      {/* ======================================================== */}
      {activeMainTab === "arena" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Player Presentation Card (Name, Price, Category, Photo, Stats) */}
          <div className="lg:col-span-7 space-y-4">
            <PlayerCard
              player={currentPlayer}
              highestBidAmount={highestBid?.amount}
              winningFranchiseName={highestBid?.franchiseName}
            />
          </div>

          {/* Right Column: Engine, Countdown, Bids, Controls (MOVED RIGHT TO THE TOP) */}
          <div className="lg:col-span-5 space-y-3">
            {/* Unified Broadcast Top Card: Live Highest Bid + Radial Countdown Clock */}
            <div
              className={`rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden transition-all duration-300 border flex items-center justify-between gap-4 ${
                highestBid
                  ? isDark
                    ? "bg-slate-900 border-2 border-emerald-500 shadow-emerald-500/20"
                    : "bg-white border-2 border-emerald-500 shadow-emerald-500/10"
                  : isDark
                    ? "bg-slate-900 border-slate-800 text-white"
                    : "bg-white border-slate-200"
              }`}
            >
              <div className="relative z-10 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Current Highest Bid
                  </span>
                  {highestBid && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> LIVE
                    </span>
                  )}
                </div>
                <p className="text-4xl sm:text-5xl font-black text-amber-400 font-mono tracking-tight leading-none mt-1.5 drop-shadow-sm">
                  {highestBid ? formatPKR(highestBid.amount) : formatPKR(currentPlayer?.basePrice || 0)}
                </p>
                {highestBid ? (
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      Leading Franchise:{" "}
                      <span className="text-emerald-400 font-black underline decoration-emerald-500/50">
                        {highestBid.franchiseName}
                      </span>
                    </span>
                  </div>
                ) : (
                  <p className={`text-[11px] mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Opening at base price ({currentPlayer?.category})
                  </p>
                )}
              </div>

              {/* Compact Synchronized Radial Countdown Clock */}
              <div className="shrink-0 relative z-10">
                <CountdownTimer compact={true} />
              </div>
            </div>

            {/* Interactive Bidding & Franchise Controls */}
            <BidControls />

            {/* Live Streaming Activity Feed */}
            <LiveAuctionActivityFeed maxItems={6} />

            {/* Live Player Bid Timeline History Card */}
            <div className={`border rounded-2xl p-4 shadow-sm transition-colors ${
              isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200"
            }`}>
              <div className={`flex items-center justify-between mb-2 pb-2 border-b ${
                isDark ? "border-slate-800" : "border-slate-100"
              }`}>
                <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Player Bidding History ({currentBids.length})
                </h4>
                <span className={`text-[11px] font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}>Live Feed</span>
              </div>

              <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {currentBids.length === 0 ? (
                  <p className={`text-center text-xs py-3 ${isDark ? "text-slate-500" : "text-slate-400"}`}>No bids placed for this player yet.</p>
                ) : (
                  [...currentBids].reverse().map((bid, i) => (
                    <div
                      key={bid.id}
                      className={`p-2 rounded-xl border flex items-center justify-between ${
                        i === 0
                          ? isDark
                            ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-bold"
                            : "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                          : isDark
                            ? "bg-slate-950/60 border-slate-800 text-slate-300"
                            : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-[10px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          {new Date(bid.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <span>{bid.franchiseName}</span>
                      </div>
                      <span className="font-mono font-black">{formatPKR(bid.amount)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PURSES & TEAM PARTICIPATION MATRIX                */}
      {/* ======================================================== */}
      {activeMainTab === "purses" && (
        <div className="space-y-4">
          <FranchiseComparisonMatrix />
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SQUAD COMPOSITION & INTERACTIVE TRADE DESK        */}
      {/* ======================================================== */}
      {activeMainTab === "squads" && (
        <div className="space-y-6">
          {/* Detailed Squad Composition Grid */}
          <div className={`rounded-3xl border p-6 shadow-sm transition-colors ${
            isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200"
          }`}>
            <h3 className={`text-base font-black mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>Squad Composition Breakdown (All 8 Teams)</h3>
            <p className={`text-xs mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Real-time composition tracking of Batters, Bowlers, All-rounders, Keepers, and Overseas slots.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {franchises.map((f) => {
                const squad = players.filter((p) => p.soldToFranchiseId === f.id);
                const batters = squad.filter((p) => p.primaryRole === "Batter").length;
                const bowlers = squad.filter((p) => p.primaryRole === "Bowler").length;
                const allrounders = squad.filter((p) => p.primaryRole === "All-Rounder").length;
                const keepers = squad.filter((p) => p.primaryRole === "Wicketkeeper").length;
                const overseas = squad.filter((p) => p.isOverseas).length;

                return (
                  <div key={f.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: f.primaryColor }} />
                      <strong className="text-slate-900 text-sm">{f.name}</strong>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
                      <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">🏏 Batters</span>
                        <strong className="text-slate-800">{batters}</strong>
                      </div>
                      <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">⚡ Bowlers</span>
                        <strong className="text-slate-800">{bowlers}</strong>
                      </div>
                      <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">★ All-round</span>
                        <strong className="text-slate-800">{allrounders}</strong>
                      </div>
                      <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">🧤 Keepers</span>
                        <strong className="text-slate-800">{keepers}</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Overseas:</span>
                      <strong className="text-cyan-700">{overseas} / {f.maxOverseas} slots</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trade Desk Form & Active Proposals */}
          {settings.allowTradesBeforeAuction && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-emerald-600" />
                    <span>Interactive Franchise Trade Desk</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Propose player-for-player, player-for-money, or player+cash trades. Requires mutual agreement + admin approval.
                  </p>
                </div>
              </div>

              {tradeSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{tradeSuccessMsg}</span>
                </div>
              )}

              {/* Propose Trade Form for Franchise Owners */}
              {role === "team_owner" && activeFranchise && (
                <form onSubmit={handleProposeTrade} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Target Franchise</label>
                    <select
                      value={tradeTargetFranchiseId}
                      onChange={(e) => setTradeTargetFranchiseId(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white"
                    >
                      <option value="">Select Team</option>
                      {franchises.filter(f => f.id !== activeFranchise.id).map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Offer My Player</label>
                    <select
                      value={tradeOfferedPlayerId}
                      onChange={(e) => setTradeOfferedPlayerId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white"
                    >
                      <option value="">(None / Money Only)</option>
                      {players.filter(p => p.soldToFranchiseId === activeFranchise.id).map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({formatPKR(p.soldPrice || p.basePrice)})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Target Player</label>
                    <select
                      value={tradeRequestedPlayerId}
                      onChange={(e) => setTradeRequestedPlayerId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 bg-white"
                    >
                      <option value="">(None / Money Only)</option>
                      {players.filter(p => tradeTargetFranchiseId && p.soldToFranchiseId === tradeTargetFranchiseId).map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end gap-2">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow"
                    >
                      Submit Proposal
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: PLAYER LIST & WISHLIST WITH HEART ICONS           */}
      {/* ======================================================== */}
      {activeMainTab === "players" && (
        <div className={`rounded-3xl border p-6 shadow-sm space-y-4 transition-colors ${
          isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200"
        }`}>
          <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b ${
            isDark ? "border-slate-800" : "border-slate-100"
          }`}>
            <div>
              <h3 className={`text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>Official Player Pool &amp; Wishlist</h3>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Search and click the heart icon (♥) to bookmark players to your strategy wishlist.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowOnlyWishlist(!showOnlyWishlist)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                  showOnlyWishlist
                    ? "bg-amber-100 text-amber-900 border-amber-300"
                    : "bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${showOnlyWishlist ? "fill-amber-500 text-amber-500" : ""}`} />
                <span>My Wishlist ({myWatchlist.length})</span>
              </button>
            </div>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <input
              type="text"
              placeholder="Search player by name, category, role..."
              value={playerSearchQuery}
              onChange={(e) => setPlayerSearchQuery(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-emerald-500 flex-1 min-w-[200px]"
            />

            <select
              value={playerCategoryFilter}
              onChange={(e) => setPlayerCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-semibold focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Platinum">Platinum</option>
              <option value="Diamond">Diamond</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="Emerging">Emerging</option>
            </select>
          </div>

          {/* Players Table / List */}
          <div className="max-h-[500px] overflow-y-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/90 text-slate-600 font-bold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="p-3 w-10">♥</th>
                  <th className="p-3">Player</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Base Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action / Sale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPlayers.map((p) => {
                  const isWishlisted = activeFranchise && watchlists.some((w) => w.franchiseId === activeFranchise.id && w.playerId === p.id);
                  const buyerTeam = franchises.find((f) => f.id === p.soldToFranchiseId);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-center">
                        {activeFranchise ? (
                          <button
                            onClick={() => toggleWatchlist(activeFranchise.id, p.id)}
                            className="p-1 hover:scale-125 transition-transform"
                            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                          >
                            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-slate-300 hover:text-red-400"}`} />
                          </button>
                        ) : (
                          <span className="text-slate-300">♥</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.photoUrl}
                            alt={p.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait-lg-webp/prd/assets/players/generic/colored/69957.png";
                            }}
                            className="w-8 h-8 rounded-lg object-cover object-top border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{p.name}</p>
                            <p className="text-[10px] text-slate-400">{p.nationality} • Age: {p.age}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{p.primaryRole}</td>
                      <td className="p-3 font-mono font-bold text-emerald-700">{formatPKR(p.basePrice)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          p.status === "sold"
                            ? "bg-emerald-100 text-emerald-800"
                            : p.status === "unsold"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {p.status === "sold" && buyerTeam ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-bold text-slate-800">
                              {buyerTeam.name} ({formatPKR(p.soldPrice || p.basePrice)})
                            </span>
                            <a
                              href={getWhatsAppShareUrl(p.name, buyerTeam.name, p.soldPrice || p.basePrice, p.category, p.wasRtmUsed)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] inline-flex items-center gap-1 shadow-sm"
                              title="Share news on WhatsApp"
                            >
                              <Share2 className="w-3 h-3" /> WhatsApp
                            </a>
                          </div>
                        ) : role === "admin" ? (
                          <button
                            onClick={() => selectPlayerForAuction(p.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px]"
                          >
                            Bring to Block
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Upcoming</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: OFFICIAL AUCTION RULES                            */}
      {/* ======================================================== */}
      {activeMainTab === "rules" && (
        <div className={`rounded-3xl border p-6 sm:p-8 shadow-sm space-y-6 transition-colors ${
          isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200"
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b ${
            isDark ? "border-slate-800" : "border-slate-100"
          }`}>
            <div>
              <h3 className={`text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>HBL PSL 12 Official Mock Auction Rules</h3>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Official tournament guidelines, purse regulations, and bidding increments.</p>
            </div>
            {role === "admin" && (
              <Link href="/admin" className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs">
                Edit Rules in Admin →
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase text-[11px]">1. Total Purse &amp; Spend Requirements</h4>
              <p className="text-slate-600 leading-relaxed">
                Each franchise has an official purse of <strong>PKR 45 Crore (450,000,000)</strong>. Teams must spend a minimum qualifying purse of PKR 36.5 Crore.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase text-[11px]">2. Squad Composition &amp; Overseas Limits</h4>
              <p className="text-slate-600 leading-relaxed">
                Squad size: <strong>16 to 20 players</strong>. Minimum 5 and maximum 7 overseas players per squad. In the Playing XI, each team must feature 3 to 4 overseas players and minimum 1 uncapped Under-23 player.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase text-[11px]">3. Official PSL Bidding Increments Ladder</h4>
              <ul className="text-slate-600 space-y-1 list-disc list-inside">
                <li>Up to 1.50 Cr: Minimum increment of <strong>PKR 2.5 Lakh (+250,000)</strong></li>
                <li>1.50 Cr to 3.00 Cr: Minimum increment of <strong>PKR 5 Lakh (+500,000)</strong></li>
                <li>Above 3.00 Cr: Minimum increment of <strong>PKR 10 Lakh (+1,000,000)</strong></li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase text-[11px]">4. Right to Match (RTM) Card Rules</h4>
              <p className="text-slate-600 leading-relaxed">
                Each franchise receives <strong>2 RTM cards</strong>. When a player's previous team matches the highest bid, the winning team gets 1 chance to raise. The previous team then has <strong>30 seconds</strong> to exercise or decline RTM.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: DEDICATED LIVE CHAT & WAR ROOM                    */}
      {/* ======================================================== */}
      {activeMainTab === "chat" && (
        <div className={`rounded-3xl border p-6 shadow-sm space-y-4 transition-colors ${
          isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200"
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b ${
            isDark ? "border-slate-800" : "border-slate-100"
          }`}>
            <div>
              <h3 className={`text-base font-black flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <span>Live Interaction &amp; War Room</span>
              </h3>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Real-time messaging channels synchronized across all tabs and devices.</p>
            </div>

            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                onClick={() => setChatChannel("owners")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${chatChannel === "owners" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
              >
                🔒 Owners &amp; Admin
              </button>
              <button
                onClick={() => setChatChannel("spectators")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${chatChannel === "spectators" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
              >
                📢 Public Spectators
              </button>
            </div>
          </div>

          {/* Message Stream */}
          <div className="h-72 overflow-y-auto space-y-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            {messages.filter(m => m.channel === chatChannel).map((msg) => (
              <div key={msg.id} className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className={msg.senderRole === "admin" ? "text-amber-600" : msg.senderRole === "team_owner" ? "text-emerald-700" : "text-slate-600"}>
                      {msg.senderName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({msg.senderRole})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {role === "admin" && (
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="text-slate-400 hover:text-red-500 p-0.5 transition-colors"
                        title="Delete message (Admin Moderation)"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-slate-800 font-medium">{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Send Message Input */}
          <form onSubmit={handleSendChatMessage} className="flex gap-2 text-xs">
            <input
              type="text"
              placeholder={`Send message in ${chatChannel === "owners" ? "Owners & Admin Room" : "Public Stream"}...`}
              value={chatMessageInput}
              onChange={(e) => setChatMessageInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1.5 shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 7: SUMMARY, WHATSAPP SHARE & DOWNLOADS               */}
      {/* ======================================================== */}
      {activeMainTab === "summary" && (
        <div className={`rounded-3xl border p-6 shadow-sm space-y-6 transition-colors ${
          isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200"
        }`}>
          <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b ${
            isDark ? "border-slate-800" : "border-slate-100"
          }`}>
            <div>
              <h3 className={`text-base font-black ${isDark ? "text-white" : "text-slate-900"}`}>Complete Auction Summary &amp; Downloads</h3>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Live summary of sold and unsold players with 1-click WhatsApp news broadcast.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => exportAuctionToExcel(franchises, players, eventLogs, settings.name)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel Report
              </button>
              <button
                onClick={() => exportPlayersToCsv(players, franchises)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Players CSV
              </button>
              <button
                onClick={() => exportSquadsToCsv(franchises, players)}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Download className="w-3.5 h-3.5" /> Squads CSV
              </button>
            </div>
          </div>

          {/* Sold Players Table with WhatsApp Share */}
          <div>
            <h4 className="text-sm font-black text-slate-900 mb-2 flex items-center justify-between">
              <span>Sold Players ({soldPlayers.length})</span>
              <span className="text-xs text-slate-500 font-normal">Click WhatsApp to share instant updates</span>
            </h4>

            {soldPlayers.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-6 bg-slate-50 rounded-2xl border border-slate-200">
                No players sold yet. Once bidding completes, sold players will appear here.
              </p>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-3">Player</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Winning Team</th>
                      <th className="p-3">Sold Price</th>
                      <th className="p-3">RTM Used</th>
                      <th className="p-3 text-right">WhatsApp Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {soldPlayers.map((p) => {
                      const buyerTeam = franchises.find(f => f.id === p.soldToFranchiseId);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{p.name}</td>
                          <td className="p-3 text-slate-600">{p.category}</td>
                          <td className="p-3">
                            <span className="font-bold text-emerald-700">{buyerTeam?.name || "N/A"}</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-900">{formatPKR(p.soldPrice || p.basePrice)}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.wasRtmUsed ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
                              {p.wasRtmUsed ? "YES" : "NO"}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <a
                              href={getWhatsAppShareUrl(p.name, buyerTeam?.name || "PSL Franchise", p.soldPrice || p.basePrice, p.category, p.wasRtmUsed)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow"
                            >
                              <Share2 className="w-3.5 h-3.5" /> WhatsApp
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
