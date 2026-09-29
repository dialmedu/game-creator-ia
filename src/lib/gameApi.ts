import { getAllGames } from '@/registry/gameRegistry';
import type { GameState } from '@/core/types';
import { supabase } from './supabase';

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

const STORAGE_PREFIX = 'imperium-games';

function readLocal<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(`${STORAGE_PREFIX}:${key}`);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}:${key}`, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Failed to write local game data:', error);
    return false;
  }
}

function getLocalGames(): GameRecord[] {
  return getAllGames().map((game, sort_order) => ({
    id: game.id,
    title: game.title,
    description: game.description,
    framework: game.framework,
    icon: game.icon,
    category: game.category,
    sort_order,
  }));
}

export async function fetchGames(): Promise<GameRecord[]> {
  if (!supabase) return getLocalGames();

  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('Failed to fetch games:', error);
    return getLocalGames();
  }
  return data || getLocalGames();
}

export async function fetchGame(gameId: string): Promise<GameRecord | null> {
  if (!supabase) return getLocalGames().find((game) => game.id === gameId) || null;

  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .maybeSingle();
  if (error) {
    console.error('Failed to fetch game:', error);
    return getLocalGames().find((game) => game.id === gameId) || null;
  }
  return data;
}

export async function saveGame(gameId: string, slot: string, state: GameState): Promise<boolean> {
  if (!supabase) return writeLocal(`save:${gameId}:${slot}`, state);

  const { error } = await supabase
    .from('game_saves')
    .upsert(
      { game_id: gameId, slot, state, updated_at: new Date().toISOString() },
      { onConflict: 'game_id,slot' },
    );
  if (error) {
    console.error('Failed to save game:', error);
    return writeLocal(`save:${gameId}:${slot}`, state);
  }
  return true;
}

export async function loadGame(gameId: string, slot: string): Promise<GameState | null> {
  if (!supabase) return readLocal<GameState | null>(`save:${gameId}:${slot}`, null);

  const { data, error } = await supabase
    .from('game_saves')
    .select('state')
    .eq('game_id', gameId)
    .eq('slot', slot)
    .maybeSingle();
  if (error) {
    console.error('Failed to load game:', error);
    return readLocal<GameState | null>(`save:${gameId}:${slot}`, null);
  }
  return data?.state ?? null;
}

export async function fetchLeaderboard(gameId: string, limit = 10): Promise<LeaderboardEntry[]> {
  if (!supabase) {
    return readLocal<LeaderboardEntry[]>(`scores:${gameId}`, [])
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

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
  if (!supabase) {
    const scores = readLocal<LeaderboardEntry[]>(`scores:${gameId}`, []);
    scores.push({
      id: crypto.randomUUID(),
      game_id: gameId,
      player_name: playerName,
      score,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    });
    return writeLocal(`scores:${gameId}`, scores);
  }

  const { error } = await supabase
    .from('leaderboard_scores')
    .insert({ game_id: gameId, player_name: playerName, score, metadata });
  if (error) {
    console.error('Failed to submit score:', error);
    return false;
  }
  return true;
}
