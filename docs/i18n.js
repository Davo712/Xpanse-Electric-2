// Shared snippets for the Xpanse Electric landing pages — no React, plain JS.
// Provides:
//   • language switching (HY default, EN toggle, persists in localStorage)
//   • SVG logo + bolt + social icons
//   • <i18n hy="..." en="..."/> helper turns into the right text on load

(function () {
  const STORAGE_KEY = 'xpanse.lang';
  const CONTACT_EMAIL = 'xpanse.electric@gmail.com';

  function buildComposeUrl({ subject = '', body = '' } = {}) {
    const params = new URLSearchParams({
      view: 'cm',
      fs: '1',
      tf: '1',
      to: CONTACT_EMAIL
    });

    if (subject) params.set('su', subject);
    if (body) params.set('body', body);

    return `https://mail.google.com/mail/?${params.toString()}`;
  }

  function openCompose(options) {
    const url = buildComposeUrl(options);
    const popup = window.open(url, '_blank', 'noopener');
    if (!popup) window.location.href = url;
  }

  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || document.body.dataset.lang || 'hy';
  }
  function setLang(lang) {
    document.body.dataset.lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const txt = el.dataset[lang === 'hy' ? 'hy' : 'en'];
      if (txt == null) return;

      if (el instanceof HTMLMetaElement) {
        el.content = txt;
        return;
      }

      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        el.placeholder = txt;
        return;
      }

      el.textContent = txt;
    });
    document.querySelectorAll('.lang-switch button').forEach((b) => {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
  }

  function setupEmailForms() {
    document.querySelectorAll('form[data-email-form]').forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;

        const lang = getLang();
        const formData = new FormData(form);
        const name = String(formData.get('name') || '').trim();
        const contact = String(formData.get('contact') || '').trim();
        const project = String(formData.get('project') || '').trim();

        const subject = lang === 'hy' ? 'Հարցում Xpanse Electric կայքից' : 'Inquiry from Xpanse Electric';
        const lines = lang === 'hy'
          ? [
              `Անուն: ${name}`,
              `Կոնտակտ: ${contact}`,
              '',
              'Նախագիծ:',
              project
            ]
          : [
              `Name: ${name}`,
              `Contact: ${contact}`,
              '',
              'Project:',
              project
            ];

        openCompose({
          subject,
          body: lines.join('\n')
        });
      });
    });
  }

  function setupRevealSections() {
    const sections = Array.from(document.querySelectorAll('.reveal-section'));
    if (!sections.length) return;

    if (!('IntersectionObserver' in window)) {
      sections.forEach((section) => section.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.16,
      rootMargin: '0px 0px -8% 0px'
    });

    sections.forEach((section) => observer.observe(section));
  }

  function setupWorkCarousel() {
    document.querySelectorAll('[data-carousel-target]').forEach((button) => {
      button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-carousel-target');
        const direction = button.getAttribute('data-direction');
        if (!targetId) return;

        const rail = document.getElementById(targetId);
        if (!rail) return;

        const firstCard = rail.querySelector('.work-card');
        const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 260;
        const gap = 18;
        const delta = cardWidth + gap;

        rail.scrollBy({
          left: direction === 'prev' ? -delta : delta,
          behavior: 'smooth'
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setLang(getLang());
    setupEmailForms();
    setupRevealSections();
    setupWorkCarousel();
    document.querySelectorAll('.lang-switch button').forEach((b) => {
      b.addEventListener('click', () => setLang(b.dataset.lang));
    });
  });

  // Convenience export
  window.XP = { setLang, getLang };
})();
