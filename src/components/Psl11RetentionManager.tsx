"use client";

import React, { useState } from "react";
import { useAuction } from "@/context/AuctionContext";
import { PSL_11_SQUADS, Psl11SquadPlayer } from "@/data/psl11Squads";
import { formatPKR } from "@/lib/rules";
import {
  Award,
  Sparkles,
  Shield,
  CheckCircle,
  ExternalLink,
  Users,
  Coins,
  Star,
  Check,
  ChevronRight,
} from "lucide-react";

export const Psl11RetentionManager: React.FC = () => {
  const {
    franchises,
    players,
    applyOfficialPsl11Retentions,
    retainPsl11SquadPlayer,
    role,
  } = useAuction();

  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>("raw");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const activeFranchise = franchises.find((f) => f.id === selectedFranchiseId) || franchises[0];
  const franchiseSquad = PSL_11_SQUADS[selectedFranchiseId] || [];

  // Count how many players are already retained for this franchise
  const retainedPlayers = players.filter(
    (p) => p.soldToFranchiseId === selectedFranchiseId && p.isRetained
  );

  const handleApplyAllCore = () => {
    if (confirm("Apply official PSL 11 core retentions for all 8 franchises? This will automatically retain each team's verified core players at their authentic prices and deduct from their purses.")) {
      const result = applyOfficialPsl11Retentions();
      setSuccessMsg(
        `Successfully applied official core retentions! ${result.count} players retained across all teams with ${(result.totalPurseSpent / 10000000).toFixed(2)} Crore deducted.`
      );
      setTimeout(() => setSuccessMsg(null), 5000);
    }
  };

  const handleRetainPlayer = (player: Psl11SquadPlayer) => {
    if (retainedPlayers.length >= 4) {
      alert("Maximum 4 retentions per franchise allowed under official PSL rules!");
      return;
    }
    retainPsl11SquadPlayer(selectedFranchiseId, player);
    setSuccessMsg(`Retained ${player.name} for ${activeFranchise.name} at ${formatPKR(player.pricePKR)}!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-6">
      {/* Background Neon Accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Global 1-Click Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Official Real Data
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs font-bold text-slate-400">PSL 11 Verified Pricing</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            PSL 11 Squads &amp; Real Retention Pricing for PSL 12
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            View every franchise&apos;s verified PSL 11 squad with authentic acquisition prices. Retain players for PSL 12 with genuine costs deducted automatically from each team&apos;s 45 Crore purse.
          </p>
        </div>

        {role === "admin" && (
          <button
            onClick={handleApplyAllCore}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 shrink-0 transition-transform active:scale-95"
            title="Automatically apply the 4 official core retentions for all 8 franchises with verified prices"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            Apply Official Core Retentions
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-300 font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Franchise Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar relative z-10">
        {franchises.map((f) => {
          const isSelected = f.id === selectedFranchiseId;
          const count = players.filter((p) => p.soldToFranchiseId === f.id && p.isRetained).length;

          return (
            <button
              key={f.id}
              onClick={() => setSelectedFranchiseId(f.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all border shrink-0 ${
                isSelected
                  ? "bg-slate-950 text-white border-amber-400 shadow-lg shadow-amber-500/10 scale-105"
                  : "bg-slate-950/50 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: f.primaryColor }} />
              <span>{f.name}</span>
              {count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {count} Retained
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Franchise Retention Status Bar */}
      <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-500 block">Franchise:</span>
          <span className="font-black text-white text-sm">{activeFranchise.name}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Remaining Purse:</span>
          <span className="font-mono font-black text-amber-400 text-sm">
            {formatPKR(activeFranchise.remainingPurse)}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Retentions Quota:</span>
          <span className="font-black text-emerald-400 text-sm">
            {retainedPlayers.length} / 4 Allowed
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">PSL 11 Roster Count:</span>
          <span className="font-black text-slate-200 text-sm">
            {franchiseSquad.length} Players Listed
          </span>
        </div>
      </div>

      {/* PSL 11 Verified Squad Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 relative z-10">
        {franchiseSquad.map((player) => {
          // Check if already retained in PSL 12 state
          const isRetained = players.some(
            (p) =>
              p.soldToFranchiseId === selectedFranchiseId &&
              p.isRetained &&
              p.name.toLowerCase().trim() === player.name.toLowerCase().trim()
          );

          const isSoldElsewhere = players.some(
            (p) =>
              p.soldToFranchiseId &&
              p.soldToFranchiseId !== selectedFranchiseId &&
              p.name.toLowerCase().trim() === player.name.toLowerCase().trim()
          );

          return (
            <div
              key={player.id}
              className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                isRetained
                  ? "bg-amber-950/20 border-amber-500/60 shadow-lg shadow-amber-500/10"
                  : isSoldElsewhere
                  ? "bg-slate-950/30 border-slate-900 opacity-50"
                  : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div>
                {/* Top Badge Row */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        player.category === "Platinum"
                          ? "bg-purple-950/60 text-purple-300 border border-purple-500/40"
                          : player.category === "Diamond"
                          ? "bg-cyan-950/60 text-cyan-300 border border-cyan-500/40"
                          : player.category === "Gold"
                          ? "bg-amber-950/60 text-amber-300 border border-amber-500/40"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {player.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900 text-slate-400 border border-slate-800">
                      {player.role}
                    </span>
                  </div>

                  {player.isOfficialCoreRetention && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      <Star className="w-3 h-3 fill-amber-400" /> Core
                    </span>
                  )}
                </div>

                {/* Player Name & Acquisition info */}
                <div className="mt-1">
                  <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                    {player.name}
                    {player.cricinfoUrl && (
                      <a
                        href={player.cricinfoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-emerald-400 transition-colors"
                        title="View ESPNcricinfo profile"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <span>{player.nationality}</span>
                    <span>•</span>
                    <span className="text-slate-500">{player.acquisitionType}</span>
                  </p>
                </div>
              </div>

              {/* Price & Action Button */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-bold block">
                    PSL 11 Price:
                  </span>
                  <span className="font-mono font-black text-amber-400 text-xs">
                    {formatPKR(player.pricePKR)}
                  </span>
                </div>

                {isRetained ? (
                  <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black flex items-center gap-1">
                    <Check className="w-3 h-3" /> Retained
                  </span>
                ) : isSoldElsewhere ? (
                  <span className="text-[11px] text-slate-500 font-medium">Sold elsewhere</span>
                ) : role === "admin" ? (
                  <button
                    onClick={() => handleRetainPlayer(player)}
                    disabled={retainedPlayers.length >= 4 || activeFranchise.remainingPurse < player.pricePKR}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-[11px] uppercase tracking-wider transition-colors shadow flex items-center gap-1"
                  >
                    <span>Retain</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-500">Available</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
