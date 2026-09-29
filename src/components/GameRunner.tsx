import { useEffect, useRef, useState, useCallback } from 'react';
import { getKaboomFromCDN } from '@/lib/kaboom-cdn';
import { EventBus, GameStateStore } from '@/core';
import type { GameState } from '@/core/types';
import { getGame } from '@/registry/gameRegistry';
import { createLaAmaliaRefs, type LaAmaliaGameRefs } from '@/games/la-amalia-1888/gameRefs';
import { ControlManager } from '@/managers';
import { GameHUD } from '@/components/GameHUD';
import { Toast, type ToastMessage } from '@/components/Toast';
import { GameModal, type ModalState } from '@/components/GameModal';
import { ReactPlatformer } from '@/games/la-amalia-1888/components/ReactPlatformer';
import { saveGame, loadGame, submitScore } from '@/lib/gameApi';
import { MenuContent } from './modal-contents/MenuContent';
import { BookContent } from './modal-contents/BookContent';
import { BackpackContent } from './modal-contents/BackpackContent';
import { LogsContent } from './modal-contents/LogsContent';
import { MinimapContent } from './modal-contents/MinimapContent';
import { BuildingContent } from './modal-contents/BuildingContent';
import { DialogueContent } from './modal-contents/DialogueContent';

interface GameRunnerProps {
  gameId: string;
  onExit: () => void;
}

export function GameRunner({ gameId, onExit }: GameRunnerProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const kRef = useRef<any>(null);
  const refsRef = useRef<LaAmaliaGameRefs | null>(null);
  const controlMgrRef = useRef<ControlManager | null>(null);

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [nearbyIcon, setNearbyIcon] = useState<string | null>(null);
  const [showPlatformer, setShowPlatformer] = useState(false);
  const [logs, setLogs] = useState<{ time: string; text: string; type: string }[]>([]);
  const [bagCount, setBagCount] = useState(0);

  const gameDef = getGame(gameId);

  const showToast = useCallback((msg: string, isError = false) => {
    const id = Date.now() + Math.random();
    setToast({ id, text: msg, isError });
    setLogs((prev) => [
      ...prev,
      { time: new Date().toLocaleTimeString(), text: msg, type: isError ? 'error' : 'log' },
    ].slice(-50));
  }, []);

  const addLog = useCallback((text: string, type = 'log') => {
    setLogs((prev) => [
      ...prev,
      { time: new Date().toLocaleTimeString(), text, type },
    ].slice(-50));
  }, []);

  // Initialize kaboom and game
  useEffect(() => {
    if (!canvasRef.current || !gameDef) return;

    addLog(`Initializing ${gameDef.title}...`);

    const k = getKaboomFromCDN()({
      width: window.innerWidth,
      height: window.innerHeight,
      scale: 1,
      stretch: true,
      letterbox: true,
      background: [34, 100, 45],
      root: canvasRef.current,
      global: false,
      touchToMouse: true,
    });
    kRef.current = k;

    const eventBus = new EventBus();
    const store = new GameStateStore(gameDef.initialState, eventBus);

    // Subscribe to state changes
    store.subscribe((_action, newState) => {
      setGameState({ ...newState });
      setBagCount(newState.inventory.reduce((acc, i) => acc + i.qty, 0));
    });

    const controlMgr = new ControlManager();
    controlMgr.setInteractHandler(() => eventBus.emit('INTERACT'));
    controlMgr.setShootHandler(() => eventBus.emit('SHOOT'));
    controlMgr.enable();
    controlMgrRef.current = controlMgr;

    // Create refs with UI callbacks
    const refs = createLaAmaliaRefs(
      { store, eventBus, getKaboom: () => kRef.current },
      k,
      {
        showToast,
        openMenu: () => setModal({ type: 'menu' }),
        openBook: () => setModal({ type: 'book' }),
        openBackpack: () => setModal({ type: 'backpack' }),
        openBuilding: (title, description) => setModal({ type: 'building', title, description }),
        openDialogue: (name, text, options) => setModal({ type: 'dialogue', name, text, options }),
        openMinimap: () => setModal({ type: 'minimap' }),
        mountPlatformer: () => setShowPlatformer(true),
        unmountPlatformer: () => setShowPlatformer(false),
      },
    );
    refsRef.current = refs;

    // Override controlMgr in managers with the one we enabled
    refs.managers.controlMgr = controlMgr;

    // Listen for nearby interactable
    eventBus.on('NEARBY_INTERACTABLE', (data: { icon: string | null; available: boolean }) => {
      setNearbyIcon(data.icon);
    });

    // Start game
    setGameState(store.getState());
    setBagCount(store.getState().inventory.reduce((acc, i) => acc + i.qty, 0));
    k.go('main');
    addLog('Game started - Scene: main');

    return () => {
      controlMgr.disable();
      k.destroyAll();
      eventBus.clear();
      canvasRef.current?.replaceChildren();
      addLog('Game disposed');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  // Actions
  const handleInteract = useCallback(() => {
    refsRef.current?.eventBus.emit('INTERACT');
  }, []);

  const handleShoot = useCallback(() => {
    refsRef.current?.eventBus.emit('SHOOT');
  }, []);

  const handleSave = useCallback(async () => {
    if (!refsRef.current || !gameDef) return;
    const state = refsRef.current.store.serialize();
    const ok = await saveGame(gameDef.id, 'auto', state);
    showToast(ok ? 'Partida guardada!' : 'Error al guardar', !ok);
  }, [gameDef, showToast]);

  const handleLoad = useCallback(async () => {
    if (!refsRef.current || !gameDef) return;
    const loaded = await loadGame(gameDef.id, 'auto');
    if (loaded) {
      refsRef.current.store.loadState(loaded);
      showToast('Partida cargada!');
    } else {
      showToast('No hay partida guardada', true);
    }
  }, [gameDef, showToast]);

  const handlePlatformerExit = useCallback(() => {
    setShowPlatformer(false);
    refsRef.current?.store.dispatch('SET_LEVEL', { level: 'main' });
    kRef.current?.go('main');
  }, []);

  const handlePlatformerScore = useCallback(async (score: number) => {
    if (!gameDef) return;
    await submitScore(gameDef.id, 'Player', score, { source: 'platformer' });
    showToast(`Score enviado: ${score}`);
  }, [gameDef, showToast]);

  if (!gameDef) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p>Game not found: {gameId}</p>
        <button onClick={onExit} className="ml-4 text-emerald-400 underline">Back</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 overflow-hidden">
      {/* Kaboom canvas container */}
      <div ref={canvasRef} className="absolute inset-0 z-10" />

      {/* HUD */}
      {gameState && !showPlatformer && (
        <GameHUD
          state={gameState}
          bagCount={bagCount}
          bagMax={10}
          nearbyIcon={nearbyIcon}
          onMenu={() => setModal({ type: 'menu' })}
          onBook={() => setModal({ type: 'book' })}
          onLogs={() => setModal({ type: 'logs' })}
          onBackpack={() => setModal({ type: 'backpack' })}
          onMinimap={() => setModal({ type: 'minimap' })}
          onSave={handleSave}
          onLoad={handleLoad}
          onExit={onExit}
          onInteract={handleInteract}
          onShoot={handleShoot}
          onMove={(dir) => controlMgrRef.current?.setDir(dir)}
        />
      )}

      {/* Toast */}
      <Toast toast={toast} />

      {/* Platformer overlay */}
      {showPlatformer && (
        <div className="absolute inset-0 z-40 bg-slate-950/90 flex flex-col items-center justify-center p-4">
          <ReactPlatformer onExit={handlePlatformerExit} onScore={handlePlatformerScore} />
        </div>
      )}

      {/* Modals */}
      <GameModal state={modal} onClose={() => setModal({ type: 'none' })}>
        {modal.type === 'menu' && gameState && (
          <MenuContent
            state={gameState}
            onToggleMinimap={(enabled) => {
              refsRef.current?.store.dispatch('TOGGLE_MINIMAP', { enabled });
            }}
          />
        )}
        {modal.type === 'book' && gameState && (
          <BookContent chapters={gameState.bookChapters} />
        )}
        {modal.type === 'backpack' && gameState && (
          <BackpackContent
            inventory={gameState.inventory}
            recipes={refsRef.current?.managers.craftMgr.getRecipes() || []}
            onCraft={(recipeId) => {
              refsRef.current?.managers.craftMgr.craft(recipeId);
            }}
          />
        )}
        {modal.type === 'logs' && <LogsContent logs={logs} />}
        {modal.type === 'minimap' && gameState && (
          <MinimapContent
            minimapData={refsRef.current?.store.getMinimapData() || null}
          />
        )}
        {modal.type === 'building' && (
          <BuildingContent description={modal.description} />
        )}
        {modal.type === 'dialogue' && (
          <DialogueContent
            text={modal.text}
            options={modal.options}
            onOptionClick={(opt) => {
              opt.action();
              setModal({ type: 'none' });
            }}
          />
        )}
      </GameModal>
    </div>
  );
}
