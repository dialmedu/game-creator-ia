import type { EventBus } from './EventBus';
import type { GameStateStore } from './GameStateStore';

export interface GameAttributes {
  money: number;
  legacy: number;
  reputation: number;
  hp: number;
  speed: number;
  ammo: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: string;
  qty: number;
}

export interface BookChapter {
  id: number;
  title: string;
  unlocked: boolean;
  content: string;
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface GameLogEntry {
  text: string;
  time: number;
}

export interface GameState {
  act: number;
  storyStage: string;
  minimapEnabled: boolean;
  currentLevel: string;
  playerPosition: Vec2;
  attributes: GameAttributes;
  inventory: InventoryItem[];
  effectHistory: GameLogEntry[];
  bookChapters: BookChapter[];
}

export interface MinimapPOI {
  type: string;
  x: number;
  y: number;
  label: string;
}

export interface MinimapData {
  level: string;
  worldSize: { width: number; height: number };
  playerPos: Vec2;
  pois: MinimapPOI[];
}

export type ActionType =
  | 'SET_ATTR'
  | 'SET_LEVEL'
  | 'SET_INV'
  | 'SET_PLAYER_POS'
  | 'ADD_LOG'
  | 'SET_ACT'
  | 'SET_STORY'
  | 'TOGGLE_MINIMAP'
  | 'UNLOCK_BOOK'
  | 'LOAD_STATE';

export interface Action {
  type: ActionType;
  payload?: any;
}

export type StateListener = (
  action: ActionType,
  newState: GameState,
  oldState: GameState,
) => void;

export interface GameContext {
  store: GameStateStore;
  eventBus: EventBus;
  getKaboom: () => any;
}

export interface GameDefinition {
  id: string;
  title: string;
  description: string;
  framework: 'react' | 'vue' | 'vanilla';
  icon: string;
  category: string;
  initialState: GameState;
  init: (context: GameContext) => void;
  dispose?: () => void;
}
