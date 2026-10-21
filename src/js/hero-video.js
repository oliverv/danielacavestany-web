/**
 * hero-video.js — vídeo de fondo del hero de Servicios.
 * - Solo se carga en pantallas ≥ 768 px, sin "reducir movimiento" ni ahorro de datos.
 * - En el resto de casos se queda el póster estático (no se descarga el vídeo).
 * - Botón de pausa accesible (WCAG 2.2.2).
 */
export function initHeroVideo() {
  const hero = document.querySelector('[data-hero-video]');
  if (!hero) return;
  const video = hero.querySelector('video');
  const toggle = hero.querySelector('.hero-video-toggle');
  if (!video) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow  = window.matchMedia('(max-width: 767px)').matches;
  const saving  = navigator.connection && navigator.connection.saveData;
  if (reduced || narrow || saving) return;

  video.src = window.innerWidth >= 1280 ? video.dataset.srcHd : video.dataset.srcSd;
  video.muted = true;

  const start = video.play();
  if (start && typeof start.catch === 'function') start.catch(() => {});

  video.addEventListener('playing', () => {
    hero.classList.add('is-playing');
    if (toggle) toggle.hidden = false;
  }, { once: true });

  if (toggle) {
    toggle.addEventListener('click', () => {
      const icon = toggle.querySelector('span');
      if (video.paused) {
        video.play();
        toggle.setAttribute('aria-label', toggle.dataset.labelPause);
        if (icon) icon.textContent = '❚❚';
      } else {
        video.pause();
        toggle.setAttribute('aria-label', toggle.dataset.labelPlay);
        if (icon) icon.textContent = '▶';
      }
    });
  }
}
