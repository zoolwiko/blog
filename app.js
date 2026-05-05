/**
 * Field Notes — app.js
 *
 * Handles:
 *  - Page navigation (goPage)
 *  - Sidebar collapse toggles (toggleNav)
 *  - Dark / light theme (toggleTheme)
 *  - Right-hand TOC rendering
 *
 * ─────────────────────────────────────────
 * ADDING A NEW SESSION
 * ─────────────────────────────────────────
 * 1. Add a TOC entry to the `tocs` object below (key = page id).
 * 2. Add the page id to the `lessons` array.
 * 3. Add the nav link in index.html inside the relevant topic's .nav-sub.
 * 4. Add the <article> block in index.html.
 * 5. Add a session row to the topic group on the home page.
 *
 * ADDING A NEW TOPIC
 * ─────────────────────────────────────────
 * 1. Add a new nav collapse block in index.html (copy the "Learning LLMs" pattern).
 * 2. Add a new topic group card on the home page.
 * 3. Add session articles and TOC entries as above.
 */

// ── TOC definitions ──────────────────────────────────────────────────────────
// Each key is a page id matching the <article id="page-{id}"> in index.html.
// Add an entry here for every lesson page that should show a right-hand TOC.

const tocs = {
  l0: [
    { id: 'l0-s1', label: 'Chatbot vs Agent' },
    { id: 'l0-s2', label: 'The Agent Loop' },
    { id: 'l0-s3', label: 'Context = Reality' },
    { id: 'l0-s4', label: 'Agent Spectrum' },
  ],
  l1: [
    { id: 'l1-s1', label: 'What is Context?' },
    { id: 'l1-s2', label: 'Context Payload' },
    { id: 'l1-s3', label: 'System Prompt' },
    { id: 'l1-s4', label: 'Management Strategies' },
    { id: 'l1-s5', label: 'Performance & Design' },
  ],
  l2: [
    { id: 'l2-s1', label: 'The Core Problem' },
    { id: 'l2-s2', label: 'RAG Pipeline' },
    { id: 'l2-s3', label: 'Vector Embeddings' },
    { id: 'l2-s4', label: 'Two Approaches' },
    { id: 'l2-s5', label: 'Vector DB Design' },
  ],
  // Add new lesson TOCs here, e.g.:
  // l3: [
  //   { id: 'l3-s1', label: 'First section' },
  // ],
};

// ── Lesson page ids (determines which layout wrapper to show) ────────────────
// Add new session ids here when creating new lessons.
// Basics: l0–l6 · Intermediate: l7–l12 · Advanced: l13–l20 · Open Source: l21–l27
const lessons = [
  'l0', 'l1', 'l2', 'l3', 'l4', 'l5', 'l6',
  'l7', 'l8', 'l9', 'l10', 'l11', 'l12',
  'l13', 'l14', 'l15', 'l16', 'l17', 'l18', 'l19', 'l20',
  'l21', 'l22', 'l23', 'l24', 'l25', 'l26', 'l27',
];

// ── Layout wrapper ids ────────────────────────────────────────────────────────
// Maps a page id to the wrapping div that contains it.
// Full-width pages (home) use 'wrap-home'; lesson pages share 'wrap-lessons'.
const wrapMap = {
  home: 'wrap-home',
  // Add future full-width pages here if needed
};

lessons.forEach(id => { wrapMap[id] = 'wrap-lessons'; });

// ── Navigation ────────────────────────────────────────────────────────────────

function goPage(id) {
  // Hide all layout wrappers
  document.querySelectorAll('[data-wrap]').forEach(el => {
    el.style.display = 'none';
  });

  // Show the correct wrapper
  const wrapId = wrapMap[id] || 'wrap-home';
  const wrap = document.getElementById(wrapId);
  if (wrap) wrap.style.display = '';

  // Deactivate all pages, activate the target
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + id);
  if (page) page.classList.add('active');

  // Update sidebar active state
  document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
  const navEl = document.getElementById('nav-' + id);
  if (navEl) navEl.classList.add('active');

  // Render TOC for lesson pages and wire up the scroll-spy
  const tocLinks = document.getElementById('toc-links');
  if (tocLinks) {
    const entries = tocs[id] || [];
    tocLinks.innerHTML = entries.map(t =>
      `<a class="toc-a" data-target="${t.id}" onclick="smoothTo('${t.id}')">${t.label}</a>`
    ).join('');
    setupTocObserver(entries.map(t => t.id));
  }

  // Close mobile drawer if open
  document.body.classList.remove('sidenav-open');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Active-section TOC (scroll-spy) ──────────────────────────────────────────

let tocObserver = null;

function setupTocObserver(ids) {
  if (tocObserver) { tocObserver.disconnect(); tocObserver = null; }
  if (!ids || !ids.length) return;

  tocObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (!visible.length) return;
    const activeId = visible[0].target.id;
    document.querySelectorAll('.toc-a').forEach(a => a.classList.remove('active'));
    const link = document.querySelector('.toc-a[data-target="' + activeId + '"]');
    if (link) link.classList.add('active');
  }, {
    // Activate a heading once it crosses ~80px below the viewport top;
    // deactivate when it's scrolled more than 60% up the viewport.
    rootMargin: '-80px 0px -60% 0px',
    threshold: 0,
  });

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) tocObserver.observe(el);
  });
}

// ── Mobile sidenav drawer ─────────────────────────────────────────────────────

function toggleSidenav() {
  document.body.classList.toggle('sidenav-open');
}

// ── Smooth scroll to heading ──────────────────────────────────────────────────

function smoothTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Sidebar collapse toggle ───────────────────────────────────────────────────

function toggleNav(id) {
  const el  = document.getElementById('nav-' + id);
  const chv = document.getElementById('chv-' + id);
  if (!el || !chv) return;

  const isOpen = chv.classList.contains('open');

  if (isOpen) {
    el.style.maxHeight = el.scrollHeight + 'px';
    requestAnimationFrame(() => {
      el.style.maxHeight = '0';
      el.style.overflow  = 'hidden';
    });
    chv.classList.remove('open');
  } else {
    el.style.overflow  = '';
    el.style.maxHeight = el.scrollHeight + 'px';
    chv.classList.add('open');
    setTimeout(() => { el.style.maxHeight = ''; }, 300);
  }
}

// ── Theme toggle ──────────────────────────────────────────────────────────────
// The inline script in <head> sets data-theme from localStorage / OS preference
// before first paint. This pair keeps the button UI in sync and persists toggles.

function syncThemeUI() {
  // Icon swap is CSS-driven via [data-theme] selectors; only the label needs updating here.
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const label = document.getElementById('theme-label');
  if (label) label.textContent = isDark ? 'Light mode' : 'Dark mode';
}

function toggleTheme() {
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
  syncThemeUI();
}

// ── Skill expand (Socratic tutor prompt) ─────────────────────────────────────

function toggleSkill() {
  const body = document.getElementById('skill-body');
  const chv  = document.getElementById('skill-chv');
  const btn  = document.querySelector('.skill-expand-toggle');
  const open = !body.hidden;
  body.hidden = open;
  chv.classList.toggle('open', !open);
  btn.setAttribute('aria-expanded', String(!open));
}

function copySkillPrompt(btn) {
  const text = document.getElementById('skill-prompt-text').textContent;
  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    btn.querySelector('span').textContent = 'Copied!';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.querySelector('span').textContent = 'Copy';
    }, 2000);
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────

syncThemeUI();
goPage('home');
