import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Player, PlayerCategory, PlayerRole } from "@/types/auction";

export interface ExtractedPlayerRow {
  tempId: string;
  name: string;
  role: PlayerRole;
  category: PlayerCategory;
  nationality: string;
  isOverseas: boolean;
  basePrice: number;
  age: number;
  battingStyle: string;
  bowlingStyle: string;
  isDuplicate?: boolean;
  hasErrors?: boolean;
  errorMessages?: string[];
}

// Normalize base price string or number to PKR number
export function parsePriceToNumber(raw: string | number | undefined): number {
  if (typeof raw === "number") return raw;
  if (!raw) return 2500000;
  const s = raw.toString().toLowerCase().trim();
  if (s.includes("cr")) {
    const num = parseFloat(s.replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 35000000 : Math.round(num * 10000000);
  }
  if (s.includes("lakh") || s.includes("lac") || s.includes("l")) {
    const num = parseFloat(s.replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 5000000 : Math.round(num * 100000);
  }
  const clean = parseFloat(s.replace(/[^0-9.]/g, ""));
  return isNaN(clean) ? 2500000 : clean;
}

// Map category string to valid category
export function normalizeCategory(raw: string | undefined): PlayerCategory {
  if (!raw) return "Gold";
  const s = raw.toLowerCase().trim();
  if (s.includes("plat")) return "Platinum";
  if (s.includes("diam")) return "Diamond";
  if (s.includes("gold")) return "Gold";
  if (s.includes("silv")) return "Silver";
  if (s.includes("emerg")) return "Emerging";
  if (s.includes("supp")) return "Supplementary";
  return "Gold";
}

// Map role string to valid role
export function normalizeRole(raw: string | undefined): PlayerRole {
  if (!raw) return "Batter";
  const s = raw.toLowerCase().trim();
  if (s.includes("all") || s.includes("ar")) return "All-Rounder";
  if (s.includes("wk") || s.includes("keep") || s.includes("wicket")) return "Wicketkeeper";
  if (s.includes("bowl") || s.includes("fast") || s.includes("spin") || s.includes("pace")) return "Bowler";
  return "Batter";
}

// Parse uploaded file (CSV, XLSX, XLS, TXT, JSON, etc.)
export async function parseUploadedDocument(
  file: File,
  existingPlayers: Player[]
): Promise<ExtractedPlayerRow[]> {
  const fileExt = file.name.split(".").pop()?.toLowerCase();

  let rawRows: Array<Record<string, unknown>> = [];

  if (fileExt === "csv") {
    const text = await file.text();
    const result = Papa.parse(text, { header: true, skipEmptyLines: true });
    rawRows = result.data as Array<Record<string, unknown>>;
  } else if (fileExt === "xlsx" || fileExt === "xls") {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    rawRows = XLSX.utils.sheet_to_json(sheet) as Array<Record<string, unknown>>;
  } else if (fileExt === "json") {
    const text = await file.text();
    try {
      const parsed = JSON.parse(text);
      rawRows = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      throw new Error("Invalid JSON document format");
    }
  } else {
    // Plain text or text fallback for PDF/Word text paste or simple format
    const text = await file.text();
    const lines = text.split("\n").filter((l) => l.trim().length > 0);
    rawRows = lines.map((l) => {
      const parts = l.split(/[,;\t|]/);
      return {
        Name: parts[0]?.trim() || "",
        Category: parts[1]?.trim() || "Gold",
        Role: parts[2]?.trim() || "Batter",
        Nationality: parts[3]?.trim() || "Pakistan",
        Price: parts[4]?.trim() || "1 Cr",
      };
    });
  }

  const existingNames = new Set(existingPlayers.map((p) => p.name.toLowerCase().trim()));

  return rawRows.map((row, index) => {
    // Fuzzy field matching
    const keys = Object.keys(row);
    const findField = (regex: RegExp) => {
      const match = keys.find((k) => regex.test(k));
      return match ? String(row[match] ?? "").trim() : "";
    };

    const name = findField(/name|player/i) || `Player ${index + 1}`;
    const rawCat = findField(/cat|category|tier/i);
    const rawRole = findField(/role|type|position/i);
    const rawNat = findField(/nation|country/i) || "Pakistan";
    const rawPrice = findField(/price|base|value/i);
    const rawAge = parseInt(findField(/age/i), 10) || 26;
    const rawBat = findField(/bat/i) || "Right-hand bat";
    const rawBowl = findField(/bowl/i) || "Right-arm medium";

    const category = normalizeCategory(rawCat);
    const role = normalizeRole(rawRole);
    const isOverseas = rawNat.toLowerCase() !== "pakistan" && rawNat.toLowerCase() !== "pak";
    const basePrice = parsePriceToNumber(rawPrice);

    const isDuplicate = existingNames.has(name.toLowerCase());
    const errors: string[] = [];
    if (!name || name.startsWith("Player ")) errors.push("Missing valid player name");
    if (isDuplicate) errors.push("Duplicate player name detected");

    return {
      tempId: `upload-${Date.now()}-${index}`,
      name,
      role,
      category,
      nationality: rawNat || "Pakistan",
      isOverseas,
      basePrice,
      age: rawAge,
      battingStyle: rawBat,
      bowlingStyle: rawBowl,
      isDuplicate,
      hasErrors: errors.length > 0,
      errorMessages: errors,
    };
  });
}
