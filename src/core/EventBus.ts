export type EventHandler = (data?: any) => void;

export class EventBus {
  private listeners: Map<string, EventHandler[]> = new Map();

  on(event: string, fn: EventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(fn);
    return () => this.off(event, fn);
  }

  off(event: string, fn: EventHandler): void {
    const arr = this.listeners.get(event);
    if (!arr) return;
    this.listeners.set(
      event,
      arr.filter((f) => f !== fn),
    );
  }

  emit(event: string, data?: any): void {
    const arr = this.listeners.get(event);
    if (!arr) return;
    for (const fn of [...arr]) {
      try {
        fn(data);
      } catch (e) {
        console.error(`EventBus Error [${event}]:`, e);
      }
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}
