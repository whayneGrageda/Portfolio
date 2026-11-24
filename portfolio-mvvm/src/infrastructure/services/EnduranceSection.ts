import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const MEMBERS = ['1×', '2×', '4×', '8×', '16×', '64×', '∞'] as const;
const BRACE_COUNT = 4;

let context: gsap.Context | null = null;

/**
 * A pinned scroll scene where scroll acts as load, not as a playhead.
 * The structure flexes, braces lock, and the datum line settles before the
 * contact CTA inherits it. Paints no background: the page ground shows through.
 */
export function renderEnduranceSection(): string {
  const members = MEMBERS.map(
    (load, index) => {
      const y = 8 + index * 13;
      return `
      <span class="endurance-member" style="--y: ${y}%"></span>
      <span class="endurance-load" style="--y: ${y}%">${load}</span>`;
    },
  ).join('');

  const braces = Array.from(
    { length: BRACE_COUNT },
    (_, index) => `
      <span
        class="endurance-brace endurance-brace--${index % 2 === 0 ? 'down' : 'up'}"
        style="--x: ${18 + index * 21}%"
      ></span>`,
  ).join('');

  return `
    <section class="endurance-stage" aria-label="Engineering endurance">
      <div class="endurance-inner">
        <div class="endurance-copy">
          <p class="endurance-kicker">03 — Built to hold</p>
          <h2
            class="endurance-title"
            aria-label="Endurance is engineered, not promised."
          >
            <span class="endurance-line">Endurance is engineered,</span>
            <span class="endurance-line">not promised.</span>
          </h2>
        </div>

        <div class="endurance-structure" aria-hidden="true">
          ${members}
          ${braces}
          <span class="endurance-datum"></span>
        </div>
      </div>
    </section>
  `;
}

export function destroyEnduranceSection(): void {
  context?.revert();
  context = null;
}

export function initEnduranceSection(): void {
  destroyEnduranceSection();

  const section = document.querySelector<HTMLElement>('.endurance-stage');
  const structure = document.querySelector<HTMLElement>('.endurance-structure');
  const datum = document.querySelector<HTMLElement>('.endurance-datum');
  const members = gsap.utils.toArray<HTMLElement>('.endurance-member');
  const loads = gsap.utils.toArray<HTMLElement>('.endurance-load');
  const braces = gsap.utils.toArray<HTMLElement>('.endurance-brace');
  const lines = gsap.utils.toArray<HTMLElement>('.endurance-line');
  const kicker = document.querySelector<HTMLElement>('.endurance-kicker');

  if (!section || !structure || !datum || !kicker || members.length === 0 || lines.length === 0) {
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  context = gsap.context(() => {
    gsap.set(members, { transformOrigin: '0% 50%' });
    gsap.set(loads, { transformOrigin: '0% 50%' });
    gsap.set(datum, { transformOrigin: '0% 50%' });
    gsap.set(structure, { transformOrigin: '50% 100%' });

    if (reduceMotion) {
      gsap.set(kicker, { opacity: 1 });
      gsap.set(members, { scaleX: 1, opacity: 0.7, filter: 'blur(0px)' });
      gsap.set(loads, { opacity: 0.8, y: 0, filter: 'blur(0px)' });
      gsap.set(braces, { scaleY: 1, opacity: 0.5 });
      gsap.set(datum, { scaleX: 1, opacity: 0.85, filter: 'blur(0px)' });
      gsap.set(structure, { skewY: 0, rotation: 0 });
      gsap.set(lines, { clipPath: 'inset(0% 0% 0% 0%)', filter: 'blur(0px)' });
      return;
    }

    // Cold frame: unloaded structure, tags above their marks, type masked.
    gsap.set(kicker, { opacity: 0 });
    gsap.set(members, { scaleX: 0, opacity: 0.15, filter: 'blur(6px)' });
    gsap.set(loads, { opacity: 0, y: -18, filter: 'blur(4px)' });
    gsap.set(braces, { scaleY: 0, opacity: 0 });
    gsap.set(datum, { scaleX: 0.2, opacity: 0.3, filter: 'blur(0px)' });
    gsap.set(structure, { skewY: 0, rotation: 0 });
    gsap.set(lines, { clipPath: 'inset(0% 0% 100% 0%)', filter: 'blur(6px)' });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=240%',
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 1,
      },
    });

    // Load tags accelerate downward; members arrive on a long tail.
    timeline
      .to(kicker, { opacity: 1, duration: 0.18, ease: 'power2.out' }, 0)
      .to(
        loads,
        {
          opacity: 0.8,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.16,
          ease: 'power3.in',
          stagger: 0.075,
        },
        0.04,
      )
      .to(
        members,
        {
          scaleX: 1,
          opacity: 0.7,
          filter: 'blur(0px)',
          duration: 0.24,
          ease: 'power4.out',
          stagger: 0.075,
        },
        0.06,
      );

    // The structure takes the strain, then returns to datum.
    timeline
      .to(structure, { skewY: 1.4, rotation: 0.8, duration: 0.42, ease: 'power2.inOut' }, 0.4)
      .to(structure, { skewY: 0, rotation: 0, duration: 0.24, ease: 'power2.inOut' }, 0.82);

    // Braces lock with a single mechanical overshoot.
    timeline.to(
      braces,
      {
        scaleY: 1,
        opacity: 0.5,
        duration: 0.18,
        ease: 'back.out(1.2)',
        stagger: 0.05,
      },
      0.72,
    );

    // Type blurs and unmasks in place — no translate, no fold.
    timeline.to(
      lines,
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        filter: 'blur(0px)',
        duration: 0.18,
        ease: 'expo.out',
        stagger: 0.08,
      },
      0.88,
    );

    // Hold dead still, then the datum line whips into the CTA rule.
    timeline
      .to(
        datum,
        {
          scaleX: 1,
          opacity: 0.85,
          filter: 'blur(6px)',
          duration: 0.12,
          ease: 'power3.in',
        },
        1.2,
      )
      .to(datum, { filter: 'blur(0px)', duration: 0.06, ease: 'power3.out' }, 1.32)
      // The settled structure and its line hold before the contact section arrives.
      .to({}, { duration: 0.42 });
  });

  if (document.readyState === 'complete') {
    ScrollTrigger.refresh();
  } else {
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  }
}
