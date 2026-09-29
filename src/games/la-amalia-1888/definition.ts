import type { GameDefinition, GameContext } from '@/core/types';
import { laAmaliaInitialState } from './initialState';

export const laAmalia1888: GameDefinition = {
  id: 'la-amalia-1888',
  title: 'La Amalia 1888',
  description:
    'Agricultural adventure set in 1888 Antioquia. Plant, harvest, craft, explore, and defend your hacienda.',
  framework: 'react',
  icon: 'Coffee',
  category: 'adventure',
  initialState: laAmaliaInitialState,
  init: (_context: GameContext) => {
    // The init is called by the GameRunner component which handles
    // kaboom initialization, manager creation, and scene registration.
    // This definition provides the initial state and metadata.
    // The actual bootstrap happens in the GameRunner via createLaAmaliaRefs.
  },
  dispose: () => {
    // Cleanup is handled by the GameRunner component's useEffect cleanup
  },
};
