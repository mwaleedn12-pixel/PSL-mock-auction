"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import {
  Franchise,
  Player,
  Bid,
  UserRole,
  AuctionStatus,
  AuctionSettings,
  AuctionEventLog,
  WatchlistItem,
  TradeOffer,
  FranchisePlayerAuctionStatus,
} from "@/types/auction";
import { INITIAL_FRANCHISES } from "@/data/initialFranchises";
import { INITIAL_PLAYERS } from "@/data/initialPlayers";
import { soundEngine } from "@/lib/audio";
import { validateBid, getNextMinimumIncrement } from "@/lib/rules";
import confetti from "canvas-confetti";

interface AuctionContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  selectedFranchiseId: string;
  setSelectedFranchiseId: (id: string) => void;
  activeFranchise: Franchise | undefined;

  auctionStatus: AuctionStatus;
  franchises: Franchise[];
  players: Player[];
  currentPlayer: Player | null;
  currentPlayerIndex: number;
  currentBids: Bid[];
  highestBid: Bid | null;
  franchiseStatuses: Record<string, 'active' | 'skipped' | 'out'>;
  timer: number;
  isTimerRunning: boolean;
  settings: AuctionSettings;
  watchlists: WatchlistItem[];
  tradeOffers: TradeOffer[];
  eventLogs: AuctionEventLog[];

  // Actions
  startAuction: () => void;
  pauseAuction: () => void;
  resumeAuction: () => void;
  placeBid: (franchiseId: string, customAmount?: number) => { success: boolean; message: string };
  skipCurrentPlayer: (franchiseId: string) => void;
  outCurrentPlayer: (franchiseId: string) => void;
  finalizePlayer: (forceSold?: boolean, winningBid?: Bid | null) => void;
  goToNextPlayer: () => void;
  goToPreviousPlayer: () => void;
  selectPlayerForAuction: (playerId: string) => void;
  startRoundTwo: () => void;
  resetAuction: () => void;

  // Management
  addPlayer: (newPlayer: Partial<Player>) => void;
  importPlayersList: (newPlayers: Player[]) => void;
  retainPlayer: (franchiseId: string, playerId: string, price: number) => void;
  directSignPlayer: (franchiseId: string, playerId: string, price: number) => void;
  toggleWatchlist: (franchiseId: string, playerId: string, maxBid?: number, notes?: string, priority?: 'High' | 'Medium' | 'Low') => void;
  savePlayingXI: (franchiseId: string, playerIds: string[], captainId?: string, viceCaptainId?: string) => void;
  proposeTrade: (trade: Omit<TradeOffer, "id" | "createdAt" | "status">) => void;
  handleTradeAction: (tradeId: string, action: 'accept' | 'reject' | 'admin_approve' | 'cancel') => void;
  updateSettings: (newSettings: Partial<AuctionSettings>) => void;
  updateFranchisePurse: (franchiseId: string, newPurse: number) => void;
}

const DEFAULT_SETTINGS: AuctionSettings = {
  id: "psl-12-default",
  name: "PSL 12 Official Mock Auction",
  season: "Season 12 (2025/2026)",
  currency: "PKR",
  totalPursePerTeam: 150000000, // 15 Crore PKR
  minSquadSize: 16,
  maxSquadSize: 20,
  minOverseas: 4,
  maxOverseas: 6,
  defaultTimerSeconds: 15,
  timerResetSeconds: 15,
  extensionSeconds: 5,
  extensionTriggerSeconds: 5,
  noBidTimeoutSeconds: 15,
  autoSellOnAllOut: true,
  allowSecondRoundForUnsold: true,
  soundEffectsEnabled: true,
  voiceAnnouncements: true,
};

const STORAGE_KEY = "psl_12_mock_auction_state_v1";

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export const AuctionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & User role state
  const [role, setRole] = useState<UserRole>("super_admin");
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>("lq");

  // Core Auction State
  const [auctionStatus, setAuctionStatus] = useState<AuctionStatus>("Ready");
  const [franchises, setFranchises] = useState<Franchise[]>(INITIAL_FRANCHISES);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [currentBids, setCurrentBids] = useState<Bid[]>([]);
  const [franchiseStatuses, setFranchiseStatuses] = useState<Record<string, 'active' | 'skipped' | 'out'>>({});
  const [timer, setTimer] = useState<number>(DEFAULT_SETTINGS.defaultTimerSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [settings, setSettings] = useState<AuctionSettings>(DEFAULT_SETTINGS);
  const [watchlists, setWatchlists] = useState<WatchlistItem[]>([]);
  const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>([]);
  const [eventLogs, setEventLogs] = useState<AuctionEventLog[]>([]);

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial state from LocalStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.franchises) setFranchises(parsed.franchises);
          if (parsed.players) setPlayers(parsed.players);
          if (parsed.auctionStatus) setAuctionStatus(parsed.auctionStatus);
          if (typeof parsed.currentPlayerIndex === "number") setCurrentPlayerIndex(parsed.currentPlayerIndex);
          if (parsed.currentBids) setCurrentBids(parsed.currentBids);
          if (parsed.franchiseStatuses) setFranchiseStatuses(parsed.franchiseStatuses);
          if (parsed.settings) setSettings(parsed.settings);
          if (parsed.watchlists) setWatchlists(parsed.watchlists);
          if (parsed.tradeOffers) setTradeOffers(parsed.tradeOffers);
          if (parsed.eventLogs) setEventLogs(parsed.eventLogs);
        } catch {
          // fallback to defaults
        }
      }

      // Initialize cross-tab BroadcastChannel
      try {
        const bc = new BroadcastChannel("psl_auction_sync_channel");
        broadcastChannelRef.current = bc;
        bc.onmessage = (event) => {
          if (event.data?.type === "STATE_SYNC") {
            const syncData = event.data.payload;
            if (syncData.franchises) setFranchises(syncData.franchises);
            if (syncData.players) setPlayers(syncData.players);
            if (syncData.auctionStatus) setAuctionStatus(syncData.auctionStatus);
            if (typeof syncData.currentPlayerIndex === "number") setCurrentPlayerIndex(syncData.currentPlayerIndex);
            if (syncData.currentBids) setCurrentBids(syncData.currentBids);
            if (syncData.franchiseStatuses) setFranchiseStatuses(syncData.franchiseStatuses);
            if (typeof syncData.timer === "number") setTimer(syncData.timer);
            if (typeof syncData.isTimerRunning === "boolean") setIsTimerRunning(syncData.isTimerRunning);
            if (syncData.eventLogs) setEventLogs(syncData.eventLogs);
          }
        };
      } catch {}
    }

    return () => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, []);

  // Save to LocalStorage and broadcast on state changes
  const persistState = useCallback(() => {
    if (typeof window !== "undefined") {
      const stateToSave = {
        franchises,
        players,
        auctionStatus,
        currentPlayerIndex,
        currentBids,
        franchiseStatuses,
        settings,
        watchlists,
        tradeOffers,
        eventLogs,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch {}
    }
  }, [franchises, players, auctionStatus, currentPlayerIndex, currentBids, franchiseStatuses, settings, watchlists, tradeOffers, eventLogs]);

  useEffect(() => {
    persistState();
  }, [persistState]);

  // Derived current player and highest bid
  const currentPlayer = players[currentPlayerIndex] || null;
  const highestBid = currentBids.length > 0 ? currentBids[currentBids.length - 1] : null;
  const activeFranchise = franchises.find((f) => f.id === selectedFranchiseId);

  // Broadcast state to other tabs
  const broadcastSync = (data: Record<string, unknown>) => {
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: "STATE_SYNC",
        payload: data,
      });
    }
  };

  // Add event log helper
  const addLog = (
    type: AuctionEventLog["type"],
    description: string,
    extra?: Partial<AuctionEventLog>
  ) => {
    const newLog: AuctionEventLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      type,
      description,
      ...extra,
    };
    setEventLogs((prev) => [newLog, ...prev.slice(0, 199)]);
  };

  // Finalize current player (Sold or Unsold)
  const finalizePlayer = useCallback(
    (forceSold?: boolean, winningBidParam?: Bid | null) => {
      const current = players[currentPlayerIndex];
      if (!current) return;

      const finalBid = winningBidParam !== undefined ? winningBidParam : (currentBids.length > 0 ? currentBids[currentBids.length - 1] : null);
      const isSold = forceSold !== undefined ? forceSold : !!finalBid;

      setIsTimerRunning(false);

      if (isSold && finalBid) {
        // Sold logic
        const winningTeam = franchises.find((f) => f.id === finalBid.franchiseId);
        soundEngine.playGavelHammerSound();
        soundEngine.playSoldFanfare();
        soundEngine.speakAnnouncement(`${current.name} sold to ${finalBid.franchiseName} for PKR ${(finalBid.amount / 10000000).toFixed(2)} Crore!`);

        // Confetti celebration
        if (typeof window !== "undefined") {
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: [winningTeam?.primaryColor || "#10b981", "#fbbf24", "#ffffff"],
            });
          } catch {}
        }

        // Deduct franchise purse & increment squad
        setFranchises((prev) =>
          prev.map((f) => {
            if (f.id === finalBid.franchiseId) {
              return {
                ...f,
                remainingPurse: f.remainingPurse - finalBid.amount,
                squadCount: f.squadCount + 1,
              };
            }
            return f;
          })
        );

        // Update player record
        setPlayers((prev) =>
          prev.map((p, idx) => {
            if (idx === currentPlayerIndex) {
              return {
                ...p,
                status: "sold",
                soldToFranchiseId: finalBid.franchiseId,
                soldPrice: finalBid.amount,
                currentPrice: finalBid.amount,
              };
            }
            return p;
          })
        );

        addLog("sold", `${current.name} sold to ${finalBid.franchiseName} for ${(finalBid.amount / 10000000).toFixed(2)} Cr`, {
          playerId: current.id,
          playerName: current.name,
          franchiseId: finalBid.franchiseId,
          franchiseName: finalBid.franchiseName,
          amount: finalBid.amount,
        });
      } else {
        // Unsold logic
        soundEngine.playGavelHammerSound();
        soundEngine.speakAnnouncement(`${current.name} goes unsold.`);

        setPlayers((prev) =>
          prev.map((p, idx) => {
            if (idx === currentPlayerIndex) {
              return {
                ...p,
                status: "unsold",
              };
            }
            return p;
          })
        );

        addLog("unsold", `${current.name} marked UNSOLD.`, {
          playerId: current.id,
          playerName: current.name,
        });
      }

      // Automatically transition to next player after a brief 3.5 second pause
      setTimeout(() => {
        goToNextPlayer();
      }, 3500);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [players, currentPlayerIndex, currentBids, franchises]
  );

  // Navigate to Next Player
  const goToNextPlayer = useCallback(() => {
    setCurrentBids([]);
    setFranchiseStatuses({});
    setTimer(settings.defaultTimerSeconds);
    setIsTimerRunning(false);

    // Find next player with status 'upcoming'
    let nextIdx = currentPlayerIndex + 1;
    while (nextIdx < players.length && players[nextIdx].status !== "upcoming") {
      nextIdx++;
    }

    if (nextIdx < players.length) {
      setCurrentPlayerIndex(nextIdx);
      if (auctionStatus === "Live") {
        setIsTimerRunning(true);
        soundEngine.speakAnnouncement(`Next up: ${players[nextIdx].name}, category ${players[nextIdx].category}, base price ${(players[nextIdx].basePrice / 10000000).toFixed(2)} Crore.`);
      }
    } else {
      // Auction completed or round 1 finished
      setAuctionStatus("Completed");
      soundEngine.speakAnnouncement("The PSL 12 Auction has successfully concluded!");
      addLog("admin", "Auction completed. All players processed.");
    }
  }, [currentPlayerIndex, players, auctionStatus, settings.defaultTimerSeconds]);

  // Navigate to Previous Player
  const goToPreviousPlayer = () => {
    if (currentPlayerIndex > 0) {
      setCurrentBids([]);
      setFranchiseStatuses({});
      setTimer(settings.defaultTimerSeconds);
      setIsTimerRunning(false);
      setCurrentPlayerIndex(currentPlayerIndex - 1);
    }
  };

  const selectPlayerForAuction = (playerId: string) => {
    const idx = players.findIndex((p) => p.id === playerId);
    if (idx !== -1) {
      setCurrentBids([]);
      setFranchiseStatuses({});
      setTimer(settings.defaultTimerSeconds);
      setIsTimerRunning(false);
      setCurrentPlayerIndex(idx);
    }
  };

  // Timer Tick Interval
  useEffect(() => {
    if (isTimerRunning && auctionStatus === "Live") {
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            finalizePlayer();
            return 0;
          }
          if (prev <= 5) {
            soundEngine.playTickSound(true);
          } else if (prev % 5 === 0) {
            soundEngine.playTickSound(false);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, auctionStatus, finalizePlayer]);

  // Real-time automatic skip/out rule check (FR-09)
  // Check if all non-leading franchises have withdrawn
  useEffect(() => {
    if (auctionStatus !== "Live" || !isTimerRunning || !currentPlayer) return;

    const currentLeadingFranchiseId = highestBid ? highestBid.franchiseId : null;
    const eligibleFranchises = franchises.filter((f) => {
      // Filter out teams with full squad
      const teamSquad = players.filter((p) => p.soldToFranchiseId === f.id);
      if (teamSquad.length >= f.maxSquadSize) return false;
      // Filter out teams if overseas player limit reached
      if (currentPlayer.isOverseas) {
        const osCount = teamSquad.filter((p) => p.isOverseas).length;
        if (osCount >= f.maxOverseas) return false;
      }
      return true;
    });

    // Check statuses for eligible franchises
    let allOthersOut = true;
    for (const f of eligibleFranchises) {
      if (f.id === currentLeadingFranchiseId) continue;
      const status = franchiseStatuses[f.id];
      if (status !== "out") {
        allOthersOut = false;
        break;
      }
    }

    if (allOthersOut && eligibleFranchises.length > 0) {
      // Automatic early finalization if all other franchises are OUT (FR-09)
      if (settings.autoSellOnAllOut) {
        finalizePlayer();
      }
    }
  }, [franchiseStatuses, auctionStatus, isTimerRunning, highestBid, currentPlayer, franchises, players, settings.autoSellOnAllOut, finalizePlayer]);

  // Place a Bid (FR-07, FR-10)
  const placeBid = (franchiseId: string, customAmount?: number): { success: boolean; message: string } => {
    if (auctionStatus !== "Live") {
      return { success: false, message: "Auction is not live. Cannot place bid." };
    }
    if (!currentPlayer || currentPlayer.status !== "upcoming") {
      return { success: false, message: "No active player available for bidding." };
    }

    const franchise = franchises.find((f) => f.id === franchiseId);
    if (!franchise) {
      return { success: false, message: "Franchise not found." };
    }

    // Check if franchise marked 'out'
    if (franchiseStatuses[franchiseId] === "out") {
      return { success: false, message: `${franchise.name} has already withdrawn (OUT) from this player.` };
    }

    // Check if franchise is already highest bidder
    if (highestBid && highestBid.franchiseId === franchiseId) {
      return { success: false, message: `${franchise.name} is already the highest bidder!` };
    }

    const currentAmount = highestBid ? highestBid.amount : null;
    const minIncrement = currentAmount ? getNextMinimumIncrement(currentAmount) : 0;
    const proposedAmount = customAmount !== undefined
      ? customAmount
      : currentAmount
      ? currentAmount + minIncrement
      : currentPlayer.basePrice;

    // Validate bid rules (Purse, squad limit, overseas limit, reserve purse)
    const validation = validateBid(
      proposedAmount,
      currentPlayer,
      franchise,
      currentAmount,
      players,
      settings.minSquadSize,
      settings.maxSquadSize,
      settings.maxOverseas,
      2500000
    );

    if (!validation.valid) {
      return { success: false, message: validation.reason || "Bid is invalid." };
    }

    // Bid is valid!
    const newBid: Bid = {
      id: `bid-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      playerId: currentPlayer.id,
      franchiseId: franchise.id,
      franchiseName: franchise.name,
      amount: proposedAmount,
      timestamp: Date.now(),
    };

    // Notify previous highest bidder
    if (highestBid && highestBid.franchiseId !== franchiseId) {
      soundEngine.playOutbidSound();
    } else {
      soundEngine.playBidSound();
    }

    // Reset or extend timer (FR-08)
    setTimer((prev) => {
      if (prev <= settings.extensionTriggerSeconds) {
        return prev + settings.extensionSeconds;
      }
      return settings.timerResetSeconds;
    });

    // Re-activate franchise if it was in 'skipped' state
    if (franchiseStatuses[franchiseId] === "skipped") {
      setFranchiseStatuses((prev) => ({ ...prev, [franchiseId]: "active" }));
    }

    setCurrentBids((prev) => [...prev, newBid]);
    addLog("bid", `${franchise.name} placed bid of PKR ${(proposedAmount / 10000000).toFixed(2)} Cr`, {
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      franchiseId: franchise.id,
      franchiseName: franchise.name,
      amount: proposedAmount,
    });

    broadcastSync({
      currentBids: [...currentBids, newBid],
      timer: settings.timerResetSeconds,
    });

    return { success: true, message: `Bid of PKR ${(proposedAmount / 10000000).toFixed(2)} Cr accepted for ${franchise.name}!` };
  };

  // Franchise Skip / Pass (FR-09)
  const skipCurrentPlayer = (franchiseId: string) => {
    const f = franchises.find((team) => team.id === franchiseId);
    if (!f) return;
    setFranchiseStatuses((prev) => ({ ...prev, [franchiseId]: "skipped" }));
    addLog("skip", `${f.name} passed/skipped bidding on ${currentPlayer?.name || "current player"}.`, {
      franchiseId,
      franchiseName: f.name,
    });
  };

  // Franchise Out (FR-09)
  const outCurrentPlayer = (franchiseId: string) => {
    // If team holds highest bid, they CANNOT withdraw (FR-09 constraint)
    if (highestBid && highestBid.franchiseId === franchiseId) {
      return;
    }
    const f = franchises.find((team) => team.id === franchiseId);
    if (!f) return;
    setFranchiseStatuses((prev) => ({ ...prev, [franchiseId]: "out" }));
    addLog("out", `${f.name} permanently withdrew (OUT) from ${currentPlayer?.name || "current player"}.`, {
      franchiseId,
      franchiseName: f.name,
    });
  };

  // Start Auction
  const startAuction = () => {
    setAuctionStatus("Live");
    setIsTimerRunning(true);
    setTimer(settings.defaultTimerSeconds);
    addLog("start", "PSL 12 Mock Auction started!");
    soundEngine.speakAnnouncement("The PSL 12 Live Auction is now open! Bidding has commenced.");
  };

  // Pause Auction
  const pauseAuction = () => {
    setAuctionStatus("Paused");
    setIsTimerRunning(false);
    addLog("pause", "Auction paused by administrator.");
  };

  // Resume Auction
  const resumeAuction = () => {
    setAuctionStatus("Live");
    setIsTimerRunning(true);
    addLog("resume", "Auction resumed by administrator.");
  };

  // Start Round 2 for Unsold Players (FR-14)
  const startRoundTwo = () => {
    const unsoldPlayers = players.filter((p) => p.status === "unsold");
    if (unsoldPlayers.length === 0) return;

    // Reset unsold players to upcoming with 20% discount or base price
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.status === "unsold") {
          return {
            ...p,
            status: "upcoming",
            auctionRound: 2,
            basePrice: Math.round(p.basePrice * 0.8), // 20% discount in Round 2
            currentPrice: Math.round(p.basePrice * 0.8),
          };
        }
        return p;
      })
    );

    // Point to first re-auction player
    const firstUnsoldIdx = players.findIndex((p) => p.status === "unsold");
    if (firstUnsoldIdx !== -1) {
      setCurrentPlayerIndex(firstUnsoldIdx);
    }
    setCurrentBids([]);
    setFranchiseStatuses({});
    setTimer(settings.defaultTimerSeconds);
    setAuctionStatus("Live");
    setIsTimerRunning(true);

    addLog("round2", "Second Auction Round initiated for Unsold Players!");
    soundEngine.speakAnnouncement("Second round of auction has commenced for unsold players!");
  };

  // Reset entire auction
  const resetAuction = () => {
    setFranchises(INITIAL_FRANCHISES);
    setPlayers(INITIAL_PLAYERS);
    setCurrentPlayerIndex(0);
    setCurrentBids([]);
    setFranchiseStatuses({});
    setTimer(DEFAULT_SETTINGS.defaultTimerSeconds);
    setIsTimerRunning(false);
    setAuctionStatus("Ready");
    setEventLogs([]);
    setTradeOffers([]);
    setWatchlists([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Add individual player
  const addPlayer = (newPlayer: Partial<Player>) => {
    const id = `p-${Date.now()}`;
    const p: Player = {
      id,
      name: newPlayer.name || "Unknown Player",
      photoUrl: newPlayer.photoUrl || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400",
      nationality: newPlayer.nationality || "Pakistan",
      isOverseas: !!newPlayer.isOverseas,
      age: newPlayer.age || 25,
      battingStyle: newPlayer.battingStyle || "Right-hand bat",
      bowlingStyle: newPlayer.bowlingStyle || "Right-arm medium",
      primaryRole: newPlayer.primaryRole || "Batter",
      category: newPlayer.category || "Gold",
      basePrice: newPlayer.basePrice || 10000000,
      currentPrice: newPlayer.basePrice || 10000000,
      status: "upcoming",
      auctionRound: 1,
      stats: newPlayer.stats,
    };
    setPlayers((prev) => [...prev, p]);
    addLog("admin", `New player added: ${p.name} (${p.category})`);
  };

  // Import batch of players
  const importPlayersList = (newPlayers: Player[]) => {
    setPlayers((prev) => [...prev, ...newPlayers]);
    addLog("admin", `Successfully imported ${newPlayers.length} players into auction database.`);
  };

  // Player Retention (FR-15)
  const retainPlayer = (franchiseId: string, playerId: string, price: number) => {
    const franchise = franchises.find((f) => f.id === franchiseId);
    const player = players.find((p) => p.id === playerId);
    if (!franchise || !player) return;

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? { ...p, status: "retained", isRetained: true, soldToFranchiseId: franchiseId, soldPrice: price }
          : p
      )
    );

    setFranchises((prev) =>
      prev.map((f) =>
        f.id === franchiseId
          ? {
              ...f,
              remainingPurse: f.remainingPurse - price,
              squadCount: f.squadCount + 1,
            }
          : f
      )
    );

    addLog("retention", `${franchise.name} retained ${player.name} for ${(price / 10000000).toFixed(2)} Cr`, {
      franchiseId,
      franchiseName: franchise.name,
      playerId,
      playerName: player.name,
      amount: price,
    });
  };

  // Direct Player Signing (FR-15)
  const directSignPlayer = (franchiseId: string, playerId: string, price: number) => {
    const franchise = franchises.find((f) => f.id === franchiseId);
    const player = players.find((p) => p.id === playerId);
    if (!franchise || !player) return;

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? { ...p, status: "direct_signing", isDirectSigning: true, soldToFranchiseId: franchiseId, soldPrice: price }
          : p
      )
    );

    setFranchises((prev) =>
      prev.map((f) =>
        f.id === franchiseId
          ? {
              ...f,
              remainingPurse: f.remainingPurse - price,
              squadCount: f.squadCount + 1,
            }
          : f
      )
    );

    addLog("retention", `${franchise.name} directly signed ${player.name} for ${(price / 10000000).toFixed(2)} Cr`, {
      franchiseId,
      franchiseName: franchise.name,
      playerId,
      playerName: player.name,
      amount: price,
    });
  };

  // Toggle Watchlist (FR-13)
  const toggleWatchlist = (
    franchiseId: string,
    playerId: string,
    maxBid?: number,
    notes?: string,
    priority: 'High' | 'Medium' | 'Low' = 'Medium'
  ) => {
    setWatchlists((prev) => {
      const exists = prev.find((w) => w.franchiseId === franchiseId && w.playerId === playerId);
      if (exists) {
        return prev.filter((w) => !(w.franchiseId === franchiseId && w.playerId === playerId));
      }
      return [...prev, { franchiseId, playerId, maxIntendedBid: maxBid, notes, priority, addedAt: Date.now() }];
    });
  };

  // Save Playing XI (FR-12)
  const savePlayingXI = (franchiseId: string, playerIds: string[], captainId?: string, viceCaptainId?: string) => {
    setFranchises((prev) =>
      prev.map((f) =>
        f.id === franchiseId
          ? {
              ...f,
              playingXI: playerIds,
              captainId,
              viceCaptainId,
            }
          : f
      )
    );
  };

  // Trade management (FR-16)
  const proposeTrade = (tradeData: Omit<TradeOffer, "id" | "createdAt" | "status">) => {
    const newOffer: TradeOffer = {
      ...tradeData,
      id: `trade-${Date.now()}`,
      createdAt: Date.now(),
      status: "pending",
    };
    setTradeOffers((prev) => [newOffer, ...prev]);
    addLog("trade", `Trade proposed between ${tradeData.fromFranchiseId} and ${tradeData.toFranchiseId}`);
  };

  const handleTradeAction = (tradeId: string, action: 'accept' | 'reject' | 'admin_approve' | 'cancel') => {
    setTradeOffers((prev) =>
      prev.map((t) => {
        if (t.id !== tradeId) return t;

        if (action === "admin_approve" || (action === "accept" && t.status === "pending")) {
          // Execute swap of players
          if (t.offeredPlayerId && t.requestedPlayerId) {
            setPlayers((playersList) =>
              playersList.map((p) => {
                if (p.id === t.offeredPlayerId) return { ...p, soldToFranchiseId: t.toFranchiseId };
                if (p.id === t.requestedPlayerId) return { ...p, soldToFranchiseId: t.fromFranchiseId };
                return p;
              })
            );
          }
          // Cash transfer
          if (t.offeredCash) {
            setFranchises((franchiseList) =>
              franchiseList.map((f) => {
                if (f.id === t.fromFranchiseId) return { ...f, remainingPurse: f.remainingPurse - t.offeredCash! };
                if (f.id === t.toFranchiseId) return { ...f, remainingPurse: f.remainingPurse + t.offeredCash! };
                return f;
              })
            );
          }
          return { ...t, status: action === "admin_approve" ? "approved_by_admin" : "accepted" };
        }

        return { ...t, status: action === "reject" ? "rejected" : "cancelled" };
      })
    );
  };

  const updateSettings = (newSettings: Partial<AuctionSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const updateFranchisePurse = (franchiseId: string, newPurse: number) => {
    setFranchises((prev) =>
      prev.map((f) => (f.id === franchiseId ? { ...f, remainingPurse: newPurse } : f))
    );
  };

  return (
    <AuctionContext.Provider
      value={{
        role,
        setRole,
        selectedFranchiseId,
        setSelectedFranchiseId,
        activeFranchise,
        auctionStatus,
        franchises,
        players,
        currentPlayer,
        currentPlayerIndex,
        currentBids,
        highestBid,
        franchiseStatuses,
        timer,
        isTimerRunning,
        settings,
        watchlists,
        tradeOffers,
        eventLogs,
        startAuction,
        pauseAuction,
        resumeAuction,
        placeBid,
        skipCurrentPlayer,
        outCurrentPlayer,
        finalizePlayer,
        goToNextPlayer,
        goToPreviousPlayer,
        selectPlayerForAuction,
        startRoundTwo,
        resetAuction,
        addPlayer,
        importPlayersList,
        retainPlayer,
        directSignPlayer,
        toggleWatchlist,
        savePlayingXI,
        proposeTrade,
        handleTradeAction,
        updateSettings,
        updateFranchisePurse,
      }}
    >
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error("useAuction must be used within an AuctionProvider");
  }
  return context;
};
