"use client";

import React, { useState } from "react";
import { useAuction } from "@/context/AuctionContext";
import { formatPKR } from "@/lib/rules";
import {
  ArrowLeftRight,
  Shield,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Coins,
  X,
} from "lucide-react";

export default function TradeCentrePage() {
  const {
    role,
    franchises,
    players,
    tradeOffers,
    proposeTrade,
    handleTradeAction,
    authenticatedFranchiseId,
  } = useAuction();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fromTeamId, setFromTeamId] = useState(authenticatedFranchiseId || "iu");
  const [toTeamId, setToTeamId] = useState("kk");
  const [offeredPlayerId, setOfferedPlayerId] = useState("");
  const [requestedPlayerId, setRequestedPlayerId] = useState("");
  const [offeredCash, setOfferedCash] = useState<number>(0);
  const [notes, setNotes] = useState("");

  const fromSquad = players.filter((p) => p.soldToFranchiseId === fromTeamId);
  const toSquad = players.filter((p) => p.soldToFranchiseId === toTeamId);

  const handleCreateTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offeredPlayerId || !requestedPlayerId) {
      alert("Please select both an offered player and a requested player.");
      return;
    }

    proposeTrade({
      fromFranchiseId: fromTeamId,
      toFranchiseId: toTeamId,
      offeredPlayerId,
      requestedPlayerId,
      offeredCash: Number(offeredCash) || 0,
      notes,
    });

    setIsModalOpen(false);
    setNotes("");
    setOfferedCash(0);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-7 h-7 text-emerald-400" /> Trade Centre
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            FR-16: Franchise-to-franchise player transfers, player-plus-money deals, and administrative approval workflow.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" /> Propose Trade
        </button>
      </div>

      {/* Trade Proposals List */}
      <div className="space-y-4">
        {tradeOffers.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
            <ArrowLeftRight className="w-10 h-10 mx-auto mb-2 text-slate-700" />
            <p className="font-semibold text-sm">No active trade proposals</p>
            <p className="text-xs mt-1">Franchises can propose player trades or cash deals at any point!</p>
          </div>
        ) : (
          tradeOffers.map((trade) => {
            const fromTeam = franchises.find((f) => f.id === trade.fromFranchiseId);
            const toTeam = franchises.find((f) => f.id === trade.toFranchiseId);
            const offeredPlayer = players.find((p) => p.id === trade.offeredPlayerId);
            const requestedPlayer = players.find((p) => p.id === trade.requestedPlayerId);

            return (
              <div
                key={trade.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Proposed on: {new Date(trade.createdAt).toLocaleDateString()}</span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      trade.status === "approved_by_admin" || trade.status === "accepted"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : trade.status === "rejected"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {trade.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  {/* From Team Offering */}
                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: fromTeam?.primaryColor }} />
                      <span className="text-xs font-black text-white">{fromTeam?.name} Offers:</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-emerald-400">
                        {offeredPlayer?.name || "Player"}
                      </span>
                      <span className="text-xs text-slate-500">{offeredPlayer?.primaryRole}</span>
                    </div>
                    {trade.offeredCash ? (
                      <p className="text-xs text-amber-400 font-mono mt-1 font-bold">
                        + {formatPKR(trade.offeredCash)} Cash
                      </p>
                    ) : null}
                  </div>

                  {/* To Team Offering */}
                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: toTeam?.primaryColor }} />
                      <span className="text-xs font-black text-white">Requests from {toTeam?.name}:</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-amber-400">
                        {requestedPlayer?.name || "Player"}
                      </span>
                      <span className="text-xs text-slate-500">{requestedPlayer?.primaryRole}</span>
                    </div>
                  </div>
                </div>

                {trade.notes && (
                  <p className="text-xs text-slate-400 italic">
                    Note: &ldquo;{trade.notes}&rdquo;
                  </p>
                )}

                {/* Actions */}
                {trade.status === "pending" && (
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleTradeAction(trade.id, "reject")}
                      className="px-4 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-950/60 border border-red-500/40 text-red-300 font-bold text-xs"
                    >
                      Reject Trade
                    </button>
                    <button
                      onClick={() => handleTradeAction(trade.id, "accept")}
                      className="px-4 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs"
                    >
                      Franchise Accept
                    </button>
                    {role === "admin" && (
                      <button
                        onClick={() => handleTradeAction(trade.id, "admin_approve")}
                        className="px-5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider"
                      >
                        Super Admin Final Approval
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Propose Trade Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-black text-white">Propose Player Trade Deal</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTrade} className="space-y-4 my-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Your Franchise</label>
                  <select
                    value={fromTeamId}
                    onChange={(e) => setFromTeamId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {franchises.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Target Franchise</label>
                  <select
                    value={toTeamId}
                    onChange={(e) => setToTeamId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {franchises
                      .filter((f) => f.id !== fromTeamId)
                      .map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Player You Offer</label>
                  <select
                    value={offeredPlayerId}
                    onChange={(e) => setOfferedPlayerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="">Select player to offer...</option>
                    {fromSquad.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.primaryRole})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Player You Want</label>
                  <select
                    value={requestedPlayerId}
                    onChange={(e) => setRequestedPlayerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="">Select requested player...</option>
                    {toSquad.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.primaryRole})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Additional Cash Offer (Optional PKR)</label>
                <input
                  type="number"
                  step="500000"
                  value={offeredCash}
                  onChange={(e) => setOfferedCash(Number(e.target.value))}
                  placeholder="e.g. 5000000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Trade Notes / Strategy</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add a proposal message or strategic reason..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-wider shadow"
                >
                  Send Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

