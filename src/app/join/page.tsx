"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuction } from "@/context/AuctionContext";
import { formatPKR } from "@/lib/rules";
import {
  Shield,
  CheckCircle,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  Gavel,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Eye,
  Key,
} from "lucide-react";

export default function JoinAuctionPage() {
  const {
    franchises,
    claimFranchise,
    authenticatedFranchiseId,
    activeFranchise,
    role,
    settings,
    auctionStatus,
    switchRoleDirectly,
  } = useAuction();

  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string | null>(null);
  const [ownerNameInput, setOwnerNameInput] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleOpenClaimModal = (franchiseId: string) => {
    const f = franchises.find((team) => team.id === franchiseId);
    if (!f) return;
    if (f.isClaimed && f.ownerName && authenticatedFranchiseId !== f.id) {
      setErrorMessage(`${f.name} is already claimed by ${f.ownerName}! Please choose another team.`);
      return;
    }
    setErrorMessage(null);
    setSelectedFranchiseId(franchiseId);
    setOwnerNameInput(f.ownerName || "");
  };

  const handleConfirmClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFranchiseId) return;
    if (!ownerNameInput.trim()) {
      setErrorMessage("Please enter your name to claim this franchise.");
      return;
    }

    const res = claimFranchise(selectedFranchiseId, ownerNameInput.trim());
    if (!res.success) {
      setErrorMessage(res.message);
    } else {
      setSuccessMessage(res.message);
      setSelectedFranchiseId(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-16">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-700/50">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider mb-3">
            ★ HBL PSL 12 Live Franchise War Room
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Select Your PSL 12 Franchise
          </h1>
          <p className="mt-2 text-sm sm:text-base text-emerald-100 font-medium">
            First-Come First-Serve Team Ownership: Select an available franchise, enter your name, and take command of the purse and live bidding strategy!
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/auction"
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider inline-flex items-center gap-2 transition-all shadow-lg shadow-amber-400/20 hover:scale-[1.02]"
            >
              <Gavel className="w-4 h-4" />
              <span>Go to Live Auction Arena</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => switchRoleDirectly("spectator")}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm transition-colors inline-flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>Join as Viewer (Read-Only)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-800 font-bold">
            ✕
          </button>
        </div>
      )}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-bold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <Link href="/auction" className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-black transition-colors">
            Enter Auction Now →
          </Link>
        </div>
      )}

      {/* Currently Claimed Summary Bar if user is an owner */}
      {role === "team_owner" && activeFranchise && (
        <div className="p-4 px-6 rounded-2xl bg-emerald-50 border-2 border-emerald-400 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shadow"
              style={{ backgroundColor: activeFranchise.primaryColor }}
            >
              {activeFranchise.shortName}
            </div>
            <div>
              <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Active Command</p>
              <h3 className="text-base font-black text-slate-900">
                {activeFranchise.name} — <span className="text-emerald-700">{activeFranchise.ownerName || "You"}</span>
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
            <span>Remaining Purse: <strong className="text-slate-900 font-mono font-black">{formatPKR(activeFranchise.remainingPurse)}</strong></span>
            <span>RTM Cards: <strong className="text-amber-600">{activeFranchise.rtmCardsLeft ?? 2} Left</strong></span>
            <Link
              href="/auction"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black transition-colors shadow"
            >
              Proceed to Auction →
            </Link>
          </div>
        </div>
      )}

      {/* 8 Franchises Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">8 Official Franchises</h2>
            <p className="text-xs text-slate-500">Click an available team to register as its franchise owner.</p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {franchises.filter((f) => f.isClaimed).length} / 8 Teams Claimed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {franchises.map((f) => {
            const isMyTeam = role === "team_owner" && authenticatedFranchiseId === f.id;
            const isClaimedByOther = f.isClaimed && f.ownerName && !isMyTeam;

            return (
              <div
                key={f.id}
                className={`rounded-2xl border p-5 transition-all relative overflow-hidden flex flex-col justify-between ${
                  isMyTeam
                    ? "bg-white border-2 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-400/20"
                    : isClaimedByOther
                    ? "bg-slate-100/80 border-slate-200 opacity-80"
                    : "bg-white hover:border-emerald-300 border-slate-200 shadow-sm hover:shadow-md"
                }`}
              >
                {/* Team Top Accent Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: f.primaryColor }}
                />

                <div>
                  <div className="flex items-start justify-between gap-2 mt-1">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-base text-white shadow-md border border-white/20 shrink-0"
                      style={{ backgroundColor: f.primaryColor }}
                    >
                      {f.shortName}
                    </div>

                    <div>
                      {isMyTeam ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> My Team
                        </span>
                      ) : isClaimedByOther ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600 border border-slate-300 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-500" /> Taken
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ● Available
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-900 mt-3">{f.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">City: {f.city}</p>

                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Owner:</span>
                      <strong className="text-slate-800 font-semibold truncate max-w-[120px]">
                        {f.ownerName ? f.ownerName : "Unclaimed"}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Starting Purse:</span>
                      <strong className="text-emerald-700 font-mono font-bold">{formatPKR(f.initialPurse)}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>RTM Cards:</span>
                      <strong className="text-amber-600 font-bold">{f.rtmCardsLeft ?? 2} Cards</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3">
                  {isMyTeam ? (
                    <Link
                      href="/auction"
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow"
                    >
                      <span>Enter Auction Room</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : isClaimedByOther ? (
                    <button
                      disabled
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-200 text-slate-400 font-bold text-xs uppercase cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Claimed by {f.ownerName}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenClaimModal(f.id)}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow hover:shadow-emerald-600/20"
                    >
                      <span>⚡ Claim This Franchise</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Claim Modal */}
      {selectedFranchiseId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                Claim Franchise Ownership
              </h3>
              <button
                onClick={() => setSelectedFranchiseId(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmClaim} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Selected Franchise
                </label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-white"
                    style={{ backgroundColor: franchises.find((f) => f.id === selectedFranchiseId)?.primaryColor }}
                  >
                    {franchises.find((f) => f.id === selectedFranchiseId)?.shortName}
                  </div>
                  <span className="font-black text-slate-900">
                    {franchises.find((f) => f.id === selectedFranchiseId)?.name}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Your Full Name (Owner Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Waleed, Ali Khan"
                  value={ownerNameInput}
                  onChange={(e) => setOwnerNameInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-900 text-sm font-semibold outline-none"
                  autoFocus
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  This name will be broadcast to all franchises and admin when placing bids.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedFranchiseId(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-colors shadow-lg shadow-emerald-600/20"
                >
                  Confirm &amp; Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
