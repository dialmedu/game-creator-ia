import { EventBus } from './EventBus';

export type RouteHandler = () => void;

export class RouterManager {
  private routes: Map<string, RouteHandler> = new Map();
  currentRoute = 'main';
  private enabled = false;
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    window.addEventListener('hashchange', () => {
      if (this.enabled) this.handleHashChange();
    });
  }

  register(routePath: string, handler: RouteHandler): void {
    this.routes.set(routePath, handler);
  }

  enable(): void {
    this.enabled = true;
    this.init();
  }

  disable(): void {
    this.enabled = false;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  navigate(routePath: string, replace = false): void {
    if (!this.enabled) return;
    const cleanPath = routePath.startsWith('#') ? routePath.slice(1) : routePath;
    if (replace) {
      history.replaceState(null, '', `#${cleanPath}`);
      this.handleHashChange();
    } else {
      window.location.hash = cleanPath;
    }
  }

  redirect(routePath: string): void {
    this.navigate(routePath, true);
  }

  private handleHashChange(): void {
    if (!this.enabled) return;
    const hash = window.location.hash.replace('#', '') || 'main';
    this.currentRoute = hash;
    const handler = this.routes.get(hash);
    if (handler) {
      try {
        handler();
      } catch (e) {
        console.error(`Router Handler Error [${hash}]:`, e);
      }
    }
    this.eventBus.emit('ROUTE_CHANGED', { route: hash });
  }

  private init(): void {
    if (!this.enabled) return;
    if (!window.location.hash) {
      this.navigate('main', true);
    } else {
      this.handleHashChange();
    }
  }
}
