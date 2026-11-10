"use client";

import React, { useState } from "react";
import { useAuction } from "@/context/AuctionContext";
import { Player, PlayerCategory, PlayerRole } from "@/types/auction";
import { formatPKR } from "@/lib/rules";
import {
  Database,
  Search,
  Filter,
  Plus,
  Bookmark,
  X,
  Award,
  Globe,
  Activity,
  Flame,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

export default function PlayersDatabasePage() {
  const {
    players,
    franchises,
    activeFranchise,
    watchlists,
    toggleWatchlist,
    addPlayer,
    role,
  } = useAuction();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Player Form State
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerCategory, setNewPlayerCategory] = useState<PlayerCategory>("Gold");
  const [newPlayerRole, setNewPlayerRole] = useState<PlayerRole>("Batter");
  const [newPlayerNationality, setNewPlayerNationality] = useState("Pakistan");
  const [newPlayerBasePrice, setNewPlayerBasePrice] = useState(10000000);
  const [newPlayerBatting, setNewPlayerBatting] = useState("Right-hand bat");
  const [newPlayerBowling, setNewPlayerBowling] = useState("Right-arm medium");
  const [newPlayerAge, setNewPlayerAge] = useState(24);

  const filteredPlayers = players.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchNat = p.nationality.toLowerCase().includes(q);
      if (!matchName && !matchNat) return false;
    }
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    if (roleFilter !== "all" && p.primaryRole !== roleFilter) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    return true;
  });

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    addPlayer({
      name: newPlayerName.trim(),
      category: newPlayerCategory,
      primaryRole: newPlayerRole,
      nationality: newPlayerNationality,
      isOverseas: newPlayerNationality.toLowerCase() !== "pakistan",
      basePrice: Number(newPlayerBasePrice),
      battingStyle: newPlayerBatting,
      bowlingStyle: newPlayerBowling,
      age: Number(newPlayerAge),
      photoUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400",
    });

    setNewPlayerName("");
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Database className="w-7 h-7 text-emerald-400" /> Player Database & Profiles
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, inspect PSL career metrics, and target players for live auction bidding.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" /> Add Player
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by player name or nationality..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Platinum">Platinum</option>
            <option value="Diamond">Diamond</option>
            <option value="Gold">Gold</option>
            <option value="Silver">Silver</option>
            <option value="Emerging">Emerging</option>
            <option value="Supplementary">Supplementary</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="Batter">Batter</option>
            <option value="Bowler">Bowler</option>
            <option value="All-Rounder">All-Rounder</option>
            <option value="Wicketkeeper">Wicketkeeper</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="sold">Sold</option>
            <option value="unsold">Unsold</option>
            <option value="retained">Retained</option>
            <option value="direct_signing">Direct Signing</option>
          </select>
        </div>
      </div>

      {/* Players Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPlayers.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-500 bg-slate-900/40 border border-slate-800 rounded-3xl">
            <Database className="w-10 h-10 mx-auto mb-2 text-slate-700" />
            <p className="font-semibold text-sm">No players match your search criteria</p>
          </div>
        ) : (
          filteredPlayers.map((player) => {
            const isWatchlisted =
              activeFranchise &&
              watchlists.some((w) => w.franchiseId === activeFranchise.id && w.playerId === player.id);

            const winningTeam = franchises.find((f) => f.id === player.soldToFranchiseId);

            return (
              <div
                key={player.id}
                onClick={() => setSelectedPlayer(player)}
                className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden shadow-md transition-all hover:scale-[1.02] cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={player.photoUrl}
                      alt={player.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90" />

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950/80 text-amber-400 border border-slate-800">
                        {player.category}
                      </span>
                    </div>

                    <div className="absolute top-2 right-2">
                      {activeFranchise && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(activeFranchise.id, player.id);
                          }}
                          className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${
                            isWatchlisted
                              ? "bg-amber-500 text-slate-950"
                              : "bg-slate-950/70 text-slate-400 hover:text-white"
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5 fill-current" />
                        </button>
                      )}
                    </div>

                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs">
                      <span className="font-black text-white text-sm">{player.name}</span>
                      <span className="text-[11px] text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-800">
                        {player.primaryRole}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{player.nationality} {player.isOverseas && "✈"}</span>
                      <span>Age: {player.age}</span>
                    </div>

                    <div className="bg-slate-950/70 rounded-xl p-2 border border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Base Price:</span>
                      <span className="font-mono font-bold text-slate-200">{formatPKR(player.basePrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="p-3 pt-0">
                  {player.status === "sold" && winningTeam ? (
                    <div className="w-full py-1.5 px-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-[11px] text-emerald-300 font-bold">
                      <span>Sold: {winningTeam.shortName}</span>
                      <span className="font-mono">{formatPKR(player.soldPrice || 0)}</span>
                    </div>
                  ) : player.status === "unsold" ? (
                    <div className="w-full py-1.5 px-2 rounded-xl bg-red-950/40 border border-red-500/40 text-center text-[11px] text-red-400 font-bold">
                      UNSOLD
                    </div>
                  ) : player.status === "retained" ? (
                    <div className="w-full py-1.5 px-2 rounded-xl bg-amber-950/40 border border-amber-500/40 text-center text-[11px] text-amber-400 font-bold">
                      RETAINED
                    </div>
                  ) : (
                    <div className="w-full py-1.5 px-2 rounded-xl bg-slate-950 border border-slate-800 text-center text-[11px] text-slate-400 font-semibold">
                      Upcoming in Auction
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detailed Player Profile Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {selectedPlayer.category}
                </span>
                <span className="text-xs text-slate-400">{selectedPlayer.primaryRole}</span>
              </div>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 my-6 items-center">
              <div className="sm:col-span-5 flex flex-col items-center">
                <div className="w-44 h-44 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl bg-slate-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedPlayer.photoUrl}
                    alt={selectedPlayer.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              <div className="sm:col-span-7 space-y-3">
                <h2 className="text-2xl font-black text-white">{selectedPlayer.name}</h2>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>Nationality: <strong className="text-white">{selectedPlayer.nationality} {selectedPlayer.isOverseas ? "(Overseas)" : "(Domestic)"}</strong></p>
                  <p>Batting: <strong className="text-white">{selectedPlayer.battingStyle}</strong></p>
                  <p>Bowling: <strong className="text-white">{selectedPlayer.bowlingStyle}</strong></p>
                  <p>Base Price: <strong className="text-amber-400">{formatPKR(selectedPlayer.basePrice)}</strong></p>
                </div>

                {selectedPlayer.status === "sold" && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs">
                    <span className="text-slate-400 block">Sold To:</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      {franchises.find((f) => f.id === selectedPlayer.soldToFranchiseId)?.name} for {formatPKR(selectedPlayer.soldPrice || 0)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {selectedPlayer.stats && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" /> Career Statistics
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-900 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">Matches</span>
                    <span className="font-bold text-white">{selectedPlayer.stats.matches}</span>
                  </div>
                  {selectedPlayer.stats.runs !== undefined && (
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">Runs</span>
                      <span className="font-bold text-emerald-400">{selectedPlayer.stats.runs}</span>
                    </div>
                  )}
                  {selectedPlayer.stats.strikeRate !== undefined && (
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">Strike Rate</span>
                      <span className="font-bold text-amber-400">{selectedPlayer.stats.strikeRate}</span>
                    </div>
                  )}
                  {selectedPlayer.stats.wickets !== undefined && (
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">Wickets</span>
                      <span className="font-bold text-blue-400">{selectedPlayer.stats.wickets}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add New Player Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-black text-white">Add New Player</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlayer} className="space-y-4 my-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Player Full Name</label>
                <input
                  type="text"
                  required
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="e.g. Sahibzada Farhan"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Category</label>
                  <select
                    value={newPlayerCategory}
                    onChange={(e) => setNewPlayerCategory(e.target.value as PlayerCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Platinum">Platinum</option>
                    <option value="Diamond">Diamond</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Emerging">Emerging</option>
                    <option value="Supplementary">Supplementary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Primary Role</label>
                  <select
                    value={newPlayerRole}
                    onChange={(e) => setNewPlayerRole(e.target.value as PlayerRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Batter">Batter</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-Rounder">All-Rounder</option>
                    <option value="Wicketkeeper">Wicketkeeper</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Nationality</label>
                  <input
                    type="text"
                    value={newPlayerNationality}
                    onChange={(e) => setNewPlayerNationality(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Base Price (PKR)</label>
                  <input
                    type="number"
                    step="500000"
                    value={newPlayerBasePrice}
                    onChange={(e) => setNewPlayerBasePrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-wider shadow"
                >
                  Save Player
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
