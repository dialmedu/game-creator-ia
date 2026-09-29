import { EventBus } from './EventBus';
import type {
  Action,
  ActionType,
  GameState,
  MinimapData,
  MinimapPOI,
  StateListener,
} from './types';

class MinimapCoreExtension {
  constructor(private store: GameStateStore) {}

  getWorldData(): MinimapData {
    const state = this.store.getState();
    const level = state.currentLevel || 'main';
    let worldSize = { width: 2000, height: 2000 };
    let pois: MinimapPOI[] = [];

    if (level === 'main') {
      pois = [
        { type: 'well', x: 500, y: 500, label: 'Pozo' },
        { type: 'building', x: 1200, y: 500, label: 'Cuarto Cerrado' },
        { type: 'stable', x: 1200, y: 800, label: 'Establo' },
        { type: 'portal', x: 1800, y: 1000, label: 'Puerto (Acto II)' },
        { type: 'admin', x: 300, y: 500, label: 'Administrador' },
        { type: 'plots', x: 800, y: 500, label: 'Cultivos' },
      ];
    } else if (level === 'warehouse') {
      worldSize = { width: 1200, height: 1200 };
      pois = [{ type: 'exit', x: 600, y: 1100, label: 'Salida Almacen' }];
    } else if (level === 'level2') {
      worldSize = { width: 2000, height: 2000 };
      pois = [
        { type: 'platformer', x: 1000, y: 1000, label: 'Zona React Platformer' },
        { type: 'return', x: 1000, y: 1800, label: 'Volver a La Amalia' },
      ];
    }

    return {
      level,
      worldSize,
      playerPos: state.playerPosition || {
        x: worldSize.width / 2,
        y: worldSize.height / 2,
      },
      pois,
    };
  }
}

export class GameStateStore {
  private state: GameState;
  private listeners: StateListener[] = [];
  minimapExt: MinimapCoreExtension;
  eventBus: EventBus;

  constructor(initialState: GameState, eventBus: EventBus) {
    this.state = JSON.parse(JSON.stringify(initialState));
    this.eventBus = eventBus;
    this.minimapExt = new MinimapCoreExtension(this);
  }

  getState(): GameState {
    return this.state;
  }

  getMinimapData(): MinimapData {
    return this.minimapExt.getWorldData();
  }

  dispatch(action: ActionType, payload?: any): void {
    const oldState: GameState = { ...this.state };
    try {
      switch (action) {
        case 'SET_ATTR':
          if (payload?.key) {
            this.state.attributes = {
              ...this.state.attributes,
              [payload.key]: payload.value,
            };
          }
          break;
        case 'SET_LEVEL':
          if (payload?.level) {
            this.state.currentLevel = payload.level;
          }
          break;
        case 'SET_INV':
          if (payload?.inventory) {
            this.state.inventory = payload.inventory;
          }
          break;
        case 'SET_PLAYER_POS':
          if (payload?.pos) {
            this.state.playerPosition = payload.pos;
          }
          break;
        case 'ADD_LOG':
          if (payload?.log) {
            this.state.effectHistory = [
              { text: payload.log, time: Date.now() },
              ...this.state.effectHistory,
            ].slice(0, 20);
          }
          break;
        case 'SET_ACT':
          if (payload?.act) this.state.act = payload.act;
          break;
        case 'SET_STORY':
          if (payload?.stage) this.state.storyStage = payload.stage;
          break;
        case 'TOGGLE_MINIMAP':
          if (payload?.enabled !== undefined)
            this.state.minimapEnabled = payload.enabled;
          break;
        case 'UNLOCK_BOOK':
          if (payload?.chapterId) {
            this.state.bookChapters = this.state.bookChapters.map((c) =>
              c.id === payload.chapterId ? { ...c, unlocked: true } : c,
            );
          }
          break;
        case 'LOAD_STATE':
          if (payload?.state) {
            this.state = payload.state;
          }
          break;
        default:
          break;
      }
      this.notify(action, this.state, oldState);
      this.eventBus.emit(action, payload);
    } catch (e) {
      console.error('Store Dispatch Error:', e);
    }
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(action: ActionType, newState: GameState, oldState: GameState): void {
    for (const listener of [...this.listeners]) {
      try {
        listener(action, newState, oldState);
      } catch (e) {
        console.error('Store Listener Error:', e);
      }
    }
  }

  serialize(): GameState {
    return JSON.parse(JSON.stringify(this.state));
  }

  loadState(state: GameState): void {
    this.dispatch('LOAD_STATE', { state: JSON.parse(JSON.stringify(state)) });
  }

  reset(initialState: GameState): void {
    this.state = JSON.parse(JSON.stringify(initialState));
    this.notify('LOAD_STATE', this.state, this.state);
    this.eventBus.emit('LOAD_STATE', { state: this.state });
  }
}
