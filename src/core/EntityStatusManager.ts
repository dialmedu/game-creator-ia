export class EntityStatusManager {
  maxCapacity: number;
  regenIntervalMs: number;
  regenAmount: number;
  currentAmount: number;
  private lastUpdate: number;

  constructor(config: {
    maxCapacity?: number;
    regenIntervalMs?: number;
    regenAmount?: number;
    initialAmount?: number;
  }) {
    this.maxCapacity = config.maxCapacity ?? 3;
    this.regenIntervalMs = config.regenIntervalMs ?? 8000;
    this.regenAmount = config.regenAmount ?? 1;
    this.currentAmount =
      config.initialAmount !== undefined
        ? config.initialAmount
        : this.maxCapacity;
    this.lastUpdate = Date.now();
  }

  evaluateLazyTicks(): number {
    const now = Date.now();
    const elapsed = now - this.lastUpdate;
    if (elapsed >= this.regenIntervalMs && this.currentAmount < this.maxCapacity) {
      const ticks = Math.floor(elapsed / this.regenIntervalMs);
      this.currentAmount = Math.min(
        this.maxCapacity,
        this.currentAmount + ticks * this.regenAmount,
      );
      this.lastUpdate = now - (elapsed % this.regenIntervalMs);
    }
    return this.currentAmount;
  }

  consume(amount = 1): boolean {
    this.evaluateLazyTicks();
    if (this.currentAmount >= amount) {
      this.currentAmount -= amount;
      this.lastUpdate = Date.now();
      return true;
    }
    return false;
  }

  serialize(): { currentAmount: number; lastUpdate: number } {
    return { currentAmount: this.currentAmount, lastUpdate: this.lastUpdate };
  }

  restore(data: { currentAmount: number; lastUpdate: number }): void {
    this.currentAmount = data.currentAmount;
    this.lastUpdate = data.lastUpdate;
  }
}
