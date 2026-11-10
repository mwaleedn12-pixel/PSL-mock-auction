"use client";

import React, { useState } from "react";
import { useAuction } from "@/context/AuctionContext";
import { formatPKR } from "@/lib/rules";
import { AuctionStatus } from "@/types/auction";
import {
  Sliders,
  Play,
  Pause,
  RotateCcw,
  RefreshCw,
  DollarSign,
  Clock,
  Users,
  Shield,
  Award,
  AlertTriangle,
  CheckCircle,
  Save,
} from "lucide-react";

export default function AdminControlPanelPage() {
  const {
    auctionStatus,
    settings,
    updateSettings,
    startAuction,
    pauseAuction,
    resumeAuction,
    resetAuction,
    startRoundTwo,
    franchises,
    players,
    retainPlayer,
    directSignPlayer,
  } = useAuction();

  // Local settings form state
  const [timerSeconds, setTimerSeconds] = useState(settings.defaultTimerSeconds);
  const [minSquad, setMinSquad] = useState(settings.minSquadSize);
  const [maxSquad, setMaxSquad] = useState(settings.maxSquadSize);
  const [maxOverseas, setMaxOverseas] = useState(settings.maxOverseas);
  const [autoSellOnAllOut, setAutoSellOnAllOut] = useState(settings.autoSellOnAllOut);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Pre-Auction Retention / Direct Signing State
  const [assignType, setAssignType] = useState<"retention" | "direct">("retention");
  const [selectedFranchise, setSelectedFranchise] = useState(franchises[0]?.id || "lq");
  const [selectedPlayer, setSelectedPlayer] = useState(players[0]?.id || "");
  const [assignPrice, setAssignPrice] = useState(35000000);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  const unsoldPlayers = players.filter((p) => p.status === "unsold");
  const upcomingPlayers = players.filter((p) => p.status === "upcoming");

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      defaultTimerSeconds: Number(timerSeconds),
      timerResetSeconds: Number(timerSeconds),
      minSquadSize: Number(minSquad),
      maxSquadSize: Number(maxSquad),
      maxOverseas: Number(maxOverseas),
      autoSellOnAllOut,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAssignPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer || !selectedFranchise) return;

    if (assignType === "retention") {
      retainPlayer(selectedFranchise, selectedPlayer, Number(assignPrice));
      setAssignSuccess("Player retained successfully! Budget deducted.");
    } else {
      directSignPlayer(selectedFranchise, selectedPlayer, Number(assignPrice));
      setAssignSuccess("Player directly signed successfully! Budget deducted.");
    }
    setTimeout(() => setAssignSuccess(null), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-7 h-7 text-emerald-400" /> Super Administrator Control Panel
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            FR-02, FR-04, FR-14, FR-15: Manage auction status, financial & timer rules, pre-auction retentions, and unsold player rounds.
          </p>
        </div>

        {/* Global Live Auction Actions */}
        <div className="flex items-center gap-2">
          {auctionStatus === "Live" ? (
            <button
              onClick={pauseAuction}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors"
            >
              <Pause className="w-4 h-4" /> Pause Live Auction
            </button>
          ) : (
            <button
              onClick={auctionStatus === "Paused" ? resumeAuction : startAuction}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/20"
            >
              <Play className="w-4 h-4 fill-slate-950" /> {auctionStatus === "Paused" ? "Resume Auction" : "Start Live Auction"}
            </button>
          )}
        </div>
      </div>

      {/* Auction Room Status Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Auction Room</span>
          <h3 className="text-xl font-black text-white mt-0.5">{settings.name}</h3>
          <p className="text-xs text-slate-400 mt-1">
            Season: <strong className="text-emerald-400">{settings.season}</strong> • Currency: <strong>PKR</strong> • Status:{" "}
            <span className="font-bold text-amber-400 uppercase">{auctionStatus}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unsoldPlayers.length > 0 && (
            <button
              onClick={startRoundTwo}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Trigger Round 2 for Unsold ({unsoldPlayers.length})
            </button>
          )}

          <button
            onClick={() => {
              if (confirm("Are you sure you want to completely reset all auction progress? This will reset all squads, bids, and purses.")) {
                resetAuction();
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-bold transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Reset Auction Room
          </button>
        </div>
      </div>

      {/* Grid: Rules Configuration (Left) + Pre-Auction Retentions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rules & Parameters Form */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" /> Auction Rules & Timers (FR-04)
            </h3>
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">
                Bidding Countdown Duration (Seconds)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={timerSeconds}
                onChange={(e) => setTimerSeconds(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Timer resets to this value on new bids, with +5s extension on last 5 seconds bids.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Min Squad Size</label>
                <input
                  type="number"
                  min="11"
                  max="25"
                  value={minSquad}
                  onChange={(e) => setMinSquad(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Max Squad Size</label>
                <input
                  type="number"
                  min="15"
                  max="30"
                  value={maxSquad}
                  onChange={(e) => setMaxSquad(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Max Overseas Players Limit</label>
              <input
                type="number"
                min="2"
                max="10"
                value={maxOverseas}
                onChange={(e) => setMaxOverseas(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                id="autoSell"
                checked={autoSellOnAllOut}
                onChange={(e) => setAutoSellOnAllOut(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
              <label htmlFor="autoSell" className="text-slate-300 font-bold cursor-pointer">
                Auto-Sell Immediately When All Non-Leading Franchises Withdraw (OUT)
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow"
            >
              <Save className="w-4 h-4" /> Save Configuration
            </button>
          </form>
        </div>

        {/* Pre-Auction Retentions & Direct Signings (FR-15) */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" /> Pre-Auction Signings & Retentions (FR-15)
            </h3>
            {assignSuccess && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Done!
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400">
            Assign star players to franchises before live bidding begins. Costs are automatically deducted from the franchise&apos;s initial purse.
          </p>

          <form onSubmit={handleAssignPlayer} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Acquisition Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAssignType("retention")}
                  className={`py-2 rounded-xl font-bold border transition-colors ${
                    assignType === "retention"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  Player Retention
                </button>
                <button
                  type="button"
                  onClick={() => setAssignType("direct")}
                  className={`py-2 rounded-xl font-bold border transition-colors ${
                    assignType === "direct"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  Direct Signing
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Target Franchise</label>
              <select
                value={selectedFranchise}
                onChange={(e) => setSelectedFranchise(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                {franchises.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} (Purse: {formatPKR(f.remainingPurse)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Select Player</label>
              <select
                value={selectedPlayer}
                onChange={(e) => {
                  setSelectedPlayer(e.target.value);
                  const p = players.find((pl) => pl.id === e.target.value);
                  if (p) setAssignPrice(p.basePrice);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                {upcomingPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category} - {p.primaryRole})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Contract Value (PKR)</label>
              <input
                type="number"
                step="500000"
                value={assignPrice}
                onChange={(e) => setAssignPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow"
            >
              Assign & Deduct Budget
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
