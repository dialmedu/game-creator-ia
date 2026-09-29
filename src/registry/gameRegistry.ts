import type { GameDefinition } from '@/core/types';
import { laAmalia1888 } from '@/games/la-amalia-1888/definition';

const registry = new Map<string, GameDefinition>();

export function registerGame(game: GameDefinition): void {
  registry.set(game.id, game);
}

export function getGame(gameId: string): GameDefinition | undefined {
  return registry.get(gameId);
}

export function getAllGames(): GameDefinition[] {
  return Array.from(registry.values());
}

export function isGameRegistered(gameId: string): boolean {
  return registry.has(gameId);
}

// Register built-in games
registerGame(laAmalia1888);
