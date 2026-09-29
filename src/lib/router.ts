export type Route =
  | { name: 'hub' }
  | { name: 'game'; gameId: string };

export function parseHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/').filter(Boolean);

  if (parts.length >= 2 && parts[0] === 'gamer') {
    return { name: 'game', gameId: parts[1] };
  }

  return { name: 'hub' };
}

export function navigateToHub(): void {
  window.location.hash = '#/';
}

export function navigateToGame(gameId: string): void {
  window.location.hash = `#/gamer/${gameId}`;
}

export function onRouteChange(callback: (route: Route) => void): () => void {
  const handler = () => callback(parseHash());
  window.addEventListener('hashchange', handler);
  return () => window.removeEventListener('hashchange', handler);
}
