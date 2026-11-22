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
  Trophy,
  Sparkles,
  Zap,
  CheckCircle,
  AlertCircle,
  Scale,
} from "lucide-react";

export default function AnalyticsAndReportsPage() {
  const { franchises, players, eventLogs, themeMode } = useAuction();

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

  // Top Buys
  const soldList = players.filter((p) => p.status === "sold" && p.soldPrice);
  const sortedSold = [...soldList].sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0));
  const topBuys = sortedSold.slice(0, 8);

  const totalSold = soldList.length;
  const avgSoldPrice =
    totalSold > 0 ? soldList.reduce((sum, p) => sum + (p.soldPrice || 0), 0) / totalSold : 0;

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

  // 4. Franchise Squad Depth & Balance Analysis (Section 12)
  const squadAnalysis = franchises.map((f) => {
    const squad = players.filter((p) => p.soldToFranchiseId === f.id);
    const battersCount = squad.filter((p) => p.primaryRole === "Batter").length;
    const bowlersCount = squad.filter((p) => p.primaryRole === "Bowler").length;
    const allroundersCount = squad.filter((p) => p.primaryRole === "All-Rounder").length;
    const keepersCount = squad.filter((p) => p.primaryRole === "Wicketkeeper").length;
    const overseasCount = squad.filter((p) => p.isOverseas).length;

    // Algorithmic ratings (out of 10)
    const battingRating = Math.min(10, Number((battersCount * 2 + allroundersCount * 1).toFixed(1)));
    const bowlingRating = Math.min(10, Number((bowlersCount * 2 + allroundersCount * 0.8).toFixed(1)));
    const balanceRating = Math.min(
      10,
      Number(
        (
          (battersCount > 0 ? 2.5 : 0) +
          (bowlersCount > 0 ? 2.5 : 0) +
          (allroundersCount > 0 ? 2.5 : 0) +
          (keepersCount > 0 ? 2.5 : 0)
        ).toFixed(1)
      )
    );
    const spent = f.initialPurse - f.remainingPurse;
    const efficiency = squad.length > 0 ? Number(((spent / 10000000) / squad.length).toFixed(2)) : 0;

    return {
      franchise: f,
      squadCount: squad.length,
      battersCount,
      bowlersCount,
      allroundersCount,
      keepersCount,
      overseasCount,
      battingRating,
      bowlingRating,
      balanceRating,
      efficiency,
    };
  });

  // 5. Auction Awards Calculation (Section 12)
  const mostExpensivePlayer = sortedSold[0] || null;
  const mostExpensiveTeam = mostExpensivePlayer
    ? franchises.find((f) => f.id === mostExpensivePlayer.soldToFranchiseId)
    : null;

  // Biggest bargain: Sold at base price or lowest ratio to runs/wickets
  const bargains = [...soldList].sort(
    (a, b) => (a.soldPrice || a.basePrice) - (b.soldPrice || b.basePrice)
  );
  const biggestBargain = bargains[0] || null;
  const bargainTeam = biggestBargain
    ? franchises.find((f) => f.id === biggestBargain.soldToFranchiseId)
    : null;

  // Best balanced squad: highest balance rating
  const balancedSquadEntry = [...squadAnalysis].sort((a, b) => b.balanceRating - a.balanceRating)[0] || null;

  const isDark = themeMode !== "stadium_light";

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Disclaimer Notice Banner */}
      <div className="p-3 px-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-300">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <p>
          <strong>Notice:</strong> All squad strength ratings, player valuations, and auction awards are algorithmic estimates for analytical benchmarking and do not represent official tournament outcomes.
        </p>
      </div>

      {/* Top Header with Export Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-emerald-400" /> Post-Auction Analytics &amp; Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Section 12: In-depth franchise comparisons, squad depth meters, visual charts, and auction honors.
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
          <p className="text-2xl font-black text-white mt-1 font-mono">{formatPKR(avgSoldPrice)}</p>
          <span className="text-xs text-slate-500 mt-1 block">Across {totalSold} sold players</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Domestic Spending</span>
          <p className="text-2xl font-black text-emerald-400 mt-1 font-mono">{formatPKR(localSpending)}</p>
          <span className="text-xs text-slate-500 mt-1 block">Local Pakistani talent</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Overseas Spending</span>
          <p className="text-2xl font-black text-cyan-400 mt-1 font-mono">{formatPKR(overseasSpending)}</p>
          <span className="text-xs text-slate-500 mt-1 block">International stars</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Most Expensive Buy</span>
          <p className="text-2xl font-black text-amber-400 mt-1 font-mono">
            {topBuys[0] ? formatPKR(topBuys[0].soldPrice || 0) : "PKR 0"}
          </p>
          <span className="text-xs text-slate-400 mt-1 block truncate">
            {topBuys[0]?.name || "None yet"}
          </span>
        </div>
      </div>

      {/* SECTION 12: AUCTION AWARDS SHOWCASE */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          <h2 className="text-xl font-black text-white tracking-tight">HBL PSL 12 Official Mock Auction Honors &amp; Awards</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Award 1 */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 fill-amber-400" /> Most Expensive Player
              </span>
              <span className="text-xs font-mono text-amber-300 font-black">
                {mostExpensivePlayer ? formatPKR(mostExpensivePlayer.soldPrice || 0) : "—"}
              </span>
            </div>
            <p className="text-lg font-black text-white">{mostExpensivePlayer ? mostExpensivePlayer.name : "Awaiting Sales"}</p>
            <p className="text-xs text-slate-400">
              Acquired by: <strong className="text-amber-300">{mostExpensiveTeam?.name || "N/A"}</strong>
            </p>
          </div>

          {/* Award 2 */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Biggest Bargain
              </span>
              <span className="text-xs font-mono text-emerald-300 font-black">
                {biggestBargain ? formatPKR(biggestBargain.soldPrice || biggestBargain.basePrice) : "—"}
              </span>
            </div>
            <p className="text-lg font-black text-white">{biggestBargain ? biggestBargain.name : "Awaiting Sales"}</p>
            <p className="text-xs text-slate-400">
              Secured by: <strong className="text-emerald-300">{bargainTeam?.name || "N/A"}</strong>
            </p>
          </div>

          {/* Award 3 */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/40 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-purple-400" /> Most Balanced Squad
              </span>
              <span className="text-xs font-mono text-purple-300 font-black">
                {balancedSquadEntry ? `${balancedSquadEntry.balanceRating}/10` : "—"}
              </span>
            </div>
            <p className="text-lg font-black text-white">{balancedSquadEntry ? balancedSquadEntry.franchise.name : "TBD"}</p>
            <p className="text-xs text-slate-400">
              Optimal balance of batting depth, pace, spin &amp; keeping.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 12: FRANCHISE COMPARISON MATRIX (STRENGTH, DEPTH, BALANCE) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" /> Franchise Squad Strength &amp; Positional Depth Ratings
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparative analysis of batting depth, bowling arsenals, all-round utility, and capital efficiency.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">Franchise</th>
                <th className="p-3 text-center">Squad Size</th>
                <th className="p-3 text-center">Batters</th>
                <th className="p-3 text-center">Bowlers</th>
                <th className="p-3 text-center">All-Round</th>
                <th className="p-3 text-center">Keepers</th>
                <th className="p-3 text-center">Batting Depth</th>
                <th className="p-3 text-center">Bowling Depth</th>
                <th className="p-3 text-center">Balance Rating</th>
                <th className="p-3 text-right">Avg Cost/Player</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {squadAnalysis.map((entry) => (
                <tr key={entry.franchise.id} className="hover:bg-slate-800/40">
                  <td className="p-3 flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: entry.franchise.primaryColor }}
                    />
                    <strong className="text-white">{entry.franchise.name}</strong>
                  </td>
                  <td className="p-3 text-center font-bold text-slate-200">{entry.squadCount}</td>
                  <td className="p-3 text-center text-slate-300">{entry.battersCount}</td>
                  <td className="p-3 text-center text-cyan-400">{entry.bowlersCount}</td>
                  <td className="p-3 text-center text-amber-400">{entry.allroundersCount}</td>
                  <td className="p-3 text-center text-emerald-400">{entry.keepersCount}</td>
                  <td className="p-3 text-center">
                    <span className="font-mono font-bold text-amber-400">{entry.battingRating} / 10</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="font-mono font-bold text-cyan-400">{entry.bowlingRating} / 10</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="font-mono font-bold text-emerald-400">{entry.balanceRating} / 10</span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-200">
                    {entry.efficiency > 0 ? `${entry.efficiency} Cr` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Charts */}
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
    </div>
  );
}
