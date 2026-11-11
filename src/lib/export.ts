import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Franchise, Player, AuctionEventLog } from "@/types/auction";
import { formatPKR } from "./rules";

export function exportAuctionToExcel(
  franchises: Franchise[],
  players: Player[],
  eventLogs: AuctionEventLog[],
  auctionTitle: string = "PSL 12 Mock Auction Final Report"
) {
  const wb = XLSX.utils.book_new();

  // 1. Franchise Summary Sheet
  const franchiseData = franchises.map((f) => {
    const squad = players.filter((p) => p.soldToFranchiseId === f.id);
    const overseas = squad.filter((p) => p.isOverseas).length;
    const spent = f.initialPurse - f.remainingPurse;
    return {
      "Franchise": f.name,
      "Short Code": f.shortName,
      "Owner": f.ownerName,
      "Initial Purse (PKR)": f.initialPurse,
      "Remaining Purse (PKR)": f.remainingPurse,
      "Total Spent (PKR)": spent,
      "Squad Count": squad.length,
      "Overseas Count": overseas,
      "Remaining Purse (Formatted)": formatPKR(f.remainingPurse),
      "Total Spent (Formatted)": formatPKR(spent),
    };
  });
  const wsFranchises = XLSX.utils.json_to_sheet(franchiseData);
  XLSX.utils.book_append_sheet(wb, wsFranchises, "Franchise Summary");

  // 2. All Players Sheet
  const playerData = players.map((p) => {
    const franchise = franchises.find((f) => f.id === p.soldToFranchiseId);
    return {
      "Player ID": p.id,
      "Player Name": p.name,
      "Category": p.category,
      "Role": p.primaryRole,
      "Nationality": p.nationality,
      "Overseas": p.isOverseas ? "Yes" : "No",
      "Base Price (PKR)": p.basePrice,
      "Sold Price (PKR)": p.soldPrice || 0,
      "Status": p.status.toUpperCase(),
      "Sold To": franchise ? franchise.name : "N/A",
      "Base Price (Formatted)": formatPKR(p.basePrice),
      "Sold Price (Formatted)": p.soldPrice ? formatPKR(p.soldPrice) : "N/A",
    };
  });
  const wsPlayers = XLSX.utils.json_to_sheet(playerData);
  XLSX.utils.book_append_sheet(wb, wsPlayers, "All Players");

  // 3. Squads by Franchise Sheet
  const squadRows: Array<Record<string, string | number>> = [];
  franchises.forEach((f) => {
    const squad = players.filter((p) => p.soldToFranchiseId === f.id);
    squad.forEach((p, idx) => {
      squadRows.push({
        "Franchise": f.name,
        "No.": idx + 1,
        "Player Name": p.name,
        "Role": p.primaryRole,
        "Category": p.category,
        "Nationality": p.nationality,
        "Overseas": p.isOverseas ? "Yes" : "No",
        "Purchase Price": formatPKR(p.soldPrice || p.basePrice),
        "Is Retained/Direct": p.isRetained ? "Retained" : p.isDirectSigning ? "Direct Signing" : "Auction Buy"
      });
    });
  });
  const wsSquads = XLSX.utils.json_to_sheet(squadRows);
  XLSX.utils.book_append_sheet(wb, wsSquads, "Team Squads");

  // 4. Audit Log Sheet
  const logRows = eventLogs.map((log) => ({
    "Time": new Date(log.timestamp).toLocaleTimeString(),
    "Type": log.type.toUpperCase(),
    "Franchise": log.franchiseName || "-",
    "Player": log.playerName || "-",
    "Amount": log.amount ? formatPKR(log.amount) : "-",
    "Description": log.description,
  }));
  const wsLogs = XLSX.utils.json_to_sheet(logRows);
  XLSX.utils.book_append_sheet(wb, wsLogs, "Audit Log");

  // Write and trigger download
  XLSX.writeFile(wb, `${auctionTitle.replace(/\s+/g, "_")}.xlsx`);
}

export function exportAuctionToCSV(players: Player[], filename: string = "PSL12_Auction_Players.csv") {
  const headers = ["Player ID", "Name", "Category", "Role", "Nationality", "Overseas", "Base Price", "Sold Price", "Status", "Sold To"];
  const rows = players.map((p) => [
    p.id,
    `"${p.name}"`,
    p.category,
    p.primaryRole,
    p.nationality,
    p.isOverseas ? "Yes" : "No",
    p.basePrice,
    p.soldPrice || 0,
    p.status,
    `"${p.soldToFranchiseId || 'Unsold'}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateAuctionPDF(
  franchises: Franchise[],
  players: Player[],
  auctionTitle: string = "PSL 12 Automated Mock Auction Final Report"
) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.setTextColor(16, 185, 129); // emerald green
  doc.text("PAKISTAN SUPER LEAGUE 12", 14, 20);

  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text("Official Mock Auction Summary & Final Squads", 14, 28);

  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 34);

  // Franchise Summary Table
  const franchiseRows = franchises.map((f) => {
    const squad = players.filter((p) => p.soldToFranchiseId === f.id);
    const spent = f.initialPurse - f.remainingPurse;
    return [
      f.name,
      f.ownerName,
      `${squad.length} (${squad.filter((p) => p.isOverseas).length} OS)`,
      formatPKR(spent),
      formatPKR(f.remainingPurse),
    ];
  });

  autoTable(doc, {
    startY: 40,
    head: [["Franchise", "Owner", "Squad (Overseas)", "Purse Spent", "Remaining Purse"]],
    body: franchiseRows,
    theme: "striped",
    headStyles: { fillColor: [16, 185, 129] },
  });

  // Top Buys Table
  const topBuys = [...players]
    .filter((p) => p.status === "sold" && p.soldPrice)
    .sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0))
    .slice(0, 8);

  const topBuyRows = topBuys.map((p, i) => {
    const team = franchises.find((f) => f.id === p.soldToFranchiseId)?.name || "Unknown";
    return [
      `#${i + 1} ${p.name}`,
      p.category,
      p.primaryRole,
      p.nationality,
      team,
      formatPKR(p.soldPrice || 0),
    ];
  });

  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 100;

  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text("Top Auction Buys (Highest Value Players)", 14, finalY + 12);

  autoTable(doc, {
    startY: finalY + 16,
    head: [["Player", "Category", "Role", "Nationality", "Winning Franchise", "Final Price"]],
    body: topBuyRows,
    theme: "grid",
    headStyles: { fillColor: [245, 158, 11] }, // Gold
  });

  doc.save(`${auctionTitle.replace(/\s+/g, "_")}.pdf`);
}

