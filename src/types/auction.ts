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
  highestScore?: string | number;
  hundreds?: number;
  fifties?: number;
  wickets?: number;
  bowlingAverage?: number;
  economyRate?: number;
  bestBowling?: string;
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
  // User Requirement: PSL Kit & PSL vs T20 stats tracking
  hasPlayedPSL?: boolean;
  statsType?: 'PSL' | 'T20';
  lastPSLTeam?: string;
  kitDescription?: string;
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
  initialPurse: number;
  remainingPurse: number;
  squadCount: number;
  minSquadSize: number;
  maxSquadSize: number;
  minOverseas: number;
  maxOverseas: number;
  playingXI?: string[];
  captainId?: string;
  viceCaptainId?: string;
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
  totalPursePerTeam: number;
  maxQualifyingPurse: number;
  minSpendRequirement: number;
  minSquadSize: number;
  maxSquadSize: number;
  minOverseasPlayingXI: number;
  maxOverseasPlayingXI: number;
  minUncappedU23Squad: number;
  minUncappedU23PlayingXI: number;
  maxRetentions: number;
  maxDirectForeignSignings: number;
  defaultTimerSeconds: number;
  timerResetSeconds: number;
  extensionSeconds: number;
  extensionTriggerSeconds: number;
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
