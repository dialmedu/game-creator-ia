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

const ASSET_BASE = `${import.meta.env.BASE_URL}assets/dukubari/`;
const BUILDING_ASSETS = {
  normal: `${ASSET_BASE}edificio_normal.png`,
  double: `${ASSET_BASE}edificio_doble.png`,
  large: `${ASSET_BASE}edificio_grande.png`,
};
const CHARACTER_ASSETS = {
  idle: `${ASSET_BASE}personaje_main.png`,
  left: `${ASSET_BASE}personaje_main_left.png`,
  right: `${ASSET_BASE}personaje_main_rigth.png`,
};

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
  private currentPlayerSprite = 'dukubari-player-idle';
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
      this.k.loadSprite('dukubari-building-normal', BUILDING_ASSETS.normal);
      this.k.loadSprite('dukubari-building-double', BUILDING_ASSETS.double);
      this.k.loadSprite('dukubari-building-large', BUILDING_ASSETS.large);
      this.k.loadSprite('dukubari-player-idle', CHARACTER_ASSETS.idle);
      this.k.loadSprite('dukubari-player-left', CHARACTER_ASSETS.left);
      this.k.loadSprite('dukubari-player-right', CHARACTER_ASSETS.right);
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
      this.addBuilding(x + 125, 250, 'normal');
      this.addBuilding(x + 300, 680, x % 800 === 0 ? 'large' : 'double');
    }
    CITY_TARGETS.forEach((target, index) => {
      const buildingType = index === CITY_TARGETS.length - 1 ? 'large' : index % 2 === 0 ? 'double' : 'normal';
      this.addBuilding(target.position.x, target.position.y - 80, buildingType);
      k.add([k.text(`${target.icon} ${target.title}`, { size: 18 }), k.pos(target.position.x, target.position.y - 145), k.anchor('center'), k.color(255, 255, 255), k.outline(4, k.rgb(15, 23, 42)), k.z(10)]);
    });
    this.player = this.addPlayer();
    k.camPos(this.player.pos);
  }

  private addBuilding(x: number, y: number, type: 'normal' | 'double' | 'large'): void {
    const spriteName = `dukubari-building-${type}`;
    const size = type === 'large' ? 230 : type === 'double' ? 190 : 155;
    try {
      this.k.add([
        this.k.sprite(spriteName, { width: size, height: size }),
        this.k.pos(x, y),
        this.k.anchor('center'),
        this.k.z(1),
      ]);
    } catch {
      this.k.add([this.k.rect(size, size * 0.75), this.k.pos(x, y), this.k.anchor('center'), this.k.color(120, 150, 170), this.k.outline(3, this.k.rgb(255, 255, 255)), this.k.z(1)]);
    }
  }

  private addPlayer(): any {
    try {
      return this.k.add([
        this.k.sprite(this.currentPlayerSprite, { width: 96, height: 96 }),
        this.k.pos(160, 480),
        this.k.anchor('center'),
        this.k.area(),
        this.k.z(5),
        'player',
      ]);
    } catch {
      return this.k.add([this.k.rect(42, 62), this.k.pos(160, 480), this.k.anchor('center'), this.k.color(45, 110, 190), this.k.area(), this.k.z(5), 'player']);
    }
  }

  private updatePlayerSprite(): void {
    const nextSprite = this.direction.x < 0 ? 'dukubari-player-left' : this.direction.x > 0 ? 'dukubari-player-right' : 'dukubari-player-idle';
    if (!this.player || nextSprite === this.currentPlayerSprite) return;
    this.currentPlayerSprite = nextSprite;
    try {
      this.player.use(this.k.sprite(nextSprite, { width: 96, height: 96 }));
    } catch {
      // Keep the previous sprite if an image is unavailable.
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
    this.updatePlayerSprite();
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
