/**
 * gallery.js — group filter, scroll reveal, lightbox viewer.
 * Progressive enhancement: no-JS still shows the full series.
 * ES module — imported by main.js.
 */

const IS_EN = document.documentElement.lang === 'en';

// ─── Group filter (portfolio page) ───────────────────────────
const bar    = document.getElementById('filterbar');
const groups = ['g-retratos', 'g-rito', 'g-tierra'];
let   plates = [...document.querySelectorAll('main .plate')];

if (bar) {
  const btns = [...bar.querySelectorAll('button[data-filter]')];

  // Live counts
  btns.forEach(btn => {
    const f = btn.dataset.filter;
    const n = f === 'all'
      ? document.querySelectorAll('main .plate').length
      : document.querySelectorAll(`#${f} .plate`).length;
    if (!btn.querySelector('.count')) {
      const s = document.createElement('span');
      s.className = 'count';
      s.textContent = ` (${n})`;
      btn.appendChild(s);
    }
  });

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(x => x.classList.remove('on'));
      btn.classList.add('on');
      const f = btn.dataset.filter;
      groups.forEach(g => {
        const sec = document.getElementById(g);
        if (!sec) return;
        const show = f === 'all' || f === g;
        sec.classList.toggle('dim', !show);
        sec.querySelectorAll('.plate').forEach(p => p.classList.toggle('hide', !show));
      });
    });
  });
}

// ─── Scroll reveal ────────────────────────────────────────────
/*
  .plate  → slower .reveal-img (photographs, 1.1s)
  .reveal → standard text reveals (0.75s)
  Both trigger by adding class "in" via IntersectionObserver.
*/
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -6% 0px' });

  plates.forEach(p => p.classList.add('reveal-img'));

  const seen = new Set();
  [...plates, ...document.querySelectorAll('main .reveal, main .reveal-img')].forEach(el => {
    if (!seen.has(el)) { seen.add(el); io.observe(el); }
  });
}

// ─── Lightbox ─────────────────────────────────────────────────
const lb = document.createElement('div');
lb.id = 'lightbox';
lb.setAttribute('role', 'dialog');
lb.setAttribute('aria-modal', 'true');
lb.setAttribute('aria-label', IS_EN ? 'Artwork viewer' : 'Visor de obra');
lb.innerHTML = `
  <div class="lb-top">
    <span class="meta" id="lb-count"></span>
    <button class="lb-close" id="lb-close">${IS_EN ? 'Close ✕' : 'Cerrar ✕'}</button>
  </div>
  <div class="lb-stage">
    <button class="lb-nav" id="lb-prev" aria-label="${IS_EN ? 'Previous' : 'Anterior'}">‹</button>
    <img id="lb-img" alt="">
    <button class="lb-nav" id="lb-next" aria-label="${IS_EN ? 'Next' : 'Siguiente'}">›</button>
  </div>
  <div class="lb-cap">
    <span class="title" id="lb-title"></span>
    <span class="meta"  id="lb-meta"></span>
  </div>
  <div class="lb-meta-row">
    <span class="meta" id="lb-cat"></span>
    <a class="lb-consult" id="lb-consult" href="#">
      ${IS_EN ? 'Enquire about this work →' : 'Consultar sobre esta obra →'}
    </a>
  </div>`;
document.body.appendChild(lb);

const lbImg     = lb.querySelector('#lb-img');
const lbTitle   = lb.querySelector('#lb-title');
const lbMeta    = lb.querySelector('#lb-meta');
const lbCat     = lb.querySelector('#lb-cat');
const lbConsult = lb.querySelector('#lb-consult');
const lbCount   = lb.querySelector('#lb-count');
let current = [];
let idx = 0;
let opener = null;

const visiblePlates = () => plates.filter(p => !p.classList.contains('hide'));

function catOf(fig) {
  const c = fig.closest('article') || fig;
  let txt = '';
  c.querySelectorAll('.meta, .obra-meta').forEach(el => { txt = el.textContent; });
  const m = txt.match(/BALI[-—]\d{2}/i);
  return m ? m[0].replace('—', '-').toUpperCase() : '';
}

function titleOf(fig) {
  const c = fig.closest('article') || fig;
  const t = c.querySelector('.title, .obra-title');
  return t ? t.textContent : '';
}

function metaOf(fig) {
  const c = fig.closest('article') || fig;
  let txt = '';
  c.querySelectorAll('.meta, .obra-meta').forEach(el => { txt = el.textContent; });
  return txt;
}

function openAt(list, i) {
  current = list;
  idx = (i + list.length) % list.length;
  const fig = current[idx];
  const img = fig.querySelector('img');
  lbImg.src = img ? (img.currentSrc || img.src) : '';
  lbImg.alt = img?.alt || '';
  lbTitle.textContent = titleOf(fig);
  lbMeta.textContent  = metaOf(fig);
  const cat = catOf(fig);
  const sec = fig.closest('section[id]');
  const h   = sec?.querySelector('h2.display, .group-title');
  lbCat.textContent = h ? h.textContent.trim().replace(/\s+/g, ' ') : '';
  if (cat) {
    lbConsult.style.display = '';
    lbConsult.href = (IS_EN ? 'contacto-en.html' : 'contacto.html') + `?obra=${cat}`;
  } else {
    lbConsult.style.display = 'none';
  }
  lbCount.textContent = `${idx + 1} / ${current.length}`;
  if (!lb.classList.contains('open')) opener = document.activeElement;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
  lb.querySelector('#lb-close').focus();
}

function close() {
  lb.classList.remove('open');
  document.body.style.overflow = '';
  opener?.focus();
}

const step = d => openAt(current, idx + d);

document.querySelectorAll('main .plate').forEach(fig => {
  fig.addEventListener('click', () => {
    const list = visiblePlates();
    openAt(list, list.indexOf(fig));
  });
  if (fig.getAttribute('role') === 'button') {
    fig.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fig.click(); }
    });
  }
});

lb.querySelector('#lb-close').addEventListener('click', close);
lb.querySelector('#lb-prev').addEventListener('click', e => { e.stopPropagation(); step(-1); });
lb.querySelector('#lb-next').addEventListener('click', e => { e.stopPropagation(); step(1); });
lb.addEventListener('click', e => { if (e.target === lb) close(); });

document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape')     close();
  if (e.key === 'ArrowLeft')  step(-1);
  if (e.key === 'ArrowRight') step(1);
});
