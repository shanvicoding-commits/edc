(() => {
  const eventDate = new Date('2026-11-12T10:00:00+05:30').getTime();
  const ids = ['days', 'hours', 'minutes', 'seconds'];
  function updateCountdown() {
    const distance = Math.max(0, eventDate - Date.now());
    const values = [Math.floor(distance / 86400000), Math.floor((distance % 86400000) / 3600000), Math.floor((distance % 3600000) / 60000), Math.floor((distance % 60000) / 1000)];
    ids.forEach((id, index) => { const node = document.getElementById(id); if (node) node.textContent = String(values[index]).padStart(2, '0'); });
  }
  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  // Theme toggle: remembers the user's choice between visits.
  const themeToggle = document.querySelector('#theme-toggle');
  const themeMeta = document.querySelector('#theme-color-meta');
  const savedTheme = (() => { try { return localStorage.getItem('ventureverse-theme'); } catch (_) { return null; } })();
  function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(isDark));
      themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      const icon = themeToggle.querySelector('.theme-icon');
      const label = themeToggle.querySelector('.theme-label');
      if (icon) icon.textContent = isDark ? '☀' : '☾';
      if (label) label.textContent = isDark ? 'Light' : 'Dark';
    }
    if (themeMeta) themeMeta.setAttribute('content', isDark ? '#111923' : '#f8f6f1');
    document.querySelectorAll('.edc-logo').forEach(logo => {
      const nextLogo = isDark ? logo.dataset.darkLogo : logo.dataset.lightLogo;
      if (nextLogo && logo.getAttribute('src') !== nextLogo) logo.setAttribute('src', nextLogo);
    });
  }
  applyTheme(savedTheme === 'dark' ? 'dark' : 'light');
  if (themeToggle) themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    try { localStorage.setItem('ventureverse-theme', nextTheme); } catch (_) { /* Theme still works for this page view. */ }
  });

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open navigation');
    }));
  }

  const form = document.querySelector('#registration-form');
  const message = document.querySelector('#form-message');
  if (form && message) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      message.classList.remove('error');
      if (!form.checkValidity()) {
        form.reportValidity();
        message.textContent = 'Please check the details above and try again.';
        message.classList.add('error');
        return;
      }
      message.textContent = 'Thanks! The demo form is valid. No information has been sent or saved.';
      form.reset();
    });
    form.querySelectorAll('input').forEach(input => input.addEventListener('input', () => {
      if (message.textContent) message.textContent = '';
      input.setCustomValidity('');
    }));
  }

  const sections = [...document.querySelectorAll('main section[id], main aside[id]')];
  const links = [...document.querySelectorAll('.nav-link')];
  if ('IntersectionObserver' in window && sections.length && links.length) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-25% 0px -65% 0px' });
    sections.forEach(section => observer.observe(section));
  }
})();
