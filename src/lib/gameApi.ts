import { supabase } from './supabase';
import type { GameState } from '@/core/types';

export interface GameRecord {
  id: string;
  title: string;
  description: string;
  framework: string;
  icon: string;
  category: string;
  sort_order: number;
}

export interface LeaderboardEntry {
  id: string;
  game_id: string;
  player_name: string;
  score: number;
  metadata: Record<string, any>;
  created_at: string;
}

export async function fetchGames(): Promise<GameRecord[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('Failed to fetch games:', error);
    return [];
  }
  return data || [];
}

export async function fetchGame(gameId: string): Promise<GameRecord | null> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .maybeSingle();
  if (error) {
    console.error('Failed to fetch game:', error);
    return null;
  }
  return data;
}

export async function saveGame(
  gameId: string,
  slot: string,
  state: GameState,
): Promise<boolean> {
  const { error } = await supabase
    .from('game_saves')
    .upsert(
      { game_id: gameId, slot, state, updated_at: new Date().toISOString() },
      { onConflict: 'game_id,slot' },
    );
  if (error) {
    console.error('Failed to save game:', error);
    return false;
  }
  return true;
}

export async function loadGame(
  gameId: string,
  slot: string,
): Promise<GameState | null> {
  const { data, error } = await supabase
    .from('game_saves')
    .select('state')
    .eq('game_id', gameId)
    .eq('slot', slot)
    .maybeSingle();
  if (error) {
    console.error('Failed to load game:', error);
    return null;
  }
  return data?.state ?? null;
}

export async function fetchLeaderboard(
  gameId: string,
  limit = 10,
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard_scores')
    .select('*')
    .eq('game_id', gameId)
    .order('score', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('Failed to fetch leaderboard:', error);
    return [];
  }
  return data || [];
}

export async function submitScore(
  gameId: string,
  playerName: string,
  score: number,
  metadata?: Record<string, any>,
): Promise<boolean> {
  const { error } = await supabase
    .from('leaderboard_scores')
    .insert({ game_id: gameId, player_name: playerName, score, metadata });
  if (error) {
    console.error('Failed to submit score:', error);
    return false;
  }
  return true;
}
