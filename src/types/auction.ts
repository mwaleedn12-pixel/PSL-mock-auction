export type UserRole = 'super_admin' | 'franchise_owner' | 'co_owner' | 'spectator';

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
  basePrice: number; // in PKR (e.g. 35000000 for 3.5 Crore)
  currentPrice: number;
  status: PlayerAuctionState;
  soldToFranchiseId?: string;
  soldPrice?: number;
  stats?: PlayerStats;
  auctionRound?: number; // 1 = main round, 2 = unsold round
  isDirectSigning?: boolean;
  isRetained?: boolean;
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
  coOwnerName?: string;
  initialPurse: number; // e.g. 150000000 (15 Crore PKR)
  remainingPurse: number;
  squadCount: number;
  minSquadSize: number; // default 16
  maxSquadSize: number; // default 20
  minOverseas: number; // default 4
  maxOverseas: number; // default 6
  playingXI?: string[]; // array of player ids
  captainId?: string;
  viceCaptainId?: string;
}

export interface Bid {
  id: string;
  playerId: string;
  franchiseId: string;
  franchiseName: string;
  amount: number;
  timestamp: number;
}

export interface FranchisePlayerAuctionStatus {
  franchiseId: string;
  playerId: string;
  state: 'active' | 'skipped' | 'out';
  updatedAt: number;
}

export interface AuctionSettings {
  id: string;
  name: string;
  season: string;
  currency: string;
  totalPursePerTeam: number;
  minSquadSize: number;
  maxSquadSize: number;
  minOverseas: number;
  maxOverseas: number;
  defaultTimerSeconds: number; // e.g. 15 seconds
  timerResetSeconds: number; // reset on new bid
  extensionSeconds: number; // extra seconds if bid placed near end
  extensionTriggerSeconds: number; // trigger if <= 5 seconds left
  noBidTimeoutSeconds: number;
  autoSellOnAllOut: boolean;
  allowSecondRoundForUnsold: boolean;
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
