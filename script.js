(() => {
  /* =====================================================================
     VentureVerse 2026 — script.js
     Sections:
       1. Countdown timer (with bounce on change)
       2. Theme toggle (light / dark, remembered)
       3. Mobile menu
       4. Registration form + confetti
       5. Active nav link while scrolling
       6. Scroll-reveal animations
       7. Animated number counters
       8. 3D tilt on cards
       9. Typing tagline in the hero
      10. Timeline line + scroll progress bar
      11. Mouse glow + click-to-pop emojis
     ===================================================================== */

  // Respect people who prefer less motion (set in their OS settings).
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
  // If the dark logo file is missing, quietly fall back to the light one instead of showing a broken image.
  document.querySelectorAll('.edc-logo').forEach(logo => logo.addEventListener('error', () => {
    if (logo.dataset.lightLogo && logo.getAttribute('src') !== logo.dataset.lightLogo) logo.setAttribute('src', logo.dataset.lightLogo);
  }));
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

  /* ---------- 6 + 7. Scroll-reveal and animated counters ---------- */
  // Tell the page the script is running (index.html checks this flag as a safety net).
  window.__vvReady = true;

  const revealItems = [...document.querySelectorAll('.reveal')];
  const counters = [...document.querySelectorAll('[data-count]')];

  // Counter: counts from 0 up to data-count with an "ease-out" feel.
  function runCounter(el) {
    if (el.dataset.done) return;          // only once
    el.dataset.done = '1';
    const end = Number(el.dataset.count);
    if (reduceMotion) { el.textContent = end; return; }
    const duration = 1400;
    const start = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // Simple check used on scroll/resize/load: anything that is on screen gets revealed.
  // (This works together with the IntersectionObserver below, so content can never stay hidden.)
  function revealVisible() {
    const limit = window.innerHeight * 0.92;
    revealItems.forEach(el => {
      if (!el.classList.contains('show') && el.getBoundingClientRect().top < limit) el.classList.add('show');
    });
    counters.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9 && r.bottom > 0) runCounter(el);
    });
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (entry.target.matches('[data-count]')) runCounter(entry.target);
        else entry.target.classList.add('show');
        io.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    revealItems.forEach(el => io.observe(el));
    counters.forEach(el => io.observe(el));
  }
  window.addEventListener('scroll', revealVisible, { passive: true });
  window.addEventListener('resize', revealVisible);
  window.addEventListener('load', revealVisible);
  setTimeout(revealVisible, 300);
  setTimeout(revealVisible, 1200);
  revealVisible();

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

  /* ---------- 11. Mouse glow + click-to-pop emojis ---------- */
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

  /* ---------- 12. Fun quiz: "Which Founder Are You?" ----------
     Every answer gives one point to a founder type (V, B, C or S).
     At the end, the type with the most points wins. */
  const quizBody = document.querySelector('#quiz-body');
  if (quizBody) {
    // The four possible results
    const types = {
      V: { emoji: '🚀', title: 'The Visionary',
           text: 'You see what doesn\u2019t exist yet and get everyone excited about it. Big ideas are your fuel \u2014 just remember to turn them into small first steps.',
           session: 'From Idea to Startup', time: '10:20 AM' },
      B: { emoji: '🛠️', title: 'The Builder',
           text: 'Talk is cheap, you ship. Give you a weekend and a laptop and something real appears. Startups need people who actually make things.',
           session: 'Campus Idea Sprint', time: '12:00 PM' },
      C: { emoji: '🤝', title: 'The Connector',
           text: 'You know who to call, and people love working with you. Great ventures grow through great relationships \u2014 yours are your superpower.',
           session: 'Networking and Closing', time: '2:15 PM' },
      S: { emoji: '📊', title: 'The Strategist',
           text: 'You think a few moves ahead. Plans, numbers, timing \u2014 you turn chaos into a roadmap and keep the team on track.',
           session: 'Pitching Basics', time: '1:15 PM' }
    };

    // The questions: each option adds a point to one type
    const questions = [
      { text: 'Your friends need a plan for Saturday. You\u2026',
        options: [
          { emoji: '💡', label: 'Pitch a wild new idea nobody has tried', type: 'V' },
          { emoji: '📝', label: 'Sort out timings, budget and logistics', type: 'S' },
          { emoji: '📱', label: 'Text everyone and get the whole gang together', type: 'C' },
          { emoji: '💻', label: 'Quickly build a shared sheet or app for it', type: 'B' } ] },
      { text: 'Pick your startup superpower:',
        options: [
          { emoji: '🔮', label: 'Seeing the future of an industry', type: 'V' },
          { emoji: '⚡', label: 'Building anything in a weekend', type: 'B' },
          { emoji: '🌐', label: 'Knowing the right person for everything', type: 'C' },
          { emoji: '🎯', label: 'Making perfect decisions under pressure', type: 'S' } ] },
      { text: 'In a group project, you are the one who\u2026',
        options: [
          { emoji: '🌈', label: 'Comes up with the big, creative idea', type: 'V' },
          { emoji: '🔧', label: 'Actually makes the thing work', type: 'B' },
          { emoji: '🎤', label: 'Presents it and keeps the team happy', type: 'C' },
          { emoji: '📅', label: 'Plans the timeline and tracks progress', type: 'S' } ] },
      { text: 'You win \u20B91 lakh in funding. First move?',
        options: [
          { emoji: '🌍', label: 'Dream even bigger \u2014 start something bolder', type: 'V' },
          { emoji: '🧪', label: 'Build a working prototype right away', type: 'B' },
          { emoji: '🎉', label: 'Throw a launch event and meet mentors', type: 'C' },
          { emoji: '🔍', label: 'Research the market before spending a rupee', type: 'S' } ] }
    ];

    let current = 0;    // which question we are on
    let answers = [];   // the type picked for each question so far
    let locked = false; // stops double-clicks while the next question loads

    function showQuestion() {
      const q = questions[current];
      locked = false;
      quizBody.innerHTML = `
        <div class="quiz-anim">
          <div class="quiz-progress" role="progressbar" aria-label="Quiz progress" aria-valuemin="0" aria-valuemax="${questions.length}" aria-valuenow="${current}">
            <span style="--p:${(current / questions.length) * 100}%"></span>
          </div>
          <p class="quiz-count">Question ${current + 1} of ${questions.length}</p>
          <h3 class="quiz-question" tabindex="-1">${q.text}</h3>
          <div class="quiz-options">
            ${q.options.map(o => `<button type="button" class="quiz-option" data-type="${o.type}"><span class="opt-emoji" aria-hidden="true">${o.emoji}</span><span>${o.label}</span></button>`).join('')}
          </div>
        </div>`;
      quizBody.querySelector('.quiz-question').focus({ preventScroll: true });
    }

    function showResult() {
      // Count the points for each type
      const score = { V: 0, B: 0, C: 0, S: 0 };
      answers.forEach(t => score[t]++);
      const best = Math.max(...Object.values(score));
      const tied = Object.keys(score).filter(t => score[t] === best);
      // If there is a tie, the answer to the LAST question breaks it
      const winner = tied.includes(answers[answers.length - 1]) ? answers[answers.length - 1] : tied[0];
      const r = types[winner];

      quizBody.innerHTML = `
        <div class="quiz-result quiz-anim" role="status">
          <div class="quiz-progress"><span style="--p:100%"></span></div>
          <div class="result-emoji" aria-hidden="true">${r.emoji}</div>
          <p class="eyebrow">YOU ARE</p>
          <h3 class="result-title" tabindex="-1">${r.title}</h3>
          <p class="result-text">${r.text}</p>
          <p class="quiz-tip">🎟️ Don\u2019t miss: <strong>${r.session}</strong> \u00B7 ${r.time}</p>
          <div class="quiz-actions">
            <a class="button button-dark" href="#register">Register Now <span aria-hidden="true">\u2192</span></a>
            <button class="button button-light" id="quiz-retry" type="button">Retake <span aria-hidden="true">\u21BB</span></button>
          </div>
        </div>`;
      quizBody.querySelector('.result-title').focus({ preventScroll: true });
      confetti(60);
    }

    function startQuiz() { current = 0; answers = []; showQuestion(); }

    // One listener handles every button inside the quiz card (start, answers, retake)
    quizBody.addEventListener('click', e => {
      const option = e.target.closest('.quiz-option');
      if (option && !locked) {
        locked = true;
        option.classList.add('picked');
        quizBody.querySelectorAll('.quiz-option').forEach(b => { b.disabled = true; });
        answers.push(option.dataset.type);
        setTimeout(() => {                       // short pause so the picked answer is visible
          current++;
          if (current < questions.length) showQuestion(); else showResult();
        }, 450);
        return;
      }
      if (e.target.closest('#quiz-start') || e.target.closest('#quiz-retry')) startQuiz();
    });
  }
})();
