"use client";

import React, { useState } from "react";
import { useAuction } from "@/context/AuctionContext";
import { formatPKR } from "@/lib/rules";
import { PlayingXIModal } from "@/components/PlayingXIModal";
import { AuthModal } from "@/components/AuthModal";
import {
  Shield,
  Coins,
  Users,
  Award,
  Globe,
  Trash2,
  Bookmark,
  LogIn,
} from "lucide-react";

export default function FranchiseDashboardPage() {
  const {
    role,
    activeFranchise,
    players,
    watchlists,
    toggleWatchlist,
    savePlayingXI,
  } = useAuction();

  const [isXIModalOpen, setIsXIModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"squad" | "watchlist">("squad");

  if (role !== "team_owner" || !activeFranchise) {
    return (
      <div className="max-w-md mx-auto my-16 bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
        <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
        <h2 className="text-xl font-black text-white">Team Owner Login Required</h2>
        <p className="text-xs text-slate-400 mt-2">
          To access your private franchise dashboard, purse ledgers, and team strategy watchlist, enter your team passkey provided by the Administrator.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="mt-6 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/25"
        >
          Login with Team Passkey
        </button>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  const squad = players.filter((p) => p.soldToFranchiseId === activeFranchise.id);
  const localPlayers = squad.filter((p) => !p.isOverseas);
  const overseasPlayers = squad.filter((p) => p.isOverseas);
  const u23Players = squad.filter((p) => p.isUnder23 && p.isUncapped);

  const totalSpent = activeFranchise.initialPurse - activeFranchise.remainingPurse;
  const spentPercent = (totalSpent / activeFranchise.initialPurse) * 100;

  const teamWatchlist = watchlists.filter((w) => w.franchiseId === activeFranchise.id);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Franchise Profile Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div
          className="absolute -top-32 -right-32 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: activeFranchise.primaryColor }}
        />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-black text-white text-2xl sm:text-3xl shadow-xl"
              style={{ backgroundColor: activeFranchise.primaryColor }}
            >
              {activeFranchise.shortName}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {activeFranchise.city}, Pakistan
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-emerald-400 font-semibold">Authenticated Franchise</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {activeFranchise.name}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Owner: <strong className="text-slate-200">{activeFranchise.ownerName}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsXIModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <Users className="w-4 h-4" /> Manage Playing XI ({activeFranchise.playingXI?.length || 0}/11)
            </button>
          </div>
        </div>

        {/* Purse Metrics */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Remaining Purse
            </span>
            <p className="text-2xl font-black text-amber-400 mt-1">
              {formatPKR(activeFranchise.remainingPurse)}
            </p>
            <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${Math.max(0, 100 - spentPercent)}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Spent
            </span>
            <p className="text-2xl font-black text-white mt-1">{formatPKR(totalSpent)}</p>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {spentPercent.toFixed(1)}% of 45 Cr purse
            </span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Squad Quota (16-20)
            </span>
            <p className="text-2xl font-black text-emerald-400 mt-1">
              {squad.length} / {activeFranchise.maxSquadSize}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Min required: {activeFranchise.minSquadSize} players
            </span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Under-23 Mandate (Min 2)
            </span>
            <p className={`text-2xl font-black mt-1 ${u23Players.length >= 2 ? "text-emerald-400" : "text-amber-400"}`}>
              {u23Players.length} / 2
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Uncapped Under-23 condition
            </span>
          </div>
        </div>
      </div>

      {/* Tabs: Official Squad vs Private Watchlist */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-4 border-b border-slate-800 pb-3 mb-6">
          <button
            onClick={() => setActiveTab("squad")}
            className={`font-black text-sm pb-2 border-b-2 transition-colors ${
              activeTab === "squad"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            My Squad ({squad.length})
          </button>
          <button
            onClick={() => setActiveTab("watchlist")}
            className={`font-black text-sm pb-2 border-b-2 transition-colors ${
              activeTab === "watchlist"
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Private Strategy Watchlist ({teamWatchlist.length})
          </button>
        </div>

        {activeTab === "squad" && (
          <div className="overflow-x-auto">
            {squad.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Users className="w-10 h-10 mx-auto mb-2 text-slate-700" />
                <p className="font-semibold text-sm">No players acquired yet</p>
                <p className="text-xs mt-1">Place bids in the Live Arena to acquire your PSL squad.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                    <th className="pb-3">Player</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Origin</th>
                    <th className="pb-3">Acquisition</th>
                    <th className="pb-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {squad.map((player) => (
                    <tr key={player.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 font-bold text-white flex items-center gap-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={player.photoUrl}
                          alt={player.name}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <span>{player.name}</span>
                        {activeFranchise.captainId === player.id && (
                          <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-1 rounded">C</span>
                        )}
                        {activeFranchise.viceCaptainId === player.id && (
                          <span className="bg-slate-300 text-slate-950 font-black text-[9px] px-1 rounded">VC</span>
                        )}
                      </td>
                      <td className="py-3 text-slate-300">{player.primaryRole}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded font-black text-[10px] bg-slate-800 text-slate-300">
                          {player.category}
                        </span>
                      </td>
                      <td className="py-3">
                        {player.isOverseas ? (
                          <span className="text-blue-400 font-semibold">{player.nationality}</span>
                        ) : (
                          <span className="text-emerald-400 font-semibold">Pakistan</span>
                        )}
                      </td>
                      <td className="py-3 text-slate-400">
                        {player.isRetained ? "Retained" : player.isDirectSigning ? "Direct Signing" : "Auction Buy"}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-amber-400">
                        {formatPKR(player.soldPrice || player.basePrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "watchlist" && (
          <div className="space-y-3">
            {teamWatchlist.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Bookmark className="w-10 h-10 mx-auto mb-2 text-slate-700" />
                <p className="font-semibold text-sm">Your private watchlist is empty</p>
                <p className="text-xs mt-1">Browse the Player Centre and star targets with max bids and private notes.</p>
              </div>
            ) : (
              teamWatchlist.map((item) => {
                const targetPlayer = players.find((p) => p.id === item.playerId);
                if (!targetPlayer) return null;

                return (
                  <div
                    key={item.playerId}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={targetPlayer.photoUrl}
                        alt={targetPlayer.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">{targetPlayer.name}</h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-black bg-slate-800 text-slate-300">
                            {targetPlayer.category}
                          </span>
                          <span className="text-[10px] text-slate-400">{targetPlayer.primaryRole}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Base Price: {formatPKR(targetPlayer.basePrice)} • Status:{" "}
                          <span className="capitalize font-semibold text-emerald-400">{targetPlayer.status}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleWatchlist(activeFranchise.id, targetPlayer.id)}
                      className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-900 transition-colors"
                      title="Remove from Watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <PlayingXIModal
        franchise={activeFranchise}
        allPlayers={players}
        isOpen={isXIModalOpen}
        onClose={() => setIsXIModalOpen(false)}
        onSave={(playerIds, cId, vcId) => savePlayingXI(activeFranchise.id, playerIds, cId, vcId)}
      />
    </div>
  );
}
