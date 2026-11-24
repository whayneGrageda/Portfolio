import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type CameraPose = {
  x: number;
  y: number;
  z: number;
  tx: number;
  ty: number;
  tz: number;
  fov: number;
  roll: number;
};

const CAMERA = {
  start: { x: 0, y: 0.1, z: 11, tx: 0, ty: 0, tz: 0, fov: 50, roll: 0 },
  approach: { x: -0.35, y: 0.2, z: 8.2, tx: 0, ty: 0, tz: 0, fov: 46, roll: 0 },
  orbit: { x: 2.4, y: 1.1, z: 5.6, tx: 0, ty: 0, tz: 0, fov: 42, roll: 0.012 },
  detail: { x: 0.3, y: 0.2, z: 1.8, tx: 0, ty: 0, tz: 0, fov: 38, roll: 0.006 },
  settle: { x: 0.3, y: 0.2, z: 1.8, tx: 0, ty: 0, tz: 0, fov: 38, roll: 0.006 },
} satisfies Record<string, CameraPose>;

type Quality = 'high' | 'medium' | 'low';

function getQuality(): Quality {
  const cores = navigator.hardwareConcurrency || 2;
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (mobile || cores <= 2) return 'low';
  if (cores <= 4) return 'medium';
  return 'high';
}

const COUNTS: Record<Quality, { arms: number; bulge: number; haze: number }> = {
  high: { arms: 12000, bulge: 4000, haze: 3000 },
  medium: { arms: 7000, bulge: 2500, haze: 1500 },
  low: { arms: 3500, bulge: 1200, haze: 800 },
};

const GALAXY = {
  arms: 4,
  armSpread: 0.35,
  armCurve: 2.8,
  radius: 4.5,
  bulgeRadius: 1,
  thickness: 0.15,
  hazeThickness: 0.3,
};

let context: gsap.Context | null = null;
let sectionEl: HTMLElement | null = null;
let mountEl: HTMLElement | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let galaxyGroup: THREE.Group | null = null;
let dustTexture: THREE.Texture | null = null;
let glowTexture: THREE.Texture | null = null;
let flareTexture: THREE.Texture | null = null;
let labelTextures: THREE.Texture[] = [];
let twinkles: Array<{ material: THREE.SpriteMaterial; base: number; phase: number }> = [];
let rafId: number | null = null;
let resizeHandler: (() => void) | null = null;
let pointerHandler: ((event: PointerEvent) => void) | null = null;
let observer: IntersectionObserver | null = null;
let visible = false;

export function renderModelSection(): string {
  return `
    <section class="model-stage" aria-label="Spiral galaxy">
      <div class="model-canvas" aria-hidden="true"></div>
      <div class="model-inner">
        <div class="model-copy">
          <p class="model-kicker">03 — Built to hold</p>
          <h2 class="model-title" aria-label="Endurance is engineered, not promised.">
            <span class="model-line">Endurance is engineered,</span>
            <span class="model-line">not promised.</span>
          </h2>
        </div>
      </div>
    </section>
  `;
}

function createRadialTexture(stops: ReadonlyArray<readonly [number, string]>, size: number): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createStarTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const center = size / 2;

  const glow = ctx.createRadialGradient(center, center, 0, center, center, center);
  glow.addColorStop(0, 'rgba(255,255,255,1)');
  glow.addColorStop(0.12, 'rgba(255,246,230,0.9)');
  glow.addColorStop(0.36, 'rgba(255,214,165,0.24)');
  glow.addColorStop(1, 'rgba(255,214,165,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  ctx.globalCompositeOperation = 'lighter';
  const flare = ctx.createLinearGradient(0, center, size, center);
  flare.addColorStop(0, 'rgba(255,255,255,0)');
  flare.addColorStop(0.5, 'rgba(255,244,225,0.5)');
  flare.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = flare;
  ctx.fillRect(0, center - 1, size, 2);
  ctx.save();
  ctx.translate(center, center);
  ctx.rotate(Math.PI / 2);
  ctx.translate(-center, -center);
  ctx.fillRect(0, center - 1, size, 1);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createLabelTexture(text: string): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '500 26px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 7;
  ctx.fillStyle = 'rgba(242,238,230,0.96)';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createAnchorStars(map: THREE.Texture) {
  const group = new THREE.Group();
  const random = seededRandom(4816);
  const stars: Array<{ material: THREE.SpriteMaterial; base: number; phase: number }> = [];
  const cool = new THREE.Color(0xbcd4ff);
  const warm = new THREE.Color(0xffd2a1);

  for (let i = 0; i < 72; i += 1) {
    const depth = i % 3;
    const x = (random() - 0.5) * 19;
    const y = (random() - 0.5) * 12;
    const z = depth === 0 ? 2 + random() * 4.5 : depth === 1 ? -1 - random() * 6 : -10 - random() * 18;

    const material = new THREE.SpriteMaterial({
      map,
      color: random() > 0.68 ? warm : cool,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(x, y, z);
    const scale = (depth === 0 ? 0.28 : depth === 1 ? 0.22 : 0.16) + random() * 0.22;
    sprite.scale.setScalar(scale);
    group.add(sprite);

    const base = 0.45 + random() * 0.5;
    stars.push({ material, base, phase: random() * Math.PI * 2 });
  }

  return { group, stars };
}

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

type PointWriter = (
  random: () => number,
  write: (index: number, x: number, y: number, z: number, color: THREE.Color, size: number) => void,
) => void;

function createPoints(
  count: number,
  map: THREE.Texture,
  opacity: number,
  sizeMultiplier: number,
  writePoint: PointWriter,
) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const random = seededRandom(count);

  writePoint(random, (index, x, y, z, color, size) => {
    positions[index * 3] = x;
    positions[index * 3 + 1] = y;
    positions[index * 3 + 2] = z;
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
    sizes[index] = size;
    phases[index] = random() * Math.PI * 2;
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: map },
      uTime: { value: 0 },
      uOpacity: { value: opacity },
      uSizeMultiplier: { value: sizeMultiplier },
      uFade: { value: 1 },
    },
    vertexShader: `
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aPhase;
      uniform float uTime;
      uniform float uSizeMultiplier;
      varying vec3 vColor;
      varying float vTwinkle;
      void main() {
        vColor = aColor;
        vTwinkle = 0.82 + 0.18 * sin(uTime * 0.7 + aPhase);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = max(aSize * uSizeMultiplier / -mv.z, 0.6);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform sampler2D uMap;
      uniform float uOpacity;
      uniform float uFade;
      varying vec3 vColor;
      varying float vTwinkle;
      void main() {
        vec4 tex = texture2D(uMap, gl_PointCoord);
        float alpha = tex.a * uOpacity * vTwinkle * uFade;
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(vColor * tex.rgb, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return { points: new THREE.Points(geometry, material), material };
}

function createGalaxy(counts: (typeof COUNTS)[Quality], dustMap: THREE.Texture, glowMap: THREE.Texture) {
  const group = new THREE.Group();
  const materials: THREE.ShaderMaterial[] = [];
  const color = new THREE.Color();

  const bulge = createPoints(counts.bulge, dustMap, 0.95, 420, (random, write) => {
    for (let i = 0; i < counts.bulge; i += 1) {
      const radius = Math.pow(random(), 1.5) * GALAXY.bulgeRadius;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi) * 0.6;
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const t = radius / GALAXY.bulgeRadius;
      color.setHSL(0.12 - t * 0.06, 0.3 + t * 0.3, 0.95 - t * 0.35);
      write(i, x, y, z, color, (1 - t * 0.5) * (0.06 + random() * 0.05));
    }
  });
  group.add(bulge.points);
  materials.push(bulge.material);

  const arms = createPoints(counts.arms, dustMap, 0.85, 360, (random, write) => {
    for (let i = 0; i < counts.arms; i += 1) {
      const arm = Math.floor(random() * GALAXY.arms);
      const offset = (arm / GALAXY.arms) * Math.PI * 2;
      const dist = GALAXY.bulgeRadius * 0.5 + Math.pow(random(), 0.7) * (GALAXY.radius - GALAXY.bulgeRadius * 0.5);
      const spread = (random() - 0.5 + (random() - 0.5)) * GALAXY.armSpread * (0.5 + dist / GALAXY.radius);
      const angle = dist * GALAXY.armCurve + offset + spread;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const y = (random() - 0.5) * GALAXY.thickness * (1 + dist * 0.3);
      const t = dist / GALAXY.radius;

      if (t < 0.3) {
        color.setHSL(0.12, 0.2 + t, 0.85 - t * 0.3);
      } else if (t < 0.6) {
        const blend = (t - 0.3) / 0.3;
        color.setHSL(0.12 + blend * 0.5, 0.3, 0.7 - blend * 0.1);
      } else {
        color.setHSL(0.6 + random() * 0.05, 0.4 + random() * 0.2, 0.5 + random() * 0.2);
      }
      if (random() < 0.05 && t > 0.2) color.setHSL(0.95 + random() * 0.1, 0.6, 0.4 + random() * 0.2);

      write(i, x, y, z, color, (0.3 + random() * 0.7) * (1.1 - t * 0.4) * 0.085);
    }
  });
  group.add(arms.points);
  materials.push(arms.material);

  const haze = createPoints(counts.haze, dustMap, 0.22, 700, (random, write) => {
    for (let i = 0; i < counts.haze; i += 1) {
      const dist = Math.pow(random(), 0.5) * GALAXY.radius;
      const angle = random() * Math.PI * 2;
      const y = (random() - 0.5) * GALAXY.hazeThickness * 2;
      const t = dist / GALAXY.radius;
      color.setHSL(0.65, 0.15, 0.25 + t * 0.1);
      write(i, Math.cos(angle) * dist, y, Math.sin(angle) * dist, color, 0.035 + random() * 0.03);
    }
  });
  group.add(haze.points);
  materials.push(haze.material);

  const innerGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowMap,
      color: 0xfff4e0,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  innerGlow.scale.setScalar(1.1);
  innerGlow.userData.baseOpacity = 0.55;
  group.add(innerGlow);

  const outerGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowMap,
      color: 0xffe0b0,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  outerGlow.scale.setScalar(2.8);
  outerGlow.userData.baseOpacity = 0.2;
  group.add(outerGlow);

  group.rotation.x = 0.82;
  group.rotation.z = 0.18;

  return { group, materials };
}

function createDeepField(map: THREE.Texture) {
  const count = 1100;
  const random = seededRandom(2047);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const cool = new THREE.Color(0x9fb8d8);
  const warm = new THREE.Color(0xf0cfae);
  const color = new THREE.Color();

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (random() - 0.5) * 46;
    positions[i * 3 + 1] = (random() - 0.5) * 30;
    positions[i * 3 + 2] = -8 - random() * 26;
    color.copy(random() > 0.84 ? warm : cool);
    const strength = 0.2 + random() * 0.45;
    colors[i * 3] = color.r * strength;
    colors[i * 3 + 1] = color.g * strength;
    colors[i * 3 + 2] = color.b * strength;
    sizes[i] = 0.04 + random() * 0.06;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: map },
      uTime: { value: 0 },
      uOpacity: { value: 0.6 },
      uSizeMultiplier: { value: 620 },
      uFade: { value: 1 },
    },
    vertexShader: `
      attribute vec3 aColor;
      attribute float aSize;
      uniform float uTime;
      uniform float uSizeMultiplier;
      varying vec3 vColor;
      varying float vTwinkle;
      void main() {
        vColor = aColor;
        vTwinkle = 0.82 + 0.18 * sin(uTime * 0.5);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = max(aSize * uSizeMultiplier / -mv.z, 0.5);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform sampler2D uMap;
      uniform float uOpacity;
      uniform float uFade;
      varying vec3 vColor;
      varying float vTwinkle;
      void main() {
        vec4 tex = texture2D(uMap, gl_PointCoord);
        float alpha = tex.a * uOpacity * vTwinkle * uFade;
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(vColor * tex.rgb, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return { points: new THREE.Points(geometry, material), material };
}

function createGitMerge(glowMap: THREE.Texture) {
  const group = new THREE.Group();
  const positions: ReadonlyArray<readonly [number, number, number]> = [
    [0, -1.25, 0],
    [0, -0.62, 0],
    [0, 0.05, 0],
    [0, 0.7, 0],
    [0, 1.25, 0],
    [-0.38, -0.34, 0.1],
    [-1.15, 0.68, 0.04],
    [0.94, -0.18, 0.02],
    [0.42, 0.52, 0.12],
  ];

  const trunkEdge = 0xdfe7f2;
  const trunkNode = 0xefe0c9;
  const warmLow = 0xf0b878;
  const warmHigh = 0xffd9a0;
  const coolLow = 0xbcd4ff;
  const coolHigh = 0xa78bff;
  const nodeColors = [
    trunkNode,
    trunkNode,
    trunkNode,
    trunkNode,
    trunkNode,
    warmLow,
    warmHigh,
    coolLow,
    coolHigh,
  ];

  const nodeGeometry = new THREE.SphereGeometry(0.028, 12, 8);
  const nodeScales: THREE.Vector3[] = [];
  const nodeMaterials: THREE.MeshBasicMaterial[] = [];
  const glowMaterials: THREE.SpriteMaterial[] = [];

  positions.forEach((position, index) => {
    const color = nodeColors[index];
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const node = new THREE.Mesh(nodeGeometry, material);
    node.position.set(...position);
    node.scale.setScalar(0.001);
    nodeScales.push(node.scale);
    nodeMaterials.push(material);
    group.add(node);

    const glowMaterial = new THREE.SpriteMaterial({
      map: glowMap,
      color,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Sprite(glowMaterial);
    glow.position.set(...position);
    glow.scale.setScalar(0.18);
    glowMaterials.push(glowMaterial);
    group.add(glow);
  });

  const at = (index: number) => new THREE.Vector3(...positions[index]);
  const labelMaterials: THREE.SpriteMaterial[] = [];
  const labelSpecs: ReadonlyArray<{ text: string; node: number; offset: readonly [number, number] }> = [
    { text: 'commit 7f4d344', node: 0, offset: [-0.18, -0.13] },
    { text: 'commit c62d34b', node: 1, offset: [-0.24, -0.13] },
    { text: 'merge 259ad64', node: 2, offset: [0.24, 0.13] },
    { text: 'branch 48ccc90', node: 5, offset: [-0.2, 0.14] },
    { text: 'commit 63efac0', node: 7, offset: [0.21, -0.13] },
    { text: 'merge a91b7e2', node: 8, offset: [0.18, 0.13] },
    { text: 'commit d84c219', node: 3, offset: [-0.2, 0.12] },
    { text: 'commit e5a63f8', node: 4, offset: [0.18, 0.13] },
  ];

  labelSpecs.forEach(({ text, node, offset }) => {
    const texture = createLabelTexture(text);
    labelTextures.push(texture);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const label = new THREE.Sprite(material);
    const position = at(node);
    label.position.set(position.x + offset[0], position.y + offset[1], position.z + 0.03);
    label.scale.set(0.44, 0.11, 1);
    labelMaterials.push(material);
    group.add(label);
  });

  const sCurve = (start: THREE.Vector3, end: THREE.Vector3, amplitude: number, sign: number) => {
    const delta = new THREE.Vector3().subVectors(end, start);
    const normal = new THREE.Vector3(-delta.y, delta.x, 0).normalize();
    const control1 = start
      .clone()
      .addScaledVector(delta, 0.32)
      .addScaledVector(normal, amplitude * sign);
    const control2 = start
      .clone()
      .addScaledVector(delta, 0.68)
      .addScaledVector(normal, -amplitude * sign);
    control1.z += 0.02 * sign;
    control2.z -= 0.02 * sign;
    return new THREE.CubicBezierCurve3(start, control1, control2, end);
  };
  const paths: ReadonlyArray<{ curve: THREE.CubicBezierCurve3; color: number }> = [
    {
      curve: new THREE.CubicBezierCurve3(
        at(0),
        new THREE.Vector3(0, -0.8, 0),
        new THREE.Vector3(0, 0.8, 0),
        at(4),
      ),
      color: trunkEdge,
    },
    {
      curve: sCurve(at(0), at(5), 0.14, 1),
      color: warmLow,
    },
    {
      curve: sCurve(at(1), at(6), 0.42, -1),
      color: warmHigh,
    },
    {
      curve: sCurve(at(2), at(7), 0.3, 1),
      color: coolLow,
    },
    {
      curve: sCurve(at(3), at(8), 0.18, -1),
      color: coolHigh,
    },
  ];

  const edgeDraws: Array<{ value: number; geometry: THREE.TubeGeometry; count: number }> = [];
  const edgeMaterials: THREE.MeshBasicMaterial[] = [];

  paths.forEach(({ curve, color }) => {
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const geometry = new THREE.TubeGeometry(curve, 48, 0.015, 10, false);
    const count = geometry.index?.count ?? 0;
    geometry.setDrawRange(0, 0);
    group.add(new THREE.Mesh(geometry, material));
    edgeDraws.push({ value: 0, geometry, count });
    edgeMaterials.push(material);
  });

  group.rotation.y = -0.06;
  return { group, edgeDraws, edgeMaterials, nodeScales, nodeMaterials, glowMaterials, labelMaterials };
}

function disposeScene(target: THREE.Scene | null): void {
  if (!target) return;

  target.traverse((object) => {
    const renderable = object as THREE.Mesh;
    if (renderable.geometry) renderable.geometry.dispose();
    const material = renderable.material;
    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose());
    } else if (material) {
      material.dispose();
    }
  });
}

export function destroyModelSection(): void {
  context?.revert();
  context = null;

  if (rafId !== null) cancelAnimationFrame(rafId);
  rafId = null;

  observer?.disconnect();
  observer = null;

  if (resizeHandler) window.removeEventListener('resize', resizeHandler);
  resizeHandler = null;

  if (pointerHandler && sectionEl) sectionEl.removeEventListener('pointermove', pointerHandler);
  pointerHandler = null;

  const mount = mountEl;
  if (renderer && mount && renderer.domElement.parentNode === mount) {
    mount.removeChild(renderer.domElement);
  }
  renderer?.dispose();

  disposeScene(scene);
  dustTexture?.dispose();
  glowTexture?.dispose();
  flareTexture?.dispose();
  labelTextures.forEach((texture) => texture.dispose());
  labelTextures = [];
  twinkles = [];

  renderer = null;
  scene = null;
  camera = null;
  galaxyGroup = null;
  dustTexture = null;
  glowTexture = null;
  flareTexture = null;
  sectionEl = null;
  mountEl = null;
  visible = false;
}

export function initModelSection(): void {
  destroyModelSection();

  const section = document.querySelector<HTMLElement>('.model-stage');
  const mount = document.querySelector<HTMLElement>('.model-canvas');
  const kicker = document.querySelector<HTMLElement>('.model-kicker');
  const lines = gsap.utils.toArray<HTMLElement>('.model-line');
  if (!section || !mount || !kicker || lines.length === 0) return;

  sectionEl = section;
  mountEl = mount;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const state: CameraPose = { ...CAMERA.start };
  const fade = { value: 1 };
  const clock = { time: 0 };
  const pointer = { x: 0, y: 0 };
  const parallax = { x: 0, y: 0 };

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(state.fov, 1, 0.1, 100);
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  mount.appendChild(renderer.domElement);

  dustTexture = createRadialTexture(
    [
      [0, 'rgba(255,255,255,0.95)'],
      [0.4, 'rgba(210,225,255,0.24)'],
      [1, 'rgba(210,225,255,0)'],
    ],
    32,
  );
  glowTexture = createRadialTexture(
    [
      [0, 'rgba(255,255,255,1)'],
      [0.16, 'rgba(255,235,205,0.7)'],
      [0.42, 'rgba(240,184,120,0.2)'],
      [1, 'rgba(240,184,120,0)'],
    ],
    128,
  );

  flareTexture = createStarTexture();

  const deepField = createDeepField(dustTexture);
  const galaxy = createGalaxy(COUNTS[getQuality()], dustTexture, glowTexture);
  const anchors = createAnchorStars(flareTexture);
  const git = createGitMerge(glowTexture);
  scene.add(deepField.points);
  scene.add(galaxy.group);
  scene.add(anchors.group);
  scene.add(git.group);
  twinkles = anchors.stars;
  galaxyGroup = galaxy.group;

  const materials = [...galaxy.materials, deepField.material];

  const layout = () => {
    if (!galaxyGroup) return;
    const mobile = window.innerWidth <= 900;
    galaxyGroup.position.set(0, mobile ? 0.25 : 0, 0);
    galaxyGroup.scale.setScalar(mobile ? 1.35 : 1.9);
    git.group.position.set(mobile ? 0 : 0.42, mobile ? 0.12 : 0, 0);
    git.group.scale.setScalar(mobile ? 0.22 : 0.3);
  };
  layout();

  const renderFrame = () => {
    if (!renderer || !scene || !camera || !galaxyGroup) return;

    materials.forEach((material) => {
      material.uniforms.uTime.value = clock.time;
      material.uniforms.uFade.value = fade.value;
    });
    galaxyGroup.traverse((object) => {
      if (object instanceof THREE.Sprite) {
        const base = object.userData.baseOpacity as number | undefined;
        if (base !== undefined) object.material.opacity = base * fade.value;
      }
    });
    twinkles.forEach((star) => {
      star.material.opacity =
        star.base * (0.78 + 0.22 * Math.sin(clock.time * 0.8 + star.phase)) * fade.value;
    });

    if (!reduceMotion) {
      parallax.x += (pointer.x * 0.14 - parallax.x) * 0.075;
      parallax.y += (-pointer.y * 0.1 - parallax.y) * 0.075;
    }

    camera.position.set(state.x + parallax.x, state.y + parallax.y, state.z);
    camera.lookAt(state.tx, state.ty, state.tz);
    camera.rotation.z = state.roll;
    if (camera.fov !== state.fov) {
      camera.fov = state.fov;
      camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
  };

  const resize = () => {
    if (!renderer || !camera || !mount) return;
    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    layout();
    if (reduceMotion) renderFrame();
  };
  resizeHandler = resize;
  window.addEventListener('resize', resize);
  resize();

  if (reduceMotion) {
    Object.assign(state, CAMERA.settle);
    fade.value = 0;
    git.edgeDraws.forEach((draw) => {
      draw.value = 1;
      draw.geometry.setDrawRange(0, draw.count);
    });
    git.edgeMaterials.forEach((material) => {
      material.opacity = 0.85;
    });
    git.nodeScales.forEach((scale) => {
      scale.setScalar(1);
    });
    git.nodeMaterials.forEach((material) => {
      material.opacity = 1;
    });
    git.glowMaterials.forEach((material) => {
      material.opacity = 0.7;
    });
    git.labelMaterials.forEach((material) => {
      material.opacity = 0.9;
    });
    gsap.set(kicker, { opacity: 1 });
    gsap.set(lines, { clipPath: 'inset(0% 0% 0% 0%)', filter: 'blur(0px)' });
    renderFrame();
    return;
  }

  gsap.set(kicker, { opacity: 0 });
  gsap.set(lines, { clipPath: 'inset(0% 0% 100% 0%)', filter: 'blur(6px)' });

  context = gsap.context(() => {
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=300%',
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 1,
      },
    });

    timeline
      .to(state, { ...CAMERA.approach, duration: 0.18, ease: 'power3.inOut' }, 0.02)
      .to(state, { ...CAMERA.orbit, duration: 0.16, ease: 'power2.inOut' }, 0.2)
      .to(state, { ...CAMERA.detail, duration: 0.22, ease: 'power3.in' }, 0.36)
      .to(fade, { value: 0, duration: 0.1, ease: 'power2.inOut' }, 0.58)
      .to(git.group.rotation, { y: 0, duration: 0.18, ease: 'power2.out' }, 0.68)
      .to(git.nodeScales, { x: 1, y: 1, z: 1, duration: 0.1, ease: 'back.out(1.6)', stagger: 0.012 }, 0.72)
      .to(git.nodeMaterials, { opacity: 1, duration: 0.08, ease: 'power2.out', stagger: 0.012 }, 0.72)
      .to(git.glowMaterials, { opacity: 0.7, duration: 0.1, ease: 'power2.out', stagger: 0.012 }, 0.72)
      .to(git.labelMaterials, { opacity: 0.9, duration: 0.08, ease: 'power2.out', stagger: 0.02 }, 0.84)
      .to(kicker, { opacity: 1, duration: 0.05, ease: 'power2.out' }, 0.9)
      .to(
        lines,
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          filter: 'blur(0px)',
          duration: 0.05,
          ease: 'expo.out',
          stagger: 0.015,
        },
        0.93,
      )
      .to({}, { duration: 0.005 }, 0.995);

    const edgeStep = 0.18 / git.edgeDraws.length;
    git.edgeDraws.forEach((draw, index) => {
      timeline.to(
        draw,
        {
          value: 1,
          duration: edgeStep * 1.8,
          ease: 'power2.out',
          onUpdate: () => draw.geometry.setDrawRange(0, Math.floor(draw.count * draw.value)),
        },
        0.68 + index * edgeStep,
      );
    });
    const materialStep = 0.18 / git.edgeMaterials.length;
    git.edgeMaterials.forEach((material, index) => {
      timeline.to(
        material,
        { opacity: 0.85, duration: materialStep * 1.8, ease: 'power2.out' },
        0.68 + index * materialStep,
      );
    });
  });

  pointerHandler = (event: PointerEvent) => {
    const rect = section.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  };
  section.addEventListener('pointermove', pointerHandler);

  observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
    },
    { rootMargin: '15% 0px' },
  );
  observer.observe(section);

  const rect = section.getBoundingClientRect();
  visible = rect.top < window.innerHeight && rect.bottom > 0;

  let lastTime = performance.now();
  const loop = () => {
    rafId = requestAnimationFrame(loop);
    if (!visible) {
      lastTime = performance.now();
      return;
    }
    const now = performance.now();
    clock.time += Math.min(now - lastTime, 50) / 1000;
    lastTime = now;
    renderFrame();
  };
  loop();

  if (document.readyState === 'complete') {
    ScrollTrigger.refresh();
  } else {
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  }
}
