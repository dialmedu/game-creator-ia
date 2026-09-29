export class ObjectManager {
  width: number;
  height: number;
  color: [number, number, number];
  spriteName: string | null;

  constructor(config: {
    width?: number;
    height?: number;
    color?: [number, number, number];
    spriteName?: string;
  }) {
    this.width = config.width ?? 40;
    this.height = config.height ?? 40;
    this.color = config.color ?? [59, 130, 246];
    this.spriteName = config.spriteName ?? null;
  }

  createComps(posVec: { x: number; y: number }, k: any): any[] {
    const comps = [
      k.pos(posVec.x, posVec.y),
      k.anchor('center'),
      k.area(),
      k.body({ isStatic: true }),
    ];

    let hasSprite = false;
    if (this.spriteName) {
      try {
        if (typeof k.getSprite === 'function' && k.getSprite(this.spriteName)) {
          comps.push(
            k.sprite(this.spriteName, { width: this.width, height: this.height }),
          );
          hasSprite = true;
        }
      } catch {
        // sprite not loaded
      }
    }

    if (!hasSprite) {
      comps.push(k.rect(this.width, this.height));
      comps.push(k.color(this.color[0], this.color[1], this.color[2]));
      comps.push(k.outline(2, k.rgb(100, 100, 100)));
    }

    return comps;
  }
}
