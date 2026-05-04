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
const lessons = ['l0', 'l1', 'l2'];

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

  // Render TOC for lesson pages
  const tocLinks = document.getElementById('toc-links');
  if (tocLinks) {
    tocLinks.innerHTML = (tocs[id] || []).map(t =>
      `<a class="toc-a" onclick="smoothTo('${t.id}')">${t.label}</a>`
    ).join('');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
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

function toggleTheme() {
  const html   = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('theme-icon').textContent  = isDark ? '☽' : '☀';
  document.getElementById('theme-label').textContent = isDark ? 'Dark mode' : 'Light mode';
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

goPage('home');
