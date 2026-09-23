/**
 * contact.js — contact form validation and obra query param handling.
 * Dynamically imported only on contacto pages.
 */

// Pre-fill obra from URL param
const params = new URLSearchParams(window.location.search);
const obra   = params.get('obra');
if (obra) {
  const notice = document.getElementById('obra-notice');
  if (notice) {
    notice.textContent = `Consulta sobre la obra ${obra}`;
    notice.classList.add('show');
  }
  const msg = document.getElementById('mensaje');
  if (msg && !msg.value) msg.value = `Me gustaría consultar sobre la obra ${obra}.`;
}

// Basic form validation
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const errors = [];
    ['nombre', 'email', 'mensaje'].forEach(id => {
      const el  = document.getElementById(id);
      const err = document.getElementById(`err-${id}`);
      el.removeAttribute('aria-invalid');
      if (err) err.textContent = '';
      if (!el.value.trim()) {
        el.setAttribute('aria-invalid', 'true');
        const label = form.querySelector(`label[for="${id}"]`);
        const name  = label ? label.textContent : id;
        if (err) err.textContent = `${name} es obligatorio.`;
        errors.push(`${name} es obligatorio.`);
      }
    });

    // Honeypot
    const hp = document.getElementById('hp');
    if (hp?.value) return;

    const errBox  = document.getElementById('form-errors');
    const errList = document.getElementById('error-list');
    if (errors.length) {
      errList.innerHTML = errors.map(e => `<li>${e}</li>`).join('');
      errBox.classList.add('show');
      errBox.focus();
    } else {
      errBox.classList.remove('show');
      document.getElementById('form-status').textContent =
        'Gracias por tu mensaje. Te responderé en 24–48 horas.';
      form.reset();
    }
  });
}
