"use client";

import React, { useState, useRef } from "react";
import { useAuction } from "@/context/AuctionContext";
import { parseUploadedDocument, ExtractedPlayerRow } from "@/lib/documentParser";
import { Player } from "@/types/auction";
import { formatPKR } from "@/lib/rules";
import {
  FileSpreadsheet,
  UploadCloud,
  FileText,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Download,
  Check,
  RefreshCw,
} from "lucide-react";

export default function PlayerImportPage() {
  const { players, importPlayersList } = useAuction();

  const [extractedRows, setExtractedRows] = useState<ExtractedPlayerRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setSuccessMessage(null);

    try {
      const rows = await parseUploadedDocument(file, players);
      setExtractedRows(rows);
    } catch (err: any) {
      alert("Failed to parse document: " + (err.message || "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateRow = (tempId: string, field: keyof ExtractedPlayerRow, value: any) => {
    setExtractedRows((prev) =>
      prev.map((r) => {
        if (r.tempId === tempId) {
          return { ...r, [field]: value };
        }
        return r;
      })
    );
  };

  const handleDeleteRow = (tempId: string) => {
    setExtractedRows((prev) => prev.filter((r) => r.tempId !== tempId));
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
    }));

    importPlayersList(newPlayers);
    setSuccessMessage(`Successfully imported ${newPlayers.length} players into the live auction pool!`);
    setExtractedRows([]);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadSampleTemplate = () => {
    const headers = "Name,Category,Role,Nationality,BasePrice\n";
    const sample = "Sahibzada Farhan,Gold,Batter,Pakistan,10000000\nFinn Allen,Diamond,Batter,New Zealand,20000000\nUsman Tariq,Emerging,Bowler,Pakistan,2500000\n";
    const blob = new Blob([headers + sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "PSL12_Player_Import_Sample.csv";
    link.click();
  };

  const duplicateCount = extractedRows.filter((r) => r.isDuplicate).length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-emerald-400" /> Player Import & Document Extraction Centre
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            FR-03: Multi-format player document extractor (CSV, XLSX, PDF/DOCX, TXT, JSON) with duplicate detection & editable approval.
          </p>
        </div>

        <button
          onClick={downloadSampleTemplate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
        >
          <Download className="w-4 h-4 text-emerald-400" /> Sample CSV Template
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 flex items-center gap-3 text-xs text-emerald-300 font-bold">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
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
          {fileName ? `Uploaded: ${fileName}` : "Click or Drag Player Document Here"}
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Supported file formats: CSV, XLSX, XLS, JSON, Text. Intelligent column recognition automatically parses names, categories, roles, base prices & nationalities.
        </p>

        {isProcessing && (
          <div className="flex items-center justify-center gap-2 mt-4 text-xs font-bold text-amber-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Extracting and analyzing document records...</span>
          </div>
        )}
      </div>

      {/* Extracted Data Editable Table */}
      {extractedRows.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>Extracted Records ({extractedRows.length} players found)</span>
                {duplicateCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 font-bold">
                    {duplicateCount} Duplicates Detected
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Review and edit player details before finalizing approval into the live auction pool.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setExtractedRows([])}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-red-400"
              >
                Clear All
              </button>
              <button
                onClick={handleApproveImport}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <Check className="w-4 h-4" /> Approve & Import ({extractedRows.length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Nationality</th>
                  <th className="pb-3">Base Price (PKR)</th>
                  <th className="pb-3">Status / Alerts</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {extractedRows.map((row) => (
                  <tr
                    key={row.tempId}
                    className={`hover:bg-slate-800/30 transition-colors ${
                      row.isDuplicate ? "bg-red-950/20" : ""
                    }`}
                  >
                    <td className="py-2.5 pr-2">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => handleUpdateRow(row.tempId, "name", e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white text-xs w-full min-w-[140px] focus:outline-none focus:border-emerald-500"
                      />
                    </td>
                    <td className="py-2.5 pr-2">
                      <select
                        value={row.category}
                        onChange={(e) => handleUpdateRow(row.tempId, "category", e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none"
                      >
                        <option value="Platinum">Platinum</option>
                        <option value="Diamond">Diamond</option>
                        <option value="Gold">Gold</option>
                        <option value="Silver">Silver</option>
                        <option value="Emerging">Emerging</option>
                        <option value="Supplementary">Supplementary</option>
                      </select>
                    </td>
                    <td className="py-2.5 pr-2">
                      <select
                        value={row.role}
                        onChange={(e) => handleUpdateRow(row.tempId, "role", e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none"
                      >
                        <option value="Batter">Batter</option>
                        <option value="Bowler">Bowler</option>
                        <option value="All-Rounder">All-Rounder</option>
                        <option value="Wicketkeeper">Wicketkeeper</option>
                      </select>
                    </td>
                    <td className="py-2.5 pr-2">
                      <input
                        type="text"
                        value={row.nationality}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleUpdateRow(row.tempId, "nationality", val);
                          handleUpdateRow(row.tempId, "isOverseas", val.toLowerCase() !== "pakistan");
                        }}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white text-xs w-28 focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 pr-2">
                      <input
                        type="number"
                        step="500000"
                        value={row.basePrice}
                        onChange={(e) => handleUpdateRow(row.tempId, "basePrice", Number(e.target.value))}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-amber-400 font-mono text-xs w-32 focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 pr-2">
                      {row.isDuplicate ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-400">
                          <AlertTriangle className="w-3.5 h-3.5" /> Duplicate
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" /> Ready
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => handleDeleteRow(row.tempId)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-900 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

