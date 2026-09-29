/// <reference types="vite/client" />

declare global {
  interface Window {
    kaboom?: (opts: Record<string, unknown>) => any;
  }
}

export {};
