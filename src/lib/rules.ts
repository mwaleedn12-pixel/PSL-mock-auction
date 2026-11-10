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

export function getNextMinimumIncrement(currentBidAmount: number): number {
  if (currentBidAmount < 10000000) {
    return 500000; // 5 Lakh
  }
  if (currentBidAmount < 20000000) {
    return 1000000; // 10 Lakh
  }
  if (currentBidAmount < 50000000) {
    return 2500000; // 25 Lakh
  }
  return 5000000; // 50 Lakh
}

export function validateBid(
  proposedBid: number,
  player: Player,
  franchise: Franchise,
  currentHighestBid: number | null,
  allSquadPlayers: Player[],
  minSquadSize: number = 16,
  maxSquadSize: number = 20,
  maxOverseas: number = 6,
  defaultBasePrice: number = 2500000
): { valid: boolean; reason?: string } {
  // Check minimum increment
  const minRequired = currentHighestBid
    ? currentHighestBid + getNextMinimumIncrement(currentHighestBid)
    : player.basePrice;

  if (proposedBid < minRequired) {
    return {
      valid: false,
      reason: `Bid must be at least ${formatPKR(minRequired)} (increment rule).`
    };
  }

  // Check purse
  if (proposedBid > franchise.remainingPurse) {
    return {
      valid: false,
      reason: `Insufficient purse! Remaining: ${formatPKR(franchise.remainingPurse)}.`
    };
  }

  // Check maximum squad size
  const currentTeamSquad = allSquadPlayers.filter(p => p.soldToFranchiseId === franchise.id);
  if (currentTeamSquad.length >= maxSquadSize) {
    return {
      valid: false,
      reason: `Maximum squad limit of ${maxSquadSize} players reached.`
    };
  }

  // Check overseas player limit
  if (player.isOverseas) {
    const currentOverseas = currentTeamSquad.filter(p => p.isOverseas).length;
    if (currentOverseas >= maxOverseas) {
      return {
        valid: false,
        reason: `Maximum overseas limit of ${maxOverseas} reached (currently has ${currentOverseas}).`
      };
    }
  }

  // FR-10: Check minimum reserve purse to fill remaining minimum squad
  const remainingSlotsNeeded = Math.max(0, minSquadSize - (currentTeamSquad.length + 1));
  const reservePurseNeeded = remainingSlotsNeeded * defaultBasePrice;
  const purseAfterBid = franchise.remainingPurse - proposedBid;

  if (purseAfterBid < reservePurseNeeded) {
    return {
      valid: false,
      reason: `Violates reserve purse rule! Need ${formatPKR(reservePurseNeeded)} reserved to complete minimum squad of ${minSquadSize}.`
    };
  }

  return { valid: true };
}
