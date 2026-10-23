(() => {

 
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Countdown timer ---------- */
  const eventDate = new Date('2026-11-12T10:00:00+05:30').getTime(); // 12 Nov 2026, 10:00 AM IST
  const ids = ['days', 'hours', 'minutes', 'seconds'];

  function updateCountdown() {
    const distance = Math.max(0, eventDate - Date.now());
    const values = [
      Math.floor(distance / 86400000),
      Math.floor((distance % 86400000) / 3600000),
      Math.floor((distance % 3600000) / 60000),
      Math.floor((distance % 60000) / 1000)
    ];
    ids.forEach((id, index) => {
      const node = document.getElementById(id);
      if (!node) return;
      const next = String(values[index]).padStart(2, '0');
      if (node.textContent !== next) {
        node.textContent = next;
        // Re-trigger the little "bounce" animation whenever a number changes.
        node.classList.remove('flip');
        void node.offsetWidth;            // forces the browser to restart the animation
        node.classList.add('flip');
      }
    });
  }
  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  /* ---------- 2. Theme toggle: remembers the user's choice between visits ---------- */
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
    // Swap the EDC logo for the dark-theme version.
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

  /* ---------- 3. Mobile menu ---------- */
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    });
    // Close the menu after tapping a link.
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation');
    }));
  }

  /* ---------- Confetti helper (used by the form and by the hero click) ---------- */
  function confetti(count = 70) {
    if (reduceMotion) return;
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('i');
      piece.className = 'confetti';
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.background = `hsl(${Math.random() * 360}, 90%, 60%)`;
      piece.style.setProperty('--dx', (Math.random() * 200 - 100) + 'px'); // sideways drift
      piece.style.animationDuration = (1.6 + Math.random() * 2) + 's';
      piece.style.animationDelay = (Math.random() * 0.4) + 's';
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 4200);
    }
  }

  /* ---------- 4. Registration form (front-end demo only) ---------- */
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
      message.textContent = '🎉 You\u2019re in! The demo form is valid. No information has been sent or saved.';
      confetti();   // celebrate!
      form.reset();
    });
    // Clear the message as soon as the user edits a field.
    form.querySelectorAll('input').forEach(input => input.addEventListener('input', () => {
      if (message.textContent) message.textContent = '';
      input.setCustomValidity('');
    }));
  }

  /* ---------- 5. Highlight the nav link of the section currently on screen ---------- */
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

  /* ---------- 6. Scroll-reveal: elements with class "reveal" fade/slide in ---------- */
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('show');
        revealObserver.unobserve(entry.target);   // animate only once
      });
    }, { threshold: 0.15 });
    revealItems.forEach(el => revealObserver.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add('show'));  // very old browsers: just show everything
  }

  /* ---------- 7. Animated counters: numbers count up when scrolled into view ---------- */
  const counters = document.querySelectorAll('[data-count]');
  function runCounter(el) {
    const end = Number(el.dataset.count);
    if (reduceMotion) { el.textContent = end; return; }
    const duration = 1400;
    const start = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);        // starts fast, slows down at the end
      el.textContent = Math.round(end * eased);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(el => counterObserver.observe(el));
  } else {
    counters.forEach(el => { el.textContent = el.dataset.count; });
  }

  /* ---------- 8. 3D tilt: cards lean towards the mouse (mouse devices only) ---------- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
    document.querySelectorAll('.feature-card, .speaker-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 (left) … 0.5 (right)
        const y = (e.clientY - rect.top) / rect.height - 0.5;   // -0.5 (top)  … 0.5 (bottom)
        card.style.setProperty('--ry', (x * 12) + 'deg');
        card.style.setProperty('--rx', (-y * 12) + 'deg');
      });
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- 9. Typing tagline: "Ideas into Action / Startups / Impact / Reality" ---------- */
  const typedEl = document.getElementById('typed');
  if (typedEl && !reduceMotion) {
    const words = ['Action', 'Startups', 'Impact', 'Reality'];
    let wordIndex = 0;
    let charIndex = words[0].length;     // start with the full first word so there is no empty flash
    let deleting = true;                 // ...then begin by deleting it
    function type() {
      const word = words[wordIndex];
      typedEl.textContent = word.slice(0, charIndex);
      if (!deleting && charIndex === word.length) {          // finished typing -> pause, then delete
        deleting = true;
        return setTimeout(type, 1400);
      }
      if (deleting && charIndex === 0) {                     // finished deleting -> next word
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
      }
      charIndex += deleting ? -1 : 1;
      setTimeout(type, deleting ? 55 : 105);
    }
    setTimeout(type, 2200);              // let the first word show for a moment
  }

  /* ---------- 10. Timeline line + scroll progress bar ---------- */
  const timeline = document.querySelector('.timeline');
  const progressBar = document.querySelector('.scroll-progress');
  let ticking = false;
  function onScroll() {
    // Top progress bar: 0 at the top of the page, 1 at the bottom.
    if (progressBar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.setProperty('--scroll', max > 0 ? Math.min(1, window.scrollY / max) : 0);
    }
    // Timeline: the coloured line "draws" down as the section scrolls through the screen.
    if (timeline) {
      const rect = timeline.getBoundingClientRect();
      const progress = (window.innerHeight * 0.7 - rect.top) / rect.height;
      timeline.style.setProperty('--tl', Math.min(1, Math.max(0, progress)));
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }  // limits work to once per frame
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();


  const glow = document.querySelector('.cursor-glow');
  if (glow && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
    window.addEventListener('mousemove', e => {
      glow.classList.add('on');
      glow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    }, { passive: true });
  }

  // Clicking the hero illustration releases emojis (and sometimes confetti).
  const heroArt = document.querySelector('.hero-art');
  if (heroArt && !reduceMotion) {
    const emojis = ['💡', '🚀', '✨', '💰', '🎯', '🔥'];
    heroArt.addEventListener('click', e => {
      for (let i = 0; i < 5; i++) {
        const pop = document.createElement('span');
        pop.className = 'emoji-pop';
        pop.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        pop.style.left = (e.clientX + (Math.random() * 80 - 40)) + 'px';
        pop.style.top = (e.clientY + (Math.random() * 40 - 20)) + 'px';
        pop.style.animationDelay = (i * 0.07) + 's';
        document.body.appendChild(pop);
        setTimeout(() => pop.remove(), 1400);
      }
      if (Math.random() < 0.25) confetti(30);   // 1-in-4 clicks also throws confetti
    });
  }
})();
