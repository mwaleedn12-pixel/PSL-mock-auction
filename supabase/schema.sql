-- =========================================================================
-- PSL 12 Live Mock Auction Manager: Supabase Realtime Database Schema
-- =========================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project and navigate to the "SQL Editor" tab (left sidebar).
-- 3. Click "New query", paste the entire contents of this file, and click "Run".
-- 4. Copy your Project URL & Anon Public Key from Settings -> API.
-- 5. Add them to Vercel Environment Variables or your local .env.local file.
-- =========================================================================

-- 1. Auction Rooms Table (Stores synchronized state of the live room)
CREATE TABLE IF NOT EXISTS public.psl_auction_rooms (
    room_id TEXT PRIMARY KEY DEFAULT 'psl12-main',
    state JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Realtime Bids Audit Table (Stores individual bids history)
CREATE TABLE IF NOT EXISTS public.psl_auction_bids (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL DEFAULT 'psl12-main',
    franchise_id TEXT NOT NULL,
    franchise_name TEXT NOT NULL,
    player_id TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Live Auction Event Logs (Audit trail for sales, RTM, passes)
CREATE TABLE IF NOT EXISTS public.psl_auction_events (
    id BIGSERIAL PRIMARY KEY,
    room_id TEXT NOT NULL DEFAULT 'psl12-main',
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Automatically update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_psl_auction_rooms_updated_at ON public.psl_auction_rooms;
CREATE TRIGGER set_psl_auction_rooms_updated_at
BEFORE UPDATE ON public.psl_auction_rooms
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.psl_auction_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psl_auction_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psl_auction_events ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies: Allow public read and write for live mock auction participants
DROP POLICY IF EXISTS "Allow public read access to psl_auction_rooms" ON public.psl_auction_rooms;
CREATE POLICY "Allow public read access to psl_auction_rooms"
ON public.psl_auction_rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert/update to psl_auction_rooms" ON public.psl_auction_rooms;
CREATE POLICY "Allow public insert/update to psl_auction_rooms"
ON public.psl_auction_rooms FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read access to psl_auction_bids" ON public.psl_auction_bids;
CREATE POLICY "Allow public read access to psl_auction_bids"
ON public.psl_auction_bids FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert to psl_auction_bids" ON public.psl_auction_bids;
CREATE POLICY "Allow public insert to psl_auction_bids"
ON public.psl_auction_bids FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read access to psl_auction_events" ON public.psl_auction_events;
CREATE POLICY "Allow public read access to psl_auction_events"
ON public.psl_auction_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert to psl_auction_events" ON public.psl_auction_events;
CREATE POLICY "Allow public insert to psl_auction_events"
ON public.psl_auction_events FOR INSERT WITH CHECK (true);

-- 7. Enable Supabase Realtime Replication for Instant Multi-Device Synchronization
ALTER PUBLICATION supabase_realtime ADD TABLE public.psl_auction_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.psl_auction_bids;
