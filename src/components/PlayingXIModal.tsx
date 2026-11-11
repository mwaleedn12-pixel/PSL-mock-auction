"use client";

import React, { useState } from "react";
import { Franchise, Player } from "@/types/auction";
import { formatPKR, validatePlayingXI } from "@/lib/rules";
import { Shield, Check, X, AlertCircle, Award, Sparkles, UserCheck } from "lucide-react";

interface PlayingXIModalProps {
  franchise: Franchise;
  allPlayers: Player[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (playerIds: string[], captainId?: string, viceCaptainId?: string) => void;
}

export const PlayingXIModal: React.FC<PlayingXIModalProps> = ({
  franchise,
  allPlayers,
  isOpen,
  onClose,
  onSave,
}) => {
  const squad = allPlayers.filter((p) => p.soldToFranchiseId === franchise.id);

  const [selectedIds, setSelectedIds] = useState<string[]>(franchise.playingXI || []);
  const [captainId, setCaptainId] = useState<string | undefined>(franchise.captainId);
  const [viceCaptainId, setViceCaptainId] = useState<string | undefined>(franchise.viceCaptainId);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleSelectPlayer = (playerId: string) => {
    setValidationErrors([]);
    if (selectedIds.includes(playerId)) {
      setSelectedIds(selectedIds.filter((id) => id !== playerId));
      if (captainId === playerId) setCaptainId(undefined);
      if (viceCaptainId === playerId) setViceCaptainId(undefined);
    } else {
      if (selectedIds.length >= 11) {
        setValidationErrors(["Playing XI is full! You can only select exactly 11 players."]);
        return;
      }
      setSelectedIds([...selectedIds, playerId]);
    }
  };

  const selectedPlayers = squad.filter((p) => selectedIds.includes(p.id));
  const overseasCount = selectedPlayers.filter((p) => p.isOverseas).length;
  const u23UncappedCount = selectedPlayers.filter((p) => p.isUnder23 && p.isUncapped).length;
  const squadU23UncappedTotal = squad.filter((p) => p.isUnder23 && p.isUncapped).length;

  const handleSave = () => {
    const validation = validatePlayingXI(selectedPlayers);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }
    onSave(selectedIds, captainId, viceCaptainId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow"
              style={{ backgroundColor: franchise.primaryColor }}
            >
              {franchise.shortName}
            </div>
            <div>
              <h3 className="text-xl font-black text-white">{franchise.name} - Playing XI Builder</h3>
              <p className="text-xs text-slate-400">
                PSL Rules Enforced: 3-4 Overseas, at least 1 Uncapped Under-23 player, Captain & VC.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PSL Rule Metrics Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 my-4">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">Total Players</span>
            <span className={`text-lg font-black ${selectedIds.length === 11 ? "text-emerald-400" : "text-amber-400"}`}>
              {selectedIds.length} / 11
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">Overseas (3 to 4)</span>
            <span
              className={`text-lg font-black ${
                overseasCount >= 3 && overseasCount <= 4 ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {overseasCount} OS
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">Uncapped U-23 in XI (Min 1)</span>
            <span className={`text-lg font-black ${u23UncappedCount >= 1 ? "text-emerald-400" : "text-red-400"}`}>
              {u23UncappedCount} / 1 min
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">Squad U-23 Total (Min 2)</span>
            <span className={`text-lg font-black ${squadU23UncappedTotal >= 2 ? "text-emerald-400" : "text-amber-400"}`}>
              {squadU23UncappedTotal} / 2 min
            </span>
          </div>
        </div>

        {/* Errors list */}
        {validationErrors.length > 0 && (
          <div className="p-3 mb-4 rounded-xl bg-red-950/60 border border-red-500/50 space-y-1">
            {validationErrors.map((err, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-red-300 font-semibold">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{err}</span>
              </div>
            ))}
          </div>
        )}

        {/* Pitch Visualization */}
        <div className="relative bg-gradient-to-b from-emerald-900/60 via-emerald-800/40 to-emerald-950/80 border-2 border-emerald-600/40 rounded-2xl p-4 min-h-[160px] mb-4 overflow-hidden">
          <div className="text-center mb-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 bg-emerald-950/70 px-3 py-1 rounded-full border border-emerald-700/40">
              🏏 Playing XI Lineup ({selectedPlayers.length} / 11)
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {selectedPlayers.map((player) => (
              <div
                key={player.id}
                className="bg-slate-950/90 border border-emerald-500/50 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 shadow-md"
              >
                <span className="text-xs font-bold text-white">{player.name}</span>
                {captainId === player.id && (
                  <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-1 rounded">C</span>
                )}
                {viceCaptainId === player.id && (
                  <span className="bg-slate-300 text-slate-950 font-black text-[9px] px-1 rounded">VC</span>
                )}
                {player.isOverseas && (
                  <span className="text-[10px] text-blue-400 font-bold">✈ OS</span>
                )}
                {player.isUnder23 && player.isUncapped && (
                  <span className="text-[9px] font-black bg-emerald-500/30 text-emerald-300 px-1 rounded">U23</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Squad Selection Table */}
        <div className="max-h-64 overflow-y-auto pr-1 space-y-2">
          {squad.length === 0 ? (
            <p className="text-center text-slate-500 py-6 text-sm">
              Your franchise has not acquired any players yet. Buy players in the live auction!
            </p>
          ) : (
            squad.map((player) => {
              const isSelected = selectedIds.includes(player.id);
              const isCap = captainId === player.id;
              const isVC = viceCaptainId === player.id;

              return (
                <div
                  key={player.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                    isSelected
                      ? "bg-emerald-950/30 border-emerald-500/50"
                      : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleSelectPlayer(player.id)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                        isSelected
                          ? "bg-emerald-500 border-emerald-400 text-slate-950"
                          : "border-slate-700 hover:border-slate-500 text-transparent"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{player.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {player.primaryRole}
                        </span>
                        {player.isOverseas && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                            ✈ Overseas
                          </span>
                        )}
                        {player.isUnder23 && player.isUncapped && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                            ★ Uncapped U-23
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">{formatPKR(player.soldPrice || player.basePrice)}</span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCaptainId(isCap ? undefined : player.id)}
                        className={`px-2 py-1 rounded text-[11px] font-black border transition-colors ${
                          isCap
                            ? "bg-amber-500 text-slate-950 border-amber-400"
                            : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                        }`}
                      >
                        (C) Captain
                      </button>
                      <button
                        onClick={() => setViceCaptainId(isVC ? undefined : player.id)}
                        className={`px-2 py-1 rounded text-[11px] font-black border transition-colors ${
                          isVC
                            ? "bg-slate-300 text-slate-950 border-white"
                            : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                        }`}
                      >
                        (VC) Vice-Captain
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/20"
          >
            Save Playing XI
          </button>
        </div>
      </div>
    </div>
  );
};
