# Field Notes — Marcin's Learning Journey

A personal site documenting learning different topics through Socratic dialogue with AI. Each topic contains sessions with notes, diagrams, and key takeaways built from real tutoring conversations.

## Structure

```
field-notes/
├── index.html      ← All content and page structure
├── styles.css      ← All styles and theme tokens (dark/light)
├── app.js          ← Navigation, TOC, theme toggle logic
└── README.md       ← This file
```

No build step. No dependencies. Deploy as a static site.

---

## Deploying

### Netlify (recommended)
1. Push this repo to GitHub
2. Go to [netlify.com](https://netlify.com) → Add new site → Import from Git
3. Select your repo — Netlify auto-detects it as a static site
4. Every push to `main` redeploys automatically

### Vercel
1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import
3. Same — auto-detected, auto-deployed on push

---

## Adding a New Session

### 1. Add the TOC entry in `app.js`

```js
const tocs = {
  // ... existing entries ...
  l3: [
    { id: 'l3-s1', label: 'First section title' },
    { id: 'l3-s2', label: 'Second section title' },
  ],
};
```

### 2. Add the session id to the `lessons` array in `app.js`

```js
const lessons = ['l0', 'l1', 'l2', 'l3'];
```

### 3. Add a nav link in `index.html` (inside the topic's `.nav-sub`)

```html
<div class="nav-link" onclick="goPage('l3')" id="nav-l3">
  <span class="sdot"></span> 04 — Your Session Title
</div>
```

### 4. Add a session row to the topic group on the home page

```html
<div class="session-row" onclick="goPage('l3')">
  <span class="sr-num">Session 04</span>
  <span class="sr-title">Your Session Title</span>
  <span class="sr-time">X min</span>
  <div class="sr-tags"><span class="stag">tag1</span></div>
</div>
```

### 5. Add the `<article>` block in `index.html`

Copy an existing `<article class="page" id="page-lN">` block and update:
- `id="page-l3"`
- Session badge text
- `h1` title and lede
- All `h2` ids to `l3-s1`, `l3-s2`, etc.
- Bottom nav prev/next buttons
- Update the previous session's "Next →" button to point to `l3`

---

## Adding a New Topic

1. Add a new collapse block in the sidebar (copy the "Learning LLMs" pattern)
2. Add a new topic group card on the home page
3. Add sessions as described above

---

## Theming

All colours are CSS custom properties defined at the top of `styles.css`.
Dark mode is the default (`data-theme="dark"` on `<html>`).
Switching themes swaps the token set — no JS colour logic needed.
