"use client";

import React, { useState } from "react";
import { useAuction } from "@/context/AuctionContext";
import { formatPKR } from "@/lib/rules";
import { RulePreset } from "@/types/auction";
import { AuthModal } from "@/components/AuthModal";
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
} from "lucide-react";

export default function AdminControlPanelPage() {
  const {
    role,
    auctionStatus,
    settings,
    updateSettings,
    rulePreset,
    setRulePreset,
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

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Settings form state
  const [roomName, setRoomName] = useState(settings.name);
  const [roomCode, setRoomCode] = useState(settings.roomCode);
  const [timerSeconds, setTimerSeconds] = useState(settings.defaultTimerSeconds);
  const [minSquad, setMinSquad] = useState(settings.minSquadSize);
  const [maxSquad, setMaxSquad] = useState(settings.maxSquadSize);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Pre-Auction Retention State
  const [assignType, setAssignType] = useState<"retention" | "direct">("retention");
  const [selectedFranchise, setSelectedFranchise] = useState(franchises[0]?.id || "iu");
  const [selectedPlayer, setSelectedPlayer] = useState(players[0]?.id || "");
  const [assignPrice, setAssignPrice] = useState(42000000);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  const unsoldPlayers = players.filter((p) => p.status === "unsold");
  const upcomingPlayers = players.filter((p) => p.status === "upcoming");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      name: roomName,
      roomCode: roomCode,
      defaultTimerSeconds: Number(timerSeconds),
      timerResetSeconds: 15,
      minSquadSize: Number(minSquad),
      maxSquadSize: Number(maxSquad),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAssignPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer || !selectedFranchise) return;

    if (assignType === "retention") {
      retainPlayer(selectedFranchise, selectedPlayer, Number(assignPrice));
      setAssignSuccess("Player retained! Budget deducted from team purse.");
    } else {
      directSignPlayer(selectedFranchise, selectedPlayer, Number(assignPrice));
      setAssignSuccess("Player directly signed! Budget deducted from team purse.");
    }
    setTimeout(() => setAssignSuccess(null), 3000);
  };

  // If not logged in as Admin, show lock gate
  if (role !== "admin") {
    return (
      <div className="max-w-md mx-auto my-16 bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
        <Lock className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h2 className="text-xl font-black text-white">Super Admin Access Required</h2>
        <p className="text-xs text-slate-400 mt-2">
          Only the Super Administrator can configure auction room settings, generate private team passkeys, and manage tournament rules.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="mt-6 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/25"
        >
          Login as Super Admin
        </button>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              Super Administrator Control Room
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Auction Management & Franchise Keys
          </h1>
        </div>

        {/* Live Auction Controller Buttons */}
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

          <button
            onClick={() => {
              if (confirm("Reset the entire auction room, squads, and purses to initial state?")) {
                resetAuction();
              }
            }}
            className="p-2.5 rounded-xl bg-red-950/40 hover:bg-red-950/60 border border-red-500/40 text-red-300 transition-colors"
            title="Reset Auction"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Official Rule Presets Selector (Section 15: Preset A vs Preset B) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" /> Official Rules Preset Selector (Section 15)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Switch between published PSL 11 Auction Rules and the announced PSL 12 Framework.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
            Active: {rulePreset === "PSL11" ? "PSL 11 Rules" : "PSL 12 Framework"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Preset A: PSL 11 */}
          <div
            onClick={() => setRulePreset("PSL11")}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              rulePreset === "PSL11"
                ? "bg-emerald-950/40 border-emerald-500/70 shadow-lg shadow-emerald-500/10"
                : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-black text-sm text-white">PRESET A: PSL 11 Official Rules</h4>
              {rulePreset === "PSL11" && <Check className="w-4 h-4 text-emerald-400" />}
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 mt-3">
              <li>• Standard Purse: <strong>PKR 45 Crore</strong> (expandable to 50.5 Cr)</li>
              <li>• 4 Base Price Brackets: <strong>4.2 Cr, 2.2 Cr, 1.1 Cr, 60 Lakh</strong></li>
              <li>• Increments: <strong>2.5L, 5L, 10L, 15L</strong></li>
              <li>• Squad size: <strong>16 to 20</strong> (Overseas: 5 to 7 by squad size)</li>
              <li>• Playing XI: <strong>3 to 4 Overseas</strong> (min 7 locals)</li>
              <li>• Under-23: <strong>Min 2 in squad, at least 1 in Playing XI</strong></li>
              <li>• Retentions: <strong>Max 4 players</strong> • Direct Foreign Signings: <strong>1</strong></li>
            </ul>
          </div>

          {/* Preset B: PSL 12 */}
          <div
            onClick={() => setRulePreset("PSL12")}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              rulePreset === "PSL12"
                ? "bg-amber-950/40 border-amber-500/70 shadow-lg shadow-amber-500/10"
                : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-black text-sm text-white">PRESET B: PSL 12 Announced Framework</h4>
              {rulePreset === "PSL12" && <Check className="w-4 h-4 text-amber-400" />}
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 mt-3">
              <li>• Announced Date: <strong>30 October 2026</strong> (Auction: 23 Jan 2027)</li>
              <li>• Salary Cap: <strong>PKR 45 Crore</strong> (rising to 50.5 Cr qualifying)</li>
              <li>• Minimum Spend: <strong>PKR 36.5 Crore</strong></li>
              <li>• 1 Direct Marquee Signing (must not have featured in PSL 10 or 11)</li>
              <li>• Retentions deadline: <strong>13 January 2027</strong></li>
              <li>• 8 Franchises unanimous framework adoption</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Private Team Owner Passkeys Matrix (Section: send private ID to team owner) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" /> Private Franchise Invite Passkeys
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Send each private passkey to the respective franchise owner. Once entered, they can only access and bid for their own team.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            Room Code: <strong className="text-white">{settings.roomCode}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {franchises.map((f) => (
            <div
              key={f.id}
              className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: f.primaryColor }} />
                  <span className="font-black text-xs text-white">{f.name}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Purse: {formatPKR(f.remainingPurse)}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <code className="text-xs font-mono font-black text-amber-400 tracking-wider">
                  {f.privatePasskey}
                </code>
                <button
                  onClick={() => copyToClipboard(f.privatePasskey)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
                  title="Copy Passkey"
                >
                  {copiedKey === f.privatePasskey ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Auction Configuration Form & Pre-Auction Retentions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Room & Timer Settings */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" /> Auction Room Configuration
            </h3>
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Auction Room Name</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Room ID / Code (Sent to Owners)</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Opening Timer (s)</label>
                <input
                  type="number"
                  value={timerSeconds}
                  onChange={(e) => setTimerSeconds(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Min Squad</label>
                <input
                  type="number"
                  value={minSquad}
                  onChange={(e) => setMinSquad(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Max Squad</label>
                <input
                  type="number"
                  value={maxSquad}
                  onChange={(e) => setMaxSquad(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow"
            >
              <Save className="w-4 h-4" /> Save Configuration
            </button>
          </form>
        </div>

        {/* Pre-Auction Retentions (Section 8: max 4 retentions, 1 direct foreign signing) */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" /> Pre-Auction Signings & Retentions (Section 8)
            </h3>
            {assignSuccess && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Done!
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400">
            A franchise can retain up to 4 players or make 1 direct foreign signing. Costs are deducted directly from their initial 45 Cr purse.
          </p>

          <form onSubmit={handleAssignPlayer} className="space-y-3.5 text-xs">
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
                Player Retention (Max 4)
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
                Direct Foreign Signing (Max 1)
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Franchise</label>
                <select
                  value={selectedFranchise}
                  onChange={(e) => setSelectedFranchise(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  {franchises.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({formatPKR(f.remainingPurse)})
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
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Deduction Amount (PKR)</label>
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
