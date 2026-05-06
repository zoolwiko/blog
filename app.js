/**
 * Field Notes — app.js
 *
 * Handles:
 *  - Page navigation (goPage)
 *  - Sidebar collapse toggles (toggleNav)
 *  - Dark / light theme (toggleTheme)
 *  - Right-hand TOC rendering (auto-derived from .body h2[id] elements)
 *
 * Content is generated at build time from .md files in lessons_notes/ and
 * future_lessons/ — see build.js and src/template.html.
 *
 * ADDING A NEW SESSION
 * ─────────────────────────────────────────
 * 1. Add a .md file to lessons_notes/ (completed) or future_lessons/ (planned).
 * 2. Add the lesson entry to the LESSONS registry in build.js.
 * 3. Add the nav link in src/template.html inside the relevant .nav-sub.
 * 4. Add a session row to the topic group on the home page in src/template.html.
 * 5. Run: node build.js
 */

// ── Layout wrapper ids ────────────────────────────────────────────────────────
// Derived from the DOM at init time so build.js doesn't need to keep this in sync.
const wrapMap = { home: 'wrap-home' };

function buildWrapMap() {
  document.querySelectorAll('[data-wrap] .page[id]').forEach(page => {
    const id   = page.id.replace('page-', '');
    const wrap = page.closest('[data-wrap]');
    if (wrap) wrapMap[id] = wrap.id;
  });
}

// ── Navigation ────────────────────────────────────────────────────────────────

function goPage(id, pushState = true) {
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

  // Auto-build TOC from h2 elements in the active article
  const tocLinks = document.getElementById('toc-links');
  if (tocLinks) {
    const entries = page
      ? [...page.querySelectorAll('.body h2[id]')].map(h => ({ id: h.id, label: h.textContent.trim() }))
      : [];
    tocLinks.innerHTML = entries.map(t =>
      `<a class="toc-a" data-target="${t.id}" onclick="smoothTo('${t.id}')">${t.label}</a>`
    ).join('');
    setupTocObserver(entries.map(t => t.id));
  }

  // Close mobile drawer if open
  document.body.classList.remove('sidenav-open');

  // Render mermaid diagrams now that the page is visible (startOnLoad:false avoids
  // rendering into hidden elements which produces black/empty SVGs)
  if (page && typeof mermaid !== 'undefined') {
    const unrendered = [...page.querySelectorAll('.mermaid:not([data-processed])')];
    if (unrendered.length) mermaid.run({ nodes: unrendered });
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update URL so the page can be shared / bookmarked
  if (pushState) {
    const hash = id === 'home' ? '' : '#' + id;
    history.pushState({ page: id }, '', location.pathname + hash);
  }
}

// Sync page state when the user navigates with browser back/forward
window.addEventListener('popstate', () => {
  const id = location.hash.slice(1) || 'home';
  goPage(wrapMap[id] !== undefined ? id : 'home', false);
});

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

buildWrapMap();
syncThemeUI();
const initialPage = location.hash.slice(1) || 'home';
goPage(wrapMap[initialPage] !== undefined ? initialPage : 'home', false);
