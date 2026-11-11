"use client";

import React, { useState } from "react";
import { useAuction } from "@/context/AuctionContext";
import { formatPKR } from "@/lib/rules";
import { exportAuctionToExcel, exportAuctionToCSV, generateAuctionPDF } from "@/lib/export";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Award,
  Globe,
  DollarSign,
  PieChart as PieIcon,
  Shield,
  Layers,
  FileSpreadsheet,
  Download,
  FileText,
  History,
  Search,
} from "lucide-react";

export default function AnalyticsAndReportsPage() {
  const { franchises, players, eventLogs } = useAuction();

  const [logFilter, setLogFilter] = useState<string>("all");
  const [logSearch, setLogSearch] = useState<string>("");

  // 1. Franchise Spending Bar Chart Data
  const franchiseSpendingData = franchises.map((f) => {
    const spent = (f.initialPurse - f.remainingPurse) / 10000000;
    const remaining = f.remainingPurse / 10000000;
    return {
      name: f.shortName,
      fullName: f.name,
      Spent: Number(spent.toFixed(2)),
      Remaining: Number(remaining.toFixed(2)),
    };
  });

  // 2. Spending by Category Pie Chart Data
  const categorySpendingMap: Record<string, number> = {};
  players
    .filter((p) => p.status === "sold" || p.status === "retained" || p.status === "direct_signing")
    .forEach((p) => {
      const cat = p.category;
      categorySpendingMap[cat] = (categorySpendingMap[cat] || 0) + (p.soldPrice || p.basePrice);
    });

  const categoryPieData = Object.entries(categorySpendingMap).map(([category, amount]) => ({
    name: category,
    value: Number((amount / 10000000).toFixed(2)),
  }));

  const CATEGORY_COLORS = ["#a855f7", "#06b6d4", "#f59e0b", "#94a3b8", "#10b981", "#3b82f6"];

  // 3. Domestic vs Overseas Spending
  let localSpending = 0;
  let overseasSpending = 0;
  players
    .filter((p) => p.status === "sold" || p.status === "retained" || p.status === "direct_signing")
    .forEach((p) => {
      const price = p.soldPrice || p.basePrice;
      if (p.isOverseas) {
        overseasSpending += price;
      } else {
        localSpending += price;
      }
    });

  const originPieData = [
    { name: "Domestic (Pakistan)", value: Number((localSpending / 10000000).toFixed(2)) },
    { name: "Overseas", value: Number((overseasSpending / 10000000).toFixed(2)) },
  ];
  const ORIGIN_COLORS = ["#10b981", "#3b82f6"];

  // Top 8 Buys
  const topBuys = [...players]
    .filter((p) => p.status === "sold" && p.soldPrice)
    .sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0))
    .slice(0, 8);

  const totalSold = players.filter((p) => p.status === "sold").length;
  const avgSoldPrice =
    totalSold > 0
      ? players
          .filter((p) => p.status === "sold")
          .reduce((sum, p) => sum + (p.soldPrice || 0), 0) / totalSold
      : 0;

  // Filtered Logs
  const filteredLogs = eventLogs.filter((log) => {
    if (logFilter !== "all" && log.type !== logFilter) return false;
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase();
      return (
        log.description.toLowerCase().includes(q) ||
        (log.franchiseName && log.franchiseName.toLowerCase().includes(q)) ||
        (log.playerName && log.playerName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Top Header with Export Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-emerald-400" /> Auction Reports & Financial Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Section 14: Comprehensive purse audits, category breakdowns, and export to Excel, CSV & PDF.
          </p>
        </div>

        {/* Quick Export Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportAuctionToExcel(franchises, players, eventLogs, "PSL_Mock_Auction_Report")}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-emerald-600/20"
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel (.xlsx)
          </button>
          <button
            onClick={() => exportAuctionToCSV(players)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors border border-slate-700"
          >
            <Download className="w-4 h-4 text-emerald-400" /> CSV
          </button>
          <button
            onClick={() => generateAuctionPDF(franchises, players, "PSL_Mock_Auction_Report")}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors shadow"
          >
            <FileText className="w-4 h-4" /> PDF Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Average Player Price</span>
          <p className="text-2xl font-black text-white mt-1">{formatPKR(avgSoldPrice)}</p>
          <span className="text-xs text-slate-500 mt-1 block">Across {totalSold} sold players</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Domestic Spending</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{formatPKR(localSpending)}</p>
          <span className="text-xs text-slate-500 mt-1 block">Local Pakistani talent</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Overseas Spending</span>
          <p className="text-2xl font-black text-blue-400 mt-1">{formatPKR(overseasSpending)}</p>
          <span className="text-xs text-slate-500 mt-1 block">International superstars</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Top Buy</span>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {topBuys[0] ? formatPKR(topBuys[0].soldPrice || 0) : "PKR 0"}
          </p>
          <span className="text-xs text-slate-500 mt-1 block truncate">
            {topBuys[0]?.name || "None yet"}
          </span>
        </div>
      </div>

      {/* Recharts Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Franchise Purse Spent vs Remaining */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Franchise Purse Utilization (Crore PKR)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={franchiseSpendingData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit=" Cr" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0b1215", borderColor: "#1f323e", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(val: number) => [`${val} Cr`, ""]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="Spent" fill="#10b981" radius={[4, 4, 0, 0]} name="Purse Spent (Cr)" />
                <Bar dataKey="Remaining" fill="#334155" radius={[4, 4, 0, 0]} name="Purse Remaining (Cr)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Spending */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-amber-400" /> Expenditure by Player Category
          </h3>
          <div className="h-72 w-full flex items-center justify-center">
            {categoryPieData.length === 0 ? (
              <p className="text-slate-500 text-xs">No player acquisitions yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0b1215", borderColor: "#1f323e", borderRadius: "12px", fontSize: "12px" }}
                    formatter={(val: number) => [`${val} Crore PKR`, "Expenditure"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Activity Audit Log */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-black text-white">Live Activity Audit Log ({eventLogs.length})</h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search activity..."
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
              <option value="sold">Sold</option>
              <option value="unsold">Unsold</option>
              <option value="skip">Pass/Skip</option>
              <option value="out">Out/Withdraw</option>
              <option value="trade">Trades</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-72">
          {filteredLogs.length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-xs">No activity logged yet.</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Franchise</th>
                  <th className="pb-2">Player</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="py-2 font-mono text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-800 text-slate-300">
                        {log.type}
                      </span>
                    </td>
                    <td className="py-2 font-bold text-white">{log.franchiseName || "-"}</td>
                    <td className="py-2 text-slate-300">{log.playerName || "-"}</td>
                    <td className="py-2 font-mono text-amber-400 font-bold">
                      {log.amount ? formatPKR(log.amount) : "-"}
                    </td>
                    <td className="py-2 text-slate-400 max-w-xs truncate">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
