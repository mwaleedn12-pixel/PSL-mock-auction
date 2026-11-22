"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuction } from "@/context/AuctionContext";
import { formatPKR } from "@/lib/rules";
import {
  Gavel,
  Eye,
  Crown,
  ArrowRight,
  Lock,
  User,
  CheckCircle,
  AlertCircle,
  X,
  Clock,
  Users,
  Zap,
  Shield,
} from "lucide-react";

type EntryMode = "home" | "owner" | "spectator" | "admin";

export default function LandingPage() {
  const router = useRouter();
  const {
    role,
    franchises,
    auctionStatus,
    currentPlayer,
    highestBid,
    timer,
    loginAsAdmin,
    claimFranchise,
    switchRoleDirectly,
    activeFranchise,
    adminUser,
    settings,
  } = useAuction();

  const [mode, setMode] = useState<EntryMode>("home");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [ownerCode, setOwnerCode] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerStep, setOwnerStep] = useState<"code" | "name" | "done">("code");
  const [selectedFranchise, setSelectedFranchise] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect appropriately
  useEffect(() => {
    if (role === "admin") {
      router.push("/auction");
    } else if (role === "team_owner" && activeFranchise) {
      router.push("/auction");
    }
  }, [role, activeFranchise, router]);

  const isLive = auctionStatus === "Live";
  const totalClaimed = franchises.filter((f) => f.isClaimed).length;

  // --- ADMIN LOGIN ---
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // loginAsAdmin takes only password in this codebase
    const res = loginAsAdmin(adminPassword);
    setLoading(false);
    if (res.success) {
      setSuccess("Welcome, Admin! Redirecting...");
      setTimeout(() => router.push("/auction"), 1000);
    } else {
      setError(res.message || "Invalid credentials.");
    }
  };

  // --- OWNER: Validate team code ---
  const handleOwnerCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const code = ownerCode.trim().toUpperCase();
    // Find franchise by code (shortName or id match)
    const matched = franchises.find(
      (f) =>
        f.id.toUpperCase() === code ||
        f.shortName.toUpperCase() === code ||
        (f as any).joinCode?.toUpperCase() === code
    );
    if (!matched) {
      setError("Invalid team code. Please ask your admin for the correct code.");
      return;
    }
    if (matched.isClaimed && matched.ownerName) {
      setError(`${matched.name} is already claimed by ${matched.ownerName}. Contact admin.`);
      return;
    }
    setSelectedFranchise(matched.id);
    setOwnerStep("name");
  };

  // --- OWNER: Submit name and claim ---
  const handleOwnerNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedFranchise) return;
    if (!ownerName.trim()) {
      setError("Please enter your name.");
      return;
    }
    setLoading(true);
    const res = claimFranchise(selectedFranchise, ownerName.trim());
    setLoading(false);
    if (res.success) {
      setOwnerStep("done");
      setSuccess(res.message);
      setTimeout(() => router.push("/auction"), 1200);
    } else {
      setError(res.message);
    }
  };

  // --- SPECTATOR ---
  const handleSpectate = () => {
    switchRoleDirectly("spectator");
    router.push("/auction");
  };

  const selectedF = franchises.find((f) => f.id === selectedFranchise);

  // ============================================================
  // RENDER: HOME
  // ============================================================
  if (mode === "home") {
    return (
      <div className="min-h-screen bg-[#060d14] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-900/15 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-10 flex flex-col items-center">
          {/* PSL Logo + Branding */}
          <div className="flex items-center gap-4 mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/psl-brand.jpg"
              alt="HBL PSL"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-xl"
            />
            <div>
              <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-0.5">
                HBL Pakistan Super League
              </p>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
                PSL 12{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  Mock Auction
                </span>
              </h1>
            </div>
          </div>

          {/* Live Status Bar */}
          <div className="flex items-center gap-3 mb-10 mt-2">
            <span
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                isLive
                  ? "bg-red-500/20 border-red-500/50 text-red-400"
                  : auctionStatus === "Paused"
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                  : "bg-slate-800 border-slate-700 text-slate-400"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLive ? "bg-red-500 animate-ping" : "bg-slate-500"
                }`}
              />
              {isLive ? "LIVE NOW" : auctionStatus === "Paused" ? "PAUSED" : "READY"}
            </span>

            {currentPlayer && isLive && (
              <span className="text-slate-400 text-xs font-semibold">
                On Block:{" "}
                <span className="text-white font-black">{currentPlayer.name}</span>
                {" · "}
                <span className="text-amber-400 font-mono font-black">
                  {highestBid ? formatPKR(highestBid.amount) : formatPKR(currentPlayer.basePrice)}
                </span>
                {" · "}
                <span className="text-red-400 font-mono font-black">{timer}s</span>
              </span>
            )}

            <span className="text-slate-500 text-xs">
              {totalClaimed}/{franchises.length} Teams Joined
            </span>
          </div>

          {/* Three Entry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl">
            {/* FRANCHISE OWNER */}
            <button
              onClick={() => setMode("owner")}
              className="group relative overflow-hidden rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-b from-emerald-950/80 to-slate-950/80 p-6 text-left hover:border-emerald-500/70 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Gavel className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-lg font-black text-white mb-1">Franchise Owner</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter team code, claim your franchise and bid live in the auction.
                </p>
                <div className="mt-4 flex items-center gap-1 text-emerald-400 text-xs font-black group-hover:gap-2 transition-all">
                  Join as Owner <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </button>

            {/* SPECTATOR */}
            <button
              onClick={handleSpectate}
              className="group relative overflow-hidden rounded-3xl border-2 border-blue-500/30 bg-gradient-to-b from-blue-950/80 to-slate-950/80 p-6 text-left hover:border-blue-500/70 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Eye className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-lg font-black text-white mb-1">Spectator</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Watch the live auction in real-time. Read-only access — no bidding.
                </p>
                <div className="mt-4 flex items-center gap-1 text-blue-400 text-xs font-black group-hover:gap-2 transition-all">
                  Watch Live <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </button>

            {/* ADMIN */}
            <button
              onClick={() => setMode("admin")}
              className="group relative overflow-hidden rounded-3xl border-2 border-amber-500/30 bg-gradient-to-b from-amber-950/80 to-slate-950/80 p-6 text-left hover:border-amber-500/70 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 hover:-translate-y-1 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Crown className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="text-lg font-black text-white mb-1">Admin</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Control the auction room, manage players, rules and franchises.
                </p>
                <div className="mt-4 flex items-center gap-1 text-amber-400 text-xs font-black group-hover:gap-2 transition-all">
                  Admin Login <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </button>
          </div>

          {/* Franchise Status Strip */}
          <div className="mt-10 w-full max-w-3xl">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3 text-center">
              Franchise Status
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {franchises.map((f) => (
                <div
                  key={f.id}
                  className={`rounded-xl p-2 text-center border transition-all ${
                    f.isClaimed
                      ? "border-emerald-500/40 bg-emerald-950/40"
                      : "border-slate-800 bg-slate-900/40"
                  }`}
                  title={f.isClaimed ? `${f.name} — ${f.ownerName}` : `${f.name} — Available`}
                >
                  <div
                    className="w-8 h-8 rounded-lg mx-auto flex items-center justify-center text-white text-[10px] font-black mb-1 shadow"
                    style={{ backgroundColor: f.primaryColor }}
                  >
                    {f.shortName}
                  </div>
                  <span
                    className={`text-[9px] font-bold ${
                      f.isClaimed ? "text-emerald-400" : "text-slate-500"
                    }`}
                  >
                    {f.isClaimed ? "✓" : "FREE"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-8 text-slate-600 text-[11px] text-center">
            HBL PSL 12 Live Mock Auction · Real-time Multi-Device Platform
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: ADMIN LOGIN
  // ============================================================
  if (mode === "admin") {
    return (
      <div className="min-h-screen bg-[#060d14] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <button
            onClick={() => { setMode("home"); setError(null); }}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-bold mb-6 transition-colors"
          >
            ← Back
          </button>

          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-950/60 to-slate-950/80 p-8 shadow-2xl shadow-amber-900/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <Crown className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Admin Login</h2>
                <p className="text-slate-400 text-xs">PSL Auction Control Room</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {success}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">
                  Admin Password
                </label>
                <input
                  type="password"
                  placeholder="Enter admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 text-white text-sm font-semibold outline-none placeholder-slate-600 transition-colors"
                  autoFocus
                  required
                />
                <p className="text-slate-600 text-[11px] mt-1">Default: admin123</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20"
              >
                {loading ? "Verifying..." : "Enter Admin Room"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: OWNER JOIN (Step 1 — Code, Step 2 — Name)
  // ============================================================
  if (mode === "owner") {
    return (
      <div className="min-h-screen bg-[#060d14] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <button
            onClick={() => {
              setMode("home");
              setError(null);
              setOwnerStep("code");
              setSelectedFranchise(null);
              setOwnerCode("");
              setOwnerName("");
            }}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-bold mb-6 transition-colors"
          >
            ← Back
          </button>

          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/60 to-slate-950/80 p-8 shadow-2xl shadow-emerald-900/20">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                  ownerStep === "code"
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                    : "bg-slate-800 border-slate-700 text-slate-500"
                }`}
              >
                <span>1</span> Team Code
              </div>
              <div className="w-6 h-px bg-slate-700" />
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                  ownerStep === "name"
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                    : ownerStep === "done"
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                    : "bg-slate-800 border-slate-700 text-slate-500"
                }`}
              >
                <span>2</span> Your Name
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
                <button onClick={() => setError(null)} className="ml-auto">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {success}
              </div>
            )}

            {/* STEP 1: Team Code */}
            {ownerStep === "code" && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">Join as Owner</h2>
                    <p className="text-slate-400 text-xs">Enter your team code to continue</p>
                  </div>
                </div>

                <form onSubmit={handleOwnerCodeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">
                      Team Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. IU, KK, LQ, PZ, QG, RPZ, MS, HHK"
                      value={ownerCode}
                      onChange={(e) => setOwnerCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 text-white text-sm font-black uppercase outline-none placeholder-slate-600 tracking-wider transition-colors"
                      autoFocus
                      maxLength={10}
                      required
                    />
                    <p className="text-slate-600 text-[11px] mt-1">
                      Ask your auction admin for the team code
                    </p>
                  </div>

                  {/* Quick team grid */}
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase mb-2">
                      Available Teams
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {franchises.map((f) => (
                        <button
                          type="button"
                          key={f.id}
                          onClick={() => setOwnerCode(f.shortName)}
                          disabled={f.isClaimed && !!f.ownerName}
                          className={`rounded-xl p-2 text-center border text-[10px] font-black transition-all ${
                            f.isClaimed && f.ownerName
                              ? "border-slate-800 bg-slate-900/30 text-slate-600 cursor-not-allowed"
                              : ownerCode === f.shortName
                              ? "border-emerald-500 bg-emerald-950 text-emerald-400"
                              : "border-slate-700 bg-slate-900 text-slate-300 hover:border-emerald-500/50 hover:text-white"
                          }`}
                        >
                          <div
                            className="w-7 h-7 rounded-lg mx-auto flex items-center justify-center text-white text-[10px] font-black mb-1"
                            style={{ backgroundColor: f.primaryColor }}
                          >
                            {f.shortName}
                          </div>
                          <span className="block truncate">{f.shortName}</span>
                          {f.isClaimed && f.ownerName && (
                            <span className="text-[8px] text-slate-500">Taken</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Verify Team Code →
                  </button>
                </form>
              </>
            )}

            {/* STEP 2: Owner Name */}
            {ownerStep === "name" && selectedF && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-lg border-2 border-white/10"
                    style={{ backgroundColor: selectedF.primaryColor }}
                  >
                    {selectedF.shortName}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">{selectedF.name}</h2>
                    <p className="text-slate-400 text-xs">Enter your name to claim ownership</p>
                  </div>
                </div>

                <form onSubmit={handleOwnerNameSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">
                      Your Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ali Khan, Sara Malik"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 text-white text-sm font-semibold outline-none placeholder-slate-600 transition-colors"
                      autoFocus
                      required
                    />
                    <p className="text-slate-600 text-[11px] mt-1">
                      This will be shown during live bidding broadcasts
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setOwnerStep("code"); setError(null); }}
                      className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 font-bold text-xs hover:bg-slate-800 transition-colors"
                    >
                      ← Change Team
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-2 flex-grow py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                    >
                      {loading ? "Joining..." : "Claim & Enter Auction →"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
