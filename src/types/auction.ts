export type UserRole = 'admin' | 'team_owner' | 'spectator';

export type RulePreset = 'PSL11' | 'PSL12' | 'Custom';

export type PlayerCategory = 'Platinum' | 'Diamond' | 'Gold' | 'Silver' | 'Emerging' | 'Supplementary';

export type PlayerRole = 'Batter' | 'Bowler' | 'All-Rounder' | 'Wicketkeeper';

export type AuctionStatus = 'Draft' | 'Configuration' | 'Ready' | 'Live' | 'Paused' | 'Completed' | 'Cancelled';

export type PlayerAuctionState = 'upcoming' | 'live' | 'sold' | 'unsold' | 'retained' | 'direct_signing';

export interface PlayerStats {
  matches: number;
  runs?: number;
  battingAverage?: number;
  strikeRate?: number;
  wickets?: number;
  bowlingAverage?: number;
  economyRate?: number;
  catches?: number;
  stumpings?: number;
}

export interface Player {
  id: string;
  name: string;
  photoUrl: string;
  nationality: string;
  isOverseas: boolean;
  age: number;
  battingStyle: string;
  bowlingStyle: string;
  primaryRole: PlayerRole;
  secondaryRole?: string;
  category: PlayerCategory;
  basePrice: number; // in PKR
  currentPrice: number;
  status: PlayerAuctionState;
  soldToFranchiseId?: string;
  soldPrice?: number;
  stats?: PlayerStats;
  auctionRound?: number;
  isDirectSigning?: boolean;
  isRetained?: boolean;
  // PSL Rule requirement: Uncapped Under-23 status
  isUnder23?: boolean;
  isUncapped?: boolean;
}

export interface Franchise {
  id: string;
  name: string;
  shortName: string;
  city: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  ownerName: string;
  initialPurse: number; // standard 45 Cr (450,000,000)
  remainingPurse: number;
  squadCount: number;
  minSquadSize: number; // 16
  maxSquadSize: number; // 20
  minOverseas: number; // 5
  maxOverseas: number; // 7 (depends on squad size)
  playingXI?: string[];
  captainId?: string;
  viceCaptainId?: string;
  // Private authentication passkey for Team Owner
  privatePasskey: string;
}

export interface Bid {
  id: string;
  playerId: string;
  franchiseId: string;
  franchiseName: string;
  amount: number;
  timestamp: number;
}

export interface AuctionSettings {
  id: string;
  name: string;
  roomCode: string;
  season: string;
  rulePreset: RulePreset;
  currency: string;
  totalPursePerTeam: number; // 450,000,000 (45 Cr)
  maxQualifyingPurse: number; // 505,000,000 (50.5 Cr)
  minSpendRequirement: number; // 365,000,000 (36.5 Cr)
  minSquadSize: number; // 16
  maxSquadSize: number; // 20
  minOverseasPlayingXI: number; // 3
  maxOverseasPlayingXI: number; // 4
  minUncappedU23Squad: number; // 2
  minUncappedU23PlayingXI: number; // 1
  maxRetentions: number; // 4
  maxDirectForeignSignings: number; // 1
  defaultTimerSeconds: number; // 30s opening
  timerResetSeconds: number; // 15s reset on bid
  extensionSeconds: number; // 10s extension
  extensionTriggerSeconds: number; // in final 5 seconds
  autoSellOnAllOut: boolean;
  soundEffectsEnabled: boolean;
  voiceAnnouncements: boolean;
}

export interface WatchlistItem {
  playerId: string;
  franchiseId: string;
  maxIntendedBid?: number;
  notes?: string;
  priority: 'High' | 'Medium' | 'Low';
  addedAt: number;
}

export interface TradeOffer {
  id: string;
  fromFranchiseId: string;
  toFranchiseId: string;
  offeredPlayerId?: string;
  offeredCash?: number;
  requestedPlayerId?: string;
  requestedCash?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'approved_by_admin' | 'cancelled';
  notes?: string;
  createdAt: number;
}

export interface AuctionEventLog {
  id: string;
  timestamp: number;
  type: 'bid' | 'out' | 'skip' | 'sold' | 'unsold' | 'pause' | 'resume' | 'start' | 'round2' | 'trade' | 'retention' | 'admin';
  playerId?: string;
  playerName?: string;
  franchiseId?: string;
  franchiseName?: string;
  amount?: number;
  description: string;
}
