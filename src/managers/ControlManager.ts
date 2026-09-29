export interface PlayerDir {
  x: number;
  y: number;
}

export class ControlManager {
  playerDir: PlayerDir = { x: 0, y: 0 };
  private keys: Set<string> = new Set();
  private enabled = false;
  private interactHandler: (() => void) | null = null;
  private shootHandler: (() => void) | null = null;

  setInteractHandler(handler: (() => void) | null): void {
    this.interactHandler = handler;
  }

  setShootHandler(handler: (() => void) | null): void {
    this.shootHandler = handler;
  }

  enable(): void {
    if (this.enabled) return;
    this.enabled = true;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  disable(): void {
    this.enabled = false;
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.playerDir = { x: 0, y: 0 };
    this.keys.clear();
    this.interactHandler = null;
    this.shootHandler = null;
  }

  setDir(dir: PlayerDir): void {
    this.playerDir = dir;
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    const key = e.key.toLowerCase();
    if (key === 'enter') {
      e.preventDefault();
      this.interactHandler?.();
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      this.shootHandler?.();
      return;
    }

    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
      e.preventDefault();
      this.keys.add(key);
      this.updateDir();
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.key.toLowerCase());
    this.updateDir();
  };

  private updateDir(): void {
    let x = 0;
    let y = 0;
    if (this.keys.has('arrowleft') || this.keys.has('a')) x -= 1;
    if (this.keys.has('arrowright') || this.keys.has('d')) x += 1;
    if (this.keys.has('arrowup') || this.keys.has('w')) y -= 1;
    if (this.keys.has('arrowdown') || this.keys.has('s')) y += 1;
    const mag = Math.sqrt(x * x + y * y);
    if (mag > 0) {
      this.playerDir = { x: x / mag, y: y / mag };
    } else {
      this.playerDir = { x: 0, y: 0 };
    }
  }
}
