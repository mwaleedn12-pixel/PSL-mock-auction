"use client";

import React, { useState } from "react";
import { useAuction } from "@/context/AuctionContext";
import {
  Shield,
  Crown,
  Eye,
  Key,
  Lock,
  LogOut,
  X,
  CheckCircle,
  AlertCircle,
  Users,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    role,
    activeFranchise,
    franchises,
    settings,
    loginAsAdmin,
    loginAsTeamOwner,
    logoutToSpectator,
  } = useAuction();

  const [tab, setTab] = useState<"team" | "admin" | "spectator">("team");
  const [adminPassword, setAdminPassword] = useState("");
  const [teamPasskey, setTeamPasskey] = useState("");
  const [roomCode, setRoomCode] = useState(settings.roomCode || "PSL12-AUCTION-2027");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const res = loginAsAdmin(adminPassword);
    if (res.success) {
      setSuccessMessage(res.message);
      setAdminPassword("");
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1000);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const res = loginAsTeamOwner(teamPasskey, roomCode);
    if (res.success) {
      setSuccessMessage(res.message);
      setTeamPasskey("");
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1000);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleSpectatorClick = () => {
    logoutToSpectator();
    setSuccessMessage("Switched to Spectator Mode (Read-Only).");
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-black text-white">Role-Based Access</h3>
            <p className="text-xs text-slate-400">Join as Team Owner, Admin, or Spectator</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Status Pill */}
        <div className="my-4 p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {role === "admin" ? (
              <Crown className="w-5 h-5 text-amber-400" />
            ) : role === "team_owner" ? (
              <Shield className="w-5 h-5 text-emerald-400" />
            ) : (
              <Eye className="w-5 h-5 text-slate-400" />
            )}
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Current Role</span>
              <span className="text-xs font-black text-white capitalize">
                {role === "team_owner" && activeFranchise
                  ? `Team Owner (${activeFranchise.shortName})`
                  : role === "admin"
                  ? "Super Administrator"
                  : "Spectator (Public Read-Only)"}
              </span>
            </div>
          </div>

          {role !== "spectator" && (
            <button
              onClick={logoutToSpectator}
              className="px-2.5 py-1 text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          )}
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold mb-4">
          <button
            onClick={() => {
              setTab("team");
              setErrorMessage(null);
            }}
            className={`py-2 rounded-xl transition-all ${
              tab === "team"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Team Owner
          </button>
          <button
            onClick={() => {
              setTab("admin");
              setErrorMessage(null);
            }}
            className={`py-2 rounded-xl transition-all ${
              tab === "admin"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Super Admin
          </button>
          <button
            onClick={() => {
              setTab("spectator");
              setErrorMessage(null);
            }}
            className={`py-2 rounded-xl transition-all ${
              tab === "spectator"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Spectator
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center gap-2 text-xs text-red-300 font-semibold animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center gap-2 text-xs text-emerald-300 font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab 1: Team Owner Login Form */}
        {tab === "team" && (
          <form onSubmit={handleTeamSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Auction Room ID</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="e.g. PSL12-AUCTION-2027"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">
                Private Team Passkey (Sent by Admin)
              </label>
              <input
                type="text"
                required
                value={teamPasskey}
                onChange={(e) => setTeamPasskey(e.target.value)}
                placeholder="e.g. LQ-2027, IU-2027, KK-2027"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono text-sm tracking-wider uppercase focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Enter your franchise private passkey to participate in bidding and manage your squad.
              </p>
            </div>

            {/* Quick Demo Helper Dropdown for convenience */}
            <div className="pt-1">
              <span className="text-[10px] text-slate-500 block mb-1">Demo Quick Key:</span>
              <select
                onChange={(e) => setTeamPasskey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none"
              >
                <option value="">Select a team key to test...</option>
                {franchises.map((f) => (
                  <option key={f.id} value={f.privatePasskey}>
                    {f.name} ({f.privatePasskey})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/20 mt-2"
            >
              Unlock Franchise Dashboard & Bidding
            </button>
          </form>
        )}

        {/* Tab 2: Admin Login Form */}
        {tab === "admin" && (
          <form onSubmit={handleAdminSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Administrator Password</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin password (default: admin123)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">Default password: <code className="text-amber-400">admin123</code></p>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/20 mt-2"
            >
              Access Admin Control Room
            </button>
          </form>
        )}

        {/* Tab 3: Spectator */}
        {tab === "spectator" && (
          <div className="space-y-4 text-xs py-2 text-center">
            <p className="text-slate-400">
              Spectator mode is free and public. You can watch the real-time live auction, monitor all team squads, view career statistics, and read final reports.
            </p>
            <p className="text-slate-500 text-[11px]">
              Spectators cannot place bids or modify team configurations.
            </p>

            <button
              onClick={handleSpectatorClick}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-wider transition-colors"
            >
              Continue as Spectator (Read-Only)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

