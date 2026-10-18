import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/*
  A two-storey brick house that builds itself as `progress` goes 0 → 1:
  setting out → foundations → brickwork (with scaffold) → joists → roof trusses + gables
  → roof tiles → windows & doors → scaffold struck, site cleared, lights on.
  Walls and roof are revealed with clipping planes so the brick texture never stretches.
*/

const W = 10; // footprint x (m)
const D = 8; // footprint z (m)
const T = 0.3; // wall thickness
const BASE = 0.3; // top of foundation slab
const FIRST = 3.0; // first-floor level
const EAVES = 5.95;
const RISE = 3.4;
const RIDGE = EAVES + RISE;
const OVER = 0.35; // roof overhang
const CHIMNEY_TOP = RIDGE + 0.95;

const clamp01 = v => Math.min(1, Math.max(0, v));
const seg = (p, a, b) => clamp01((p - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

const STAGES = [
  [0, 'Setting out'],
  [0.05, 'Foundations'],
  [0.12, 'Ground-floor brickwork'],
  [0.36, 'First-floor joists'],
  [0.42, 'First-floor brickwork'],
  [0.64, 'Roof trusses & gables'],
  [0.78, 'Tiling the roof'],
  [0.86, 'Windows & doors'],
  [0.92, 'Handover']
];

// Project UVs in metres so one repeating texture tiles evenly across every wall.
function projectUV(mesh, tileW, tileH, local = false) {
  mesh.updateMatrixWorld(true);
  const g = mesh.geometry;
  const pos = g.attributes.position;
  const nor = g.attributes.normal;
  const uv = new Float32Array(pos.count * 2);
  const v = new THREE.Vector3();
  const n = new THREE.Vector3();
  const nm = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    n.fromBufferAttribute(nor, i);
    if (!local) {
      v.applyMatrix4(mesh.matrixWorld);
      n.applyMatrix3(nm).normalize();
    }
    const ax = Math.abs(n.x),
      ay = Math.abs(n.y),
      az = Math.abs(n.z);
    let u, w;
    if (ax >= ay && ax >= az) [u, w] = [v.z, v.y];
    else if (az >= ay) [u, w] = [v.x, v.y];
    else [u, w] = [v.x, v.z];
    uv[i * 2] = u / tileW;
    uv[i * 2 + 1] = w / tileH;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

function canvasTexture(w, h, draw, srgb = true) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

// 4 bricks wide × 4 courses = 0.9 m × 0.3 m
const brickTexture = () =>
  canvasTexture(256, 88, (g, w) => {
    g.fillStyle = '#cdbfac';
    g.fillRect(0, 0, w, 88);
    const reds = ['#9e4b33', '#a8553b', '#b5603f', '#8f4430', '#ab5a43', '#bf6c4b', '#96503a'];
    for (let r = 0; r < 4; r++) {
      const off = r % 2 ? 32 : 0;
      for (let c = -1; c < 5; c++) {
        g.fillStyle = reds[Math.floor(Math.random() * reds.length)];
        g.fillRect(c * 64 + off + 2, r * 22 + 2, 60, 18);
        g.fillStyle = 'rgba(0,0,0,0.08)';
        g.fillRect(c * 64 + off + 2, r * 22 + 16, 60, 4);
      }
    }
  });

// Concrete interlocking tiles, ~0.33 m courses
const tileTexture = () =>
  canvasTexture(256, 128, (g, w) => {
    for (let r = 0; r < 4; r++) {
      const off = r % 2 ? 16 : 0;
      for (let c = -1; c < 9; c++) {
        const s = 52 + Math.random() * 14;
        g.fillStyle = `rgb(${s},${s + 2},${s + 6})`;
        g.fillRect(c * 32 + off, r * 32, 31, 32);
        g.fillStyle = 'rgba(0,0,0,0.35)';
        g.fillRect(c * 32 + off, r * 32 + 27, 31, 5);
        g.fillStyle = 'rgba(255,255,255,0.05)';
        g.fillRect(c * 32 + off, r * 32, 31, 3);
      }
    }
  });

// White uPVC window with glazing bars; `bars` = number of vertical dividers
const windowTextures = bars => {
  const map = canvasTexture(256, 256, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, '#5d6f78');
    grd.addColorStop(0.45, '#2c3a42');
    grd.addColorStop(1, '#1d272d');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.08)';
    g.beginPath();
    g.moveTo(0, h * 0.25);
    g.lineTo(w * 0.35, 0);
    g.lineTo(w * 0.55, 0);
    g.lineTo(0, h * 0.45);
    g.fill();
    g.fillStyle = '#f1f0ec';
    g.fillRect(0, 0, w, 16);
    g.fillRect(0, h - 16, w, 16);
    g.fillRect(0, 0, 16, h);
    g.fillRect(w - 16, 0, 16, h);
    for (let i = 1; i <= bars; i++) g.fillRect((w / (bars + 1)) * i - 6, 0, 12, h);
  });
  const lit = canvasTexture(256, 256, (g, w, h) => {
    g.fillStyle = '#000';
    g.fillRect(0, 0, w, h);
    const grd = g.createRadialGradient(w / 2, h * 0.7, 10, w / 2, h / 2, w * 0.7);
    grd.addColorStop(0, '#ffd9a0');
    grd.addColorStop(1, '#f2a44e');
    g.fillStyle = grd;
    g.fillRect(16, 16, w - 32, h - 32);
    g.fillStyle = '#000';
    for (let i = 1; i <= bars; i++) g.fillRect((w / (bars + 1)) * i - 6, 0, 12, h);
  });
  return [map, lit];
};

const doorTexture = () =>
  canvasTexture(128, 256, (g, w, h) => {
    g.fillStyle = '#f1f0ec';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#26352f';
    g.fillRect(10, 10, w - 20, h - 10);
    g.strokeStyle = 'rgba(255,255,255,0.12)';
    g.lineWidth = 3;
    g.strokeRect(24, 70, w - 48, 70);
    g.strokeRect(24, 156, w - 48, 80);
    g.fillStyle = '#9fb3bd';
    g.fillRect(30, 24, w - 60, 34);
    g.fillStyle = '#c9a267';
    g.fillRect(w - 34, 140, 8, 26);
  });

export default function HouseScene({ progressRef, scrollRef, hudRef, accent = '#DE8460', bg = '#17211E', mobile = false, metric = true }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const accentC = new THREE.Color(accent);
    const bgC = new THREE.Color(bg);
    const disposables = [];
    const keep = x => (disposables.push(x), x);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 1.75));
    renderer.setClearColor(bgC, 1);
    renderer.localClippingEnabled = true;
    renderer.shadowMap.enabled = !mobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(bgC, 30, 70);
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);

    // ── Lights
    scene.add(new THREE.HemisphereLight(0xb7c4d0, 0x221a14, 0.6));
    const sun = new THREE.DirectionalLight(0xffe0bc, 2.2);
    sun.position.set(12, 18, 14);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 60 });
    sun.shadow.bias = -0.0006;
    scene.add(sun);
    const rim = new THREE.DirectionalLight(accentC, 0.8);
    rim.position.set(-14, 7, -10);
    scene.add(rim);

    // ── Clipping planes: keep everything below each height
    const brickClip = new THREE.Plane(new THREE.Vector3(0, -1, 0), BASE);
    const roofClip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    const scafClip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);

    // ── Textures & materials
    const brickTex = keep(brickTexture());
    const tileTex = keep(tileTexture());
    const [winMap, winLit] = windowTextures(1).map(keep);
    const [bifMap, bifLit] = windowTextures(3).map(keep);
    const doorTex = keep(doorTexture());

    const brickMat = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.95, clippingPlanes: [brickClip], clipShadows: true });
    const concrete = new THREE.MeshStandardMaterial({ color: 0x8e8a84, roughness: 0.95 });
    const timber = new THREE.MeshStandardMaterial({ color: 0xc9a77a, roughness: 0.85 });
    const roofMat = new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.8, clippingPlanes: [roofClip], clipShadows: true });
    const white = new THREE.MeshStandardMaterial({ color: 0xf1f0ec, roughness: 0.6, clippingPlanes: [roofClip] });
    const black = new THREE.MeshStandardMaterial({ color: 0x1d1f21, roughness: 0.5, clippingPlanes: [roofClip] });
    const opening = new THREE.MeshBasicMaterial({ color: 0x121816, clippingPlanes: [brickClip] });
    const galv = new THREE.LineBasicMaterial({ color: 0xa9b1b8, clippingPlanes: [scafClip] });
    const boardMat = new THREE.MeshStandardMaterial({ color: 0xb08d5a, roughness: 0.9, clippingPlanes: [scafClip], clipShadows: true });

    // ── Ground, grid, setting-out lines
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(60, 64),
      new THREE.MeshStandardMaterial({ color: bgC.clone().offsetHSL(0, 0, 0.03), roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    const grid = new THREE.GridHelper(80, 80, accentC, bgC.clone().offsetHSL(0, -0.05, 0.08));
    grid.material.transparent = true;
    grid.material.opacity = 0.2;
    grid.position.y = 0.003;
    scene.add(grid);

    const setOut = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.PlaneGeometry(W + 0.4, D + 0.4)),
      new THREE.LineDashedMaterial({ color: accentC, dashSize: 0.3, gapSize: 0.2, transparent: true })
    );
    setOut.computeLineDistances();
    setOut.rotation.x = -Math.PI / 2;
    setOut.position.y = 0.02;
    scene.add(setOut);
    // corner profile boards
    const profiles = new THREE.Group();
    [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1]
    ].forEach(([sx, sz]) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.04), timber);
      b.position.set(sx * (W / 2 + 0.9), 0.5, sz * (D / 2 + 0.9));
      b.rotation.y = sx * sz > 0 ? Math.PI / 4 : -Math.PI / 4;
      profiles.add(b);
    });
    scene.add(profiles);

    // Ghost outline of the finished house (the "plan")
    const gp = [];
    const hw = W / 2,
      hd = D / 2;
    const box = [
      [-hw, BASE, -hd],
      [hw, BASE, -hd],
      [hw, BASE, hd],
      [-hw, BASE, hd]
    ];
    box.forEach((a, i) => {
      const b = box[(i + 1) % 4];
      gp.push(...a, ...b, a[0], EAVES, a[2], b[0], EAVES, b[2], a[0], BASE, a[2], a[0], EAVES, a[2]);
    });
    [-hw, hw].forEach(x => gp.push(x, EAVES, -hd, x, RIDGE, 0, x, RIDGE, 0, x, EAVES, hd));
    gp.push(-hw, RIDGE, 0, hw, RIDGE, 0);
    const ghostGeo = new THREE.BufferGeometry();
    ghostGeo.setAttribute('position', new THREE.Float32BufferAttribute(gp, 3));
    const ghost = new THREE.LineSegments(ghostGeo, new THREE.LineDashedMaterial({ color: accentC, dashSize: 0.3, gapSize: 0.22, transparent: true, opacity: 0.45 }));
    ghost.computeLineDistances();
    scene.add(ghost);

    // ── Foundation slab
    const foundation = new THREE.Mesh(new THREE.BoxGeometry(W + 0.4, BASE, D + 0.4), concrete);
    foundation.geometry.translate(0, BASE / 2, 0);
    foundation.castShadow = foundation.receiveShadow = true;
    scene.add(foundation);

    // ── Brick walls (one box per side, revealed bottom-up by brickClip)
    const wallH = EAVES - BASE;
    const walls = [
      [W, T, 0, hd - T / 2],
      [W, T, 0, -hd + T / 2],
      [T, D - 2 * T, hw - T / 2, 0],
      [T, D - 2 * T, -hw + T / 2, 0]
    ].map(([sx, sz, x, z]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(sx, wallH, sz), brickMat);
      m.position.set(x, BASE + wallH / 2, z);
      m.castShadow = m.receiveShadow = true;
      projectUV(m, 0.9, 0.3);
      scene.add(m);
      return m;
    });

    // Gable ends
    const gableShape = new THREE.Shape([new THREE.Vector2(-hd, 0), new THREE.Vector2(hd, 0), new THREE.Vector2(0, RISE)]);
    [-1, 1].forEach(sx => {
      const geo = new THREE.ExtrudeGeometry(gableShape, { depth: T, bevelEnabled: false });
      geo.translate(0, 0, -T / 2);
      geo.rotateY(Math.PI / 2);
      const m = new THREE.Mesh(geo, brickMat);
      m.position.set(sx * (hw - T / 2), EAVES, 0);
      m.castShadow = true;
      projectUV(m, 0.9, 0.3);
      scene.add(m);
    });

    // Chimney with two pots
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.95, CHIMNEY_TOP - RIDGE + 1.6, 0.7), brickMat);
    chimney.position.set(hw - 1.5, RIDGE - 1.6 + (CHIMNEY_TOP - RIDGE + 1.6) / 2, 0);
    chimney.castShadow = true;
    projectUV(chimney, 0.9, 0.3);
    scene.add(chimney);
    const potMat = new THREE.MeshStandardMaterial({ color: 0xa4593b, roughness: 0.9, clippingPlanes: [roofClip] });
    [-0.2, 0.2].forEach(dx => {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.4, 12), potMat);
      pot.position.set(hw - 1.5 + dx, CHIMNEY_TOP + 0.2, 0);
      scene.add(pot);
    });

    // ── First-floor joists
    const joists = new THREE.Group();
    joists.position.y = FIRST;
    for (let x = -hw + 0.5; x <= hw - 0.4; x += 0.4) {
      const j = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, D - 2 * T), timber);
      j.position.set(x, 0.11, 0);
      j.castShadow = true;
      joists.add(j);
    }
    scene.add(joists);

    // ── Roof trusses (instanced)
    const span = D / 2 + OVER;
    const tShape = new THREE.Shape([new THREE.Vector2(-span, -OVER * (RISE / hd)), new THREE.Vector2(span, -OVER * (RISE / hd)), new THREE.Vector2(0, RISE)]);
    tShape.holes.push(new THREE.Path([new THREE.Vector2(-hd + 0.55, 0.12), new THREE.Vector2(0, RISE - 0.42), new THREE.Vector2(hd - 0.55, 0.12)]));
    const trussGeo = new THREE.ExtrudeGeometry(tShape, { depth: 0.05, bevelEnabled: false });
    trussGeo.rotateY(Math.PI / 2);
    const trussXs = [];
    for (let x = -hw + 0.4; x <= hw - 0.35; x += 0.6) trussXs.push(x);
    const trusses = new THREE.InstancedMesh(trussGeo, timber, trussXs.length);
    trusses.castShadow = true;
    trusses.position.y = EAVES;
    scene.add(trusses);
    const dummy = new THREE.Object3D();

    // ── Roof slopes + fascia + gutters
    const slope = Math.atan(RISE / hd);
    const slopeLen = span / Math.cos(slope) + 0.1;
    const roofGroup = new THREE.Group();
    [1, -1].forEach(side => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(W + 0.6, 0.12, slopeLen), roofMat);
      projectUV(m, 1.0, 0.66, true);
      m.rotation.x = side * slope;
      const eY = EAVES - OVER * Math.tan(slope);
      m.position.set(0, (eY + RIDGE) / 2 + 0.08, (side * span) / 2);
      m.castShadow = m.receiveShadow = true;
      roofGroup.add(m);
      const fascia = new THREE.Mesh(new THREE.BoxGeometry(W + 0.7, 0.22, 0.04), white);
      fascia.position.set(0, eY - 0.02, side * (span + 0.02));
      roofGroup.add(fascia);
      const gutter = new THREE.Mesh(new THREE.BoxGeometry(W + 0.7, 0.1, 0.12), black);
      gutter.position.set(0, eY - 0.12, side * (span + 0.1));
      roofGroup.add(gutter);
    });
    const ridgeTiles = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, W + 0.6, 10, 1, false, 0, Math.PI), roofMat);
    ridgeTiles.rotation.z = Math.PI / 2;
    ridgeTiles.position.y = RIDGE + 0.12;
    roofGroup.add(ridgeTiles);
    scene.add(roofGroup);

    // ── Openings (dark reveals in the brickwork) + windows/doors that fade in
    const glazing = [];
    const addOpening = (face, a, y, w, h, kind = 'window') => {
      const g = new THREE.Group();
      const rot = { front: 0, back: Math.PI, right: Math.PI / 2, left: -Math.PI / 2 }[face];
      g.rotation.y = rot;
      const out = (face === 'front' || face === 'back' ? hd : hw) + 0.006;
      const nx = Math.sin(rot),
        nz = Math.cos(rot);
      // a = world x on the front/back walls, world z on the side walls
      const onFrontBack = face === 'front' || face === 'back';
      g.position.set(nx * out + (onFrontBack ? a : 0), y + h / 2, nz * out + (onFrontBack ? 0 : a));
      const hole = new THREE.Mesh(new THREE.PlaneGeometry(w, h), opening);
      g.add(hole);
      const [map, lit] = kind === 'bifold' ? [bifMap, bifLit] : kind === 'door' ? [doorTex, null] : [winMap, winLit];
      const mat = new THREE.MeshStandardMaterial({
        map,
        emissiveMap: lit || null,
        emissive: new THREE.Color(lit ? 0xffffff : 0x000000),
        emissiveIntensity: 0,
        roughness: 0.25,
        metalness: 0.1,
        transparent: true,
        opacity: 0
      });
      const pane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      pane.position.z = 0.015;
      g.add(pane);
      // stone sill
      if (kind === 'window') {
        const sill = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.07, 0.14), new THREE.MeshStandardMaterial({ color: 0xd8d2c6, roughness: 0.9 }));
        sill.position.set(0, -h / 2 - 0.035, 0.06);
        sill.visible = false;
        g.add(sill);
        glazing.push({ mat, sill, lit: !!lit, seed: Math.random(), y });
      } else glazing.push({ mat, lit: !!lit, seed: Math.random(), y });
      scene.add(g);
    };
    // front
    addOpening('front', -3, BASE + 0.9, 1.4, 1.25);
    addOpening('front', 3, BASE + 0.9, 1.4, 1.25);
    addOpening('front', 0, BASE, 1.0, 2.1, 'door');
    addOpening('front', -3, FIRST + 1.0, 1.4, 1.2);
    addOpening('front', 0, FIRST + 1.25, 0.8, 0.95);
    addOpening('front', 3, FIRST + 1.0, 1.4, 1.2);
    // back
    addOpening('back', 1.6, BASE, 3.6, 2.15, 'bifold');
    addOpening('back', -3, BASE + 0.9, 1.4, 1.25);
    addOpening('back', -3, FIRST + 1.0, 1.4, 1.2);
    addOpening('back', 1.0, FIRST + 1.0, 1.4, 1.2);
    addOpening('back', 3.6, FIRST + 1.2, 0.8, 0.95);
    // sides
    addOpening('right', 0, FIRST + 1.1, 0.8, 1.0);
    addOpening('left', 1.2, BASE + 0.9, 0.9, 1.1);
    // porch canopy over the front door
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.7), black.clone());
    canopy.material.clippingPlanes = [brickClip];
    canopy.position.set(0, BASE + 2.4, hd + 0.35);
    canopy.castShadow = true;
    scene.add(canopy);

    // ── Scaffold along front and back (tube lines + timber boards), revealed by scafClip
    const tubes = [];
    const scafTop = EAVES + 1.3;
    const xs = Array.from({ length: 6 }, (_, i) => -hw - 0.6 + (i * (W + 1.2)) / 5);
    [1, -1].forEach(side => {
      const zi = side * (hd + 0.45),
        zo = side * (hd + 1.45);
      xs.forEach(x => tubes.push(x, 0, zi, x, scafTop, zi, x, 0, zo, x, scafTop, zo));
      for (let y = 2; y <= scafTop; y += 2) {
        tubes.push(xs[0], y, zi, xs[xs.length - 1], y, zi, xs[0], y, zo, xs[xs.length - 1], y, zo);
        tubes.push(xs[0], y + 1, zo, xs[xs.length - 1], y + 1, zo); // guard rail
        xs.forEach(x => tubes.push(x, y, zi, x, y, zo));
      }
      // diagonal braces
      for (let i = 0; i < xs.length - 1; i += 2) tubes.push(xs[i], 0, zo, xs[i + 1], scafTop - 1, zo);
    });
    const tubeGeo = new THREE.BufferGeometry();
    tubeGeo.setAttribute('position', new THREE.Float32BufferAttribute(tubes, 3));
    scene.add(new THREE.LineSegments(tubeGeo, galv));
    [1, -1].forEach(side => {
      for (let y = 2; y <= scafTop; y += 2) {
        const b = new THREE.Mesh(new THREE.BoxGeometry(xs[xs.length - 1] - xs[0], 0.05, 0.95), boardMat);
        b.position.set((xs[0] + xs[xs.length - 1]) / 2, y + 0.03, side * (hd + 0.95));
        b.castShadow = b.receiveShadow = true;
        scene.add(b);
      }
    });

    // ── Site kit: a yellow skip and pallets of bricks (cleared at handover)
    const site = new THREE.Group();
    scene.add(site);
    const skipShape = new THREE.Shape([new THREE.Vector2(-1.3, 0), new THREE.Vector2(1.3, 0), new THREE.Vector2(1.8, 1.1), new THREE.Vector2(-1.8, 1.1)]);
    const skipGeo = new THREE.ExtrudeGeometry(skipShape, { depth: 1.7, bevelEnabled: false });
    skipGeo.translate(0, 0, -0.85);
    const skip = new THREE.Mesh(skipGeo, new THREE.MeshStandardMaterial({ color: 0xe0ac1f, roughness: 0.6, metalness: 0.2 }));
    skip.position.set(-hw - 3.4, 0, hd + 3.2);
    skip.rotation.y = 0.15;
    skip.castShadow = true;
    site.add(skip);
    const rubble = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.3, 1.5), new THREE.MeshStandardMaterial({ color: 0x6d6258, roughness: 1 }));
    rubble.position.set(-hw - 3.4, 0.95, hd + 3.2);
    rubble.rotation.y = 0.15;
    site.add(rubble);
    const stackMat = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.95 });
    const stacks = [];
    [
      [hw + 2.6, hd + 2.2],
      [hw + 4.0, hd + 2.0]
    ].forEach(([x, z]) => {
      const pallet = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.14, 1.1), timber);
      pallet.position.set(x, 0.07, z);
      site.add(pallet);
      const st = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.85, 1.0), stackMat);
      st.geometry.translate(0, 0.425, 0);
      st.position.set(x, 0.14, z);
      st.castShadow = true;
      projectUV(st, 0.9, 0.3);
      site.add(st);
      stacks.push(st);
    });

    // ── Landscaping (appears at handover)
    const garden = new THREE.Group();
    scene.add(garden);
    const lawnMat = new THREE.MeshStandardMaterial({ color: 0x3a4f33, roughness: 1, transparent: true, opacity: 0 });
    const lawn = new THREE.Mesh(new THREE.PlaneGeometry(W + 8, 7), lawnMat);
    lawn.rotation.x = -Math.PI / 2;
    lawn.position.set(-1, 0.012, hd + 3.8);
    lawn.receiveShadow = true;
    garden.add(lawn);
    const pathMat = new THREE.MeshStandardMaterial({ color: 0xb9b2a6, roughness: 1, transparent: true, opacity: 0 });
    const path = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 7), pathMat);
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0.02, hd + 3.8);
    garden.add(path);
    const drive = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 7.5), pathMat);
    drive.rotation.x = -Math.PI / 2;
    drive.position.set(hw + 2.6, 0.016, hd + 3.4);
    garden.add(drive);
    const hedges = [];
    const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x2f4329, roughness: 1 });
    [
      [-4.6, 7.4, 6.4],
      [3.3, 7.4, 3.2]
    ].forEach(([x, len, z]) => {
      const h = new THREE.Mesh(new THREE.BoxGeometry(len, 0.9, 0.6), hedgeMat);
      h.geometry.translate(0, 0.45, 0);
      h.position.set(x, 0, hd + z);
      h.castShadow = true;
      garden.add(h);
      hedges.push(h);
    });
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.2, 8), new THREE.MeshStandardMaterial({ color: 0x4a3626 }));
    trunk.position.y = 1.1;
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 1), new THREE.MeshStandardMaterial({ color: 0x3d5a35, roughness: 1, flatShading: true }));
    crown.position.y = 3.0;
    trunk.castShadow = crown.castShadow = true;
    tree.add(trunk, crown);
    tree.position.set(-hw - 2.8, 0, hd + 4.5);
    garden.add(tree);

    // ── Dust motes
    const dustN = mobile ? 100 : 220;
    const dustPos = new Float32Array(dustN * 3);
    for (let i = 0; i < dustN; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 36;
      dustPos[i * 3 + 1] = Math.random() * 14;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 36;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: accentC, size: 0.05, transparent: true, opacity: 0.45, depthWrite: false }));
    scene.add(dust);

    // ── Sizing: shift the house right on wide screens, down on phones
    const resize = () => {
      const vw = mount.clientWidth,
        vh = mount.clientHeight;
      renderer.setSize(vw, vh);
      camera.aspect = vw / vh;
      const wide = vw > 900;
      camera.setViewOffset(vw, vh, wide ? -vw * 0.22 : vw * 0.05, wide ? vh * 0.02 : -vh * 0.18, vw, vh);
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = e => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(mount);

    // ── Loop
    let p = reduce ? 1 : 0;
    let raf = 0;
    let lastStage = -1;
    const clock = new THREE.Clock();

    const brickHeight = q => {
      if (q < 0.12) return BASE;
      if (q < 0.36) return lerp(BASE, FIRST, easeInOut(seg(q, 0.12, 0.36)));
      if (q < 0.42) return FIRST;
      if (q < 0.64) return lerp(FIRST, EAVES, easeInOut(seg(q, 0.42, 0.64)));
      if (q < 0.7) return EAVES;
      return lerp(EAVES, CHIMNEY_TOP + 0.05, easeInOut(seg(q, 0.7, 0.8)));
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      const target = reduce ? 1 : clamp01(progressRef.current);
      p += (target - p) * (1 - Math.pow(0.002, dt));

      // setting out + plan ghost
      setOut.material.opacity = 1 - seg(p, 0.12, 0.22);
      setOut.visible = setOut.material.opacity > 0.01;
      profiles.visible = p < 0.2;
      ghost.material.opacity = 0.45 * (1 - seg(p, 0.8, 0.94));
      ghost.visible = ghost.material.opacity > 0.01;

      // foundation
      const f = easeOut(seg(p, 0.05, 0.12));
      foundation.visible = f > 0.001;
      foundation.scale.y = Math.max(f, 0.001);

      // brickwork, gables, chimney
      const bh = brickHeight(p);
      brickClip.constant = bh;

      // joists slide in
      const j = easeOut(seg(p, 0.36, 0.42));
      joists.visible = j > 0.001;
      joists.scale.set(1, 1, Math.max(j, 0.001));

      // trusses go up one by one
      trussXs.forEach((x, i) => {
        const a = 0.64 + (i / trussXs.length) * 0.08;
        const s = easeOut(seg(p, a, a + 0.025));
        dummy.position.set(x, 0, 0);
        dummy.scale.set(1, Math.max(s, 0.0001), 1);
        dummy.updateMatrix();
        trusses.setMatrixAt(i, dummy.matrix);
      });
      trusses.instanceMatrix.needsUpdate = true;
      trusses.visible = p > 0.64;

      // roof tiles from eaves to ridge
      const r = seg(p, 0.78, 0.88);
      roofClip.constant = r <= 0 ? 0 : lerp(EAVES - 0.5, CHIMNEY_TOP + 0.6, easeInOut(r));

      // windows & doors
      const g = seg(p, 0.86, 0.93);
      const lights = seg(p, 0.94, 1);
      glazing.forEach(o => {
        o.mat.opacity = g;
        if (o.sill) o.sill.visible = g > 0.05;
        if (o.lit) {
          const on = lights > o.seed * 0.9 ? 0.9 + o.seed * 0.5 : 0.04;
          o.mat.emissiveIntensity += (on * lights - o.mat.emissiveIntensity) * 0.08;
        }
      });

      // scaffold: rises a lift ahead of the brickwork, struck at handover
      const struck = seg(p, 0.92, 0.97);
      const up = p < 0.12 ? 0 : Math.min(bh + 1.4, scafTop + 0.1);
      scafClip.constant = lerp(up, 0, struck);

      // site kit + garden
      const clear = 1 - easeOut(seg(p, 0.92, 0.96));
      site.visible = clear > 0.01;
      site.scale.setScalar(Math.max(clear, 0.001));
      stacks.forEach(st => (st.scale.y = 1 - 0.75 * seg(p, 0.12, 0.8)));
      const gd = easeOut(seg(p, 0.93, 1));
      lawnMat.opacity = gd;
      pathMat.opacity = gd;
      hedges.forEach(h => (h.scale.y = Math.max(gd, 0.001)));
      tree.scale.setScalar(Math.max(gd, 0.001));
      garden.visible = gd > 0.001;

      dust.rotation.y = t * 0.02;

      // camera: swings from front-left to front-right as the house goes up
      const sc = scrollRef?.current || 0;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      const ang = -0.7 + p * 0.85 + sc * 0.5 + mouse.x * 0.12 + (reduce ? 0 : Math.sin(t * 0.12) * 0.03);
      const radius = (mobile ? 44 : 35) + p * 2 + sc * 5;
      const camY = 6 + p * 2.5 + sc * 4 - mouse.y * 1.0;
      camera.position.set(Math.sin(ang) * radius, camY, Math.cos(ang) * radius);
      camera.lookAt(0.6, 3.9 + p * 0.6, 0);

      renderer.render(scene, camera);

      // HUD
      if (hudRef?.current) {
        const h = hudRef.current;
        let stage = 0;
        STAGES.forEach(([a], i) => p >= a && (stage = i));
        h.querySelector('[data-hud=pct]').textContent = String(Math.round(p * 100)).padStart(3, '0');
        h.querySelector('[data-hud=bar]').style.transform = `scaleX(${p})`;
        const top = Math.max(p < 0.12 ? BASE * f : Math.min(bh, CHIMNEY_TOP), r > 0 ? RIDGE : 0) - 0;
        const height = metric ? `+${top.toFixed(1)} m` : `+${Math.round(top * 3.281)}'`;
        h.querySelector('[data-hud=right]').innerHTML = `Height <b>${height}</b>`;
        if (stage !== lastStage) {
          lastStage = stage;
          h.querySelector('[data-hud=phase]').textContent = STAGES[stage][1];
          h.querySelector('[data-hud=left]').innerHTML = `Stage <b>${String(stage + 1).padStart(2, '0')}</b>/${String(STAGES.length).padStart(2, '0')}`;
        }
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
      disposables.forEach(d => d.dispose());
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [accent, bg, mobile, metric, progressRef, scrollRef, hudRef]);

  return <div ref={mountRef} className="build-scene" aria-hidden="true" />;
}
