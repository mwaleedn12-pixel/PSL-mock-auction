"use client";

import React, { useState } from "react";
import { Franchise, Player } from "@/types/auction";
import { formatPKR } from "@/lib/rules";
import { Shield, Check, X, AlertCircle, Award, Crown, Star } from "lucide-react";

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
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSelectPlayer = (playerId: string) => {
    setValidationError(null);
    if (selectedIds.includes(playerId)) {
      setSelectedIds(selectedIds.filter((id) => id !== playerId));
      if (captainId === playerId) setCaptainId(undefined);
      if (viceCaptainId === playerId) setViceCaptainId(undefined);
    } else {
      if (selectedIds.length >= 11) {
        setValidationError("Playing XI is full! You can only select exactly 11 players.");
        return;
      }
      setSelectedIds([...selectedIds, playerId]);
    }
  };

  const selectedPlayers = squad.filter((p) => selectedIds.includes(p.id));
  const overseasCount = selectedPlayers.filter((p) => p.isOverseas).length;

  const handleSave = () => {
    if (selectedIds.length !== 11) {
      setValidationError(`Please select exactly 11 players (currently ${selectedIds.length} selected).`);
      return;
    }
    if (overseasCount > 4) {
      setValidationError(`Maximum 4 overseas players allowed in Playing XI (currently ${overseasCount} selected).`);
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
              <p className="text-xs text-slate-400">Select 11 players, Captain (C), and Vice-Captain (VC)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Metrics */}
        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">Selected Players</span>
            <span className={`text-lg font-black ${selectedIds.length === 11 ? "text-emerald-400" : "text-amber-400"}`}>
              {selectedIds.length} / 11
            </span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">Overseas Limit (Max 4)</span>
            <span className={`text-lg font-black ${overseasCount > 4 ? "text-red-400" : "text-blue-400"}`}>
              {overseasCount} / 4
            </span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">Leadership</span>
            <span className="text-xs font-bold text-slate-300">
              {captainId ? `C: ${squad.find(p => p.id === captainId)?.name.split(" ")[0]}` : "No Captain"} |{" "}
              {viceCaptainId ? `VC: ${squad.find(p => p.id === viceCaptainId)?.name.split(" ")[0]}` : "No VC"}
            </span>
          </div>
        </div>

        {validationError && (
          <div className="p-3 mb-4 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center gap-2 text-xs text-red-300 font-semibold">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Cricket Pitch Visualization */}
        <div className="relative bg-gradient-to-b from-emerald-900/60 via-emerald-800/40 to-emerald-950/80 border-2 border-emerald-600/40 rounded-2xl p-4 min-h-[220px] mb-4 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div className="w-72 h-72 border-4 border-white rounded-full" />
          </div>
          <div className="text-center mb-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300/80 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-700/40">
              🏏 Field Preview ({selectedPlayers.length} Active in XI)
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
                  <span className="text-[10px] text-blue-400 font-bold">✈</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Squad Selection Table */}
        <div className="max-h-64 overflow-y-auto pr-1 space-y-2">
          {squad.length === 0 ? (
            <p className="text-center text-slate-500 py-6 text-sm">
              Your franchise has not acquired any players yet. Buy players in the auction first!
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
                            Overseas
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">{formatPKR(player.soldPrice || player.basePrice)}</span>
                    </div>
                  </div>

                  {/* Leadership assignment buttons */}
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

        {/* Footer actions */}
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
