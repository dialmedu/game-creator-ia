import type { GameDefinition } from '@/core/types';

export const dukubari: GameDefinition = {
  id: 'dukubari',
  title: 'Dukubari',
  description:
    'Aventura narrativa sobre identidad, conformismo y una ciudad donde todo funciona como debe.',
  framework: 'react',
  icon: 'Eye',
  category: 'aventura narrativa',
  initialState: {
    act: 1,
    storyStage: 'station',
    minimapEnabled: false,
    currentLevel: 'station',
    playerPosition: { x: 50, y: 58 },
    attributes: { money: 0, legacy: 0, reputation: 0, hp: 100, speed: 0, ammo: 0 },
    inventory: [],
    effectHistory: [],
    bookChapters: [],
  },
  init: () => undefined,
  dispose: () => undefined,
};
