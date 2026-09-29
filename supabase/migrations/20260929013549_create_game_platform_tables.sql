/*
# Create game platform tables (single-tenant, no auth)

1. New Tables
- `games`: registry of available games in the platform. Each game has an id (slug), title, description, framework (react/vue/vanilla), and metadata.
- `game_saves`: per-game save slots storing serialized state (JSONB) with a slot name. One active save per game+slot.
- `leaderboard_scores`: per-game leaderboard entries with player name, score, and timestamp.

2. Security
- Enable RLS on all tables.
- Allow anon + authenticated full CRUD (single-tenant, intentionally public/shared data).
*/

CREATE TABLE IF NOT EXISTS games (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  framework text NOT NULL DEFAULT 'react',
  icon text NOT NULL DEFAULT 'Gamepad2',
  category text NOT NULL DEFAULT 'adventure',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_games" ON games;
CREATE POLICY "anon_select_games" ON games FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_games" ON games;
CREATE POLICY "anon_insert_games" ON games FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_games" ON games;
CREATE POLICY "anon_update_games" ON games FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_games" ON games;
CREATE POLICY "anon_delete_games" ON games FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS game_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id text NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  slot text NOT NULL DEFAULT 'auto',
  state jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(game_id, slot)
);

ALTER TABLE game_saves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_saves" ON game_saves;
CREATE POLICY "anon_select_saves" ON game_saves FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_saves" ON game_saves;
CREATE POLICY "anon_insert_saves" ON game_saves FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_saves" ON game_saves;
CREATE POLICY "anon_update_saves" ON game_saves FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_saves" ON game_saves;
CREATE POLICY "anon_delete_saves" ON game_saves FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS leaderboard_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id text NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_name text NOT NULL DEFAULT 'Anonymous',
  score integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leaderboard_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_scores" ON leaderboard_scores;
CREATE POLICY "anon_select_scores" ON leaderboard_scores FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_scores" ON leaderboard_scores;
CREATE POLICY "anon_insert_scores" ON leaderboard_scores FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_scores" ON leaderboard_scores;
CREATE POLICY "anon_delete_scores" ON leaderboard_scores FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_leaderboard_game_score
  ON leaderboard_scores(game_id, score DESC);

CREATE INDEX IF NOT EXISTS idx_saves_game_slot
  ON game_saves(game_id, slot);
