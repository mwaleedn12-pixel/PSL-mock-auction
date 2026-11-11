"use client";

import React, { useState } from "react";
import { useAuction } from "@/context/AuctionContext";
import { formatPKR } from "@/lib/rules";
import { PlayingXIModal } from "@/components/PlayingXIModal";
import {
  Users,
  Shield,
  Award,
  Globe,
  Filter,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Lock,
} from "lucide-react";

export default function SquadsPage() {
  const {
    role,
    authenticatedFranchiseId,
    activeFranchise,
    franchises,
    players,
    savePlayingXI,
  } = useAuction();

  // If team owner, default to their own team
  const defaultTeamId = (role === "team_owner" && authenticatedFranchiseId)
    ? authenticatedFranchiseId
    : franchises[0]?.id || "iu";

  const [activeTeamId, setActiveTeamId] = useState<string>(defaultTeamId);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [originFilter, setOriginFilter] = useState<string>("all");
  const [isXIModalOpen, setIsXIModalOpen] = useState(false);

  const currentFranchise = franchises.find((f) => f.id === activeTeamId) || franchises[0];
  const squad = players.filter((p) => p.soldToFranchiseId === currentFranchise.id);

  const filteredSquad = squad.filter((p) => {
    if (roleFilter !== "all" && p.primaryRole !== roleFilter) return false;
    if (originFilter === "domestic" && p.isOverseas) return false;
    if (originFilter === "overseas" && !p.isOverseas) return false;
    if (originFilter === "u23" && (!p.isUnder23 || !p.isUncapped)) return false;
    return true;
  });

  const overseasCount = squad.filter((p) => p.isOverseas).length;
  const u23UncappedSquad = squad.filter((p) => p.isUnder23 && p.isUncapped).length;
  const playingXICount = currentFranchise.playingXI?.length || 0;

  // Permission check: only admin or the specific team owner can edit playing XI
  const canEditPlayingXI = role === "admin" || (role === "team_owner" && authenticatedFranchiseId === currentFranchise.id);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-emerald-400" /> Squad Management & Playing XI
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Section 6 & 7: Official roster size (16-20), overseas allocation (5-7), and Under-23 player mandates.
          </p>
        </div>

        {canEditPlayingXI ? (
          <button
            onClick={() => setIsXIModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Sparkles className="w-4 h-4" /> Manage Playing XI ({playingXICount}/11)
          </button>
        ) : (
          <span className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Lock className="w-3.5 h-3.5 text-slate-400" /> Playing XI editing locked to team owner
          </span>
        )}
      </div>

      {/* Franchise Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {franchises.map((f) => {
          const isActive = f.id === activeTeamId;
          const isMyTeam = role === "team_owner" && authenticatedFranchiseId === f.id;
          const teamSquad = players.filter((p) => p.soldToFranchiseId === f.id);

          return (
            <button
              key={f.id}
              onClick={() => setActiveTeamId(f.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-slate-900 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                  : "bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: f.primaryColor }}
              />
              <span>{f.shortName}</span>
              {isMyTeam && (
                <span className="text-[9px] bg-emerald-500 text-slate-950 px-1 rounded font-black">
                  YOU
                </span>
              )}
              <span className="text-[10px] px-1.5 rounded bg-slate-800 text-slate-300 font-mono">
                {teamSquad.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Team Profile Summary */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow"
            style={{ backgroundColor: currentFranchise.primaryColor }}
          >
            {currentFranchise.shortName}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">{currentFranchise.name}</h2>
              {role === "team_owner" && authenticatedFranchiseId === currentFranchise.id && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Your Team
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
              <span>Squad: <strong className="text-white">{squad.length} / {currentFranchise.maxSquadSize}</strong></span>
              <span>•</span>
              <span>Overseas: <strong className="text-blue-400">{overseasCount} / {currentFranchise.maxOverseas} max</strong></span>
              <span>•</span>
              <span>Uncapped U-23: <strong className={u23UncappedSquad >= 2 ? "text-emerald-400" : "text-amber-400"}>{u23UncappedSquad} / 2 min</strong></span>
              <span>•</span>
              <span>Purse Left: <strong className="text-amber-400">{formatPKR(currentFranchise.remainingPurse)}</strong></span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Roles</option>
              <option value="Batter" className="bg-slate-900">Batters</option>
              <option value="Bowler" className="bg-slate-900">Bowlers</option>
              <option value="All-Rounder" className="bg-slate-900">All-Rounders</option>
              <option value="Wicketkeeper" className="bg-slate-900">Wicketkeepers</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Players</option>
              <option value="domestic" className="bg-slate-900">Domestic (Pakistan)</option>
              <option value="overseas" className="bg-slate-900">Overseas</option>
              <option value="u23" className="bg-slate-900">Uncapped Under-23</option>
            </select>
          </div>
        </div>
      </div>

      {/* Squad Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSquad.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 bg-slate-900/40 border border-slate-800 rounded-3xl">
            <Users className="w-10 h-10 mx-auto mb-2 text-slate-700" />
            <p className="font-semibold text-sm">No players acquired yet matching current filter</p>
          </div>
        ) : (
          filteredSquad.map((player) => {
            const isXI = currentFranchise.playingXI?.includes(player.id);
            const isCap = currentFranchise.captainId === player.id;
            const isVC = currentFranchise.viceCaptainId === player.id;

            return (
              <div
                key={player.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isXI
                    ? "bg-slate-900/95 border-emerald-500/50 shadow-md shadow-emerald-500/10"
                    : "bg-slate-900/60 border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={player.photoUrl}
                      alt={player.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-black text-white text-sm">{player.name}</h4>
                        {isCap && (
                          <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-1 rounded">C</span>
                        )}
                        {isVC && (
                          <span className="bg-slate-300 text-slate-950 font-black text-[9px] px-1 rounded">VC</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <span>{player.primaryRole}</span>
                        <span>•</span>
                        <span className="text-[10px] font-bold px-1.5 rounded bg-slate-800 text-slate-300">
                          {player.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isXI && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      PLAYING XI
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {player.isOverseas ? (
                      <span className="text-blue-400 font-semibold">✈ {player.nationality}</span>
                    ) : (
                      <span className="text-emerald-400 font-semibold">Local</span>
                    )}
                    {player.isUnder23 && player.isUncapped && (
                      <span className="text-[10px] font-bold px-1 rounded bg-emerald-500/20 text-emerald-300">
                        U23
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-amber-400">
                    {formatPKR(player.soldPrice || player.basePrice)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Playing XI Modal */}
      <PlayingXIModal
        franchise={currentFranchise}
        allPlayers={players}
        isOpen={isXIModalOpen}
        onClose={() => setIsXIModalOpen(false)}
        onSave={(playerIds, cId, vcId) => savePlayingXI(currentFranchise.id, playerIds, cId, vcId)}
      />
    </div>
  );
}
