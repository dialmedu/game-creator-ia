export function getKaboomFromCDN(): (opts: Record<string, unknown>) => any {
  if (typeof window !== 'undefined' && window.kaboom) {
    return window.kaboom;
  }
  throw new Error(
    'Kaboom no esta cargado. Asegurate de que el CDN script este en index.html.',
  );
}

export function isKaboomReady(): boolean {
  return typeof window !== 'undefined' && !!window.kaboom;
}
