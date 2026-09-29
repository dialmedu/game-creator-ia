import type { EventBus } from '@/core/EventBus';
import type { BackpackManager } from './BackpackManager';

export interface Recipe {
  id: string;
  name: string;
  inputs: Record<string, number>;
  output: { type: string; qty: number };
  desc: string;
}

export class CraftingManager {
  private recipes: Recipe[];

  constructor(
    private bagMgr: BackpackManager,
    private eventBus: EventBus,
    private showToast: (msg: string, isError?: boolean) => void,
  ) {
    this.recipes = [
      {
        id: 'rec_1',
        name: 'Lote de Cafe',
        inputs: { Cafe: 2, Balanza: 1 },
        output: { type: 'LoteCafe', qty: 1 },
        desc: 'Combina 2x Cafe y 1x Balanza para crear un Lote de Exportacion.',
      },
      {
        id: 'rec_2',
        name: 'Habitacion Secreta',
        inputs: { Carta: 1, Llave: 1 },
        output: { type: 'AccesoSecreto', qty: 1 },
        desc: 'Usa Carta y Llave para abrir el cuarto cerrado.',
      },
    ];
  }

  getRecipes(): Recipe[] {
    return this.recipes;
  }

  craft(recipeId: string): boolean {
    const rec = this.recipes.find((r) => r.id === recipeId);
    if (!rec) return false;

    for (const [itemType, qtyNeeded] of Object.entries(rec.inputs)) {
      if (this.bagMgr.getItemQty(itemType) < qtyNeeded) {
        this.showToast(
          `Falta ${itemType} (${this.bagMgr.getItemQty(itemType)}/${qtyNeeded})`,
          true,
        );
        return false;
      }
    }

    for (const [itemType, qtyNeeded] of Object.entries(rec.inputs)) {
      this.bagMgr.removeItem(itemType, qtyNeeded);
    }

    this.bagMgr.addItem(rec.output.type, rec.output.qty);
    this.showToast(`Creado con exito: ${rec.output.type}!`);
    this.eventBus.emit('ITEM_CRAFTED', { item: rec.output.type });
    return true;
  }
}
