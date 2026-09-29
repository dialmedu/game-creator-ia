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
const BUILDINGS = {
  normal: `${ASSET_BASE}edificio_normal.png`,
  double: `${ASSET_BASE}edificio_doble.png`,
  large: `${ASSET_BASE}edificio_grande.png`,
};
const PLAYER = {
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

type BuildingType = 'normal' | 'double' | 'large';

export class DukubariCityManager {
  private readonly k: any;
  private readonly options: CityManagerOptions;
  private player: any;
  private direction: CityPoint = { x: 0, y: 0 };
  private externalDirection: CityPoint = { x: 0, y: 0 };
  private mode: CityMode = 'day';
  private targetIndex = 0;
  private disposed = false;
  private targetArrow: any;
  private pathPoints: CityPoint[] = [];
  private pressedKeys = new Set<string>();
  private lastDirection: CityPoint = { x: 0, y: 0 };
  private idleSince = 0;
  private currentSprite = 'dukubari-player-idle';
  private lastTargetId: string | null = null;

  constructor(options: CityManagerOptions) {
    this.options = options;
    const kaboom = getKaboomFromCDN();
    this.k = kaboom({
      width: window.innerWidth,
      height: window.innerHeight,
      scale: 1,
      stretch: true,
      letterbox: true,
      background: [248, 250, 249],
      root: options.root,
      global: false,
      touchToMouse: true,
    });
  }

  async start(): Promise<void> {
    this.loadAssets();
    this.buildCity();
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.k.onUpdate(() => this.update(this.k.dt()));
  }

  setTargetIndex(index: number): void {
    this.targetIndex = Math.max(0, Math.min(CITY_TARGETS.length - 1, index));
    this.updateTargetArrow();
  }

  setMode(mode: CityMode): void {
    this.mode = mode;
    this.k.setBackground(mode === 'night' ? this.k.rgb(226, 232, 240) : this.k.rgb(248, 250, 249));
  }

  setDirection(direction: CityPoint): void {
    this.direction = this.normalize(direction);
  }

  stop(): void {
    this.disposed = true;
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.k.destroyAll();
  }

  private loadAssets(): void {
    this.k.loadSprite('city-building-normal', BUILDINGS.normal);
    this.k.loadSprite('city-building-double', BUILDINGS.double);
    this.k.loadSprite('city-building-large', BUILDINGS.large);
    this.k.loadSprite('city-player-idle', PLAYER.idle);
    this.k.loadSprite('city-player-left', PLAYER.left);
    this.k.loadSprite('city-player-right', PLAYER.right);
  }

  private buildCity(): void {
    const mapWidth = 3600;
    const mapHeight = 900;
    this.k.add([this.k.rect(mapWidth, mapHeight), this.k.pos(0, 0), this.k.color(248, 250, 249), this.k.z(-30)]);
    this.drawRoadNetwork();

    CITY_TARGETS.forEach((target, index) => {
      this.addBuildingPad(target.position);
      const type: BuildingType = index === CITY_TARGETS.length - 1 ? 'large' : index % 2 === 0 ? 'double' : 'normal';
      this.addBuilding(target.position, type);
      this.k.add([
        this.k.text(`${target.icon} ${target.title}`, { size: 16 }),
        this.k.pos(target.position.x, target.position.y - 128),
        this.k.anchor('center'),
        this.k.color(30, 41, 59),
        this.k.outline(4, this.k.rgb(255, 255, 255)),
        this.k.z(10),
      ]);
    });

    this.targetArrow = this.k.add([
      this.k.text('↓', { size: 42 }),
      this.k.pos(0, 0),
      this.k.anchor('center'),
      this.k.color(245, 158, 11),
      this.k.z(12),
    ]);
    this.updateTargetArrow();
    this.player = this.addPlayer();
    this.k.camPos(this.player.pos);
  }

  private drawRoadNetwork(): void {
    this.pathPoints = [{ x: 160, y: 480 }, ...CITY_TARGETS.map((target) => target.position)];
    for (let index = 0; index < this.pathPoints.length - 1; index += 1) {
      const from = this.pathPoints[index];
      const to = this.pathPoints[index + 1];
      const roadWidth = 94;
      const horizontalWidth = Math.abs(to.x - from.x) + roadWidth;
      this.k.add([
        this.k.rect(horizontalWidth, roadWidth),
        this.k.pos((from.x + to.x) / 2, from.y),
        this.k.anchor('center'),
        this.k.color(203, 213, 225),
        this.k.outline(2, this.k.rgb(148, 163, 184)),
        this.k.z(-20),
      ]);
      if (from.y !== to.y) {
        const verticalHeight = Math.abs(to.y - from.y) + roadWidth;
        this.k.add([
          this.k.rect(roadWidth, verticalHeight),
          this.k.pos(to.x, (from.y + to.y) / 2),
          this.k.anchor('center'),
          this.k.color(203, 213, 225),
          this.k.outline(2, this.k.rgb(148, 163, 184)),
          this.k.z(-20),
        ]);
      }
    }
  }

  private addBuildingPad(position: CityPoint): void {
    this.k.add([
      this.k.rect(210, 210),
      this.k.pos(position.x, position.y),
      this.k.anchor('center'),
      this.k.color(255, 255, 255),
      this.k.outline(3, this.k.rgb(226, 232, 240)),
      this.k.z(-5),
    ]);
  }

  private addBuilding(position: CityPoint, type: BuildingType): void {
    const size = type === 'large' ? 230 : type === 'double' ? 190 : 155;
    try {
      this.k.add([
        this.k.sprite(`city-building-${type}`, { width: size, height: size }),
        this.k.pos(position.x, position.y),
        this.k.anchor('center'),
        this.k.z(1),
      ]);
    } catch {
      this.k.add([
        this.k.rect(size, size * 0.75),
        this.k.pos(position.x, position.y),
        this.k.anchor('center'),
        this.k.color(120, 150, 170),
        this.k.z(1),
      ]);
    }
  }

  private addPlayer(): any {
    return this.k.add([
      this.k.sprite(this.currentSprite, { width: 96, height: 96 }),
      this.k.pos(160, 480),
      this.k.anchor('center'),
      this.k.area(),
      this.k.z(5),
      'player',
    ]);
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    const key = event.key.toLowerCase();
    if (!['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) return;
    event.preventDefault();
    this.pressedKeys.add(key);
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    this.pressedKeys.delete(event.key.toLowerCase());
  };

  private getKeyboardDirection(): CityPoint {
    let x = 0;
    let y = 0;
    if (this.pressedKeys.has('a') || this.pressedKeys.has('arrowleft')) x -= 1;
    if (this.pressedKeys.has('d') || this.pressedKeys.has('arrowright')) x += 1;
    if (this.pressedKeys.has('w') || this.pressedKeys.has('arrowup')) y -= 1;
    if (this.pressedKeys.has('s') || this.pressedKeys.has('arrowdown')) y += 1;
    return this.normalize({ x, y });
  }

  private normalize(direction: CityPoint): CityPoint {
    const magnitude = Math.hypot(direction.x, direction.y);
    return magnitude > 0 ? { x: direction.x / magnitude, y: direction.y / magnitude } : { x: 0, y: 0 };
  }

  private isOnRoad(position: CityPoint): boolean {
    const width = 48;
    return this.pathPoints.some((point, index) => {
      const next = this.pathPoints[index + 1];
      if (!next) return Math.hypot(position.x - point.x, position.y - point.y) <= width;
      const onHorizontal = Math.abs(position.y - point.y) <= width && position.x >= Math.min(point.x, next.x) - width && position.x <= Math.max(point.x, next.x) + width;
      const onVertical = Math.abs(position.x - next.x) <= width && position.y >= Math.min(point.y, next.y) - width && position.y <= Math.max(point.y, next.y) + width;
      return onHorizontal || onVertical;
    });
  }

  private updatePlayerSprite(): void {
    const now = performance.now();
    const moving = Math.hypot(this.direction.x, this.direction.y) > 0.01;
    const nextSprite = moving ? (this.direction.x < -0.1 ? 'city-player-left' : this.direction.x > 0.1 ? 'city-player-right' : 'city-player-idle') : now - this.idleSince > 180 ? 'city-player-idle' : this.currentSprite;
    if (nextSprite === this.currentSprite) return;
    this.currentSprite = nextSprite;
    this.player.use(this.k.sprite(nextSprite, { width: 96, height: 96 }));
  }

  private updateTargetArrow(): void {
    const target = CITY_TARGETS[this.targetIndex];
    if (this.targetArrow && target) this.targetArrow.pos = this.k.vec2(target.position.x, target.position.y - 175);
  }

  private update(dt: number): void {
    if (this.disposed || !this.player) return;
    const keyboardDirection = this.getKeyboardDirection();
    const direction = Math.hypot(this.externalDirection.x, this.externalDirection.y) > 0.01
      ? this.externalDirection
      : keyboardDirection;
    this.direction = direction;
    const moving = Math.hypot(direction.x, direction.y) > 0.01;
    if (moving) this.idleSince = performance.now();
    this.updatePlayerSprite();

    const speed = 240;
    const nextPosition = {
      x: this.player.pos.x + direction.x * speed * dt,
      y: this.player.pos.y + direction.y * speed * dt,
    };
    if (this.isOnRoad(nextPosition)) {
      this.player.pos = this.k.vec2(nextPosition.x, nextPosition.y);
    }

    if (this.targetArrow) this.targetArrow.opacity = Math.sin(performance.now() / 180) > 0 ? 1 : 0.25;
    this.k.camPos(this.player.pos);
    this.options.onPositionChange({ x: this.player.pos.x, y: this.player.pos.y });
    const target = CITY_TARGETS[this.targetIndex];
    if (target && this.player.pos.dist(this.k.vec2(target.position.x, target.position.y)) < 30 && this.lastTargetId !== target.id) {
      this.lastTargetId = target.id;
      this.options.onTargetEnter(target);
    }
    if (!target || this.player.pos.dist(this.k.vec2(target.position.x, target.position.y)) >= 45) this.lastTargetId = null;
    this.direction = { x: 0, y: 0 };
  }
}
