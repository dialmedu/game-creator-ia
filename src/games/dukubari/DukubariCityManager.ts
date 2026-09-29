import { getKaboomFromCDN } from '@/lib/kaboom-cdn';

export type CityPoint = { x: number; y: number };
export type CityMode = 'day' | 'night';

export interface CityTarget {
  id: string;
  title: string;
  icon: string;
  position: CityPoint;
}

interface CityManagerOptions {
  root: HTMLElement;
  onTargetEnter: (target: CityTarget) => void;
  onPositionChange: (position: CityPoint) => void;
}

const BUILDINGS_URL = `${import.meta.env.BASE_URL}assets/dukubari/spinter_edificios_png.png`;
const CHARACTER_URL = `${import.meta.env.BASE_URL}assets/dukubari/spinter_personaje_png.png`;

export const CITY_TARGETS: CityTarget[] = [
  { id: 'identity', title: 'Funcionario', icon: '🪪', position: { x: 420, y: 330 } },
  { id: 'pet', title: 'Centro de mascotas', icon: '🐾', position: { x: 820, y: 520 } },
  { id: 'schedule', title: 'Oficina de horarios', icon: '🕒', position: { x: 1220, y: 330 } },
  { id: 'study', title: 'Centro de educación', icon: '🎓', position: { x: 1620, y: 520 } },
  { id: 'marriage', title: 'Oficina de vínculos', icon: '💍', position: { x: 2020, y: 330 } },
  { id: 'work', title: 'Distrito laboral', icon: '💼', position: { x: 2420, y: 520 } },
  { id: 'car', title: 'Concesionario', icon: '🚗', position: { x: 2820, y: 330 } },
  { id: 'exit', title: 'Centro del Orden', icon: '🚪', position: { x: 3220, y: 520 } },
];

export class DukubariCityManager {
  private readonly k: any;
  private readonly options: CityManagerOptions;
  private player: any;
  private direction = { x: 0, y: 0 };
  private mode: CityMode = 'day';
  private targetIndex = 0;
  private disposed = false;

  constructor(options: CityManagerOptions) {
    this.options = options;
    const kaboom = getKaboomFromCDN();
    this.k = kaboom({
      width: window.innerWidth,
      height: window.innerHeight,
      scale: 1,
      stretch: true,
      letterbox: true,
      background: [210, 235, 225],
      root: options.root,
      global: false,
      touchToMouse: true,
    });
  }

  async start(): Promise<void> {
    await this.loadAssets();
    this.buildCity();
    this.bindKeyboard();
    this.k.onUpdate(() => this.update());
  }

  setTargetIndex(index: number): void {
    this.targetIndex = Math.max(0, Math.min(CITY_TARGETS.length - 1, index));
  }

  setMode(mode: CityMode): void {
    this.mode = mode;
    this.k.setBackground(this.mode === 'night' ? this.k.rgb(15, 23, 42) : this.k.rgb(210, 235, 225));
  }

  setDirection(direction: CityPoint): void {
    this.direction = direction;
  }

  stop(): void {
    this.disposed = true;
    window.removeEventListener('keydown', this.onKeyDown);
    this.k.destroyAll();
  }

  private async loadAssets(): Promise<void> {
    try {
      this.k.loadSprite('dukubari-buildings', BUILDINGS_URL, { sliceX: 8, sliceY: 6 });
      this.k.loadSprite('dukubari-character', CHARACTER_URL, { sliceX: 5, sliceY: 3 });
      await Promise.resolve();
    } catch (error) {
      console.warn('Dukubari sprites no disponibles; usando fallback:', error);
    }
  }

  private buildCity(): void {
    const k = this.k;
    const mapWidth = 3600;
    const mapHeight = 900;
    k.add([k.rect(mapWidth, mapHeight), k.pos(0, 0), k.color(135, 190, 150), k.z(-20)]);
    for (let x = 0; x < mapWidth; x += 400) {
      k.add([k.rect(150, mapHeight), k.pos(x, 0), k.color(75, 82, 88), k.z(-10)]);
      k.add([k.rect(12, mapHeight), k.pos(x + 69, 0), k.color(225, 225, 190), k.z(-9)]);
    }
    for (let x = 0; x < mapWidth; x += 400) {
      this.addBuilding(x + 125, 250, 16);
      this.addBuilding(x + 300, 680, 32);
    }
    CITY_TARGETS.forEach((target, index) => {
      this.addBuilding(target.position.x, target.position.y - 80, index % 2 === 0 ? 16 : 24);
      k.add([k.text(`${target.icon} ${target.title}`, { size: 18 }), k.pos(target.position.x, target.position.y - 145), k.anchor('center'), k.color(255, 255, 255), k.outline(4, k.rgb(15, 23, 42)), k.z(10)]);
    });
    this.player = this.addPlayer();
    k.camPos(this.player.pos);
  }

  private addBuilding(x: number, y: number, frame: number): void {
    const k = this.k;
    try {
      k.add([k.sprite('dukubari-buildings', { frame }), k.pos(x, y), k.anchor('center'), k.z(1)]);
    } catch {
      k.add([k.rect(150, 120), k.pos(x, y), k.anchor('center'), k.color(120, 150, 170), k.outline(3, k.rgb(255, 255, 255)), k.z(1)]);
    }
  }

  private addPlayer(): any {
    const k = this.k;
    try {
      return k.add([k.sprite('dukubari-character', { frame: this.mode === 'day' ? 0 : 3 }), k.pos(160, 480), k.anchor('center'), k.area(), k.z(5), 'player']);
    } catch {
      return k.add([k.rect(42, 62), k.pos(160, 480), k.anchor('center'), k.color(45, 110, 190), k.area(), k.z(5), 'player']);
    }
  }

  private bindKeyboard(): void {
    window.addEventListener('keydown', this.onKeyDown);
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    const key = event.key.toLowerCase();
    if (!['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) return;
    event.preventDefault();
    this.direction = { x: key === 'a' || key === 'arrowleft' ? -1 : key === 'd' || key === 'arrowright' ? 1 : 0, y: key === 'w' || key === 'arrowup' ? -1 : key === 's' || key === 'arrowdown' ? 1 : 0 };
  };

  private update(): void {
    if (this.disposed || !this.player) return;
    const speed = 240;
    this.player.move(this.direction.x * speed, this.direction.y * speed);
    this.player.pos.x = Math.max(80, Math.min(3450, this.player.pos.x));
    this.player.pos.y = Math.max(160, Math.min(760, this.player.pos.y));
    this.k.camPos(this.player.pos);
    this.options.onPositionChange({ x: this.player.pos.x, y: this.player.pos.y });
    const target = CITY_TARGETS[this.targetIndex];
    if (target && this.player.pos.dist(this.k.vec2(target.position.x, target.position.y)) < 125) this.options.onTargetEnter(target);
    this.direction = { x: 0, y: 0 };
  }
}
