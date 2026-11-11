import { Franchise, Player } from "@/types/auction";

export function formatPKR(amount: number): string {
  if (amount >= 10000000) {
    const crore = amount / 10000000;
    return `PKR ${crore % 1 === 0 ? crore.toFixed(0) : crore.toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `PKR ${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)} Lakh`;
  }
  return `PKR ${amount.toLocaleString()}`;
}

// PSL 11 / PSL 12 Official Increment Rules (Section 5)
// - Below 1.1 Cr: PKR 250,000
// - 1.1 Cr up to < 2.2 Cr: PKR 500,000
// - 2.2 Cr up to < 4.2 Cr: PKR 1,000,000
// - 4.2 Cr and above: PKR 1,500,000
export function getNextMinimumIncrement(currentBidAmount: number): number {
  if (currentBidAmount < 11000000) {
    return 250000; // 2.5 Lakh
  }
  if (currentBidAmount < 22000000) {
    return 500000; // 5 Lakh
  }
  if (currentBidAmount < 42000000) {
    return 1000000; // 10 Lakh
  }
  return 1500000; // 15 Lakh
}

// Maximum allowed overseas players depending on current squad size (Section 6)
// 16-17 squad: up to 5 overseas
// 18-19 squad: up to 6 overseas
// 20 squad: up to 7 overseas
export function getMaxOverseasForSquadSize(squadCount: number): number {
  if (squadCount <= 17) return 5;
  if (squadCount <= 19) return 6;
  return 7;
}

export function validateBid(
  proposedBid: number,
  player: Player,
  franchise: Franchise,
  currentHighestBid: number | null,
  allSquadPlayers: Player[],
  minSquadSize: number = 16,
  maxSquadSize: number = 20,
  defaultBasePrice: number = 6000000 // 60 Lakh minimum base price
): { valid: boolean; reason?: string } {
  // Check minimum increment
  const minRequired = currentHighestBid
    ? currentHighestBid + getNextMinimumIncrement(currentHighestBid)
    : player.basePrice;

  if (proposedBid < minRequired) {
    return {
      valid: false,
      reason: `Bid must be at least ${formatPKR(minRequired)} under official PSL increment brackets.`
    };
  }

  // Check purse limit
  if (proposedBid > franchise.remainingPurse) {
    return {
      valid: false,
      reason: `Insufficient purse! Remaining: ${formatPKR(franchise.remainingPurse)}.`
    };
  }

  // Check maximum squad size
  const currentTeamSquad = allSquadPlayers.filter((p) => p.soldToFranchiseId === franchise.id);
  if (currentTeamSquad.length >= maxSquadSize) {
    return {
      valid: false,
      reason: `Maximum squad capacity of ${maxSquadSize} players reached.`
    };
  }

  // Check dynamic overseas player limit (5 to 7 depending on projected squad size)
  if (player.isOverseas) {
    const projectedSquadSize = currentTeamSquad.length + 1;
    const allowedOverseas = getMaxOverseasForSquadSize(projectedSquadSize);
    const currentOverseas = currentTeamSquad.filter((p) => p.isOverseas).length;

    if (currentOverseas + 1 > allowedOverseas) {
      return {
        valid: false,
        reason: `Overseas quota exceeded! Squad of ${projectedSquadSize} can have max ${allowedOverseas} overseas players (currently ${currentOverseas}).`
      };
    }
  }

  // Minimum reserve purse check:
  // Must have enough budget to buy remaining players up to minimum squad (16) at 60 Lakh base price
  const remainingSlotsNeeded = Math.max(0, minSquadSize - (currentTeamSquad.length + 1));
  const reservePurseNeeded = remainingSlotsNeeded * defaultBasePrice;
  const purseAfterBid = franchise.remainingPurse - proposedBid;

  if (purseAfterBid < reservePurseNeeded) {
    return {
      valid: false,
      reason: `Reserve purse rule: Need ${formatPKR(reservePurseNeeded)} reserved to complete minimum squad of ${minSquadSize}.`
    };
  }

  return { valid: true };
}

// Playing XI Validation (Section 6 & 7):
// - Exactly 11 players
// - 3 to 4 Overseas players (at least 7 local)
// - At least 1 Uncapped Under-23 player in Playing XI
export function validatePlayingXI(
  selectedPlayers: Player[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (selectedPlayers.length !== 11) {
    errors.push(`Playing XI must have exactly 11 players (currently ${selectedPlayers.length}).`);
  }

  const overseasCount = selectedPlayers.filter((p) => p.isOverseas).length;
  if (overseasCount < 3) {
    errors.push(`Playing XI must contain at least 3 overseas players (currently ${overseasCount}).`);
  }
  if (overseasCount > 4) {
    errors.push(`Playing XI can contain at most 4 overseas players (currently ${overseasCount}).`);
  }

  const u23UncappedInXI = selectedPlayers.filter((p) => p.isUnder23 && p.isUncapped).length;
  if (u23UncappedInXI < 1) {
    errors.push(`Playing XI must contain at least 1 uncapped Under-23 player (Section 7).`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
