import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/*
  A tower that assembles itself as `progress` goes 0 → 1:
  foundation → columns rise → slabs swing in on the crane → glass → lights on.
  progressRef.current is written from outside (scroll); this component only reads it.
*/

const FLOORS = 9;
const FH = 1.15; // floor height
const W = 8; // footprint x
const D = 5.5; // footprint z
const COLS_X = [-4, -2, 0, 2, 4];
const COLS_Z = [-2.75, 0, 2.75];

const clamp01 = v => Math.min(1, Math.max(0, v));
const seg = (p, a, b) => clamp01((p - a) / (b - a));
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function BuildScene({ progressRef, accent = '#F5A524', bg = '#0E0F11', hudRef, mobile = false }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const accentC = new THREE.Color(accent);
    const bgC = new THREE.Color(bg);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 1.75));
    renderer.setClearColor(bgC, 1);
    renderer.shadowMap.enabled = !mobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(bgC, 28, 70);

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);

    // ── Lights
    scene.add(new THREE.HemisphereLight(0x9fb3c8, 0x1a1410, 0.55));
    const sun = new THREE.DirectionalLight(0xffe2b8, 2.1);
    sun.position.set(14, 22, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 60 });
    sun.shadow.bias = -0.0008;
    scene.add(sun);
    const rim = new THREE.DirectionalLight(accentC, 0.9);
    rim.position.set(-12, 6, -10);
    scene.add(rim);

    // ── Ground
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(60, 64),
      new THREE.MeshStandardMaterial({ color: bgC.clone().offsetHSL(0, 0, 0.025), roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    const grid = new THREE.GridHelper(80, 80, accentC, 0x2a2c30);
    grid.material.transparent = true;
    grid.material.opacity = 0.22;
    grid.position.y = 0.002;
    scene.add(grid);

    // ── Ghost envelope: the "plan" drawn in light before anything is built
    const ghostGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(W + 0.6, FLOORS * FH + 0.4, D + 0.6));
    const ghost = new THREE.LineSegments(
      ghostGeo,
      new THREE.LineDashedMaterial({ color: accentC, dashSize: 0.35, gapSize: 0.25, transparent: true, opacity: 0.5 })
    );
    ghost.computeLineDistances();
    ghost.position.y = (FLOORS * FH + 0.4) / 2;
    scene.add(ghost);

    // footprint outline on the ground
    const footprint = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(W + 2.4, D + 2.4)),
      new THREE.LineBasicMaterial({ color: accentC, transparent: true, opacity: 0.8 })
    );
    footprint.rotation.x = -Math.PI / 2;
    footprint.position.y = 0.01;
    scene.add(footprint);

    // ── Materials
    const concrete = new THREE.MeshStandardMaterial({ color: 0x8b8781, roughness: 0.92, metalness: 0.02 });
    const steel = new THREE.MeshStandardMaterial({ color: 0x3b3f45, roughness: 0.5, metalness: 0.7 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.3,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0,
      reflectivity: 0.8,
      emissive: new THREE.Color(0xffb35c),
      emissiveIntensity: 0
    });
    const edgeMat = new THREE.LineBasicMaterial({ color: accentC, transparent: true, opacity: 0.9 });

    // ── Façade texture: a grid of windows, some lit warm, used as map + emissiveMap
    const makeFacade = () => {
      const cols = 24,
        rows = FLOORS;
      const cw = 32,
        ch = 48;
      const cv = document.createElement('canvas');
      cv.width = cols * cw;
      cv.height = rows * ch;
      const g = cv.getContext('2d');
      const lit = document.createElement('canvas');
      lit.width = cv.width;
      lit.height = cv.height;
      const gl = lit.getContext('2d');
      gl.fillStyle = '#000';
      gl.fillRect(0, 0, lit.width, lit.height);
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const x = c * cw,
            y = r * ch;
          const shade = 30 + Math.random() * 25;
          g.fillStyle = `rgb(${shade * 0.7},${shade * 0.9},${shade * 1.2})`;
          g.fillRect(x, y, cw, ch);
          const grd = g.createLinearGradient(x, y, x + cw, y + ch);
          grd.addColorStop(0, 'rgba(160,190,220,0.18)');
          grd.addColorStop(1, 'rgba(160,190,220,0)');
          g.fillStyle = grd;
          g.fillRect(x, y, cw, ch);
          if (Math.random() < 0.45) {
            const warm = Math.random();
            gl.fillStyle = warm > 0.3 ? `rgba(255,${170 + warm * 50},${90 + warm * 40},1)` : 'rgba(220,235,255,0.9)';
            gl.fillRect(x + 3, y + 3, cw - 6, ch - 6);
          }
          g.fillStyle = '#0d0f12';
          g.fillRect(x, y, 3, ch);
          g.fillRect(x, y, cw, 3);
        }
      const t1 = new THREE.CanvasTexture(cv);
      const t2 = new THREE.CanvasTexture(lit);
      t1.colorSpace = t2.colorSpace = THREE.SRGBColorSpace;
      t1.anisotropy = t2.anisotropy = 4;
      return [t1, t2];
    };
    const [facadeMap, facadeLit] = makeFacade();

    // ── Foundation
    const foundation = new THREE.Mesh(new THREE.BoxGeometry(W + 1.6, 0.35, D + 1.6), concrete);
    foundation.position.y = 0.175;
    foundation.castShadow = foundation.receiveShadow = true;
    scene.add(foundation);

    // ── Floors
    const colGeo = new THREE.BoxGeometry(0.28, FH, 0.28);
    colGeo.translate(0, FH / 2, 0); // pivot at base so scale.y "grows" upward
    const slabGeo = new THREE.BoxGeometry(W + 0.6, 0.22, D + 0.6);
    const slabEdges = new THREE.EdgesGeometry(slabGeo);
    const floors = [];
    const glassMats = [];
    const dummy = new THREE.Object3D();

    for (let f = 0; f < FLOORS; f++) {
      const y0 = 0.35 + f * FH;
      const group = new THREE.Group();
      group.position.y = y0;
      scene.add(group);

      const cols = new THREE.InstancedMesh(colGeo, steel, COLS_X.length * COLS_Z.length);
      let i = 0;
      COLS_X.forEach(x =>
        COLS_Z.forEach(z => {
          dummy.position.set(x, 0, z);
          dummy.updateMatrix();
          cols.setMatrixAt(i++, dummy.matrix);
        })
      );
      cols.castShadow = true;
      group.add(cols);

      const slab = new THREE.Mesh(slabGeo, concrete);
      slab.castShadow = slab.receiveShadow = true;
      const slabLine = new THREE.LineSegments(slabEdges, edgeMat);
      slab.add(slabLine);
      group.add(slab);

      // glass: four thin panes inset from the slab edge
      const glass = new THREE.Group();
      const paneH = FH - 0.24;
      const fMap = facadeMap.clone();
      const fLit = facadeLit.clone();
      [fMap, fLit].forEach(t => {
        t.needsUpdate = true;
        t.repeat.set(1, 1 / FLOORS);
        t.offset.set(0, f / FLOORS);
      });
      const floorGlass = glassMat.clone();
      floorGlass.map = fMap;
      floorGlass.emissiveMap = fLit;
      floorGlass.emissive = new THREE.Color(0xffffff);
      glassMats.push(floorGlass);
      [
        [W, 0, 0, D / 2],
        [W, Math.PI, 0, -D / 2],
        [D, Math.PI / 2, W / 2, 0],
        [D, -Math.PI / 2, -W / 2, 0]
      ].forEach(([len, rot, px, pz]) => {
        const pane = new THREE.Mesh(new THREE.PlaneGeometry(len, paneH), floorGlass);
        pane.rotation.y = rot;
        pane.position.set(px, paneH / 2 + 0.01, pz);
        glass.add(pane);
      });
      group.add(glass);

      floors.push({ group, cols, slab, glass, y0, lightSeed: Math.random(), glassT: 0 });
    }

    // roof parapet + rooftop unit
    const roof = new THREE.Group();
    const parapet = new THREE.Mesh(new THREE.BoxGeometry(W + 0.6, 0.45, D + 0.6), concrete);
    parapet.castShadow = true;
    roof.add(parapet);
    roof.add(new THREE.LineSegments(new THREE.EdgesGeometry(parapet.geometry), edgeMat));
    const unit = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 1.6), steel);
    unit.position.set(-1.6, 0.6, 0.4);
    unit.castShadow = true;
    roof.add(unit);
    roof.position.y = 0.35 + FLOORS * FH + 0.22;
    scene.add(roof);

    // ── Tower crane
    const crane = new THREE.Group();
    const craneMat = new THREE.MeshStandardMaterial({ color: accentC, roughness: 0.55, metalness: 0.35 });
    const mastH = FLOORS * FH + 4.5;
    const mastX = W / 2 + 2.6;
    const mastZ = -1.2;
    crane.position.set(mastX, 0, mastZ);
    scene.add(crane);

    // lattice mast: 4 chords + zig-zag bracing
    const chordGeo = new THREE.BoxGeometry(0.09, mastH, 0.09);
    [
      [-0.35, -0.35],
      [0.35, -0.35],
      [-0.35, 0.35],
      [0.35, 0.35]
    ].forEach(([x, z]) => {
      const c = new THREE.Mesh(chordGeo, craneMat);
      c.position.set(x, mastH / 2, z);
      c.castShadow = true;
      crane.add(c);
    });
    const brace = [];
    for (let y = 0; y < mastH - 0.7; y += 0.7) {
      const a = y,
        b = y + 0.7;
      brace.push(-0.35, a, 0.35, 0.35, b, 0.35, 0.35, a, -0.35, -0.35, b, -0.35);
      brace.push(-0.35, a, -0.35, -0.35, b, 0.35, 0.35, a, 0.35, 0.35, b, -0.35);
    }
    const braceGeo = new THREE.BufferGeometry();
    braceGeo.setAttribute('position', new THREE.Float32BufferAttribute(brace, 3));
    crane.add(new THREE.LineSegments(braceGeo, new THREE.LineBasicMaterial({ color: accentC })));

    // slewing unit: jib + counter-jib + cab
    const slew = new THREE.Group();
    slew.position.y = mastH;
    crane.add(slew);
    const jibLen = 13;
    const jib = new THREE.Mesh(new THREE.BoxGeometry(jibLen, 0.32, 0.32), craneMat);
    jib.position.x = -jibLen / 2 + 0.4;
    jib.castShadow = true;
    slew.add(jib);
    const cjib = new THREE.Mesh(new THREE.BoxGeometry(4, 0.3, 0.3), craneMat);
    cjib.position.x = 2.2;
    slew.add(cjib);
    const weight = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.9, 0.8), concrete);
    weight.position.set(3.6, -0.5, 0);
    weight.castShadow = true;
    slew.add(weight);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.8), steel);
    cab.position.set(0.2, -0.5, 0.6);
    slew.add(cab);
    const apex = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-jibLen + 0.6, 0.15, 0),
      new THREE.Vector3(0, 2.2, 0),
      new THREE.Vector3(4.1, 0.15, 0)
    ]);
    slew.add(new THREE.Line(apex, new THREE.LineBasicMaterial({ color: accentC })));
    const apexPole = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.2, 0.12), craneMat);
    apexPole.position.y = 1.1;
    slew.add(apexPole);
    // aviation light
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), new THREE.MeshBasicMaterial({ color: 0xff3b2f }));
    beacon.position.y = 2.3;
    slew.add(beacon);

    // trolley, cable, hook + the load it carries
    const trolley = new THREE.Group();
    slew.add(trolley);
    const cableGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, -1, 0)]);
    const cable = new THREE.Line(cableGeo, new THREE.LineBasicMaterial({ color: 0xbfbfbf }));
    trolley.add(cable);
    const hook = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.25), steel);
    trolley.add(hook);
    const load = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.18, 0.5), steel);
    load.castShadow = true;
    trolley.add(load);

    // ── Dust motes
    const dustN = mobile ? 120 : 260;
    const dustPos = new Float32Array(dustN * 3);
    for (let i = 0; i < dustN; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 40;
      dustPos[i * 3 + 1] = Math.random() * 18;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({ color: accentC, size: 0.06, transparent: true, opacity: 0.5, depthWrite: false })
    );
    scene.add(dust);

    // ── Sizing (shift the building right on wide screens, down on phones)
    let vw = 1,
      vh = 1;
    const resize = () => {
      vw = mount.clientWidth;
      vh = mount.clientHeight;
      renderer.setSize(vw, vh);
      camera.aspect = vw / vh;
      const wide = vw > 900;
      camera.setViewOffset(vw, vh, wide ? -vw * 0.2 : -vw * 0.12, wide ? 0 : -vh * 0.2, vw, vh);
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    // ── Mouse parallax
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = e => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    // ── Visibility: stop rendering off-screen
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(mount);

    // ── Loop
    let p = reduce ? 1 : 0;
    let raf = 0;
    const clock = new THREE.Clock();
    const PHASES = ['Surveying site', 'Pouring foundation', 'Raising steel', 'Placing slabs', 'Glazing façade', 'Topped out'];

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      const target = reduce ? 1 : clamp01(progressRef.current);
      p += (target - p) * (1 - Math.pow(0.0015, dt)); // framerate-independent smoothing

      // foundation 0 → 0.06
      const fnd = easeOut(seg(p, 0, 0.06));
      foundation.scale.set(1, Math.max(fnd, 0.001), 1);
      foundation.position.y = 0.175 * fnd;
      ghost.material.opacity = 0.5 * (1 - seg(p, 0.85, 1)) + 0.05;
      ghost.material.dashSize = 0.35;

      // floors build between 0.06 and 0.86
      const span = 0.8 / FLOORS;
      let activeFloor = 0;
      let hookTargetY = mastH - 2;
      let hookTargetX = -6;
      let loadVisible = false;
      floors.forEach((fl, f) => {
        const a = 0.06 + f * span;
        const colT = easeOut(seg(p, a, a + span * 0.55));
        const slabT = easeInOut(seg(p, a + span * 0.35, a + span * 1.05));
        const glassT = seg(p, a + span * 0.8, a + span * 1.9);

        fl.cols.visible = colT > 0.001;
        fl.cols.scale.y = Math.max(colT, 0.001);

        fl.slab.visible = slabT > 0.001;
        // slab swings down from above onto the columns
        fl.slab.position.y = FH + (1 - slabT) * 4.5;
        fl.slab.position.x = (1 - slabT) * -3.5;
        fl.slab.rotation.y = (1 - slabT) * 0.6;

        fl.glass.visible = glassT > 0;
        fl.glassT = glassT;

        if (p >= a) activeFloor = f;
        if (slabT > 0 && slabT < 1) {
          hookTargetY = fl.y0 + FH + (1 - slabT) * 4.5 + 0.6;
          hookTargetX = -mastX - (1 - slabT) * 3.5;
          loadVisible = false;
        } else if (colT > 0 && colT < 1) {
          hookTargetY = fl.y0 + FH + 3;
          hookTargetX = -mastX;
          loadVisible = true;
        }
      });

      // glass shared opacity + window lights at the very end
      const lightsOn = seg(p, 0.88, 1);
      floors.forEach((fl, f) => {
        const m = glassMats[f];
        m.opacity = 0.92 * (fl.glassT || 0);
        const target = 0.15 + lightsOn * 1.1 * (0.6 + fl.lightSeed * 0.4);
        m.emissiveIntensity += (target - m.emissiveIntensity) * 0.08;
      });

      const roofT = easeOut(seg(p, 0.86, 0.95));
      roof.visible = roofT > 0.001;
      roof.scale.set(1, Math.max(roofT, 0.001), 1);

      // crane: slew toward the work, idle sway when done
      const slewTarget = p > 0.95 ? Math.sin(t * 0.25) * 0.6 + 0.4 : 0;
      slew.rotation.y += (slewTarget - slew.rotation.y) * 0.04;
      const tx = Math.max(-jibLen + 1, Math.min(-1, hookTargetX));
      trolley.position.x += (tx - trolley.position.x) * 0.06;
      const drop = Math.max(0.8, mastH - hookTargetY);
      const cur = -cable.geometry.attributes.position.getY(1);
      const next = cur + (drop - cur) * 0.06;
      cable.geometry.attributes.position.setY(1, -next);
      cable.geometry.attributes.position.needsUpdate = true;
      hook.position.y = -next - 0.15;
      load.position.y = -next - 0.45;
      load.visible = loadVisible && p < 0.86;
      beacon.material.color.setHex(Math.sin(t * 4) > 0.4 ? 0xff3b2f : 0x401010);

      // dust drift
      dust.rotation.y = t * 0.02;
      dust.position.y = Math.sin(t * 0.3) * 0.2;

      // camera orbit — rises and swings around as the tower goes up
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      const ang = -0.75 + p * 0.9 + mouse.x * 0.12 + (reduce ? 0 : Math.sin(t * 0.1) * 0.03);
      const radius = (mobile ? 44 : 36) + p * 4;
      const camY = 6 + p * 7 - mouse.y * 1.2;
      camera.position.set(Math.sin(ang) * radius, camY, Math.cos(ang) * radius);
      camera.lookAt(1.5, 4.2 + p * 3, 0);

      renderer.render(scene, camera);

      // HUD
      if (hudRef?.current) {
        const pct = Math.round(p * 100);
        const lvl = p < 0.06 ? 0 : Math.min(FLOORS, activeFloor + 1);
        const phase =
          p < 0.02 ? PHASES[0] : p < 0.06 ? PHASES[1] : p < 0.86 ? (lvl % 2 ? PHASES[2] : PHASES[3]) : p < 0.97 ? PHASES[4] : PHASES[5];
        const h = hudRef.current;
        h.querySelector('[data-hud=pct]').textContent = String(pct).padStart(3, '0');
        h.querySelector('[data-hud=lvl]').textContent = String(lvl).padStart(2, '0');
        h.querySelector('[data-hud=phase]').textContent = phase;
        h.querySelector('[data-hud=bar]').style.transform = `scaleX(${p})`;
        h.querySelector('[data-hud=el]').textContent = `+${Math.round(lvl * 12.5)
          .toString()
          .padStart(3, '0')}'`;
      }
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      scene.traverse(o => {
        o.geometry?.dispose();
        const m = o.material;
        if (Array.isArray(m)) m.forEach(x => x.dispose());
        else m?.dispose();
      });
      facadeMap.dispose();
      facadeLit.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [accent, bg, mobile, progressRef, hudRef]);

  return <div ref={mountRef} className="build-scene" aria-hidden="true" />;
}
