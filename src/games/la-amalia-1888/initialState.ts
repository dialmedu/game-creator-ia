import type { GameState } from '@/core/types';

export const laAmaliaInitialState: GameState = {
  act: 1,
  storyStage: 'intro',
  minimapEnabled: true,
  currentLevel: 'main',
  playerPosition: { x: 1000, y: 1000 },
  attributes: {
    money: 50,
    legacy: 10,
    reputation: 20,
    hp: 100,
    speed: 220,
    ammo: 15,
  },
  inventory: [
    { id: 'seed_1', name: 'Semilla', type: 'Semilla', qty: 5 },
    { id: 'bal_1', name: 'Balanza', type: 'Balanza', qty: 1 },
    { id: 'key_1', name: 'Llave', type: 'Llave', qty: 1 },
    { id: 'carta_1', name: 'Carta Antigua', type: 'Carta', qty: 1 },
  ],
  effectHistory: [],
  bookChapters: [
    {
      id: 1,
      title: 'Capitulo I: Las Semillas del Legado',
      unlocked: true,
      content:
        'Llegada a La Amalia en 1888. Las montanas de Antioquia guardan promesas y misterios familiares.',
    },
    {
      id: 2,
      title: 'Capitulo II: La Primera Cosecha y Deudas',
      unlocked: false,
      content:
        'El cafe brota, pero el mantenimiento de la hacienda exige decisiones dificiles entre dinero y reputacion.',
    },
    {
      id: 3,
      title: 'Capitulo III: Cartas del Pasado',
      unlocked: false,
      content:
        'Un documento polvoriento en el cuarto cerrado revela pistas sobre el verdadero origen de la hacienda.',
    },
    {
      id: 4,
      title: 'Capitulo IV: Puerto y Exportacion (React Platformer)',
      unlocked: false,
      content:
        'Acceso al Nivel 2: Modulo de Plataformas Acto II powered by React.js.',
    },
  ],
};
