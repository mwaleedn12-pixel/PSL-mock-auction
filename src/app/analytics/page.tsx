"use client";

import React from "react";
import { useAuction } from "@/context/AuctionContext";
import { formatPKR } from "@/lib/rules";
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
} from "lucide-react";

export default function AnalyticsDashboardPage() {
  const { franchises, players } = useAuction();

  // 1. Franchise Spending Bar Chart Data
  const franchiseSpendingData = franchises.map((f) => {
    const spent = (f.initialPurse - f.remainingPurse) / 10000000; // in Crore
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
    value: Number((amount / 10000000).toFixed(2)), // in Crore
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

  // 4. Role-wise Spending
  const roleSpendingMap: Record<string, number> = {};
  players
    .filter((p) => p.status === "sold" || p.status === "retained" || p.status === "direct_signing")
    .forEach((p) => {
      const role = p.primaryRole;
      roleSpendingMap[role] = (roleSpendingMap[role] || 0) + (p.soldPrice || p.basePrice);
    });

  const roleBarData = Object.entries(roleSpendingMap).map(([role, amount]) => ({
    role,
    amount: Number((amount / 10000000).toFixed(2)),
  }));

  // Top 10 Buys
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

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-emerald-400" /> Auction Analytics & Franchise Comparisons
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          FR-17, FR-18, FR-19: Comprehensive financial breakdowns, role distribution, overseas ratios, and top player purchases.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Average Player Price</span>
          <p className="text-2xl font-black text-white mt-1">{formatPKR(avgSoldPrice)}</p>
          <span className="text-xs text-slate-500 mt-1 block">Across {totalSold} sold players</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Domestic Spending</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{formatPKR(localSpending)}</p>
          <span className="text-xs text-slate-500 mt-1 block">Local talent acquisition</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Overseas Spending</span>
          <p className="text-2xl font-black text-blue-400 mt-1">{formatPKR(overseasSpending)}</p>
          <span className="text-xs text-slate-500 mt-1 block">International superstars</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Top Single Purchase</span>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {topBuys[0] ? formatPKR(topBuys[0].soldPrice || 0) : "PKR 0"}
          </p>
          <span className="text-xs text-slate-500 mt-1 block truncate">
            {topBuys[0]?.name || "None yet"}
          </span>
        </div>
      </div>

      {/* Charts Grid */}
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

        {/* Chart 2: Category-wise Spending */}
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

        {/* Chart 3: Domestic vs Overseas Expenditure */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" /> Domestic vs Overseas Investment
          </h3>
          <div className="h-72 w-full flex items-center justify-center">
            {localSpending === 0 && overseasSpending === 0 ? (
              <p className="text-slate-500 text-xs">No acquisitions finalized yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={originPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    dataKey="value"
                    label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}
                  >
                    {originPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ORIGIN_COLORS[index % ORIGIN_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0b1215", borderColor: "#1f323e", borderRadius: "12px", fontSize: "12px" }}
                    formatter={(val: number) => [`${val} Crore PKR`, ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 4: Spending by Primary Role */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" /> Spending Across Playing Roles
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleBarData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="role" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit=" Cr" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0b1215", borderColor: "#1f323e", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(val: number) => [`${val} Cr`, "Spent"]}
                />
                <Bar dataKey="amount" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Expenditure (Cr)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Buys Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="text-lg font-black text-white flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-amber-400" /> Most Expensive Player Signings
        </h3>
        <div className="overflow-x-auto">
          {topBuys.length === 0 ? (
            <p className="text-slate-500 text-xs py-6 text-center">No players sold yet.</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                  <th className="pb-3">Rank</th>
                  <th className="pb-3">Player</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Purchased By</th>
                  <th className="pb-3 text-right">Winning Bid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {topBuys.map((player, idx) => {
                  const team = franchises.find((f) => f.id === player.soldToFranchiseId);
                  return (
                    <tr key={player.id} className="hover:bg-slate-800/30">
                      <td className="py-3 font-mono font-bold text-amber-400">#{idx + 1}</td>
                      <td className="py-3 font-bold text-white flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={player.photoUrl}
                          alt={player.name}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <span>{player.name}</span>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded font-black text-[10px] bg-slate-800 text-slate-300">
                          {player.category}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">{player.primaryRole}</td>
                      <td className="py-3 font-semibold text-emerald-400">
                        {team ? `${team.name} (${team.shortName})` : "N/A"}
                      </td>
                      <td className="py-3 text-right font-mono font-black text-amber-400 text-sm">
                        {formatPKR(player.soldPrice || 0)}
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
