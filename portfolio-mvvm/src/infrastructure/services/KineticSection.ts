import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const LINES = [
  'Systems that hold',
  'when the pressure',
  'moves upstream.',
] as const;

let context: gsap.Context | null = null;

/**
 * One self-contained, scroll-pinned motion scene.
 * It paints no background — the page's existing background stays visible.
 */
export function renderKineticSection(): string {
  const lines = LINES.map((line) => {
    const words = line.split(' ');
    return `<span class="kinetic-line">${words
      .map((word, index) => {
        const space = index < words.length - 1 ? '\u00A0' : '';
        return `<span class="kinetic-word">${word}${space}</span>`;
      })
      .join('')}</span>`;
  }).join('');

  return `
    <section class="kinetic-stage" aria-label="Engineering philosophy">
      <div class="kinetic-reticle" aria-hidden="true">
        <span class="kinetic-ring kinetic-ring--outer"></span>
        <span class="kinetic-ring kinetic-ring--inner"></span>
        <span class="kinetic-cross kinetic-cross--h"></span>
        <span class="kinetic-cross kinetic-cross--v"></span>
      </div>

      <div class="kinetic-world">
        <span class="kinetic-ghost" aria-hidden="true">02</span>
        <div class="kinetic-copy">
          <p class="kinetic-kicker">02 — How I build</p>
          <h2
            class="kinetic-title"
            aria-label="Systems that hold when the pressure moves upstream."
          >
            ${lines}
          </h2>
        </div>
      </div>

      <span class="kinetic-streak" aria-hidden="true"></span>
    </section>
  `;
}

export function destroyKineticSection(): void {
  context?.revert();
  context = null;
}

export function initKineticSection(): void {
  destroyKineticSection();

  const section = document.querySelector<HTMLElement>('.kinetic-stage');
  const world = document.querySelector<HTMLElement>('.kinetic-world');
  const title = document.querySelector<HTMLElement>('.kinetic-title');
  const ghost = document.querySelector<HTMLElement>('.kinetic-ghost');
  const streak = document.querySelector<HTMLElement>('.kinetic-streak');
  const outerRing = document.querySelector<HTMLElement>('.kinetic-ring--outer');
  const innerRing = document.querySelector<HTMLElement>('.kinetic-ring--inner');
  const crosses = gsap.utils.toArray<HTMLElement>('.kinetic-cross');
  const words = gsap.utils.toArray<HTMLElement>('.kinetic-word');

  if (
    !section ||
    !world ||
    !title ||
    !ghost ||
    !streak ||
    !outerRing ||
    !innerRing ||
    crosses.length !== 2 ||
    words.length === 0
  ) {
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rings = [outerRing, innerRing];

  context = gsap.context(() => {
    gsap.set(rings, { transformOrigin: '50% 50%' });
    gsap.set(crosses, { transformOrigin: '50% 50%' });

    if (reduceMotion) {
      gsap.set(words, {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        y: 0,
        rotateX: 0,
        rotateZ: 0,
        opacity: 1,
      });
      gsap.set(world, { rotateX: 0, z: 0 });
      gsap.set(ghost, { z: -80, rotateY: 0, opacity: 0.12, scale: 1 });
      gsap.set(outerRing, { scale: 1, rotation: 0, opacity: 0.45 });
      gsap.set(innerRing, { scale: 1, rotation: -30, opacity: 0.25 });
      gsap.set(crosses, { scale: 1, opacity: 0.35 });
      gsap.set(streak, { scaleX: 0, opacity: 0 });
      return;
    }

    // Cold frame: camera pulled back, reticle open, letters compressed to a slit.
    gsap.set(world, { rotateX: 14, z: -140, transformPerspective: 900 });
    gsap.set(ghost, { z: -420, rotateY: -18, opacity: 0.05, scale: 1.1 });
    gsap.set(outerRing, { scale: 1.45, rotation: -55, opacity: 0.15 });
    gsap.set(innerRing, { scale: 1.9, rotation: 40, opacity: 0.1 });
    gsap.set(crosses, { scale: 1.6, opacity: 0.15 });
    gsap.set(streak, { scaleX: 0, opacity: 0, transformOrigin: '50% 50%' });
    gsap.set(words, {
      clipPath: 'polygon(0% 47%, 100% 47%, 100% 53%, 0% 53%)',
      y: (index: number) => (index % 2 === 0 ? 26 : -26),
      rotateX: (index: number) => (index % 2 === 0 ? -65 : 65),
      rotateZ: (index: number) => (index % 3 === 0 ? 4 : index % 3 === 1 ? -3 : 2),
      opacity: 0,
      transformOrigin: '50% 50%',
    });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=260%',
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 1,
      },
    });

    // Camera dolly + reticle convergence.
    timeline
      .to(world, { rotateX: 0, z: 0, duration: 1, ease: 'power2.out' }, 0)
      .to(
        ghost,
        { z: -80, rotateY: 0, opacity: 0.12, scale: 1, duration: 1, ease: 'none' },
        0,
      )
      .to(outerRing, { scale: 1, rotation: 0, opacity: 0.45, duration: 1, ease: 'power2.out' }, 0)
      .to(innerRing, { scale: 1, rotation: -30, opacity: 0.25, duration: 1, ease: 'none' }, 0)
      .to(crosses, { scale: 1, opacity: 0.35, duration: 1, ease: 'power2.out' }, 0);

    // Each word opens from a horizontal slit and settles out of a 3D fold.
    words.forEach((word, index) => {
      timeline.to(
        word,
        {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          y: 0,
          rotateX: 0,
          rotateZ: 0,
          opacity: 1,
          duration: 0.2,
          ease: 'expo.out',
        },
        0.14 + index * 0.07,
      );
    });

    // Anamorphic streak crosses the assembled line once.
    timeline
      .fromTo(
        streak,
        { scaleX: 0, opacity: 0, yPercent: -180 },
        { scaleX: 1, opacity: 0.9, yPercent: 180, duration: 0.28, ease: 'power2.inOut' },
        0.48,
      )
      .to(streak, { opacity: 0, duration: 0.08 }, 0.76);

    // Scroll velocity leans the type, then eases it back upright.
    const skewTo = gsap.quickTo(title, 'skewX', { duration: 0.4, ease: 'power3.out' });
    let settle: gsap.core.Tween | null = null;
    ScrollTrigger.create({
      onUpdate: (self) => {
        skewTo(gsap.utils.clamp(-5, 5, self.getVelocity() / 320));
        settle?.kill();
        settle = gsap.delayedCall(0.2, () => skewTo(0));
      },
    });
  });

  if (document.readyState === 'complete') {
    ScrollTrigger.refresh();
  } else {
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  }
}
