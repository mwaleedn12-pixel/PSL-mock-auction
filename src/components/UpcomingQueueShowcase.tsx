"use client";

import React, { useState } from "react";
import { useAuction } from "@/context/AuctionContext";
import { formatPKR } from "@/lib/rules";
import { Player } from "@/types/auction";
import {
  Activity,
  Flame,
  Globe,
  Star,
  ChevronRight,
  Gavel,
  Bookmark,
  Users,
} from "lucide-react";

export const UpcomingQueueShowcase: React.FC = () => {
  const {
    players,
    currentPlayerIndex,
    selectPlayerForAuction,
    role,
    activeFranchise,
    watchlists,
    toggleWatchlist,
  } = useAuction();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const upcomingPlayers = players.filter((p) => p.status === "upcoming");

  const filteredUpcoming = upcomingPlayers.filter((p) => {
    if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h3 className="text-base font-black text-white uppercase tracking-wider">
              Upcoming Auction Queue ({upcomingPlayers.length} Players)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Players in queue with official PSL Kit or Debut T20 Kit pictures, and PSL vs T20 stats comparison.
          </p>
        </div>

        {/* Category quick filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold no-scrollbar">
          {["all", "Platinum", "Diamond", "Gold", "Silver", "Emerging"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl capitalize transition-colors ${
                selectedCategory === cat
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {cat === "all" ? "All Queue" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[520px] overflow-y-auto pr-1">
        {filteredUpcoming.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            No upcoming players found in this category.
          </div>
        ) : (
          filteredUpcoming.map((player) => {
            const isWatchlisted =
              activeFranchise &&
              watchlists.some((w) => w.franchiseId === activeFranchise.id && w.playerId === player.id);

            return (
              <div
                key={player.id}
                className="bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden shadow-md transition-all hover:scale-[1.01] flex flex-col justify-between group"
              >
                <div>
                  {/* Photo with Kit Badge */}
                  <div className="relative h-40 w-full bg-slate-900 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={player.photoUrl}
                      alt={player.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait-lg-webp/prd/assets/players/generic/colored/69957.png";
                      }}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />

                    {/* Watchlist Star button */}
                    {activeFranchise && (
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => toggleWatchlist(activeFranchise.id, player.id)}
                          className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${
                            isWatchlisted
                              ? "bg-amber-500 text-slate-950"
                              : "bg-slate-950/70 text-slate-400 hover:text-white"
                          }`}
                        >
                          <Bookmark className="w-3 h-3 fill-current" />
                        </button>
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-black text-white text-sm">{player.name}</h4>
                        <span className="text-[10px] text-slate-400">{player.primaryRole}</span>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-900/90 text-amber-400 border border-slate-800">
                        {player.category}
                      </span>
                    </div>
                  </div>

                  {/* PSL vs T20 Stats Banner */}
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span
                        className={`font-black uppercase px-1.5 py-0.2 rounded ${
                          player.statsType === "PSL"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {player.statsType === "PSL" ? "Official PSL Career" : "T20 Overall"}
                      </span>
                      <span className="text-slate-400 font-mono font-bold">
                        {player.stats?.matches || 0} Matches
                      </span>
                    </div>

                    {/* Stats Highlights Grid */}
                    {player.stats && (
                      <div className="grid grid-cols-3 gap-1 text-center text-[10px] bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
                        {player.stats.runs !== undefined ? (
                          <div>
                            <span className="text-slate-500 block">Runs</span>
                            <span className="font-bold text-emerald-400">{player.stats.runs}</span>
                          </div>
                        ) : null}

                        {player.stats.strikeRate !== undefined ? (
                          <div>
                            <span className="text-slate-500 block">SR</span>
                            <span className="font-bold text-amber-400">{player.stats.strikeRate}</span>
                          </div>
                        ) : null}

                        {player.stats.wickets !== undefined ? (
                          <div>
                            <span className="text-slate-500 block">Wickets</span>
                            <span className="font-bold text-cyan-400">{player.stats.wickets}</span>
                          </div>
                        ) : null}

                        {player.stats.economyRate !== undefined ? (
                          <div>
                            <span className="text-slate-500 block">Econ</span>
                            <span className="font-bold text-teal-400">{player.stats.economyRate}</span>
                          </div>
                        ) : null}

                        {player.stats.battingAverage !== undefined ? (
                          <div>
                            <span className="text-slate-500 block">Avg</span>
                            <span className="font-bold text-slate-200">{player.stats.battingAverage}</span>
                          </div>
                        ) : null}

                        {player.stats.highestScore !== undefined ? (
                          <div>
                            <span className="text-slate-500 block">HS</span>
                            <span className="font-bold text-purple-400">{player.stats.highestScore}</span>
                          </div>
                        ) : null}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500 text-[11px]">Base Price:</span>
                      <span className="font-mono font-bold text-slate-200">{formatPKR(player.basePrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="p-3 pt-0">
                  {role === "admin" ? (
                    <button
                      onClick={() => selectPlayerForAuction(player.id)}
                      className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
                    >
                      <Gavel className="w-3.5 h-3.5" /> Put on Block
                    </button>
                  ) : (
                    <div className="text-center py-1 text-[11px] text-slate-500">
                      In Queue • {player.isOverseas ? "✈ Overseas" : "Domestic"}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

