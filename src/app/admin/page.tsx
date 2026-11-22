"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuction } from "@/context/AuctionContext";
import { formatPKR } from "@/lib/rules";
import { INITIAL_PLAYERS } from "@/data/initialPlayers";
import { exportAuctionToExcel, exportPlayersToCsv, exportSquadsToCsv } from "@/lib/export";
import {
  Sliders,
  Play,
  Pause,
  RotateCcw,
  RefreshCw,
  Key,
  Copy,
  Check,
  Shield,
  Crown,
  Lock,
  Layers,
  Sparkles,
  Award,
  Clock,
  Save,
  CheckCircle,
  Shuffle,
  Users,
  Eye,
  CheckSquare,
  Square,
  TrendingDown,
  UserPlus,
  PlusCircle,
  FileSpreadsheet,
  Download,
  Share2,
  ExternalLink,
  MessageSquare,
  ArrowRight,
  Gavel,
  XCircle,
  SkipForward,
  SkipBack,
  AlertTriangle,
  Bot,
} from "lucide-react";

export default function AdminControlPanelPage() {
  const {
    role,
    loginAsAdmin,
    signupAdmin,
    adminUser,
    auctionStatus,
    settings,
    updateSettings,
    rulePreset,
    setRulePreset,
    startAuction,
    pauseAuction,
    resumeAuction,
    resetAuction,
    finalizePlayer,
    goToNextPlayer,
    goToPreviousPlayer,
    startRoundTwo,
    reEnterUnsoldPlayers,
    shuffleUpcomingPlayers,
    franchises,
    players,
    importPlayersList,
    addNewPlayerDuringAuction,
    tradeOffers,
    handleTradeAction,
    eventLogs,
    isCloudConnected,
    botBiddingEnabled,
    toggleBotBidding,
  } = useAuction();

  // Authentication State for Admin Login / Signup
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminName, setAdminName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Admin Dashboard Active Tab
  const [adminTab, setAdminTab] = useState<"setup" | "rules" | "lobby" | "live" | "trades" | "reports" | "bots">("setup");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings form state
  const [roomName, setRoomName] = useState(settings.name);
  const [roomCode, setRoomCode] = useState(settings.roomCode);
  const [totalPurse, setTotalPurse] = useState(settings.totalPursePerTeam);
  const [timerSeconds, setTimerSeconds] = useState(settings.defaultTimerSeconds);
  const [minSquad, setMinSquad] = useState(settings.minSquadSize);
  const [maxSquad, setMaxSquad] = useState(settings.maxSquadSize);
  const [minOverseas, setMinOverseas] = useState(settings.minOverseasPlayingXI || 3);
  const [maxOverseas, setMaxOverseas] = useState(settings.maxOverseasPlayingXI || 4);
  const [minU23Squad, setMinU23Squad] = useState(settings.minUncappedU23Squad ?? 2);
  const [playerOccurrence, setPlayerOccurrence] = useState<'sequential' | 'random'>(
    settings.playerOccurrenceOrder || 'sequential'
  );
  const [enableRTM, setEnableRTM] = useState(settings.enableRTM ?? true);
  const [rtmCards, setRtmCards] = useState(settings.rtmCardsPerFranchise ?? 2);
  const [allowRetentions, setAllowRetentions] = useState(settings.allowRetentions ?? true);
  const [allowTradesBefore, setAllowTradesBefore] = useState(settings.allowTradesBeforeAuction ?? true);
  const [allowTradesAfter, setAllowTradesAfter] = useState(settings.allowTradesAfterAuction ?? true);

  // New Player Manual Input Form
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerCategory, setNewPlayerCategory] = useState<"Platinum" | "Diamond" | "Gold" | "Silver" | "Emerging">("Gold");
  const [newPlayerRole, setNewPlayerRole] = useState<"Batter" | "Bowler" | "All-Rounder" | "Wicketkeeper">("All-Rounder");
  const [newPlayerBasePrice, setNewPlayerBasePrice] = useState(15000000);
  const [newPlayerNationality, setNewPlayerNationality] = useState("Pakistan");
  const [newPlayerAge, setNewPlayerAge] = useState(25);
  const [playerAddSuccess, setPlayerAddSuccess] = useState<string | null>(null);

  // Re-entering Unsold Players State
  const [reAuctionDiscount, setReAuctionDiscount] = useState<number>(0);
  const [reAuctionSuccess, setReAuctionSuccess] = useState<string | null>(null);

  const unsoldPlayers = players.filter((p) => p.status === "unsold");
  const upcomingPlayers = players.filter((p) => p.status === "upcoming");
  const soldPlayers = players.filter((p) => p.status === "sold");

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (authTab === "login") {
      const res = loginAsAdmin(adminPassword);
      if (!res.success) setAuthError(res.message);
    } else {
      const res = signupAdmin(adminEmail, adminPassword, adminName);
      if (!res.success) setAuthError(res.message);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      name: roomName,
      roomCode: roomCode,
      totalPursePerTeam: Number(totalPurse),
      defaultTimerSeconds: Number(timerSeconds),
      minSquadSize: Number(minSquad),
      maxSquadSize: Number(maxSquad),
      minOverseasPlayingXI: Number(minOverseas),
      maxOverseasPlayingXI: Number(maxOverseas),
      minUncappedU23Squad: Number(minU23Squad),
      playerOccurrenceOrder: playerOccurrence,
      enableRTM,
      rtmCardsPerFranchise: Number(rtmCards),
      allowRetentions,
      allowTradesBeforeAuction: allowTradesBefore,
      allowTradesAfterAuction: allowTradesAfter,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLoadOfficialPslPool = () => {
    importPlayersList(INITIAL_PLAYERS);
    setPlayerAddSuccess(`Successfully loaded ${INITIAL_PLAYERS.length} official verified PSL players with authentic stats!`);
    setTimeout(() => setPlayerAddSuccess(null), 4000);
  };

  const handleAddNewPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    addNewPlayerDuringAuction({
      name: newPlayerName.trim(),
      category: newPlayerCategory,
      primaryRole: newPlayerRole,
      basePrice: Number(newPlayerBasePrice),
      nationality: newPlayerNationality,
      isOverseas: newPlayerNationality.toLowerCase() !== "pakistan",
      age: Number(newPlayerAge),
    });

    setPlayerAddSuccess(`Player ${newPlayerName} successfully added to the auction pool!`);
    setNewPlayerName("");
    setTimeout(() => setPlayerAddSuccess(null), 4000);
  };

  // If not authenticated as Admin, show clean light Login / Signup card
  if (role !== "admin") {
    return (
      <div className="max-w-md mx-auto py-12 px-4 animate-fadeIn">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-emerald-100 border border-emerald-300 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-700 shadow-sm">
              <Crown className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Control Room</h1>
            <p className="text-xs text-slate-500 mt-1">
              Sign in or create an administrator account to configure rules and run the auction.
            </p>
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1 mb-5 text-xs font-bold">
            <button
              onClick={() => { setAuthTab("login"); setAuthError(null); }}
              className={`flex-1 py-2 rounded-lg transition-colors ${authTab === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
            >
              Admin Sign In
            </button>
            <button
              onClick={() => { setAuthTab("signup"); setAuthError(null); }}
              className={`flex-1 py-2 rounded-lg transition-colors ${authTab === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
            >
              Create Account
            </button>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {authError}
            </div>
          )}

          <form onSubmit={handleAdminAuth} className="space-y-4">
            {authTab === "signup" && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PCB Commissioner"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {authTab === "signup" && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Admin Email</label>
                <input
                  type="email"
                  required
                  placeholder="admin@psl-mock.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {authTab === "login" ? "Admin Master Password" : "Create Password"}
              </label>
              <input
                type="password"
                required
                placeholder={authTab === "login" ? "Enter admin password (e.g. admin123)" : "Choose a secure password"}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
              />
              {authTab === "login" && (
                <p className="text-[11px] text-slate-400 mt-1">Default master key: <code className="font-mono font-bold text-emerald-600">admin123</code></p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-colors shadow-lg shadow-emerald-600/20 mt-2"
            >
              {authTab === "login" ? "Unlock Admin Room" : "Register Admin Account"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Admin Top Dashboard Banner */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-amber-100 border border-amber-300 rounded-2xl flex items-center justify-center text-amber-700 font-black text-xl shadow-sm">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Super Admin Command Center</h1>
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                auctionStatus === "Live"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse"
                  : "bg-amber-100 text-amber-800 border-amber-300"
              }`}>
                ● {auctionStatus.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Logged in as: <strong className="text-slate-800">{adminUser?.name || "Super Admin"}</strong> • Room Code: <strong className="text-emerald-700 font-mono font-bold">{settings.roomCode}</strong>
            </p>
          </div>
        </div>

        {/* Quick Launch & Arena Link */}
        <div className="flex items-center gap-2">
          {auctionStatus !== "Live" ? (
            <button
              onClick={startAuction}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Live Auction</span>
            </button>
          ) : (
            <button
              onClick={pauseAuction}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow transition-colors"
            >
              <Pause className="w-4 h-4" />
              <span>Pause Auction</span>
            </button>
          )}

          <Link
            href="/auction"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow"
          >
            <Gavel className="w-4 h-4" />
            <span>Open Arena</span>
          </Link>
        </div>
      </div>

      {/* Admin Horizontal Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto text-xs font-bold no-scrollbar">
        <button
          onClick={() => setAdminTab("setup")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
            adminTab === "setup"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. Player Pool ({players.length})</span>
        </button>

        <button
          onClick={() => setAdminTab("rules")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
            adminTab === "rules"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>2. Auction Rules</span>
        </button>

        <button
          onClick={() => setAdminTab("lobby")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
            adminTab === "lobby"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>3. Owner Links &amp; Lobby</span>
        </button>

        <button
          onClick={() => setAdminTab("live")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
            adminTab === "live"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Gavel className="w-4 h-4" />
          <span>4. Live Overrides</span>
        </button>

        <button
          onClick={() => setAdminTab("trades")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
            adminTab === "trades"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>5. Trade Desk ({tradeOffers.filter(t => t.status === 'accepted').length})</span>
        </button>

        <button
          onClick={() => setAdminTab("reports")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
            adminTab === "reports"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Download className="w-4 h-4" />
          <span>6. Reports &amp; Downloads</span>
        </button>

        <button
          onClick={() => setAdminTab("bots")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
            adminTab === "bots"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-purple-700 hover:text-purple-900 hover:bg-purple-50"
          }`}
        >
          <Bot className="w-4 h-4 text-purple-600" />
          <span>7. Developer Bot Simulator ({botBiddingEnabled ? "ON" : "OFF"})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: PLAYER POOL SETUP & DYNAMIC PLAYER ADDITION       */}
      {/* ======================================================== */}
      {adminTab === "setup" && (
        <div className="space-y-6">
          {/* Quick 1-Click Load Official Pool Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-2 border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">Official PSL 11 / PSL 12 Players Pool</h3>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                Load 58 verified players complete with authentic PSL/T20 stats, kit photos, and Cricinfo profiles with a single click.
              </p>
            </div>
            <button
              onClick={handleLoadOfficialPslPool}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow transition-colors shrink-0"
            >
              ⚡ Load Official Pool ({INITIAL_PLAYERS.length} Players)
            </button>
          </div>

          {playerAddSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{playerAddSuccess}</span>
            </div>
          )}

          {/* Add Player (Works Pre-Auction and DURING Live Auction) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              <span>Add Player to Pool (Can Add Anytime During Live Auction)</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add individual new players directly into the live upcoming auction queue.
            </p>

            <form onSubmit={handleAddNewPlayer} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Player Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sahibzada Farhan"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={newPlayerCategory}
                  onChange={(e) => setNewPlayerCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-semibold focus:outline-none"
                >
                  <option value="Platinum">Platinum (PKR 4.2 Cr)</option>
                  <option value="Diamond">Diamond (PKR 2.2 Cr)</option>
                  <option value="Gold">Gold (PKR 1.5 Cr)</option>
                  <option value="Silver">Silver (PKR 70 L)</option>
                  <option value="Emerging">Emerging (PKR 35 L)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Primary Role</label>
                <select
                  value={newPlayerRole}
                  onChange={(e) => setNewPlayerRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-semibold focus:outline-none"
                >
                  <option value="Batter">Batter</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-Rounder">All-Rounder</option>
                  <option value="Wicketkeeper">Wicketkeeper</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Base Price (PKR)</label>
                <input
                  type="number"
                  required
                  value={newPlayerBasePrice}
                  onChange={(e) => setNewPlayerBasePrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nationality</label>
                <input
                  type="text"
                  required
                  value={newPlayerNationality}
                  onChange={(e) => setNewPlayerNationality(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-semibold focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3 lg:col-span-6 flex justify-end mt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider transition-colors shadow"
                >
                  + Add Player to Live Queue
                </button>
              </div>
            </form>
          </div>

          {/* Player Breakdown Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Pool</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{players.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Upcoming</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">{upcomingPlayers.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Sold</span>
              <p className="text-2xl font-black text-amber-600 mt-1">{soldPlayers.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Unsold</span>
              <p className="text-2xl font-black text-red-600 mt-1">{unsoldPlayers.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: AUCTION RULES CONFIGURATION                       */}
      {/* ======================================================== */}
      {adminTab === "rules" && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">Configure Auction Rules &amp; Framework</h3>
              <p className="text-xs text-slate-500">All modifications immediately synchronize to all franchise owners and spectators.</p>
            </div>
            {saveSuccess && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 animate-fadeIn">
                <Check className="w-3.5 h-3.5" /> Rules Synchronized!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            {/* Room Name */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Auction Room Name</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Room Passcode */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Room Code</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-emerald-700 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Total Purse */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Purse Per Team (PKR)</label>
              <input
                type="number"
                value={totalPurse}
                onChange={(e) => setTotalPurse(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Standard: 450,000,000 (45 Crore)</span>
            </div>

            {/* Timer Seconds */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Countdown Timer Per Bid (Seconds)</label>
              <input
                type="number"
                value={timerSeconds}
                onChange={(e) => setTimerSeconds(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Min / Max Squad */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Squad Size Range (Min - Max)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minSquad}
                  onChange={(e) => setMinSquad(Number(e.target.value))}
                  className="w-1/2 px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxSquad}
                  onChange={(e) => setMaxSquad(Number(e.target.value))}
                  className="w-1/2 px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900"
                />
              </div>
            </div>

            {/* Occurrence Order */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Player Occurrence Order</label>
              <select
                value={playerOccurrence}
                onChange={(e) => setPlayerOccurrence(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900"
              >
                <option value="sequential">Sequential List Order</option>
                <option value="random">Random Draw from Pot</option>
              </select>
            </div>

            {/* RTM Toggles */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <label className="font-bold text-slate-800 flex items-center justify-between">
                <span>Enable Right To Match (RTM)</span>
                <input
                  type="checkbox"
                  checked={enableRTM}
                  onChange={(e) => setEnableRTM(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </label>
              <div className="flex items-center justify-between text-slate-600 pt-1">
                <span>RTM Cards Per Team:</span>
                <input
                  type="number"
                  value={rtmCards}
                  onChange={(e) => setRtmCards(Number(e.target.value))}
                  className="w-16 px-2 py-1 rounded-lg border border-slate-300 text-center font-bold"
                />
              </div>
            </div>

            {/* Retentions & Trades Toggles */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <label className="font-bold text-slate-800 flex items-center justify-between">
                <span>Allow Pre-Auction Retentions</span>
                <input
                  type="checkbox"
                  checked={allowRetentions}
                  onChange={(e) => setAllowRetentions(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </label>
              <label className="font-bold text-slate-800 flex items-center justify-between pt-1">
                <span>Enable Trade Desk</span>
                <input
                  type="checkbox"
                  checked={allowTradesBefore}
                  onChange={(e) => setAllowTradesBefore(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-colors shadow-lg shadow-emerald-600/20"
            >
              Save &amp; Broadcast Rules
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SHAREABLE OWNER LINKS & REAL-TIME LOBBY           */}
      {/* ======================================================== */}
      {adminTab === "lobby" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-black text-slate-900 mb-1">Franchise Owner &amp; Viewer Invite Links</h3>
            <p className="text-xs text-slate-500 mb-4">
              Share these links so owners can claim their teams and spectators can watch live.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <span className="font-black text-emerald-900 block uppercase tracking-wider text-[11px]">
                  🏏 Franchise Owners Join Link
                </span>
                <p className="text-slate-600 text-[11px]">
                  Franchise owners can click to claim their team (first-come first-serve) and enter their name.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== "undefined" ? `${window.location.origin}/join` : "/join"}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-emerald-300 font-mono text-[11px] text-slate-800"
                  />
                  <button
                    onClick={() => copyToClipboard(typeof window !== "undefined" ? `${window.location.origin}/join` : "/join", "owner-link")}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1 shrink-0"
                  >
                    {copiedKey === "owner-link" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "owner-link" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-black text-slate-900 block uppercase tracking-wider text-[11px]">
                  👁️ Public Spectator Stream Link
                </span>
                <p className="text-slate-600 text-[11px]">
                  Fans and media can watch the live auction stream in read-only mode without bidding permissions.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== "undefined" ? `${window.location.origin}/auction?role=spectator` : "/auction?role=spectator"}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 font-mono text-[11px] text-slate-800"
                  />
                  <button
                    onClick={() => copyToClipboard(typeof window !== "undefined" ? `${window.location.origin}/auction?role=spectator` : "/auction?role=spectator", "spec-link")}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center gap-1 shrink-0"
                  >
                    {copiedKey === "spec-link" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "spec-link" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Franchise Owners Lobby Grid */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Franchise Ownership Lobby (8 Teams)</h3>
                <p className="text-xs text-slate-500">Live overview of claimed and unassigned franchise seats.</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {franchises.filter(f => f.isClaimed).length} of 8 Teams Ready
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {franchises.map((f) => (
                <div
                  key={f.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                    f.isClaimed
                      ? "bg-emerald-50/60 border-emerald-300 text-slate-900"
                      : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: f.primaryColor }}
                    />
                    <div className="truncate">
                      <p className="font-black text-slate-900 truncate">{f.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {f.isClaimed ? `Owner: ${f.ownerName}` : "Unassigned seat"}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                    f.isClaimed ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    {f.isClaimed ? "READY" : "WAITING"}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Once ready, click Start Auction to begin synchronized live bidding across all owner devices.
              </span>
              <button
                onClick={startAuction}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-colors shadow"
              >
                🚀 Start Live Auction Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: LIVE AUCTION CONTROLS & OVERRIDES                 */}
      {/* ======================================================== */}
      {adminTab === "live" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900">Admin Live Auction Controls</h3>
            <p className="text-xs text-slate-500">Manual override actions to sell, mark unsold, pause, or skip players.</p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => finalizePlayer(true)}
                disabled={auctionStatus !== "Live"}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow disabled:opacity-40"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Hammer Down (Sell Player)</span>
              </button>

              <button
                onClick={() => finalizePlayer(false)}
                disabled={auctionStatus !== "Live"}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow disabled:opacity-40"
              >
                <XCircle className="w-4 h-4" />
                <span>Mark Unsold</span>
              </button>

              <button
                onClick={goToNextPlayer}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase flex items-center gap-1.5 transition-colors"
              >
                <span>Next Player</span>
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={goToPreviousPlayer}
                className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                title="Previous player"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={shuffleUpcomingPlayers}
                className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Shuffle className="w-4 h-4" />
                <span>Shuffle Upcoming Draw</span>
              </button>
            </div>
          </div>

          {/* Re-Auction Unsold Players */}
          {unsoldPlayers.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">Re-Auction Unsold Players ({unsoldPlayers.length})</h3>
                  <p className="text-xs text-slate-500">Put unsold players back onto the auction block with an optional discount.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-bold">Discount:</span>
                  <select
                    value={reAuctionDiscount}
                    onChange={(e) => setReAuctionDiscount(Number(e.target.value))}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                  >
                    <option value={0}>0% (Same Base Price)</option>
                    <option value={10}>10% Discount</option>
                    <option value={20}>20% Discount</option>
                    <option value={25}>25% Discount</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  reEnterUnsoldPlayers([], reAuctionDiscount);
                  setReAuctionSuccess(`Re-entered ${unsoldPlayers.length} unsold players into Round 2 with ${reAuctionDiscount}% discount!`);
                  setTimeout(() => setReAuctionSuccess(null), 4000);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors shadow"
              >
                🔄 Re-Enter All {unsoldPlayers.length} Unsold Players into Auction
              </button>

              {reAuctionSuccess && (
                <p className="text-xs text-emerald-700 font-bold">{reAuctionSuccess}</p>
              )}
            </div>
          )}

          {/* Emergency Reset Auction Button */}
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-red-900 uppercase">Emergency Reset Auction</h4>
              <p className="text-[11px] text-red-700">Wipes all sales, resets all purses to starting 45 Cr, and returns to Player 1.</p>
            </div>
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to completely RESET the auction? All sales and purses will be reset to 0!")) {
                  resetAuction();
                }
              }}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase transition-colors shadow"
            >
              Reset Auction
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: TRADE DESK APPROVALS                              */}
      {/* ======================================================== */}
      {adminTab === "trades" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900">Franchise Trade Desk Approvals</h3>
          <p className="text-xs text-slate-500">Review, approve, or reject player trades submitted between franchises.</p>

          {tradeOffers.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-8">No trade proposals have been submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {tradeOffers.map((trade) => {
                const fromTeam = franchises.find(f => f.id === trade.fromFranchiseId);
                const toTeam = franchises.find(f => f.id === trade.toFranchiseId);
                const offeredPlayer = players.find(p => p.id === trade.offeredPlayerId);
                const requestedPlayer = players.find(p => p.id === trade.requestedPlayerId);

                return (
                  <div key={trade.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <strong className="text-slate-900">{fromTeam?.name}</strong>
                        <span className="text-slate-400">⇄</span>
                        <strong className="text-slate-900">{toTeam?.name}</strong>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          trade.status === 'approved_by_admin' ? 'bg-emerald-100 text-emerald-800' :
                          trade.status === 'accepted' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {trade.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Offered: {offeredPlayer ? offeredPlayer.name : "Cash only"} {trade.offeredCash ? `+ ${formatPKR(trade.offeredCash)}` : ""}
                        {" | "}
                        Requested: {requestedPlayer ? requestedPlayer.name : "Cash only"} {trade.requestedCash ? `+ ${formatPKR(trade.requestedCash)}` : ""}
                      </p>
                    </div>

                    {trade.status === 'accepted' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTradeAction(trade.id, 'admin_approve')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                        >
                          Approve Trade
                        </button>
                        <button
                          onClick={() => handleTradeAction(trade.id, 'reject')}
                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: REPORTS & DOWNLOADS                               */}
      {/* ======================================================== */}
      {adminTab === "reports" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h3 className="text-base font-black text-slate-900">Auction Reports &amp; Downloads</h3>
          <p className="text-xs text-slate-500">Download formatted Excel spreadsheets and CSV rosters.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 text-xs">
              <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
              <h4 className="font-bold text-slate-900">Complete Master Excel Workbook</h4>
              <p className="text-slate-600 text-[11px]">Includes Franchise Summary, All Players with Prices, Team Squads, and Event Audit logs.</p>
              <button
                onClick={() => exportAuctionToExcel(franchises, players, eventLogs, settings.name)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow"
              >
                📥 Download Excel Workbook
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <Download className="w-8 h-8 text-slate-700" />
              <h4 className="font-bold text-slate-900">Player List CSV (Per Team)</h4>
              <p className="text-slate-600 text-[11px]">Download all players with base prices, sold prices, status, and buying franchise.</p>
              <button
                onClick={() => exportPlayersToCsv(players, franchises)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors"
              >
                📥 Download Players CSV
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 text-xs">
              <Download className="w-8 h-8 text-amber-700" />
              <h4 className="font-bold text-slate-900">Team Squads Rosters CSV</h4>
              <p className="text-slate-600 text-[11px]">Download each franchise's squad roster with player names, categories, roles, and prices paid.</p>
              <button
                onClick={() => exportSquadsToCsv(franchises, players)}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-colors shadow"
              >
                📥 Download Squads CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 7: DEVELOPER-ONLY BOT SIMULATOR                      */}
      {/* ======================================================== */}
      {adminTab === "bots" && (
        <div className="bg-white rounded-3xl border border-purple-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-purple-100">
            <div>
              <div className="flex items-center gap-2">
                <Bot className="w-6 h-6 text-purple-600" />
                <h3 className="text-base font-black text-slate-900">Developer Testing Mode: AI Bot Simulator</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                The AI bots are isolated to this developer console for testing real-time bidding, timers, and Right to Match (RTM) workflows. They are strictly hidden from normal franchise owners and live spectators.
              </p>
            </div>

            <button
              onClick={toggleBotBidding}
              className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all ${
                botBiddingEnabled
                  ? "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30"
                  : "bg-slate-200 hover:bg-slate-300 text-slate-800"
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Simulation Status: {botBiddingEnabled ? "ACTIVE (ON)" : "INACTIVE (OFF)"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
              <h4 className="font-black text-purple-900 uppercase text-[11px]">Developer Mode Guidelines</h4>
              <ul className="text-slate-600 space-y-1.5 list-disc list-inside">
                <li>Bots simulate rival bids for other 7 franchises within authentic purse and overseas constraints.</li>
                <li>When a human owner (e.g. Islamabad United) bids, bots respond with a 3.5s delay up to realistic player valuations.</li>
                <li>Bots will automatically decline or exercise RTM based on purse health and remaining RTM cards.</li>
                <li>Normal users see only live human franchises; bot badges are completely removed from the public UI.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-black text-slate-900 uppercase text-[11px]">Rival Franchises in Test Suite</h4>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                {franchises.map((f) => (
                  <div key={f.id} className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: f.primaryColor }} />
                      <span className="font-bold text-slate-800 truncate">{f.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold shrink-0">{formatPKR(f.remainingPurse)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
