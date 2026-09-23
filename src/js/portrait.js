/**
 * portrait.js — subtle scroll-scale effect on the opening portrait.
 * scale 1.0 → 1.025 as user scrolls through the first viewport.
 * Stops when portrait is out of view. prefers-reduced-motion safe.
 */
export function initPortraitScale() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const portrait = document.querySelector('.stage-full:first-of-type img');
  if (!portrait) return;

  const vh = window.innerHeight;

  function onScroll() {
    const y = window.scrollY;
    if (y > vh) return; // only while portrait is visible
    const progress = Math.min(y / vh, 1);
    const scale = 1 + (progress * 0.025);
    portrait.style.transform = `scale(${scale.toFixed(4)})`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}
