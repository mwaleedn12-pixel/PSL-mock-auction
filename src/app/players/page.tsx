"use client";

import React, { useState, useRef } from "react";
import { useAuction } from "@/context/AuctionContext";
import { Player, PlayerCategory, PlayerRole } from "@/types/auction";
import { formatPKR } from "@/lib/rules";
import { parseUploadedDocument, ExtractedPlayerRow } from "@/lib/documentParser";
import {
  Database,
  Search,
  Plus,
  Bookmark,
  X,
  UploadCloud,
  FileSpreadsheet,
  ArrowLeftRight,
  Download,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Check,
  RefreshCw,
} from "lucide-react";

export default function PlayerCentrePage() {
  const {
    role,
    players,
    franchises,
    activeFranchise,
    authenticatedFranchiseId,
    watchlists,
    toggleWatchlist,
    addPlayer,
    importPlayersList,
    tradeOffers,
    proposeTrade,
    handleTradeAction,
  } = useAuction();

  const [activeTab, setActiveTab] = useState<"database" | "import" | "trade">("database");

  // Database search & filters
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
  const [newPlayerBasePrice, setNewPlayerBasePrice] = useState(11000000);
  const [newPlayerAge, setNewPlayerAge] = useState(22);
  const [newPlayerIsU23Uncapped, setNewPlayerIsU23Uncapped] = useState(false);

  // Import State
  const [extractedRows, setExtractedRows] = useState<ExtractedPlayerRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Trade State
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [fromTeamId, setFromTeamId] = useState(authenticatedFranchiseId || franchises[0]?.id || "iu");
  const [toTeamId, setToTeamId] = useState("kk");
  const [offeredPlayerId, setOfferedPlayerId] = useState("");
  const [requestedPlayerId, setRequestedPlayerId] = useState("");
  const [offeredCash, setOfferedCash] = useState<number>(0);
  const [tradeNotes, setTradeNotes] = useState("");

  const fromSquad = players.filter((p) => p.soldToFranchiseId === fromTeamId);
  const toSquad = players.filter((p) => p.soldToFranchiseId === toTeamId);

  // Filter players
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
      age: Number(newPlayerAge),
      isUnder23: Number(newPlayerAge) <= 23,
      isUncapped: newPlayerIsU23Uncapped,
      photoUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400",
    });

    setNewPlayerName("");
    setIsAddModalOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setImportSuccess(null);

    try {
      const rows = await parseUploadedDocument(file, players);
      setExtractedRows(rows);
    } catch (err: any) {
      alert("Failed to parse document: " + (err.message || "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveImport = () => {
    if (extractedRows.length === 0) return;

    const newPlayers: Player[] = extractedRows.map((r, i) => ({
      id: `imported-${Date.now()}-${i}`,
      name: r.name,
      photoUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400",
      nationality: r.nationality,
      isOverseas: r.isOverseas,
      age: r.age,
      battingStyle: r.battingStyle,
      bowlingStyle: r.bowlingStyle,
      primaryRole: r.role,
      category: r.category,
      basePrice: r.basePrice,
      currentPrice: r.basePrice,
      status: "upcoming",
      auctionRound: 1,
      isUnder23: r.age <= 23,
      isUncapped: !r.isOverseas && r.age <= 23,
    }));

    importPlayersList(newPlayers);
    setImportSuccess(`Imported ${newPlayers.length} players into the auction database!`);
    setExtractedRows([]);
    setFileName(null);
  };

  const handleCreateTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offeredPlayerId || !requestedPlayerId) {
      alert("Please select both offered and requested players.");
      return;
    }

    proposeTrade({
      fromFranchiseId: fromTeamId,
      toFranchiseId: toTeamId,
      offeredPlayerId,
      requestedPlayerId,
      offeredCash: Number(offeredCash) || 0,
      notes: tradeNotes,
    });

    setIsTradeModalOpen(false);
    setTradeNotes("");
    setOfferedCash(0);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Database className="w-7 h-7 text-emerald-400" /> Player Centre
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search player profiles, import documents (Excel/CSV), and manage franchise trade deals.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab("database")}
            className={`px-4 py-2 rounded-xl transition-colors ${
              activeTab === "database"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Database ({players.length})
          </button>
          <button
            onClick={() => setActiveTab("import")}
            className={`px-4 py-2 rounded-xl transition-colors ${
              activeTab === "import"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Document Import
          </button>
          <button
            onClick={() => setActiveTab("trade")}
            className={`px-4 py-2 rounded-xl transition-colors ${
              activeTab === "trade"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Trade Desk ({tradeOffers.length})
          </button>
        </div>
      </div>

      {/* TAB 1: PLAYER DATABASE */}
      {activeTab === "database" && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search player name or nationality..."
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
                <option value="Platinum">Platinum (4.2 Cr)</option>
                <option value="Diamond">Diamond (2.2 Cr)</option>
                <option value="Gold">Gold (1.1 Cr)</option>
                <option value="Silver">Silver (60 Lakh)</option>
                <option value="Emerging">Emerging (60 Lakh)</option>
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
              </select>

              {role === "admin" && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Player
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPlayers.map((player) => {
              const winningTeam = franchises.find((f) => f.id === player.soldToFranchiseId);
              const isWatchlisted =
                activeFranchise &&
                watchlists.some((w) => w.franchiseId === activeFranchise.id && w.playerId === player.id);

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

                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950/80 text-amber-400 border border-slate-800">
                          {player.category}
                        </span>
                        {player.isUnder23 && player.isUncapped && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/80 text-slate-950">
                            U23
                          </span>
                        )}
                      </div>

                      {activeFranchise && (
                        <div className="absolute top-2 right-2">
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
                        </div>
                      )}

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
            })}
          </div>
        </div>
      )}

      {/* TAB 2: DOCUMENT IMPORT */}
      {activeTab === "import" && (
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-900/60 hover:bg-slate-900/90 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv, .xlsx, .xls, .json, .txt"
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <UploadCloud className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-black text-white">
              {fileName ? `Selected: ${fileName}` : "Upload Player Document (Excel, CSV, Scans)"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Automated extraction recognizes names, categories, roles, base prices, and Under-23 status.
            </p>

            {isProcessing && (
              <div className="flex items-center justify-center gap-2 mt-4 text-xs font-bold text-amber-400">
                <RefreshCw className="w-4 h-4 animate-spin" /> Extracting records...
              </div>
            )}
          </div>

          {importSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 flex items-center gap-2 text-xs text-emerald-300 font-bold">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>{importSuccess}</span>
            </div>
          )}

          {extractedRows.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-black text-white">
                  Extracted Records ({extractedRows.length} found)
                </h3>
                <button
                  onClick={handleApproveImport}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider"
                >
                  Approve & Import to Queue
                </button>
              </div>

              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                      <th className="pb-2">Name</th>
                      <th className="pb-2">Category</th>
                      <th className="pb-2">Role</th>
                      <th className="pb-2">Nationality</th>
                      <th className="pb-2">Base Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {extractedRows.map((r) => (
                      <tr key={r.tempId}>
                        <td className="py-2 font-bold text-white">{r.name}</td>
                        <td className="py-2 text-slate-300">{r.category}</td>
                        <td className="py-2 text-slate-300">{r.role}</td>
                        <td className="py-2 text-slate-300">{r.nationality}</td>
                        <td className="py-2 font-mono text-amber-400">{formatPKR(r.basePrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TRADE DESK */}
      {activeTab === "trade" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Franchise player transfers and player-plus-money proposals with Administrator approval.
            </p>
            <button
              onClick={() => setIsTradeModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" /> Propose Trade
            </button>
          </div>

          <div className="space-y-3">
            {tradeOffers.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-500 text-xs">
                No active trade proposals. Click &ldquo;Propose Trade&rdquo; to initiate a deal!
              </div>
            ) : (
              tradeOffers.map((t) => {
                const fromTeam = franchises.find((f) => f.id === t.fromFranchiseId);
                const toTeam = franchises.find((f) => f.id === t.toFranchiseId);
                const offPlayer = players.find((p) => p.id === t.offeredPlayerId);
                const reqPlayer = players.find((p) => p.id === t.requestedPlayerId);

                return (
                  <div key={t.id} className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{fromTeam?.shortName} offers {offPlayer?.name}</span>
                      <span className="text-slate-500"> ➔ </span>
                      <span className="font-bold text-amber-400">For {toTeam?.shortName}&apos;s {reqPlayer?.name}</span>
                      {t.offeredCash ? <span className="text-emerald-400 font-mono"> (+{formatPKR(t.offeredCash)})</span> : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-800 text-slate-300">
                        {t.status}
                      </span>
                      {role === "admin" && t.status === "pending" && (
                        <button
                          onClick={() => handleTradeAction(t.id, "admin_approve")}
                          className="px-3 py-1 bg-emerald-500 text-slate-950 font-black rounded-lg text-[11px]"
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Add Player Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Add Player to Auction</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePlayer} className="space-y-3.5 my-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Player Full Name</label>
                <input
                  type="text"
                  required
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Category</label>
                  <select
                    value={newPlayerCategory}
                    onChange={(e) => setNewPlayerCategory(e.target.value as PlayerCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Platinum">Platinum (4.2 Cr)</option>
                    <option value="Diamond">Diamond (2.2 Cr)</option>
                    <option value="Gold">Gold (1.1 Cr)</option>
                    <option value="Silver">Silver (60 Lakh)</option>
                    <option value="Emerging">Emerging (60 Lakh)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Role</label>
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Age</label>
                  <input
                    type="number"
                    value={newPlayerAge}
                    onChange={(e) => setNewPlayerAge(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Base Price</label>
                  <input
                    type="number"
                    value={newPlayerBasePrice}
                    onChange={(e) => setNewPlayerBasePrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="u23"
                  checked={newPlayerIsU23Uncapped}
                  onChange={(e) => setNewPlayerIsU23Uncapped(e.target.checked)}
                />
                <label htmlFor="u23" className="text-slate-300 font-semibold cursor-pointer">
                  Eligible as Uncapped Under-23 Player (Section 7)
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black uppercase tracking-wider mt-2"
              >
                Save Player
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Propose Trade Modal */}
      {isTradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white">Propose Player Trade Deal</h3>
              <button onClick={() => setIsTradeModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTrade} className="space-y-3.5 my-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Your Franchise</label>
                  <select
                    value={fromTeamId}
                    onChange={(e) => setFromTeamId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {franchises.map((f) => (
                      <option key={f.id} value={f.id}>{f.shortName}</option>
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
                    {franchises.filter((f) => f.id !== fromTeamId).map((f) => (
                      <option key={f.id} value={f.id}>{f.shortName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">You Offer</label>
                  <select
                    value={offeredPlayerId}
                    onChange={(e) => setOfferedPlayerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="">Select player...</option>
                    {fromSquad.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">You Request</label>
                  <select
                    value={requestedPlayerId}
                    onChange={(e) => setRequestedPlayerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="">Select player...</option>
                    {toSquad.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black uppercase tracking-wider mt-2"
              >
                Send Proposal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
