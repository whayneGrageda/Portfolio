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
  detail: { x: 0.35, y: 0.25, z: 3.4, tx: 0, ty: 0, tz: 0, fov: 38, roll: 0.006 },
  settle: { x: 0.2, y: 0.15, z: 3.1, tx: 0, ty: 0, tz: 0, fov: 42, roll: 0 },
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
      varying vec3 vColor;
      varying float vTwinkle;
      void main() {
        vec4 tex = texture2D(uMap, gl_PointCoord);
        float alpha = tex.a * uOpacity * vTwinkle;
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
      varying vec3 vColor;
      varying float vTwinkle;
      void main() {
        vec4 tex = texture2D(uMap, gl_PointCoord);
        float alpha = tex.a * uOpacity * vTwinkle;
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
  scene.add(deepField.points);
  scene.add(galaxy.group);
  scene.add(anchors.group);
  twinkles = anchors.stars;
  galaxyGroup = galaxy.group;

  const materials = [...galaxy.materials, deepField.material];

  const layout = () => {
    if (!galaxyGroup) return;
    const mobile = window.innerWidth <= 900;
    galaxyGroup.position.set(0, mobile ? 0.25 : 0, 0);
    galaxyGroup.scale.setScalar(mobile ? 1.35 : 1.9);
  };
  layout();

  const renderFrame = () => {
    if (!renderer || !scene || !camera || !galaxyGroup) return;

    materials.forEach((material) => {
      material.uniforms.uTime.value = clock.time;
    });
    twinkles.forEach((star) => {
      star.material.opacity = star.base * (0.78 + 0.22 * Math.sin(clock.time * 0.8 + star.phase));
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
      .to(state, { ...CAMERA.approach, duration: 0.22, ease: 'power3.inOut' }, 0.02)
      .to(state, { ...CAMERA.orbit, duration: 0.24, ease: 'power2.inOut' }, 0.24)
      .to(state, { ...CAMERA.detail, duration: 0.24, ease: 'power3.in' }, 0.48)
      .to(state, { ...CAMERA.settle, duration: 0.16, ease: 'expo.out' }, 0.72)
      .to(kicker, { opacity: 1, duration: 0.12, ease: 'power2.out' }, 0.78)
      .to(
        lines,
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          filter: 'blur(0px)',
          duration: 0.18,
          ease: 'expo.out',
          stagger: 0.08,
        },
        0.86,
      )
      .to({}, { duration: 0.22 });
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
