import type { GameStateStore } from '@/core/GameStateStore';
import type { EventBus } from '@/core/EventBus';
import type { GameContext } from '@/core/types';
import { EntityStatusManager } from '@/core/EntityStatusManager';
import {
  BackpackManager,
  CraftingManager,
  ControlManager,
  NotificationManager,
  ObjectManager,
} from '@/managers';
import { buildMainScene } from './scenes/mainScene';
import { buildWarehouseScene } from './scenes/warehouseScene';

export interface LaAmaliaManagers {
  bagMgr: BackpackManager;
  craftMgr: CraftingManager;
  notifMgr: NotificationManager;
  controlMgr: ControlManager;
  wellStatus: EntityStatusManager;
}

export interface LaAmaliaGameRefs {
  managers: LaAmaliaManagers;
  store: GameStateStore;
  eventBus: EventBus;
  k: any;
  go: (scene: string) => void;
  currentScene: string;
  setCurrentScene: (s: string) => void;
  openMenu: () => void;
  openBook: () => void;
  openBackpack: () => void;
  openBuilding: (title: string, desc: string) => void;
  openDialogue: (name: string, text: string, options: { text: string; action: () => void }[]) => void;
  openMinimap: () => void;
  mountPlatformer: () => void;
  unmountPlatformer: () => void;
}

export function createLaAmaliaRefs(
  context: GameContext,
  k: any,
  uiCallbacks: {
    showToast: (msg: string, isError?: boolean) => void;
    openMenu: () => void;
    openBook: () => void;
    openBackpack: () => void;
    openBuilding: (title: string, desc: string) => void;
    openDialogue: (name: string, text: string, options: { text: string; action: () => void }[]) => void;
    openMinimap: () => void;
    mountPlatformer: () => void;
    unmountPlatformer: () => void;
  },
): LaAmaliaGameRefs {
  const { store, eventBus } = context;

  const notifMgr = new NotificationManager(uiCallbacks.showToast);
  const bagMgr = new BackpackManager(store, eventBus, uiCallbacks.showToast);
  const craftMgr = new CraftingManager(bagMgr, eventBus, uiCallbacks.showToast);
  const controlMgr = new ControlManager();
  const wellStatus = new EntityStatusManager({
    maxCapacity: 3,
    regenIntervalMs: 8000,
    regenAmount: 1,
  });

  let currentScene = 'main';

  const refs: LaAmaliaGameRefs = {
    managers: { bagMgr, craftMgr, notifMgr, controlMgr, wellStatus },
    store,
    eventBus,
    k,
    go: (scene: string) => k.go(scene),
    currentScene,
    setCurrentScene: (s: string) => {
      currentScene = s;
      refs.currentScene = s;
    },
    openMenu: uiCallbacks.openMenu,
    openBook: uiCallbacks.openBook,
    openBackpack: uiCallbacks.openBackpack,
    openBuilding: uiCallbacks.openBuilding,
    openDialogue: uiCallbacks.openDialogue,
    openMinimap: uiCallbacks.openMinimap,
    mountPlatformer: uiCallbacks.mountPlatformer,
    unmountPlatformer: uiCallbacks.unmountPlatformer,
  };

  // Register scenes with kaboom
  k.scene('main', () => buildMainScene(refs));
  k.scene('warehouse', () => buildWarehouseScene(refs));

  return refs;
}
