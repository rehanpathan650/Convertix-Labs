import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Fade/slide every `.reveal` element in as it scrolls into view. */
export default function useRevealAnimations(rootRef) {
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.set(el, { y: 20 });
        gsap.to(el, {
          opacity: 1, y: 0, duration: 0.65, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 92%' },
        });
      });
    }, rootRef);
    return () => ctx.revert();
  }, [rootRef]);
}
