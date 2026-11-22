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
  RulePreset,
  RtmState,
  PlayerRole,
  AdminUser,
  AuctionMessage,
} from "@/types/auction";
import { INITIAL_FRANCHISES } from "@/data/initialFranchises";
import { INITIAL_PLAYERS } from "@/data/initialPlayers";
import { PSL_11_SQUADS, Psl11SquadPlayer } from "@/data/psl11Squads";
import { soundEngine } from "@/lib/audio";
import { validateBid, getNextMinimumIncrement } from "@/lib/rules";
import confetti from "canvas-confetti";
import {
  getSupabase,
  isSupabaseConfigured,
  fetchRemoteAuctionState,
  saveRemoteAuctionState,
  broadcastSupabaseEvent,
  recordSupabaseBid,
  DEFAULT_ROOM_ID,
} from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

interface AuctionContextType {
  // Authentication & RBAC (3 Roles: admin, team_owner, spectator)
  role: UserRole;
  authenticatedFranchiseId: string | null;
  activeFranchise: Franchise | undefined;
  loginAsAdmin: (password: string) => { success: boolean; message: string };
  loginAsTeamOwner: (passkey: string, roomCode?: string) => { success: boolean; message: string };
  logoutToSpectator: () => void;
  switchRoleDirectly: (newRole: UserRole, franchiseId?: string) => void;

  // Presets & Auction State
  rulePreset: RulePreset;
  setRulePreset: (preset: RulePreset) => void;
  auctionStatus: AuctionStatus;
  franchises: Franchise[];
  players: Player[];
  currentPlayer: Player | null;
  currentPlayerIndex: number;
  currentBids: Bid[];
  highestBid: Bid | null;
  franchiseStatuses: Record<string, 'active' | 'skipped' | 'out'>;
  timer: number;
  timerExpiresAt: number | null;
  isTimerRunning: boolean;
  settings: AuctionSettings;
  watchlists: WatchlistItem[];
  tradeOffers: TradeOffer[];
  eventLogs: AuctionEventLog[];

  // Right to Match (RTM) State & Actions
  rtmState: RtmState | null;
  exerciseRtm: () => void;
  declineRtmInitial: () => void;
  submitRtmRaise: (newAmount: number) => { success: boolean; message: string };
  acceptRtmFinal: () => void;
  declineRtmFinal: () => void;
  cancelRtm: () => void;

  // Player Queue Organization
  shuffleUpcomingPlayers: () => void;
  reEnterUnsoldPlayers: (selectedPlayerIds?: string[], discountPercent?: number) => void;

  // Actions
  startAuction: () => void;
  pauseAuction: () => void;
  resumeAuction: () => void;
  placeBid: (franchiseId?: string, customAmount?: number) => { success: boolean; message: string };
  skipCurrentPlayer: (franchiseId?: string) => void;
  outCurrentPlayer: (franchiseId?: string) => void;
  finalizePlayer: (forceSold?: boolean, winningBid?: Bid | null) => void;
  goToNextPlayer: () => void;
  goToPreviousPlayer: () => void;
  selectPlayerForAuction: (playerId: string) => void;
  startRoundTwo: () => void;
  resetAuction: () => void;

  // Management & Retentions
  addPlayer: (newPlayer: Partial<Player>) => void;
  importPlayersList: (newPlayers: Player[]) => void;
  retainPlayer: (franchiseId: string, playerId: string, price: number) => void;
  directSignPlayer: (franchiseId: string, playerId: string, price: number) => void;
  applyOfficialPsl11Retentions: () => { count: number; totalPurseSpent: number };
  retainPsl11SquadPlayer: (franchiseId: string, player: Psl11SquadPlayer) => void;
  toggleWatchlist: (franchiseId: string, playerId: string, maxBid?: number, notes?: string, priority?: 'High' | 'Medium' | 'Low') => void;
  savePlayingXI: (franchiseId: string, playerIds: string[], captainId?: string, viceCaptainId?: string) => void;
  proposeTrade: (trade: Omit<TradeOffer, "id" | "createdAt" | "status">) => void;
  handleTradeAction: (tradeId: string, action: 'accept' | 'reject' | 'admin_approve' | 'cancel') => void;
  updateSettings: (newSettings: Partial<AuctionSettings>) => void;
  toggleBotBidding: () => void;
  botBiddingEnabled: boolean;
  isCloudConnected: boolean;

  // First-Come-First-Serve Team Selection & Owner Identity
  claimFranchise: (franchiseId: string, ownerName: string) => { success: boolean; message: string };
  releaseFranchise: (franchiseId: string) => void;

  // Real-time Chat Channels
  messages: AuctionMessage[];
  sendMessage: (channel: 'owners' | 'spectators', text: string) => void;

  // Admin Account & Sign-up
  adminUser: AdminUser | null;
  signupAdmin: (email: string, password: string, name: string) => { success: boolean; message: string };

  // Live Player addition during auction
  addNewPlayerDuringAuction: (player: Partial<Player>) => void;
}

const DEFAULT_SETTINGS: AuctionSettings = {
  id: "psl-12-default",
  name: "PSL 12 Official Mock Auction Room",
  roomCode: "PSL12-AUCTION-2027",
  season: "PSL Season 12",
  rulePreset: "PSL11",
  currency: "PKR",
  totalPursePerTeam: 450000000, // 45 Crore standard
  maxQualifyingPurse: 505000000, // 50.5 Crore qualifying
  minSpendRequirement: 365000000, // 36.5 Crore
  minSquadSize: 16,
  maxSquadSize: 20,
  minOverseasPlayingXI: 3,
  maxOverseasPlayingXI: 4,
  minUncappedU23Squad: 2,
  minUncappedU23PlayingXI: 1,
  maxRetentions: 4,
  maxDirectForeignSignings: 1,
  defaultTimerSeconds: 30,
  timerResetSeconds: 15,
  extensionSeconds: 10,
  extensionTriggerSeconds: 5,
  autoSellOnAllOut: true,
  soundEffectsEnabled: true,
  voiceAnnouncements: true,
  playerOccurrenceOrder: "sequential",
  enableRTM: true,
  rtmCardsPerFranchise: 2,
  scheduledStartTime: "",
  botBiddingEnabled: true,
  manualFranchiseId: "iu",
  allowRetentions: true,
  allowTradesBeforeAuction: true,
  allowTradesAfterAuction: true,
  reEnterUnsoldRule: "all",
  unsoldDiscountPercent: 0,
};

const STORAGE_KEY = "psl_12_mock_auction_state_v2";
const AUTH_SESSION_KEY = "psl_12_mock_auction_session_auth_v2";

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export const AuctionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication & RBAC (Isolated per browser tab/session - defaults to Islamabad United for immediate testing)
  const [role, setRole] = useState<UserRole>("team_owner");
  const [authenticatedFranchiseId, setAuthenticatedFranchiseId] = useState<string | null>("iu");

  // Core Auction Shared State
  const [rulePreset, setRulePresetState] = useState<RulePreset>("PSL11");
  const [auctionStatus, setAuctionStatus] = useState<AuctionStatus>("Ready");
  const [franchises, setFranchises] = useState<Franchise[]>(INITIAL_FRANCHISES);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [currentBids, setCurrentBids] = useState<Bid[]>([]);
  const [franchiseStatuses, setFranchiseStatuses] = useState<Record<string, 'active' | 'skipped' | 'out'>>({});
  const [timer, setTimer] = useState<number>(DEFAULT_SETTINGS.defaultTimerSeconds);
  const [timerExpiresAt, setTimerExpiresAt] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [settings, setSettings] = useState<AuctionSettings>(DEFAULT_SETTINGS);
  const [watchlists, setWatchlists] = useState<WatchlistItem[]>([]);
  const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>([]);
  const [eventLogs, setEventLogs] = useState<AuctionEventLog[]>([]);
  const [rtmState, setRtmState] = useState<RtmState | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [messages, setMessages] = useState<AuctionMessage[]>([
    {
      id: "msg-init-1",
      senderId: "system",
      senderName: "PSL Control Room",
      senderRole: "admin",
      channel: "owners",
      text: "Welcome to HBL PSL 12 Live Franchise War Room! All official trades, retentions, and strategy discussions take place here.",
      timestamp: Date.now() - 60000,
    },
    {
      id: "msg-init-2",
      senderId: "system",
      senderName: "HBL Broadcast Feed",
      senderRole: "spectator",
      channel: "spectators",
      text: "Welcome cricket fans to the HBL PSL 12 Live Virtual Player Auction broadcast! Track all bids, player sales, and franchise squad compositions in real-time.",
      timestamp: Date.now() - 60000,
    },
  ]);

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const supabaseChannelRef = useRef<RealtimeChannel | null>(null);
  const supabaseSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isHydratedRef = useRef<boolean>(false);
  const lastFinalizedIdxRef = useRef<number | null>(null);

  // Reusable state synchronization applier
  const applySyncedState = useCallback((syncData: Record<string, unknown>) => {
    if (syncData.franchises) setFranchises(syncData.franchises as Franchise[]);
    if (syncData.players) setPlayers(syncData.players as Player[]);
    if (syncData.auctionStatus) setAuctionStatus(syncData.auctionStatus as AuctionStatus);
    if (typeof syncData.currentPlayerIndex === "number") setCurrentPlayerIndex(syncData.currentPlayerIndex);
    if (syncData.currentBids) setCurrentBids(syncData.currentBids as Bid[]);
    if (syncData.franchiseStatuses) setFranchiseStatuses(syncData.franchiseStatuses as Record<string, "active" | "skipped" | "out">);
    if (typeof syncData.timer === "number") setTimer(syncData.timer);
    if (typeof syncData.timerExpiresAt === "number" || syncData.timerExpiresAt === null) {
      setTimerExpiresAt(syncData.timerExpiresAt as number | null);
    }
    if (typeof syncData.isTimerRunning === "boolean") setIsTimerRunning(syncData.isTimerRunning);
    if (syncData.settings) setSettings(syncData.settings as AuctionSettings);
    if (syncData.rulePreset) setRulePresetState(syncData.rulePreset as RulePreset);
    if (syncData.watchlists) setWatchlists(syncData.watchlists as WatchlistItem[]);
    if (syncData.tradeOffers) setTradeOffers(syncData.tradeOffers as TradeOffer[]);
    if (syncData.eventLogs) setEventLogs(syncData.eventLogs as AuctionEventLog[]);
    if ("rtmState" in syncData) setRtmState(syncData.rtmState as RtmState | null);
    if (syncData.messages) setMessages(syncData.messages as AuctionMessage[]);
    if (syncData.adminUser) setAdminUser(syncData.adminUser as AdminUser);
  }, []);

  // Broadcast function to local tabs AND global Supabase Realtime channel
  const broadcastSync = useCallback((data: Record<string, unknown>) => {
    // 1. Cross-tab on local machine
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({
          type: "STATE_SYNC",
          payload: data,
        });
      } catch {}
    }

    // 2. Cloud Realtime across all internet users/devices via Supabase
    if (supabaseChannelRef.current) {
      broadcastSupabaseEvent(supabaseChannelRef.current, "STATE_SYNC", data);
    }
  }, []);

  // Save shared state to LocalStorage and debounced Supabase Cloud DB
  const persistState = useCallback(() => {
    if (typeof window !== "undefined" && isHydratedRef.current) {
      const stateToSave = {
        franchises,
        players,
        auctionStatus,
        currentPlayerIndex,
        currentBids,
        franchiseStatuses,
        settings,
        rulePreset,
        watchlists,
        tradeOffers,
        eventLogs,
        rtmState,
        timer,
        timerExpiresAt,
        isTimerRunning,
        messages,
        adminUser,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch {}

      // Supabase cloud persistence (debounced by 800ms to prevent flooding)
      if (isSupabaseConfigured()) {
        if (supabaseSaveTimeoutRef.current) {
          clearTimeout(supabaseSaveTimeoutRef.current);
        }
        supabaseSaveTimeoutRef.current = setTimeout(() => {
          saveRemoteAuctionState(stateToSave);
        }, 800);
      }
    }
  }, [
    franchises,
    players,
    auctionStatus,
    currentPlayerIndex,
    currentBids,
    franchiseStatuses,
    settings,
    rulePreset,
    watchlists,
    tradeOffers,
    eventLogs,
    rtmState,
    timer,
    timerExpiresAt,
    isTimerRunning,
    messages,
    adminUser,
  ]);

  useEffect(() => {
    persistState();
  }, [persistState]);

  // Load state from LocalStorage and SessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Restore tab session authentication (isolated from other tabs)
      try {
        const sessionAuth = sessionStorage.getItem(AUTH_SESSION_KEY);
        if (sessionAuth) {
          const parsedAuth = JSON.parse(sessionAuth);
          if (parsedAuth.role) setRole(parsedAuth.role);
          if (parsedAuth.authenticatedFranchiseId !== undefined) {
            setAuthenticatedFranchiseId(parsedAuth.authenticatedFranchiseId);
          }
        } else {
          setRole("team_owner");
          setAuthenticatedFranchiseId("iu");
        }
      } catch {}

      // 2. Load shared room state from LocalStorage
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
          if (parsed.rulePreset) setRulePresetState(parsed.rulePreset);
          if (parsed.watchlists) setWatchlists(parsed.watchlists);
          if (parsed.tradeOffers) setTradeOffers(parsed.tradeOffers);
          if (parsed.eventLogs) setEventLogs(parsed.eventLogs);
          if (typeof parsed.timer === "number") setTimer(parsed.timer);
          if (typeof parsed.timerExpiresAt === "number" || parsed.timerExpiresAt === null) {
            setTimerExpiresAt(parsed.timerExpiresAt);
          }
          if (typeof parsed.isTimerRunning === "boolean") setIsTimerRunning(parsed.isTimerRunning);
          if (parsed.rtmState !== undefined) setRtmState(parsed.rtmState);
        } catch {}
      }
      isHydratedRef.current = true;

      // 3. Check URL query parameters for instant franchise link join or spectator mode
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const joinKey = urlParams.get("join") || urlParams.get("passkey") || urlParams.get("code");
        const teamId = urlParams.get("team");
        const requestedRole = urlParams.get("role");

        if (joinKey) {
          const cleanKey = joinKey.trim().toUpperCase();
          const matched = INITIAL_FRANCHISES.find(
            (f) =>
              f.privatePasskey.toUpperCase() === cleanKey ||
              f.id.toUpperCase() === cleanKey ||
              f.shortName.toUpperCase() === cleanKey ||
              (f.id === "raw" &&
                (cleanKey === "RPZ-2027" ||
                  cleanKey === "RAW-2027" ||
                  cleanKey === "RPZ" ||
                  cleanKey === "RAW"))
          );
          if (matched) {
            setRole("team_owner");
            setAuthenticatedFranchiseId(matched.id);
            sessionStorage.setItem(
              AUTH_SESSION_KEY,
              JSON.stringify({ role: "team_owner", authenticatedFranchiseId: matched.id })
            );
          }
        } else if (teamId) {
          const matched = INITIAL_FRANCHISES.find(
            (f) =>
              f.id.toLowerCase() === teamId.toLowerCase() ||
              (f.id === "raw" && (teamId.toLowerCase() === "rpz" || teamId.toLowerCase() === "rawalpindiz"))
          );
          if (matched) {
            setRole("team_owner");
            setAuthenticatedFranchiseId(matched.id);
            sessionStorage.setItem(
              AUTH_SESSION_KEY,
              JSON.stringify({ role: "team_owner", authenticatedFranchiseId: matched.id })
            );
          }
        } else if (requestedRole === "admin" || urlParams.get("admin") === "true") {
          setRole("admin");
          setAuthenticatedFranchiseId(null);
          sessionStorage.setItem(
            AUTH_SESSION_KEY,
            JSON.stringify({ role: "admin", authenticatedFranchiseId: null })
          );
        } else if (requestedRole === "spectator") {
          setRole("spectator");
          setAuthenticatedFranchiseId(null);
          sessionStorage.setItem(
            AUTH_SESSION_KEY,
            JSON.stringify({ role: "spectator", authenticatedFranchiseId: null })
          );
        }
      } catch {}

      // 4. Initialize cross-tab BroadcastChannel
      try {
        const bc = new BroadcastChannel("psl_auction_sync_channel_v2");
        broadcastChannelRef.current = bc;
        bc.onmessage = (event) => {
          if (event.data?.type === "STATE_SYNC") {
            const syncData = event.data.payload;
            if (syncData) applySyncedState(syncData);
          } else if (event.data?.type === "REQUEST_SYNC") {
            // New tab joined, provide current state
            try {
              const currentSaved = localStorage.getItem(STORAGE_KEY);
              if (currentSaved) {
                const parsed = JSON.parse(currentSaved);
                bc.postMessage({ type: "STATE_SYNC", payload: parsed });
              }
            } catch {}
          }
        };

        // Emit sync request to get active room state from any active admin or peer tab
        bc.postMessage({ type: "REQUEST_SYNC" });
      } catch {}

      // 5. Cross-window/cross-tab Storage Event Listener
      const handleStorageEvent = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY && event.newValue) {
          try {
            const parsed = JSON.parse(event.newValue);
            if (parsed) applySyncedState(parsed);
          } catch {}
        }
      };

      window.addEventListener("storage", handleStorageEvent);

      // 6. Initialize Supabase Cloud Realtime Channel (Global Multi-Device Synchronization)
      if (isSupabaseConfigured()) {
        const client = getSupabase();
        if (client) {
          // Fetch existing remote auction room state from database
          fetchRemoteAuctionState().then((remoteState) => {
            if (remoteState) {
              applySyncedState(remoteState);
            }
          });

          // Join realtime channel
          const channel = client.channel("psl_live_auction_channel", {
            config: { broadcast: { self: false } },
          });

          channel
            .on("broadcast", { event: "STATE_SYNC" }, (event) => {
              if (event.payload) {
                applySyncedState(event.payload as Record<string, unknown>);
              }
            })
            .on(
              "postgres_changes",
              {
                event: "*",
                schema: "public",
                table: "psl_auction_rooms",
                filter: `room_id=eq.${DEFAULT_ROOM_ID}`,
              },
              (payload) => {
                if (payload.new && (payload.new as { state?: Record<string, unknown> }).state) {
                  applySyncedState((payload.new as { state: Record<string, unknown> }).state);
                }
              }
            )
            .subscribe((status) => {
              if (status === "SUBSCRIBED") {
                setIsCloudConnected(true);
              }
            });

          supabaseChannelRef.current = channel;
        }
      }

      return () => {
        window.removeEventListener("storage", handleStorageEvent);
        if (broadcastChannelRef.current) {
          broadcastChannelRef.current.close();
        }
        if (supabaseChannelRef.current) {
          supabaseChannelRef.current.unsubscribe();
        }
        if (supabaseSaveTimeoutRef.current) {
          clearTimeout(supabaseSaveTimeoutRef.current);
        }
      };
    }
  }, []);

  // Derived current player, highest bid, and active franchise
  const currentPlayer = players[currentPlayerIndex] || null;
  const highestBid = currentBids.length > 0 ? currentBids[currentBids.length - 1] : null;
  const activeFranchise = authenticatedFranchiseId
    ? franchises.find((f) => f.id === authenticatedFranchiseId)
    : undefined;

  // Helper to add event log
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

  // --- Authentication Handlers (Isolated to current tab session) ---
  const loginAsAdmin = (password: string) => {
    if (password === "admin123" || password === "admin" || password === "psl12") {
      setRole("admin");
      setAuthenticatedFranchiseId(null);
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(
            AUTH_SESSION_KEY,
            JSON.stringify({ role: "admin", authenticatedFranchiseId: null })
          );
        } catch {}
      }
      addLog("admin", "Super Administrator logged in.");
      return { success: true, message: "Welcome Super Administrator! Auction control unlocked." };
    }
    return { success: false, message: "Invalid Admin password. (Hint: default is admin123 or psl2027)" };
  };

  const signupAdmin = (email: string, pass: string, name: string) => {
    if (!email || !pass || !name) {
      return { success: false, message: "All fields are required." };
    }
    const newAdmin: AdminUser = {
      id: `admin-${Date.now()}`,
      email: email.trim(),
      name: name.trim(),
      createdAt: Date.now(),
    };
    setAdminUser(newAdmin);
    setRole("admin");
    setAuthenticatedFranchiseId(null);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          AUTH_SESSION_KEY,
          JSON.stringify({ role: "admin", authenticatedFranchiseId: null, adminUser: newAdmin })
        );
      } catch {}
    }
    broadcastSync({ adminUser: newAdmin });
    addLog("admin", `Admin registered: ${name} (${email})`);
    return { success: true, message: `Admin account created! Welcome ${name}.` };
  };

  const claimFranchise = (franchiseId: string, ownerName: string) => {
    const f = franchises.find((t) => t.id === franchiseId);
    if (!f) return { success: false, message: "Franchise not found." };
    if (f.isClaimed && f.ownerName && f.ownerName.toLowerCase() !== ownerName.toLowerCase()) {
      return { success: false, message: `${f.name} is already claimed by ${f.ownerName}!` };
    }

    const updatedFranchises = franchises.map((team) =>
      team.id === franchiseId
        ? {
            ...team,
            isClaimed: true,
            ownerName: ownerName.trim() || team.ownerName,
            claimedByUserId: `user-${ownerName.toLowerCase().replace(/\s+/g, "_")}`,
          }
        : team
    );

    setFranchises(updatedFranchises);
    setRole("team_owner");
    setAuthenticatedFranchiseId(franchiseId);

    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          AUTH_SESSION_KEY,
          JSON.stringify({ role: "team_owner", authenticatedFranchiseId: franchiseId, ownerName })
        );
      } catch {}
    }

    broadcastSync({ franchises: updatedFranchises });
    addLog("admin", `${ownerName} claimed ownership of ${f.name}.`);
    return { success: true, message: `Successfully claimed ${f.name} as ${ownerName}!` };
  };

  const releaseFranchise = (franchiseId: string) => {
    const updatedFranchises = franchises.map((team) =>
      team.id === franchiseId
        ? { ...team, isClaimed: false, ownerName: "" }
        : team
    );
    setFranchises(updatedFranchises);
    broadcastSync({ franchises: updatedFranchises });
  };

  const sendMessage = (channel: "owners" | "spectators", text: string) => {
    if (!text.trim()) return;
    const currentTeam = franchises.find((f) => f.id === authenticatedFranchiseId);
    const newMsg: AuctionMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderId: role === "admin" ? "admin" : (currentTeam?.id || "spectator"),
      senderName: role === "admin" ? (adminUser?.name || "Super Admin") : (currentTeam ? `${currentTeam.name} (${currentTeam.ownerName || "Owner"})` : "Fan / Spectator"),
      senderRole: role,
      franchiseId: currentTeam?.id,
      franchiseName: currentTeam?.name,
      channel,
      text: text.trim(),
      timestamp: Date.now(),
    };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    broadcastSync({ messages: updatedMessages });
  };

  const addNewPlayerDuringAuction = (newPlayerData: Partial<Player>) => {
    const id = `p-live-${Date.now()}`;
    const newPlayer: Player = {
      id,
      name: newPlayerData.name || "Custom Player",
      photoUrl: newPlayerData.photoUrl || "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait-lg-webp/prd/assets/players/generic/colored/69957.png",
      nationality: newPlayerData.nationality || "Pakistan",
      isOverseas: Boolean(newPlayerData.isOverseas),
      age: newPlayerData.age || 25,
      battingStyle: newPlayerData.battingStyle || "Right-hand bat",
      bowlingStyle: newPlayerData.bowlingStyle || "Right-arm medium",
      primaryRole: newPlayerData.primaryRole || "All-Rounder",
      category: newPlayerData.category || "Silver",
      basePrice: newPlayerData.basePrice || 7000000,
      currentPrice: newPlayerData.basePrice || 7000000,
      status: "upcoming",
      auctionRound: 1,
      stats: newPlayerData.stats || {
        matches: 20,
        runs: 350,
        battingAverage: 25.0,
        strikeRate: 130.0,
        wickets: 15,
        economyRate: 8.2,
      },
      hasPlayedPSL: true,
      statsType: "T20",
      cricinfoUrl: `https://www.espncricinfo.com/cricketers/${(newPlayerData.name || "").toLowerCase().replace(/\s+/g, "-")}`,
    };

    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    broadcastSync({ players: updatedPlayers });
    addLog("admin", `Admin added new player to auction pool: ${newPlayer.name} (${newPlayer.category})`);
  };

  const loginAsTeamOwner = (passkey: string, roomCode?: string) => {
    const cleanKey = passkey.trim().toUpperCase();
    const matchedFranchise = franchises.find(
      (f) =>
        f.privatePasskey.toUpperCase() === cleanKey ||
        f.id.toUpperCase() === cleanKey ||
        f.shortName.toUpperCase() === cleanKey ||
        (f.id === "raw" &&
          (cleanKey === "RPZ-2027" ||
            cleanKey === "RAW-2027" ||
            cleanKey === "RPZ" ||
            cleanKey === "RAW"))
    );

    if (matchedFranchise) {
      setRole("team_owner");
      setAuthenticatedFranchiseId(matchedFranchise.id);
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(
            AUTH_SESSION_KEY,
            JSON.stringify({ role: "team_owner", authenticatedFranchiseId: matchedFranchise.id })
          );
        } catch {}
      }
      addLog("admin", `${matchedFranchise.name} Team Owner joined room.`);
      return { success: true, message: `Access granted! You are logged in as Team Owner of ${matchedFranchise.name}.` };
    }
    return { success: false, message: "Invalid Team Passkey. Please verify the code provided by the Admin." };
  };

  const logoutToSpectator = () => {
    setRole("spectator");
    setAuthenticatedFranchiseId(null);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          AUTH_SESSION_KEY,
          JSON.stringify({ role: "spectator", authenticatedFranchiseId: null })
        );
      } catch {}
    }
  };

  const switchRoleDirectly = (newRole: UserRole, franchiseId?: string) => {
    setRole(newRole);
    const targetFranchiseId = newRole === "team_owner" ? (franchiseId || "iu") : null;
    setAuthenticatedFranchiseId(targetFranchiseId);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          AUTH_SESSION_KEY,
          JSON.stringify({ role: newRole, authenticatedFranchiseId: targetFranchiseId })
        );
      } catch {}
    }
    const team = franchises.find((f) => f.id === targetFranchiseId);
    addLog("admin", `Session switched role to ${newRole}${team ? ` (${team.name})` : ""}`);
  };

  // Rule Preset Selector
  const setRulePreset = (preset: RulePreset) => {
    setRulePresetState(preset);
    let updatedSettings = { ...settings };
    if (preset === "PSL11") {
      updatedSettings = {
        ...updatedSettings,
        rulePreset: "PSL11",
        name: "PSL 11 Official Rules Mock Auction",
        totalPursePerTeam: 450000000,
        maxQualifyingPurse: 505000000,
        minSpendRequirement: 365000000,
        minSquadSize: 16,
        maxSquadSize: 20,
        minOverseasPlayingXI: 3,
        maxOverseasPlayingXI: 4,
        minUncappedU23Squad: 2,
        minUncappedU23PlayingXI: 1,
        maxRetentions: 4,
        maxDirectForeignSignings: 1,
      };
      addLog("admin", "Rule Preset changed to: PRESET A - PSL 11 Official Rules.");
    } else if (preset === "PSL12") {
      updatedSettings = {
        ...updatedSettings,
        rulePreset: "PSL12",
        name: "PSL 12 Announced Framework Mock Auction",
        totalPursePerTeam: 450000000,
        maxQualifyingPurse: 505000000,
        minSpendRequirement: 365000000,
        minSquadSize: 16,
        maxSquadSize: 20,
        maxDirectForeignSignings: 1,
      };
      addLog("admin", "Rule Preset changed to: PRESET B - PSL 12 Announced Framework.");
    }
    setSettings(updatedSettings);
    broadcastSync({ settings: updatedSettings, rulePreset: preset });
  };

  // Navigate to Next Player
  const goToNextPlayer = useCallback(() => {
    setCurrentBids([]);
    setFranchiseStatuses({});
    const duration = settings.defaultTimerSeconds || 30;
    setTimer(duration);
    setRtmState(null);

    let nextIdx = currentPlayerIndex + 1;
    while (nextIdx < players.length && players[nextIdx].status !== "upcoming") {
      nextIdx++;
    }

    if (nextIdx < players.length) {
      setCurrentPlayerIndex(nextIdx);
      const isLive = auctionStatus === "Live";
      const expiresAt = isLive ? Date.now() + duration * 1000 : null;
      setIsTimerRunning(isLive);
      setTimerExpiresAt(expiresAt);
      lastFinalizedIdxRef.current = null;
      if (isLive) {
        soundEngine.speakAnnouncement(
          `Next player: ${players[nextIdx].name}, category ${players[nextIdx].category}, base price ${(players[nextIdx].basePrice / 10000000).toFixed(2)} Crore.`
        );
      }
      broadcastSync({
        currentPlayerIndex: nextIdx,
        currentBids: [],
        franchiseStatuses: {},
        timer: duration,
        timerExpiresAt: expiresAt,
        isTimerRunning: isLive,
        rtmState: null,
      });
    } else {
      setAuctionStatus("Completed");
      setIsTimerRunning(false);
      setTimerExpiresAt(null);
      soundEngine.speakAnnouncement("The PSL Mock Auction has successfully concluded!");
      addLog("admin", "Auction completed. All players processed.");
      broadcastSync({
        auctionStatus: "Completed",
        isTimerRunning: false,
        timerExpiresAt: null,
        rtmState: null,
      });
    }
  }, [currentPlayerIndex, players, auctionStatus, settings.defaultTimerSeconds, broadcastSync]);

  // Complete a confirmed sale (direct or via RTM)
  const completePlayerSale = useCallback(
    (playerToSell: Player, soldToFranchiseId: string, soldPrice: number, isRtmSale: boolean = false) => {
      const winningTeam = franchises.find((f) => f.id === soldToFranchiseId);
      soundEngine.playGavelHammerSound();
      soundEngine.playSoldFanfare();
      soundEngine.speakAnnouncement(
        `${playerToSell.name} sold to ${winningTeam?.name || "franchise"} for PKR ${(soldPrice / 10000000).toFixed(2)} Crore${isRtmSale ? " via Right to Match!" : "!"}`
      );

      if (typeof window !== "undefined") {
        try {
          confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.6 },
            colors: [winningTeam?.primaryColor || "#10b981", "#fbbf24", "#ffffff"],
          });
        } catch {}
      }

      // Deduct purse, increment squad count, decrement RTM card if used
      const updatedFranchises = franchises.map((f) => {
        if (f.id === soldToFranchiseId) {
          return {
            ...f,
            remainingPurse: f.remainingPurse - soldPrice,
            squadCount: f.squadCount + 1,
            rtmCardsLeft: isRtmSale ? Math.max(0, (f.rtmCardsLeft ?? 2) - 1) : f.rtmCardsLeft,
          };
        }
        return f;
      });
      setFranchises(updatedFranchises);

      // Update player record
      const updatedPlayers = players.map((p) => {
        if (p.id === playerToSell.id) {
          return {
            ...p,
            status: "sold" as const,
            soldToFranchiseId: soldToFranchiseId,
            soldPrice: soldPrice,
            currentPrice: soldPrice,
            wasRtmUsed: Boolean(isRtmSale),
          };
        }
        return p;
      });
      setPlayers(updatedPlayers);

      addLog(
        "sold",
        `${playerToSell.name} sold to ${winningTeam?.name || soldToFranchiseId} for ${(soldPrice / 10000000).toFixed(2)} Cr${isRtmSale ? " (RTM Card Exercised)" : ""}`,
        {
          playerId: playerToSell.id,
          playerName: playerToSell.name,
          franchiseId: soldToFranchiseId,
          franchiseName: winningTeam?.name,
          amount: soldPrice,
        }
      );

      setRtmState(null);
      setIsTimerRunning(false);
      setTimerExpiresAt(null);
      broadcastSync({
        franchises: updatedFranchises,
        players: updatedPlayers,
        rtmState: null,
        isTimerRunning: false,
        timerExpiresAt: null,
      });

      setTimeout(() => {
        goToNextPlayer();
      }, 3500);
    },
    [franchises, players, goToNextPlayer, broadcastSync]
  );

  // Finalize current player (Sold, Unsold, or Trigger RTM)
  const finalizePlayer = useCallback(
    (forceSold?: boolean, winningBidParam?: Bid | null) => {
      const current = players[currentPlayerIndex];
      if (!current) return;

      const finalBid = winningBidParam !== undefined ? winningBidParam : (currentBids.length > 0 ? currentBids[currentBids.length - 1] : null);
      const isSold = forceSold !== undefined ? forceSold : !!finalBid;

      setIsTimerRunning(false);
      setTimerExpiresAt(null);

      if (isSold && finalBid) {
        // Check RTM (Right to Match) criteria
        if (
          settings.enableRTM &&
          current.previousFranchiseId &&
          current.previousFranchiseId !== finalBid.franchiseId
        ) {
          const originalFranchise = franchises.find((f) => f.id === current.previousFranchiseId);
          if (
            originalFranchise &&
            (originalFranchise.rtmCardsLeft ?? 2) > 0 &&
            originalFranchise.remainingPurse >= finalBid.amount
          ) {
            const newRtm: RtmState = {
              active: true,
              playerId: current.id,
              originalFranchiseId: originalFranchise.id,
              originalFranchiseName: originalFranchise.name,
              highestBidderFranchiseId: finalBid.franchiseId,
              highestBidderFranchiseName: finalBid.franchiseName,
              initialBidAmount: finalBid.amount,
              stage: "prompt_rtm",
              expiresAt: Date.now() + 30000,
            };
            setRtmState(newRtm);
            soundEngine.playRtmAlert();
            soundEngine.speakAnnouncement(
              `${originalFranchise.name} has the Right to Match for ${current.name}!`
            );
            addLog(
              "rtm",
              `RTM Available: ${originalFranchise.name} can match ${finalBid.franchiseName}'s bid of PKR ${(finalBid.amount / 10000000).toFixed(2)} Cr for ${current.name}`,
              {
                playerId: current.id,
                playerName: current.name,
                franchiseId: originalFranchise.id,
                franchiseName: originalFranchise.name,
                amount: finalBid.amount,
              }
            );
            broadcastSync({ rtmState: newRtm, isTimerRunning: false, timerExpiresAt: null });
            return;
          }
        }

        // Direct standard sale
        completePlayerSale(current, finalBid.franchiseId, finalBid.amount, false);
      } else {
        soundEngine.playGavelHammerSound();
        soundEngine.speakAnnouncement(`${current.name} marked unsold.`);

        const updatedPlayers = players.map((p, idx) => {
          if (idx === currentPlayerIndex) {
            return { ...p, status: "unsold" as const };
          }
          return p;
        });
        setPlayers(updatedPlayers);

        addLog("unsold", `${current.name} marked UNSOLD.`, {
          playerId: current.id,
          playerName: current.name,
        });

        broadcastSync({ players: updatedPlayers, isTimerRunning: false, timerExpiresAt: null });

        setTimeout(() => {
          goToNextPlayer();
        }, 3500);
      }
    },
    [players, currentPlayerIndex, currentBids, franchises, settings.enableRTM, completePlayerSale, goToNextPlayer, broadcastSync]
  );

  // RTM Action Handlers
  const exerciseRtm = () => {
    if (!rtmState || rtmState.stage !== "prompt_rtm") return;
    const nextState: RtmState = {
      ...rtmState,
      stage: "awaiting_raise",
      expiresAt: Date.now() + 30000,
    };
    setRtmState(nextState);
    soundEngine.playRtmAlert();
    soundEngine.speakAnnouncement(
      `${rtmState.originalFranchiseName} has exercised Right to Match! ${rtmState.highestBidderFranchiseName}, enter your final revised bid.`
    );
    addLog(
      "rtm",
      `${rtmState.originalFranchiseName} exercised RTM for ${currentPlayer?.name}! Awaiting final price raise from ${rtmState.highestBidderFranchiseName}.`,
      {
        franchiseId: rtmState.originalFranchiseId,
        franchiseName: rtmState.originalFranchiseName,
      }
    );
    broadcastSync({ rtmState: nextState });
  };

  const declineRtmInitial = () => {
    if (!rtmState || rtmState.stage !== "prompt_rtm") return;
    addLog(
      "rtm",
      `${rtmState.originalFranchiseName} declined RTM for ${currentPlayer?.name}. Selling to ${rtmState.highestBidderFranchiseName}.`,
      {
        franchiseId: rtmState.originalFranchiseId,
        franchiseName: rtmState.originalFranchiseName,
      }
    );
    const current = players.find((p) => p.id === rtmState.playerId);
    if (current) {
      completePlayerSale(current, rtmState.highestBidderFranchiseId, rtmState.initialBidAmount, false);
    }
  };

  const submitRtmRaise = (newAmount: number): { success: boolean; message: string } => {
    if (!rtmState || rtmState.stage !== "awaiting_raise") {
      return { success: false, message: "RTM is not awaiting a revised bid." };
    }
    if (newAmount <= rtmState.initialBidAmount) {
      return {
        success: false,
        message: `Revised bid must be strictly greater than current bid of PKR ${(rtmState.initialBidAmount / 10000000).toFixed(2)} Crore!`,
      };
    }

    const highestBidderTeam = franchises.find((f) => f.id === rtmState.highestBidderFranchiseId);
    if (highestBidderTeam && highestBidderTeam.remainingPurse < newAmount) {
      return {
        success: false,
        message: `${rtmState.highestBidderFranchiseName} does not have sufficient remaining purse for PKR ${(newAmount / 10000000).toFixed(2)} Cr!`,
      };
    }

    const nextState: RtmState = {
      ...rtmState,
      revisedBidAmount: newAmount,
      stage: "rtm_decision",
      expiresAt: Date.now() + 30000,
    };
    setRtmState(nextState);
    soundEngine.playBidSound();
    soundEngine.speakAnnouncement(
      `${rtmState.highestBidderFranchiseName} has raised the price to PKR ${(newAmount / 10000000).toFixed(2)} Crore! ${rtmState.originalFranchiseName}, do you accept?`
    );
    addLog(
      "rtm",
      `${rtmState.highestBidderFranchiseName} raised final bid to PKR ${(newAmount / 10000000).toFixed(2)} Cr. ${rtmState.originalFranchiseName} deciding to match.`,
      {
        franchiseId: rtmState.highestBidderFranchiseId,
        franchiseName: rtmState.highestBidderFranchiseName,
        amount: newAmount,
      }
    );
    broadcastSync({ rtmState: nextState });
    return { success: true, message: `Final price raised to PKR ${(newAmount / 10000000).toFixed(2)} Cr.` };
  };

  const acceptRtmFinal = () => {
    if (!rtmState || rtmState.stage !== "rtm_decision" || !rtmState.revisedBidAmount) return;
    const current = players.find((p) => p.id === rtmState.playerId);
    if (current) {
      completePlayerSale(current, rtmState.originalFranchiseId, rtmState.revisedBidAmount, true);
    }
  };

  const declineRtmFinal = () => {
    if (!rtmState || rtmState.stage !== "rtm_decision" || !rtmState.revisedBidAmount) return;
    addLog(
      "rtm",
      `${rtmState.originalFranchiseName} declined to match PKR ${(rtmState.revisedBidAmount / 10000000).toFixed(2)} Cr. Sold to ${rtmState.highestBidderFranchiseName}!`,
      {
        franchiseId: rtmState.originalFranchiseId,
        franchiseName: rtmState.originalFranchiseName,
        amount: rtmState.revisedBidAmount,
      }
    );
    const current = players.find((p) => p.id === rtmState.playerId);
    if (current) {
      completePlayerSale(current, rtmState.highestBidderFranchiseId, rtmState.revisedBidAmount, false);
    }
  };

  const cancelRtm = () => {
    if (!rtmState) return;
    const current = players.find((p) => p.id === rtmState.playerId);
    if (current) {
      completePlayerSale(current, rtmState.highestBidderFranchiseId, rtmState.initialBidAmount, false);
    }
  };

  const goToPreviousPlayer = () => {
    if (currentPlayerIndex > 0) {
      const prevIdx = currentPlayerIndex - 1;
      const duration = settings.defaultTimerSeconds || 30;
      const isLive = auctionStatus === "Live";
      const expiresAt = isLive ? Date.now() + duration * 1000 : null;
      setCurrentBids([]);
      setFranchiseStatuses({});
      setTimer(duration);
      setTimerExpiresAt(expiresAt);
      setIsTimerRunning(isLive);
      setCurrentPlayerIndex(prevIdx);
      setRtmState(null);
      lastFinalizedIdxRef.current = null;
      broadcastSync({
        currentPlayerIndex: prevIdx,
        currentBids: [],
        franchiseStatuses: {},
        timer: duration,
        timerExpiresAt: expiresAt,
        isTimerRunning: isLive,
        rtmState: null,
      });
    }
  };

  const selectPlayerForAuction = (playerId: string) => {
    const idx = players.findIndex((p) => p.id === playerId);
    if (idx !== -1) {
      const duration = settings.defaultTimerSeconds || 30;
      const isLive = auctionStatus === "Live";
      const expiresAt = isLive ? Date.now() + duration * 1000 : null;
      setCurrentBids([]);
      setFranchiseStatuses({});
      setTimer(duration);
      setTimerExpiresAt(expiresAt);
      setIsTimerRunning(isLive);
      setCurrentPlayerIndex(idx);
      setRtmState(null);
      lastFinalizedIdxRef.current = null;
      broadcastSync({
        currentPlayerIndex: idx,
        currentBids: [],
        franchiseStatuses: {},
        timer: duration,
        timerExpiresAt: expiresAt,
        isTimerRunning: isLive,
        rtmState: null,
      });
    }
  };

  // Master Synchronized Timer Tick (Wall-Clock Epoch Based)
  useEffect(() => {
    if (auctionStatus === "Live" && isTimerRunning) {
      const interval = setInterval(() => {
        if (!timerExpiresAt) return;
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((timerExpiresAt - now) / 1000));
        setTimer(remaining);

        if (remaining <= 5 && remaining > 0) {
          soundEngine.playTickSound(true);
        } else if (remaining % 5 === 0 && remaining > 0) {
          soundEngine.playTickSound(false);
        }

        if (remaining <= 0) {
          if (lastFinalizedIdxRef.current !== currentPlayerIndex) {
            lastFinalizedIdxRef.current = currentPlayerIndex;
            setIsTimerRunning(false);
            setTimerExpiresAt(null);
            finalizePlayer();
          }
        }
      }, 250);

      return () => clearInterval(interval);
    }
  }, [auctionStatus, isTimerRunning, timerExpiresAt, currentPlayerIndex, finalizePlayer]);

  // Real-time automatic skip/out rule check
  useEffect(() => {
    if (auctionStatus !== "Live" || !isTimerRunning || !currentPlayer) return;

    const currentLeadingFranchiseId = highestBid ? highestBid.franchiseId : null;
    const eligibleFranchises = franchises.filter((f) => {
      const teamSquad = players.filter((p) => p.soldToFranchiseId === f.id);
      return teamSquad.length < f.maxSquadSize;
    });

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
      if (settings.autoSellOnAllOut) {
        finalizePlayer();
      }
    }
  }, [franchiseStatuses, auctionStatus, isTimerRunning, highestBid, currentPlayer, franchises, players, settings.autoSellOnAllOut, finalizePlayer]);

  // Place a Bid
  const placeBid = (franchiseIdParam?: string, customAmount?: number): { success: boolean; message: string } => {
    const biddingFranchiseId =
      franchiseIdParam ||
      (role === "team_owner" ? authenticatedFranchiseId : null) ||
      (role === "admin" ? franchises[0]?.id : null);

    if (!biddingFranchiseId) {
      return { success: false, message: "Spectator Mode: You are in read-only mode. Please login or select a franchise to bid." };
    }

    if (auctionStatus !== "Live") {
      return { success: false, message: "Auction is not live. Cannot place bid." };
    }
    if (!currentPlayer || currentPlayer.status !== "upcoming") {
      return { success: false, message: "No active player available for bidding." };
    }

    const franchise = franchises.find((f) => f.id === biddingFranchiseId);
    if (!franchise) {
      return { success: false, message: "Franchise not found." };
    }

    if (franchiseStatuses[biddingFranchiseId] === "out") {
      return { success: false, message: `${franchise.name} has permanently withdrawn (OUT) from this player.` };
    }

    if (highestBid && highestBid.franchiseId === biddingFranchiseId) {
      return { success: false, message: `${franchise.name} already holds the highest bid!` };
    }

    const currentAmount = highestBid ? highestBid.amount : null;
    const minIncrement = currentAmount ? getNextMinimumIncrement(currentAmount) : 0;
    const proposedAmount = customAmount !== undefined
      ? customAmount
      : currentAmount
      ? currentAmount + minIncrement
      : currentPlayer.basePrice;

    // Validate bid with official PSL rules
    const validation = validateBid(
      proposedAmount,
      currentPlayer,
      franchise,
      currentAmount,
      players,
      settings.minSquadSize,
      settings.maxSquadSize,
      6000000
    );

    if (!validation.valid) {
      return { success: false, message: validation.reason || "Bid is invalid." };
    }

    const newBid: Bid = {
      id: `bid-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      playerId: currentPlayer.id,
      franchiseId: franchise.id,
      franchiseName: franchise.name,
      amount: proposedAmount,
      timestamp: Date.now(),
    };

    if (highestBid && highestBid.franchiseId !== biddingFranchiseId) {
      soundEngine.playOutbidSound();
    } else {
      soundEngine.playBidSound();
    }

    // Reset or extend timer
    const currentRemaining = timerExpiresAt ? Math.max(0, Math.ceil((timerExpiresAt - Date.now()) / 1000)) : timer;
    const newTimerVal = currentRemaining <= settings.extensionTriggerSeconds
      ? currentRemaining + settings.extensionSeconds
      : settings.timerResetSeconds;
    const newExpiresAt = Date.now() + newTimerVal * 1000;

    setTimer(newTimerVal);
    setTimerExpiresAt(newExpiresAt);
    setIsTimerRunning(true);
    lastFinalizedIdxRef.current = null;

    let updatedStatuses = franchiseStatuses;
    if (franchiseStatuses[biddingFranchiseId] === "skipped") {
      updatedStatuses = { ...franchiseStatuses, [biddingFranchiseId]: "active" };
      setFranchiseStatuses(updatedStatuses);
    }

    const updatedBids = [...currentBids, newBid];
    setCurrentBids(updatedBids);

    addLog("bid", `${franchise.name} placed bid of PKR ${(proposedAmount / 10000000).toFixed(2)} Cr`, {
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      franchiseId: franchise.id,
      franchiseName: franchise.name,
      amount: proposedAmount,
    });

    if (isSupabaseConfigured()) {
      recordSupabaseBid(newBid);
    }

    broadcastSync({
      currentBids: updatedBids,
      franchiseStatuses: updatedStatuses,
      timer: newTimerVal,
      timerExpiresAt: newExpiresAt,
      isTimerRunning: true,
      currentPlayerIndex,
    });

    return { success: true, message: `Bid of PKR ${(proposedAmount / 10000000).toFixed(2)} Cr accepted for ${franchise.name}!` };
  };

  const skipCurrentPlayer = (franchiseIdParam?: string) => {
    const fId = role === "team_owner" ? authenticatedFranchiseId : (franchiseIdParam || authenticatedFranchiseId);
    if (!fId) return;
    const f = franchises.find((team) => team.id === fId);
    if (!f) return;
    const updatedStatuses = { ...franchiseStatuses, [fId]: "skipped" as const };
    setFranchiseStatuses(updatedStatuses);
    addLog("skip", `${f.name} passed/skipped bidding on ${currentPlayer?.name || "current player"}.`, {
      franchiseId: fId,
      franchiseName: f.name,
    });
    broadcastSync({ franchiseStatuses: updatedStatuses });
  };

  const outCurrentPlayer = (franchiseIdParam?: string) => {
    const fId = role === "team_owner" ? authenticatedFranchiseId : (franchiseIdParam || authenticatedFranchiseId);
    if (!fId) return;
    if (highestBid && highestBid.franchiseId === fId) return;
    const f = franchises.find((team) => team.id === fId);
    if (!f) return;
    const updatedStatuses = { ...franchiseStatuses, [fId]: "out" as const };
    setFranchiseStatuses(updatedStatuses);
    addLog("out", `${f.name} permanently withdrew (OUT) from ${currentPlayer?.name || "current player"}.`, {
      franchiseId: fId,
      franchiseName: f.name,
    });
    broadcastSync({ franchiseStatuses: updatedStatuses });
  };

  const toggleBotBidding = () => {
    setSettings((prev) => {
      const updated = { ...prev, botBiddingEnabled: !prev.botBiddingEnabled };
      broadcastSync({ settings: updated });
      return updated;
    });
  };

  // --- Automated Bot Bidding Engine (Only Islamabad United is manual, 7 other franchises automated) ---
  const botBiddingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (
      auctionStatus !== "Live" ||
      !isTimerRunning ||
      settings.botBiddingEnabled === false ||
      rtmState?.active ||
      !currentPlayer ||
      currentPlayer.status !== "upcoming"
    ) {
      if (botBiddingTimeoutRef.current) {
        clearTimeout(botBiddingTimeoutRef.current);
        botBiddingTimeoutRef.current = null;
      }
      return;
    }

    // Do not bid if timer is about to run out (< 3 seconds)
    if (timer <= 3) return;

    // Pick a natural, human-like delay between 2200ms and 4800ms
    const randomDelay = Math.floor(Math.random() * 2600) + 2200;

    botBiddingTimeoutRef.current = setTimeout(() => {
      if (
        auctionStatus !== "Live" ||
        !isTimerRunning ||
        rtmState?.active ||
        !currentPlayer ||
        currentPlayer.status !== "upcoming"
      ) {
        return;
      }

      const manualTeamId = settings.manualFranchiseId || "iu";
      const currentLeadingFranchiseId = highestBid ? highestBid.franchiseId : null;

      // Eligible bot franchises (all except IU and current leader)
      const eligibleBots = franchises.filter((f) => {
        if (f.id === manualTeamId) return false;
        if (f.id === currentLeadingFranchiseId) return false;
        if (franchiseStatuses[f.id] === "out") return false;

        const squad = players.filter((p) => p.soldToFranchiseId === f.id);
        if (squad.length >= f.maxSquadSize) return false;

        if (currentPlayer.isOverseas) {
          const overseasSquad = squad.filter((p) => p.isOverseas);
          if (overseasSquad.length >= f.maxOverseas) return false;
        }

        const minInc = highestBid ? getNextMinimumIncrement(highestBid.amount) : 0;
        const proposed = highestBid ? highestBid.amount + minInc : currentPlayer.basePrice;
        const slotsNeeded = Math.max(0, f.minSquadSize - squad.length - 1);
        const reserveBudget = slotsNeeded * 6000000;
        if (f.remainingPurse < proposed + reserveBudget) return false;

        // Realistic valuation threshold
        const maxValuationMultipliers: Record<string, number> = {
          Platinum: 2.8,
          Diamond: 2.2,
          Gold: 1.8,
          Silver: 1.5,
          Emerging: 1.4,
          Supplementary: 1.3,
        };
        const maxPrice = currentPlayer.basePrice * (maxValuationMultipliers[currentPlayer.category] || 1.8);
        if (proposed > maxPrice) return false;

        return true;
      });

      if (eligibleBots.length > 0) {
        // Probability check so bots act realistically
        const probMap: Record<string, number> = {
          Platinum: 0.85,
          Diamond: 0.75,
          Gold: 0.65,
          Silver: 0.50,
          Emerging: 0.45,
          Supplementary: 0.40,
        };
        const prob = probMap[currentPlayer.category] || 0.60;
        if (Math.random() < prob) {
          const chosenBot = eligibleBots[Math.floor(Math.random() * eligibleBots.length)];
          placeBid(chosenBot.id);
        }
      }
    }, randomDelay);

    return () => {
      if (botBiddingTimeoutRef.current) {
        clearTimeout(botBiddingTimeoutRef.current);
      }
    };
  }, [
    auctionStatus,
    isTimerRunning,
    settings.botBiddingEnabled,
    settings.manualFranchiseId,
    rtmState,
    currentPlayer,
    currentPlayerIndex,
    highestBid,
    franchises,
    franchiseStatuses,
    players,
    timer,
  ]);

  // --- Automatic RTM 30-Second Countdown & Auto-Decline Engine ---
  useEffect(() => {
    if (!rtmState || !rtmState.active) return;

    // Check 30-second expiry every 500ms
    const expiryInterval = setInterval(() => {
      if (!rtmState.expiresAt) return;
      const now = Date.now();
      if (now >= rtmState.expiresAt) {
        clearInterval(expiryInterval);
        if (rtmState.stage === "prompt_rtm") {
          addLog("rtm", `RTM 30-second timer expired without response. Auto-declined!`);
          declineRtmInitial();
        } else if (rtmState.stage === "rtm_decision") {
          addLog("rtm", `RTM final decision 30-second timer expired without response. Auto-declined!`);
          declineRtmFinal();
        }
      }
    }, 500);

    // If the original franchise is a BOT (not Islamabad United), simulate bot decision within 3.5s
    const manualTeamId = settings.manualFranchiseId || "iu";
    let botRtmTimeout: NodeJS.Timeout | null = null;

    if (settings.botBiddingEnabled !== false) {
      if (rtmState.stage === "prompt_rtm" && rtmState.originalFranchiseId !== manualTeamId) {
        botRtmTimeout = setTimeout(() => {
          const originalBot = franchises.find((f) => f.id === rtmState.originalFranchiseId);
          // 65% chance bot exercises RTM if it has cards and budget
          if (
            originalBot &&
            (originalBot.rtmCardsLeft ?? 2) > 0 &&
            originalBot.remainingPurse >= rtmState.initialBidAmount &&
            Math.random() < 0.65
          ) {
            exerciseRtm();
          } else {
            declineRtmInitial();
          }
        }, 3500);
      } else if (rtmState.stage === "awaiting_raise" && rtmState.highestBidderFranchiseId !== manualTeamId) {
        // Highest bidder is a bot, raise by minimum increment within 3.5s
        botRtmTimeout = setTimeout(() => {
          const minInc = getNextMinimumIncrement(rtmState.initialBidAmount);
          submitRtmRaise(rtmState.initialBidAmount + minInc);
        }, 3500);
      } else if (rtmState.stage === "rtm_decision" && rtmState.originalFranchiseId !== manualTeamId) {
        // Bot decides to accept or decline revised price within 3.5s
        botRtmTimeout = setTimeout(() => {
          const originalBot = franchises.find((f) => f.id === rtmState.originalFranchiseId);
          const revised = rtmState.revisedBidAmount || rtmState.initialBidAmount;
          if (originalBot && originalBot.remainingPurse >= revised && Math.random() < 0.50) {
            acceptRtmFinal();
          } else {
            declineRtmFinal();
          }
        }, 3500);
      }
    }

    return () => {
      clearInterval(expiryInterval);
      if (botRtmTimeout) clearTimeout(botRtmTimeout);
    };
  }, [
    rtmState,
    settings.botBiddingEnabled,
    settings.manualFranchiseId,
    franchises,
    declineRtmInitial,
    declineRtmFinal,
    exerciseRtm,
    submitRtmRaise,
    acceptRtmFinal,
  ]);

  const shuffleUpcomingPlayers = () => {
    const upcoming = players.filter((p) => p.status === "upcoming");
    for (let i = upcoming.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [upcoming[i], upcoming[j]] = [upcoming[j], upcoming[i]];
    }
    let uIdx = 0;
    const updatedPlayers = players.map((p) => (p.status === "upcoming" ? upcoming[uIdx++] : p));
    setPlayers(updatedPlayers);
    addLog("admin", "Upcoming player pool order randomized (Pot Draw Order).");
    broadcastSync({ players: updatedPlayers });
  };

  const reEnterUnsoldPlayers = (selectedPlayerIds?: string[], discountPercent: number = 0) => {
    const updatedPlayers = players.map((p) => {
      const shouldReEnter =
        p.status === "unsold" &&
        (!selectedPlayerIds || selectedPlayerIds.length === 0 || selectedPlayerIds.includes(p.id));

      if (shouldReEnter) {
        const discountFactor = Math.max(0.5, 1 - discountPercent / 100);
        const newPrice = Math.round(p.basePrice * discountFactor);
        return {
          ...p,
          status: "upcoming" as const,
          auctionRound: (p.auctionRound || 1) + 1,
          basePrice: newPrice,
          currentPrice: newPrice,
        };
      }
      return p;
    });

    const firstUpcoming = updatedPlayers.findIndex((p) => p.status === "upcoming");
    const newIdx = firstUpcoming !== -1 ? firstUpcoming : 0;
    const duration = settings.defaultTimerSeconds || 30;
    const expiresAt = Date.now() + duration * 1000;

    setPlayers(updatedPlayers);
    setCurrentPlayerIndex(newIdx);
    setCurrentBids([]);
    setFranchiseStatuses({});
    setTimer(duration);
    setTimerExpiresAt(expiresAt);
    setAuctionStatus("Live");
    setIsTimerRunning(true);
    lastFinalizedIdxRef.current = null;

    const count = selectedPlayerIds && selectedPlayerIds.length > 0 ? selectedPlayerIds.length : "all";
    addLog("round2", `Accelerated Auction Round started for ${count} unsold players with ${discountPercent}% price adjustment.`);
    soundEngine.speakAnnouncement(`Accelerated auction round has begun for unsold players!`);

    broadcastSync({
      players: updatedPlayers,
      currentPlayerIndex: newIdx,
      currentBids: [],
      franchiseStatuses: {},
      timer: duration,
      timerExpiresAt: expiresAt,
      auctionStatus: "Live",
      isTimerRunning: true,
      rtmState: null,
    });
  };

  const startAuction = () => {
    let currentPool = players;
    if (settings.playerOccurrenceOrder === "random") {
      const upcoming = players.filter((p) => p.status === "upcoming");
      for (let i = upcoming.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [upcoming[i], upcoming[j]] = [upcoming[j], upcoming[i]];
      }
      let uIdx = 0;
      currentPool = players.map((p) => (p.status === "upcoming" ? upcoming[uIdx++] : p));
      setPlayers(currentPool);
    }
    const duration = settings.defaultTimerSeconds || 30;
    const expiresAt = Date.now() + duration * 1000;
    setAuctionStatus("Live");
    setIsTimerRunning(true);
    setTimer(duration);
    setTimerExpiresAt(expiresAt);
    lastFinalizedIdxRef.current = null;
    addLog("start", "Live Player Auction started!");
    soundEngine.speakAnnouncement("The PSL Mock Auction is now live! Bidding has commenced.");

    broadcastSync({
      players: currentPool,
      auctionStatus: "Live",
      isTimerRunning: true,
      timer: duration,
      timerExpiresAt: expiresAt,
      currentPlayerIndex,
      currentBids: [],
      franchiseStatuses: {},
      rtmState: null,
    });
  };

  const pauseAuction = () => {
    setAuctionStatus("Paused");
    setIsTimerRunning(false);
    setTimerExpiresAt(null);
    addLog("pause", "Auction paused by administrator.");
    broadcastSync({
      auctionStatus: "Paused",
      isTimerRunning: false,
      timerExpiresAt: null,
      timer,
    });
  };

  const resumeAuction = () => {
    const duration = timer > 0 ? timer : settings.defaultTimerSeconds || 30;
    const expiresAt = Date.now() + duration * 1000;
    setAuctionStatus("Live");
    setIsTimerRunning(true);
    setTimer(duration);
    setTimerExpiresAt(expiresAt);
    lastFinalizedIdxRef.current = null;
    addLog("resume", "Auction resumed.");
    broadcastSync({
      auctionStatus: "Live",
      isTimerRunning: true,
      timerExpiresAt: expiresAt,
      timer: duration,
    });
  };

  const startRoundTwo = () => {
    const unsoldPlayers = players.filter((p) => p.status === "unsold");
    if (unsoldPlayers.length === 0) return;

    const updatedPlayers = players.map((p) => {
      if (p.status === "unsold") {
        return {
          ...p,
          status: "upcoming" as const,
          auctionRound: 2,
          basePrice: Math.round(p.basePrice * 0.8),
          currentPrice: Math.round(p.basePrice * 0.8),
        };
      }
      return p;
    });

    const firstUnsoldIdx = updatedPlayers.findIndex((p) => p.status === "upcoming");
    const targetIdx = firstUnsoldIdx !== -1 ? firstUnsoldIdx : 0;
    const duration = settings.defaultTimerSeconds || 30;
    const expiresAt = Date.now() + duration * 1000;

    setPlayers(updatedPlayers);
    setCurrentPlayerIndex(targetIdx);
    setCurrentBids([]);
    setFranchiseStatuses({});
    setTimer(duration);
    setTimerExpiresAt(expiresAt);
    setAuctionStatus("Live");
    setIsTimerRunning(true);
    lastFinalizedIdxRef.current = null;

    addLog("round2", "Second Auction Round initiated for Unsold Players!");
    soundEngine.speakAnnouncement("Second auction round has commenced for unsold players!");

    broadcastSync({
      players: updatedPlayers,
      currentPlayerIndex: targetIdx,
      currentBids: [],
      franchiseStatuses: {},
      timer: duration,
      timerExpiresAt: expiresAt,
      auctionStatus: "Live",
      isTimerRunning: true,
      rtmState: null,
    });
  };

  const resetAuction = () => {
    setFranchises(INITIAL_FRANCHISES);
    setPlayers(INITIAL_PLAYERS);
    setCurrentPlayerIndex(0);
    setCurrentBids([]);
    setFranchiseStatuses({});
    setTimer(DEFAULT_SETTINGS.defaultTimerSeconds);
    setTimerExpiresAt(null);
    setIsTimerRunning(false);
    setAuctionStatus("Ready");
    setEventLogs([]);
    setTradeOffers([]);
    setWatchlists([]);
    setRtmState(null);
    lastFinalizedIdxRef.current = null;
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
    broadcastSync({
      franchises: INITIAL_FRANCHISES,
      players: INITIAL_PLAYERS,
      currentPlayerIndex: 0,
      currentBids: [],
      franchiseStatuses: {},
      timer: DEFAULT_SETTINGS.defaultTimerSeconds,
      timerExpiresAt: null,
      isTimerRunning: false,
      auctionStatus: "Ready",
      eventLogs: [],
      tradeOffers: [],
      watchlists: [],
      rtmState: null,
    });
  };

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
      basePrice: newPlayer.basePrice || 11000000,
      currentPrice: newPlayer.basePrice || 11000000,
      status: "upcoming",
      auctionRound: 1,
      isUnder23: newPlayer.isUnder23 || (newPlayer.age ? newPlayer.age <= 23 : false),
      isUncapped: newPlayer.isUncapped || false,
      stats: newPlayer.stats,
    };
    const updatedPlayers = [...players, p];
    setPlayers(updatedPlayers);
    addLog("admin", `New player added: ${p.name} (${p.category})`);
    broadcastSync({ players: updatedPlayers });
  };

  const importPlayersList = (newPlayers: Player[]) => {
    const updatedPlayers = [...players, ...newPlayers];
    setPlayers(updatedPlayers);
    addLog("admin", `Successfully imported ${newPlayers.length} players into auction database.`);
    broadcastSync({ players: updatedPlayers });
  };

  const retainPlayer = (franchiseId: string, playerId: string, price: number) => {
    const franchise = franchises.find((f) => f.id === franchiseId);
    const player = players.find((p) => p.id === playerId);
    if (!franchise || !player) return;

    const updatedPlayers = players.map((p) =>
      p.id === playerId
        ? { ...p, status: "retained" as const, isRetained: true, soldToFranchiseId: franchiseId, soldPrice: price, currentPrice: price }
        : p
    );

    const updatedFranchises = franchises.map((f) =>
      f.id === franchiseId
        ? {
            ...f,
            remainingPurse: f.remainingPurse - price,
            squadCount: f.squadCount + 1,
          }
        : f
    );

    setPlayers(updatedPlayers);
    setFranchises(updatedFranchises);

    addLog("retention", `${franchise.name} retained ${player.name} for ${(price / 10000000).toFixed(2)} Cr`, {
      franchiseId,
      franchiseName: franchise.name,
      playerId,
      playerName: player.name,
      amount: price,
    });

    broadcastSync({ players: updatedPlayers, franchises: updatedFranchises });
  };

  const directSignPlayer = (franchiseId: string, playerId: string, price: number) => {
    const franchise = franchises.find((f) => f.id === franchiseId);
    const player = players.find((p) => p.id === playerId);
    if (!franchise || !player) return;

    const updatedPlayers = players.map((p) =>
      p.id === playerId
        ? { ...p, status: "direct_signing" as const, isDirectSigning: true, soldToFranchiseId: franchiseId, soldPrice: price, currentPrice: price }
        : p
    );

    const updatedFranchises = franchises.map((f) =>
      f.id === franchiseId
        ? {
            ...f,
            remainingPurse: f.remainingPurse - price,
            squadCount: f.squadCount + 1,
          }
        : f
    );

    setPlayers(updatedPlayers);
    setFranchises(updatedFranchises);

    addLog("retention", `${franchise.name} directly signed ${player.name} for ${(price / 10000000).toFixed(2)} Cr`, {
      franchiseId,
      franchiseName: franchise.name,
      playerId,
      playerName: player.name,
      amount: price,
    });

    broadcastSync({ players: updatedPlayers, franchises: updatedFranchises });
  };

  // Apply Official PSL 11 Core Retentions to all 8 Franchises
  const applyOfficialPsl11Retentions = (): { count: number; totalPurseSpent: number } => {
    let count = 0;
    let totalPurseSpent = 0;

    const updatedFranchises = [...franchises];
    let updatedPlayers = [...players];

    Object.entries(PSL_11_SQUADS).forEach(([franchiseId, squad]) => {
      const corePlayers = squad.filter((p) => p.isOfficialCoreRetention);
      corePlayers.forEach((corePlayer) => {
        const franchiseIdx = updatedFranchises.findIndex((f) => f.id === franchiseId);
        if (franchiseIdx !== -1) {
          updatedFranchises[franchiseIdx] = {
            ...updatedFranchises[franchiseIdx],
            remainingPurse: Math.max(0, updatedFranchises[franchiseIdx].remainingPurse - corePlayer.pricePKR),
            squadCount: updatedFranchises[franchiseIdx].squadCount + 1,
          };
          count++;
          totalPurseSpent += corePlayer.pricePKR;
        }

        const playerIdx = updatedPlayers.findIndex(
          (p) => p.name.toLowerCase().trim() === corePlayer.name.toLowerCase().trim()
        );

        if (playerIdx !== -1) {
          updatedPlayers[playerIdx] = {
            ...updatedPlayers[playerIdx],
            status: "retained",
            isRetained: true,
            soldToFranchiseId: franchiseId,
            soldPrice: corePlayer.pricePKR,
            currentPrice: corePlayer.pricePKR,
          };
        } else {
          updatedPlayers.push({
            id: corePlayer.id,
            name: corePlayer.name,
            photoUrl: corePlayer.photoUrl || "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait-lg-webp/prd/assets/players/generic/colored/69957.png",
            nationality: corePlayer.nationality,
            isOverseas: corePlayer.isOverseas,
            age: corePlayer.age,
            battingStyle: corePlayer.battingStyle,
            bowlingStyle: corePlayer.bowlingStyle,
            primaryRole: corePlayer.role as PlayerRole,
            category: corePlayer.category,
            basePrice: corePlayer.pricePKR,
            currentPrice: corePlayer.pricePKR,
            status: "retained",
            isRetained: true,
            soldToFranchiseId: franchiseId,
            soldPrice: corePlayer.pricePKR,
            cricinfoUrl: corePlayer.cricinfoUrl,
          });
        }
      });
    });

    setFranchises(updatedFranchises);
    setPlayers(updatedPlayers);

    addLog(
      "retention",
      `Applied official PSL 11 core retentions for all franchises (${count} star players retained, total ${(totalPurseSpent / 10000000).toFixed(2)} Cr deducted from team budgets).`
    );
    soundEngine.playSoldFanfare();

    broadcastSync({
      franchises: updatedFranchises,
      players: updatedPlayers,
    });

    return { count, totalPurseSpent };
  };

  // Retain a single PSL 11 squad player for a specific franchise
  const retainPsl11SquadPlayer = (franchiseId: string, pslPlayer: Psl11SquadPlayer) => {
    const franchise = franchises.find((f) => f.id === franchiseId);
    if (!franchise) return;

    if (franchise.remainingPurse < pslPlayer.pricePKR) {
      alert(`${franchise.name} does not have sufficient purse for PKR ${(pslPlayer.pricePKR / 10000000).toFixed(2)} Cr!`);
      return;
    }

    const updatedFranchises = franchises.map((f) =>
      f.id === franchiseId
        ? {
            ...f,
            remainingPurse: f.remainingPurse - pslPlayer.pricePKR,
            squadCount: f.squadCount + 1,
          }
        : f
    );

    let updatedPlayers = [...players];
    const playerIdx = updatedPlayers.findIndex(
      (p) => p.name.toLowerCase().trim() === pslPlayer.name.toLowerCase().trim()
    );

    if (playerIdx !== -1) {
      updatedPlayers = updatedPlayers.map((p, idx) =>
        idx === playerIdx
          ? {
              ...p,
              status: "retained" as const,
              isRetained: true,
              soldToFranchiseId: franchiseId,
              soldPrice: pslPlayer.pricePKR,
              currentPrice: pslPlayer.pricePKR,
            }
          : p
      );
    } else {
      updatedPlayers.push({
        id: pslPlayer.id,
        name: pslPlayer.name,
        photoUrl: pslPlayer.photoUrl || "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait-lg-webp/prd/assets/players/generic/colored/69957.png",
        nationality: pslPlayer.nationality,
        isOverseas: pslPlayer.isOverseas,
        age: pslPlayer.age,
        battingStyle: pslPlayer.battingStyle,
        bowlingStyle: pslPlayer.bowlingStyle,
        primaryRole: pslPlayer.role as PlayerRole,
        category: pslPlayer.category,
        basePrice: pslPlayer.pricePKR,
        currentPrice: pslPlayer.pricePKR,
        status: "retained",
        isRetained: true,
        soldToFranchiseId: franchiseId,
        soldPrice: pslPlayer.pricePKR,
        cricinfoUrl: pslPlayer.cricinfoUrl,
      });
    }

    setFranchises(updatedFranchises);
    setPlayers(updatedPlayers);

    addLog(
      "retention",
      `${franchise.name} retained PSL 11 star ${pslPlayer.name} for PKR ${(pslPlayer.pricePKR / 10000000).toFixed(2)} Cr.`,
      {
        franchiseId,
        franchiseName: franchise.name,
        playerName: pslPlayer.name,
        amount: pslPlayer.pricePKR,
      }
    );

    broadcastSync({
      franchises: updatedFranchises,
      players: updatedPlayers,
    });
  };

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

  const savePlayingXI = (franchiseId: string, playerIds: string[], captainId?: string, viceCaptainId?: string) => {
    const updatedFranchises = franchises.map((f) =>
      f.id === franchiseId
        ? {
            ...f,
            playingXI: playerIds,
            captainId,
            viceCaptainId,
          }
        : f
    );
    setFranchises(updatedFranchises);
    broadcastSync({ franchises: updatedFranchises });
  };

  const proposeTrade = (tradeData: Omit<TradeOffer, "id" | "createdAt" | "status">) => {
    const newOffer: TradeOffer = {
      ...tradeData,
      id: `trade-${Date.now()}`,
      createdAt: Date.now(),
      status: "pending",
    };
    setTradeOffers((prev) => [newOffer, ...prev]);
    addLog("trade", `Trade proposed between ${tradeData.fromFranchiseId} and ${tradeData.toFranchiseId}`);
    broadcastSync({ tradeOffers: [newOffer, ...tradeOffers] });
  };

  const handleTradeAction = (tradeId: string, action: 'accept' | 'reject' | 'admin_approve' | 'cancel') => {
    let updatedPlayers = players;
    let updatedFranchises = franchises;

    const updatedOffers = tradeOffers.map((t) => {
      if (t.id !== tradeId) return t;

      if (action === "admin_approve" || (action === "accept" && t.status === "pending")) {
        if (t.offeredPlayerId && t.requestedPlayerId) {
          updatedPlayers = players.map((p) => {
            if (p.id === t.offeredPlayerId) return { ...p, soldToFranchiseId: t.toFranchiseId };
            if (p.id === t.requestedPlayerId) return { ...p, soldToFranchiseId: t.fromFranchiseId };
            return p;
          });
        }
        if (t.offeredCash) {
          updatedFranchises = franchises.map((f) => {
            if (f.id === t.fromFranchiseId) return { ...f, remainingPurse: f.remainingPurse - t.offeredCash! };
            if (f.id === t.toFranchiseId) return { ...f, remainingPurse: f.remainingPurse + t.offeredCash! };
            return f;
          });
        }
        return { ...t, status: 'accepted' as const };
      } else if (action === "reject") {
        return { ...t, status: 'rejected' as const };
      } else if (action === "cancel") {
        return { ...t, status: 'cancelled' as const };
      }
      return t;
    });

    setTradeOffers(updatedOffers);
    setPlayers(updatedPlayers);
    setFranchises(updatedFranchises);

    broadcastSync({
      tradeOffers: updatedOffers,
      players: updatedPlayers,
      franchises: updatedFranchises,
    });
  };

  const updateSettings = (newSettings: Partial<AuctionSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    addLog("admin", "Auction settings modified.");
    broadcastSync({ settings: updated });
  };

  return (
    <AuctionContext.Provider
      value={{
        role,
        authenticatedFranchiseId,
        activeFranchise,
        loginAsAdmin,
        loginAsTeamOwner,
        logoutToSpectator,
        switchRoleDirectly,
        rulePreset,
        setRulePreset,
        auctionStatus,
        franchises,
        players,
        currentPlayer,
        currentPlayerIndex,
        currentBids,
        highestBid,
        franchiseStatuses,
        timer,
        timerExpiresAt,
        isTimerRunning,
        settings,
        watchlists,
        tradeOffers,
        eventLogs,
        rtmState,
        exerciseRtm,
        declineRtmInitial,
        submitRtmRaise,
        acceptRtmFinal,
        declineRtmFinal,
        cancelRtm,
        shuffleUpcomingPlayers,
        reEnterUnsoldPlayers,
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
        applyOfficialPsl11Retentions,
        retainPsl11SquadPlayer,
        toggleWatchlist,
        savePlayingXI,
        proposeTrade,
        handleTradeAction,
        updateSettings,
        toggleBotBidding,
        botBiddingEnabled: settings.botBiddingEnabled !== false,
        isCloudConnected,
        claimFranchise,
        releaseFranchise,
        messages,
        sendMessage,
        adminUser,
        signupAdmin,
        addNewPlayerDuringAuction,
      }}
    >
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = (): AuctionContextType => {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error("useAuction must be used within an AuctionProvider");
  }
  return context;
};
