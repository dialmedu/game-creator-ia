import type { EventBus } from '@/core/EventBus';
import type { GameStateStore } from '@/core/GameStateStore';
import type { InventoryItem } from '@/core/types';

export class BackpackManager {
  private maxSlots = 10;

  constructor(
    private store: GameStateStore,
    private eventBus: EventBus,
    private showToast: (msg: string, isError?: boolean) => void,
  ) {}

  get inventory(): InventoryItem[] {
    return this.store.getState().inventory;
  }

  set inventory(inv: InventoryItem[]) {
    this.store.dispatch('SET_INV', { inventory: inv });
  }

  get maxSlots(): number {
    return this.maxSlots;
  }

  addItem(type: string, qty = 1): boolean {
    const current = [...this.inventory];
    const existing = current.find((i) => i.type === type);
    if (existing) {
      existing.qty += qty;
    } else {
      current.push({
        id: Math.random().toString(36).slice(2, 11),
        name: type,
        type,
        qty,
      });
    }
    this.inventory = current;
    this.showToast(`+${qty} ${type}`);
    this.eventBus.emit('INVENTORY_CHANGED', { type, qty });
    return true;
  }

  removeItem(type: string, qty = 1): boolean {
    const current = [...this.inventory];
    const existing = current.find((i) => i.type === type);
    if (existing && existing.qty >= qty) {
      existing.qty -= qty;
      const filtered = current.filter((i) => i.type !== type || i.qty > 0);
      this.inventory = filtered;
      this.eventBus.emit('INVENTORY_CHANGED', { type, qty: -qty });
      return true;
    }
    return false;
  }

  getItemQty(type: string): number {
    const item = this.inventory.find((i) => i.type === type);
    return item ? item.qty : 0;
  }

  getTotalQty(): number {
    return this.inventory.reduce((acc, item) => acc + item.qty, 0);
  }
}
