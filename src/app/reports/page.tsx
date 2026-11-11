"use client";

import React, { useState } from "react";
import { useAuction } from "@/context/AuctionContext";
import { exportAuctionToExcel, exportAuctionToCSV, generateAuctionPDF } from "@/lib/export";
import { formatPKR } from "@/lib/rules";
import {
  FileText,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  History,
  CheckCircle,
  XCircle,
  Slash,
  LogOut,
  Gavel,
  Shield,
} from "lucide-react";

export default function ReportsAndExportPage() {
  const { franchises, players, eventLogs, settings } = useAuction();

  const [logFilter, setLogFilter] = useState<string>("all");
  const [logSearch, setLogSearch] = useState<string>("");

  const filteredLogs = eventLogs.filter((log) => {
    if (logFilter !== "all" && log.type !== logFilter) return false;
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase();
      const matchDesc = log.description.toLowerCase().includes(q);
      const matchTeam = log.franchiseName?.toLowerCase().includes(q);
      const matchPlayer = log.playerName?.toLowerCase().includes(q);
      if (!matchDesc && !matchTeam && !matchPlayer) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-emerald-400" /> Final Reports & Audit Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            FR-21, FR-22: Export official tournament squads, financial ledgers, and comprehensive timestamped activity logs.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportAuctionToExcel(franchises, players, eventLogs, "PSL12_Mock_Auction_Report")}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-emerald-600/20"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel (.xlsx)
          </button>
          <button
            onClick={() => exportAuctionToCSV(players)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors border border-slate-700"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Export CSV
          </button>
          <button
            onClick={() => generateAuctionPDF(franchises, players, "PSL12_Official_Mock_Auction_Report")}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors shadow"
          >
            <FileText className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Logged Events</span>
          <p className="text-2xl font-black text-white mt-1">{eventLogs.length}</p>
          <span className="text-xs text-slate-500 mt-1 block">Every bid, pass, and sale captured</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Completed Signings</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {players.filter((p) => p.status === "sold" || p.status === "retained" || p.status === "direct_signing").length}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Ready for official PSL 12 season</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Capital Deployed</span>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {formatPKR(franchises.reduce((sum, f) => sum + (f.initialPurse - f.remainingPurse), 0))}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Across all franchise squads</span>
        </div>
      </div>

      {/* Audit Log Table & Filters */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-black text-white">Auction Activity Log & Replay</h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Filter logs..."
                className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <select
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Events</option>
              <option value="bid">Bids Only</option>
              <option value="sold">Sold Players</option>
              <option value="unsold">Unsold Players</option>
              <option value="skip">Skips / Passes</option>
              <option value="out">Out / Withdrawals</option>
              <option value="trade">Trades</option>
              <option value="retention">Retentions</option>
              <option value="admin">Admin Actions</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          {filteredLogs.length === 0 ? (
            <p className="text-center py-12 text-slate-500 text-xs">
              No audit log entries matching criteria.
            </p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Event Type</th>
                  <th className="pb-3">Franchise</th>
                  <th className="pb-3">Player</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.map((log) => {
                  const badgeConfig: Record<string, { bg: string; text: string }> = {
                    bid: { bg: "bg-blue-500/20", text: "text-blue-400" },
                    sold: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
                    unsold: { bg: "bg-red-500/20", text: "text-red-400" },
                    skip: { bg: "bg-amber-500/20", text: "text-amber-400" },
                    out: { bg: "bg-rose-500/20", text: "text-rose-400" },
                    trade: { bg: "bg-purple-500/20", text: "text-purple-400" },
                    retention: { bg: "bg-teal-500/20", text: "text-teal-400" },
                    admin: { bg: "bg-slate-700/40", text: "text-slate-300" },
                  };
                  const badge = badgeConfig[log.type] || badgeConfig.admin;

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 font-mono text-slate-400 text-[11px]">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${badge.bg} ${badge.text}`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="py-2.5 font-bold text-white">
                        {log.franchiseName || "-"}
                      </td>
                      <td className="py-2.5 text-slate-300">
                        {log.playerName || "-"}
                      </td>
                      <td className="py-2.5 font-mono text-amber-400 font-bold">
                        {log.amount ? formatPKR(log.amount) : "-"}
                      </td>
                      <td className="py-2.5 text-slate-400 max-w-xs truncate">
                        {log.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

