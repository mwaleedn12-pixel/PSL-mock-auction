import { createClient, SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl.startsWith("http") &&
      !supabaseUrl.includes("your-project-id")
  );
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl!, supabaseAnonKey!, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 20,
          },
        },
      });
    } catch (err) {
      console.warn("Failed to initialize Supabase client:", err);
      return null;
    }
  }
  return supabaseInstance;
};

export const DEFAULT_ROOM_ID = "psl12-main";

/**
 * Fetch remote auction room state from Supabase
 */
export async function fetchRemoteAuctionState(roomId: string = DEFAULT_ROOM_ID): Promise<Record<string, unknown> | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("psl_auction_rooms")
      .select("state, updated_at")
      .eq("room_id", roomId)
      .maybeSingle();

    if (error) {
      console.warn("Supabase fetchRemoteAuctionState warning:", error.message);
      return null;
    }

    if (data && data.state) {
      return data.state as Record<string, unknown>;
    }
  } catch (err) {
    console.warn("Supabase fetch error:", err);
  }

  return null;
}

/**
 * Upsert remote auction room state to Supabase
 */
export async function saveRemoteAuctionState(
  state: Record<string, unknown>,
  roomId: string = DEFAULT_ROOM_ID
): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client.from("psl_auction_rooms").upsert(
      {
        room_id: roomId,
        state: state,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "room_id" }
    );

    if (error) {
      console.warn("Supabase saveRemoteAuctionState warning:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Supabase save error:", err);
    return false;
  }
}

/**
 * Broadcast an auction event across all connected clients via Supabase Realtime
 */
export async function broadcastSupabaseEvent(
  channel: RealtimeChannel | null,
  event: string,
  payload: Record<string, unknown>
): Promise<void> {
  if (!channel) return;
  try {
    await channel.send({
      type: "broadcast",
      event: event,
      payload: payload,
    });
  } catch (err) {
    console.warn("Supabase broadcast error:", err);
  }
}

/**
 * Record an auction bid history entry in Supabase table
 */
export async function recordSupabaseBid(
  bid: {
    id: string;
    franchiseId: string;
    franchiseName: string;
    playerId: string;
    amount: number;
    timestamp: number;
  },
  roomId: string = DEFAULT_ROOM_ID
): Promise<void> {
  const client = getSupabase();
  if (!client) return;

  try {
    await client.from("psl_auction_bids").insert({
      id: bid.id,
      room_id: roomId,
      franchise_id: bid.franchiseId,
      franchise_name: bid.franchiseName,
      player_id: bid.playerId,
      amount: bid.amount,
      created_at: new Date(bid.timestamp).toISOString(),
    });
  } catch (err) {
    console.warn("Supabase record bid error:", err);
  }
}
