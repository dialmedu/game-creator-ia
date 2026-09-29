import type { LaAmaliaGameRefs } from '../gameRefs';
import { ObjectManager } from '@/managers';

export function buildMainScene(refs: LaAmaliaGameRefs): void {
  const { k, store, managers, go, setCurrentScene } = refs;
  const { bagMgr, notifMgr, controlMgr, wellStatus } = managers;

  setCurrentScene('main');
  store.dispatch('SET_LEVEL', { level: 'main' });

  const MAP_W = 2000;
  const MAP_H = 2000;

  // Ground
  k.add([
    k.rect(MAP_W, MAP_H),
    k.pos(0, 0),
    k.color(45, 120, 50),
    k.z(-20),
  ]);

  // Road
  k.add([
    k.rect(MAP_W, 200),
    k.pos(0, MAP_H / 2 - 100),
    k.color(90, 60, 30),
    k.z(-10),
  ]);

  // Well
  const wellObj = new ObjectManager({ width: 70, height: 70, color: [30, 144, 255] });
  k.add([
    ...wellObj.createComps({ x: 500, y: 500 }, k),
    'interactable',
    {
      getIcon: () => 'W',
      onInteract: () => {
        const available = wellStatus.evaluateLazyTicks();
        if (available > 0) {
          wellStatus.consume(1);
          bagMgr.addItem('Agua', 1);
          notifMgr.showToast(`Agua extraida (${wellStatus.currentAmount}/3)`);
        } else {
          notifMgr.showToast('El pozo se esta recargando...', true);
        }
      },
    },
  ]);

  // Building (cuarto cerrado)
  const buildingObj = new ObjectManager({ width: 100, height: 80, color: [120, 80, 50] });
  k.add([
    ...buildingObj.createComps({ x: 1200, y: 500 }, k),
    'interactable',
    {
      getIcon: () => 'H',
      onInteract: () => {
        refs.openBuilding(
          'Cuarto Cerrado (Hacienda La Amalia)',
          'Un recinto antiguo con documentos familiares y rastros del pasado de 1888. Aqui puedes investigar secretos de la familia y desbloquear capitulos.',
        );
        store.dispatch('UNLOCK_BOOK', { chapterId: 3 });
      },
    },
  ]);

  // Stable / Warehouse entrance
  const stableObj = new ObjectManager({ width: 110, height: 85, color: [140, 90, 40] });
  k.add([
    ...stableObj.createComps({ x: 1200, y: 800 }, k),
    'interactable',
    {
      getIcon: () => 'S',
      onInteract: () => {
        refs.openDialogue('Almacen / Establo', 'Un espacio de suministros en la hacienda. Deseas entrar al Almacen?', [
          {
            text: 'Entrar al Almacen',
            action: () => {
              store.dispatch('SET_LEVEL', { level: 'warehouse' });
              go('warehouse');
            },
          },
          { text: 'Cerrar', action: () => {} },
        ]);
      },
    },
  ]);

  // Portal to React Platformer
  const portalObj = new ObjectManager({ width: 90, height: 90, color: [200, 180, 50] });
  k.add([
    ...portalObj.createComps({ x: 1800, y: 1000 }, k),
    'interactable',
    {
      getIcon: () => 'P',
      onInteract: () => {
        refs.openDialogue(
          'Portal React Platformer',
          'Deseas ingresar al Nivel 2: Modulo React Platformer (Estilo Donkey Kong) para el Acto II?',
          [
            {
              text: 'Ingresar a React Platformer',
              action: () => {
                store.dispatch('SET_ACT', { act: 2 });
                store.dispatch('UNLOCK_BOOK', { chapterId: 4 });
                store.dispatch('SET_LEVEL', { level: 'level2' });
                refs.mountPlatformer();
              },
            },
            { text: 'Quedarse en La Amalia', action: () => {} },
          ],
        );
      },
    },
  ]);

  // Farming plots
  const plots: any[] = [];
  for (let i = 0; i < 3; i++) {
    const p = k.add([
      k.rect(80, 80),
      k.pos(700 + i * 100, 500),
      k.anchor('center'),
      k.color(100, 70, 30),
      k.area(),
      k.body({ isStatic: true }),
      k.z(5),
      'interactable',
      {
        state: 'empty',
        getIcon: () => {
          if (p.state === 'empty') return 's';
          if (p.state === 'planted') return 'w';
          if (p.state === 'watered') return 'g';
          return 'C';
        },
        onInteract: () => {
          if (p.state === 'empty') {
            if (bagMgr.removeItem('Semilla', 1)) {
              p.state = 'planted';
              p.color = k.rgb(50, 120, 50);
              notifMgr.showToast('Semilla sembrada.');
            } else {
              notifMgr.showToast('Necesitas Semillas.', true);
            }
          } else if (p.state === 'planted') {
            if (bagMgr.removeItem('Agua', 1)) {
              p.state = 'watered';
              notifMgr.showToast('Planta regada. Creciendo...');
              k.wait(5, () => {
                if (p) p.state = 'grown';
              });
            } else {
              notifMgr.showToast('Necesitas Agua para regar.', true);
            }
          } else if (p.state === 'grown') {
            p.state = 'empty';
            p.color = k.rgb(100, 70, 30);
            bagMgr.addItem('Cafe', 2);
            notifMgr.showToast('Cafe cosechado!');
            if (store.getState().storyStage === 'intro') {
              store.dispatch('SET_STORY', { stage: 'harvested' });
              store.dispatch('SET_ACT', { act: 2 });
              store.dispatch('UNLOCK_BOOK', { chapterId: 2 });
            }
          }
        },
      },
    ]);
    plots.push(p);
  }

  // Administrator NPC
  const adminObj = new ObjectManager({ width: 50, height: 50, color: [200, 150, 100] });
  k.add([
    ...adminObj.createComps({ x: 300, y: 500 }, k),
    'interactable',
    {
      getIcon: () => 'A',
      onInteract: () => {
        refs.openDialogue(
          'Administrador',
          'Bienvenido a La Amalia 1888. "Antes de cosechar el cafe, tendras que sembrar el legado." Toma estas semillas y aprende a cultivar la tierra.',
          [
            {
              text: 'Tomar 5x Semillas',
              action: () => {
                bagMgr.addItem('Semilla', 5);
                notifMgr.showToast('Recibiste 5 Semillas!');
              },
            },
            { text: 'Cerrar', action: () => {} },
          ],
        );
      },
    },
  ]);

  // Zombie spawner
  k.loop(15, () => {
    if (store.getState().currentLevel !== 'main') return;
    const player = k.get('player')[0];
    if (!player) return;
    const rx = player.pos.x + (Math.random() * 600 - 300);
    const ry = player.pos.y + (Math.random() * 600 - 300);
    const zombieObj = new ObjectManager({ width: 40, height: 40, color: [150, 50, 50] });
    const zombie = k.add([
      ...zombieObj.createComps({ x: rx, y: ry }, k),
      'zombie',
      { hp: 3 },
    ]);
    zombie.onUpdate(() => {
      const dir = player.pos.sub(zombie.pos).unit();
      zombie.move(dir.scale(70));
      if (zombie.pos.dist(player.pos) < 35) {
        const st = store.getState();
        st.attributes.hp = Math.max(0, st.attributes.hp - 1);
        store.dispatch('SET_ATTR', { key: 'hp', value: st.attributes.hp });
      }
    });
  });

  // Player
  const playerObj = new ObjectManager({ width: 40, height: 40, color: [59, 130, 246] });
  const player = k.add([
    ...playerObj.createComps({ x: MAP_W / 2, y: MAP_H / 2 }, k),
    'player',
  ]);

  let activeInteractable: any = null;

  // Shoot button handler - exposed via refs eventBus
  const onShoot = () => {
    const st = store.getState();
    if (st.attributes.ammo > 0) {
      st.attributes.ammo--;
      store.dispatch('SET_ATTR', { key: 'ammo', value: st.attributes.ammo });
      const bullet = k.add([
        k.rect(10, 10),
        k.pos(player.pos),
        k.anchor('center'),
        k.color(255, 255, 0),
        k.area(),
        k.move(k.vec2(1, 0), 600),
        k.lifespan(1),
        'bullet',
      ]);
      bullet.onCollide('zombie', (z: any) => {
        k.destroy(bullet);
        z.hp--;
        if (z.hp <= 0) {
          k.destroy(z);
          notifMgr.showToast('Amenaza neutralizada.');
        }
      });
      notifMgr.showToast('Disparo!');
    } else {
      notifMgr.showToast('Sin municion.', true);
    }
  };
  refs.eventBus.on('SHOOT', onShoot);

  // Interact handler
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
      player.pos.dist(obj.pos) < 130,
    );
    activeInteractable = nearby || null;
    refs.eventBus.emit('NEARBY_INTERACTABLE', {
      icon: nearby?.getIcon ? nearby.getIcon() : null,
      available: !!nearby,
    });
  });

  k.onSceneLeave(() => {
    refs.eventBus.off('SHOOT', onShoot);
    refs.eventBus.off('INTERACT', onInteract);
  });
}
