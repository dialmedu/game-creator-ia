import type { LaAmaliaGameRefs } from '../gameRefs';
import { ObjectManager } from '@/managers';

export function buildWarehouseScene(refs: LaAmaliaGameRefs): void {
  const { k, store, managers, go, setCurrentScene } = refs;
  const { notifMgr, controlMgr } = managers;

  setCurrentScene('warehouse');
  store.dispatch('SET_LEVEL', { level: 'warehouse' });

  const MAP_W = 1200;
  const MAP_H = 1200;

  k.add([
    k.rect(MAP_W, MAP_H),
    k.pos(0, 0),
    k.color(50, 40, 30),
    k.z(-20),
  ]);

  k.add([
    k.text('Almacen de Municion', { size: 20 }),
    k.pos(MAP_W / 2, 50),
    k.anchor('center'),
    k.color(255, 255, 255),
    k.z(10),
  ]);

  // Bullet pickups
  for (let i = 0; i < 8; i++) {
    const bx = 300 + Math.random() * 600;
    const by = 200 + Math.random() * 600;
    k.add([
      k.rect(30, 30),
      k.pos(bx, by),
      k.anchor('center'),
      k.color(220, 50, 50),
      k.area(),
      k.z(5),
      'bullet_pickup',
    ]);
  }

  // Exit portal
  const exitPortal = new ObjectManager({ width: 80, height: 80, color: [50, 150, 200] });
  k.add([
    ...exitPortal.createComps({ x: MAP_W / 2, y: MAP_H - 100 }, k),
    'interactable',
    {
      getIcon: () => 'X',
      onInteract: () => {
        store.dispatch('SET_LEVEL', { level: 'main' });
        go('main');
      },
    },
  ]);

  // Player
  const playerObj = new ObjectManager({ width: 40, height: 40, color: [59, 130, 246] });
  const player = k.add([
    ...playerObj.createComps({ x: MAP_W / 2, y: MAP_H / 2 }, k),
    'player',
  ]);

  player.onCollide('bullet_pickup', (bullet: any) => {
    k.destroy(bullet);
    const st = store.getState();
    st.attributes.ammo += 5;
    store.dispatch('SET_ATTR', { key: 'ammo', value: st.attributes.ammo });
    notifMgr.showToast('+5 Balas recogidas.');
  });

  let activeInteractable: any = null;

  const onInteract = () => {
    if (activeInteractable && activeInteractable.onInteract) {
      activeInteractable.onInteract();
    }
  };
  refs.eventBus.on('INTERACT', onInteract);

  k.onUpdate(() => {
    k.camPos(player.pos);
    store.dispatch('SET_PLAYER_POS', { pos: { x: player.pos.x, y: player.pos.y } });

    const speed = store.getState().attributes.speed;
    if (controlMgr.playerDir.x !== 0 || controlMgr.playerDir.y !== 0) {
      player.move(
        k.vec2(controlMgr.playerDir.x, controlMgr.playerDir.y).scale(speed),
      );
    }

    const nearby = k.get('interactable').find((obj: any) =>
      player.pos.dist(obj.pos) < 90,
    );
    activeInteractable = nearby || null;
    refs.eventBus.emit('NEARBY_INTERACTABLE', {
      icon: nearby?.getIcon ? nearby.getIcon() : null,
      available: !!nearby,
    });
  });

  k.onSceneLeave(() => {
    refs.eventBus.off('INTERACT', onInteract);
  });
}
