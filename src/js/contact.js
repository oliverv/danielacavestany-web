/**
 * contact.js — contact form validation and obra query param handling.
 * Dynamically imported only on contacto pages. Shared by ES and EN
 * via document.documentElement.lang.
 */

const isEn = document.documentElement.lang === 'en';

const t = isEn ? {
  obraNotice:   obra => `Enquiry about artwork ${obra}`,
  obraMessage:  obra => `I would like to ask about the artwork ${obra}.`,
  required:     name => `${name} is required.`,
  success:      'Your email app will open to send the message. I will reply within 24–48 hours.',
  subject:      (nombre, tipo) => `Enquiry from ${nombre}${tipo ? ` — ${tipo}` : ''}`,
  body:         (nombre, email, tipo, mensaje) =>
    `Name: ${nombre}\nEmail: ${email}\nType of enquiry: ${tipo}\n\n${mensaje}`,
} : {
  obraNotice:   obra => `Consulta sobre la obra ${obra}`,
  obraMessage:  obra => `Me gustaría consultar sobre la obra ${obra}.`,
  required:     name => `${name} es obligatorio.`,
  success:      'Se abrirá tu aplicación de correo para enviar el mensaje. Te responderé en 24–48 horas.',
  subject:      (nombre, tipo) => `Consulta de ${nombre}${tipo ? ` — ${tipo}` : ''}`,
  body:         (nombre, email, tipo, mensaje) =>
    `Nombre: ${nombre}\nEmail: ${email}\nNaturaleza del encargo: ${tipo}\n\n${mensaje}`,
};

// Pre-fill obra from URL param
const params = new URLSearchParams(window.location.search);
const obra   = params.get('obra');
if (obra) {
  const notice = document.getElementById('obra-notice');
  if (notice) {
    notice.textContent = t.obraNotice(obra);
    notice.classList.add('show');
  }
  const msg = document.getElementById('mensaje');
  if (msg && !msg.value) msg.value = t.obraMessage(obra);
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
        const msg   = t.required(name);
        if (err) err.textContent = msg;
        errors.push(msg);
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
      return;
    }

    errBox.classList.remove('show');

    const nombreVal  = document.getElementById('nombre').value.trim();
    const emailVal   = document.getElementById('email').value.trim();
    const tipoVal    = document.getElementById('tipo')?.value || '';
    const mensajeVal = document.getElementById('mensaje').value.trim();

    const subject = encodeURIComponent(t.subject(nombreVal, tipoVal));
    const body    = encodeURIComponent(t.body(nombreVal, emailVal, tipoVal, mensajeVal));
    window.location.href = `mailto:daniela@danielacavestany.com?subject=${subject}&body=${body}`;

    document.getElementById('form-status').textContent = t.success;
    form.reset();
  });
}
