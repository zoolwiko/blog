'use strict';
const fs   = require('fs');
const path = require('path');
const { Marked, Renderer } = require('marked');

const ROOT = __dirname;

// ── Lesson registry ───────────────────────────────────────────────────────────
// Defines the canonical lesson order, metadata, and which .md file to read.
// completed lessons  → lessons_notes/  (full markdown notes)
// planned lessons    → future_lessons/ (one-paragraph description)

const LESSONS = [
  // ── Basics ──────────────────────────────────────────────────────────────────
  {
    id: 'l0', journey: 'basics',
    session: '01', readTime: '5 min', tags: ['agents', 'loop'],
    title: 'Agent Fundamentals',
    titleHtml: 'Agent<br><em>Fundamentals</em>',
    lede: 'What agents actually are, how the loop works, and why the LLM is just a passenger.',
    file: 'lessons_notes/agent_fundamentals.md',
  },
  {
    id: 'l1', journey: 'basics',
    session: '02', readTime: '7 min', tags: ['context', 'memory'],
    title: 'Context & Context Window',
    titleHtml: 'Context &amp;<br><em>Context Window</em>',
    lede: 'What context is, how it\'s structured, and the strategies agents use to manage a finite resource.',
    file: 'lessons_notes/context_and_context_window.md',
  },
  {
    id: 'l2', journey: 'basics',
    session: '03', readTime: '8 min', tags: ['RAG', 'embeddings'],
    title: 'RAG & Agent Memory',
    titleHtml: 'RAG &amp;<br><em>Agent Memory</em>',
    lede: 'How agents persist and retrieve knowledge across sessions — and how retrieval actually works under the hood.',
    file: 'lessons_notes/rag_and_memory.md',
  },
  {
    id: 'l3', journey: 'basics', planned: true,
    session: '04',
    title: 'Prompt Engineering',
    titleHtml: 'Prompt<br><em>Engineering</em>',
    lede: 'How the system prompt gets written well.',
    file: 'future_lessons/prompt_engineering.md',
  },
  {
    id: 'l4', journey: 'basics', planned: true,
    session: '05',
    title: 'Fine-tuning vs Prompting',
    titleHtml: 'Fine-tuning<br><em>vs Prompting</em>',
    lede: 'When to change the model\'s weights versus write better instructions.',
    file: 'future_lessons/fine_tuning_vs_prompting.md',
  },
  {
    id: 'l5', journey: 'basics', planned: true,
    session: '06',
    title: 'Tokenisation',
    titleHtml: 'Tokens &amp;<br><em>Tokenisation</em>',
    lede: 'How text actually becomes the numbers a model sees.',
    file: 'future_lessons/tokenisation.md',
  },
  {
    id: 'l6', journey: 'basics', planned: true,
    session: '07',
    title: 'Temperature & Sampling',
    titleHtml: 'Temperature<br><em>&amp; Sampling</em>',
    lede: 'What temperature actually does — and when you want determinism versus variety.',
    file: 'future_lessons/temperature_and_sampling.md',
  },

  // ── Intermediate ─────────────────────────────────────────────────────────────
  {
    id: 'l7', journey: 'intermediate', planned: true,
    session: '01',
    title: 'Multi-agent Systems',
    titleHtml: 'Multi-agent<br><em>Systems</em>',
    lede: 'What happens when multiple agents work together.',
    file: 'future_lessons/multi_agent_systems.md',
  },
  {
    id: 'l8', journey: 'intermediate', planned: true,
    session: '02',
    title: 'Evaluation & Testing',
    titleHtml: 'Evaluation<br><em>&amp; Testing</em>',
    lede: 'How do you know if your agent is actually working?',
    file: 'future_lessons/evaluation_and_testing.md',
  },
  {
    id: 'l9', journey: 'intermediate', planned: true,
    session: '03',
    title: 'Tool Calling in Depth',
    titleHtml: 'Tool Calling<br><em>in Depth</em>',
    lede: 'The full mechanics of how tool use actually works in the API.',
    file: 'future_lessons/tool_calling_in_depth.md',
  },
  {
    id: 'l10', journey: 'intermediate', planned: true,
    session: '04',
    title: 'Structured Outputs',
    titleHtml: 'Structured<br><em>Outputs</em>',
    lede: 'Getting the model to return reliable JSON or typed data.',
    file: 'future_lessons/structured_outputs.md',
  },
  {
    id: 'l11', journey: 'intermediate', planned: true,
    session: '05',
    title: 'Long-context Strategies',
    titleHtml: 'Long-context<br><em>Strategies</em>',
    lede: 'Large context windows don\'t mean you can stuff everything in.',
    file: 'future_lessons/long_context_strategies.md',
  },
  {
    id: 'l12', journey: 'intermediate', planned: true,
    session: '06',
    title: 'Guardrails & Validation',
    titleHtml: 'Guardrails<br><em>&amp; Validation</em>',
    lede: 'Keeping LLM systems from producing harmful or off-topic output in production.',
    file: 'future_lessons/guardrails_and_validation.md',
  },

  // ── Advanced ─────────────────────────────────────────────────────────────────
  {
    id: 'l13', journey: 'advanced', planned: true,
    session: '01',
    title: 'How LLMs Are Trained',
    titleHtml: 'How LLMs<br><em>Are Trained</em>',
    lede: 'Pre-training, SFT, RLHF, DPO — what each stage shapes and why it matters.',
    file: 'future_lessons/how_llms_are_trained.md',
  },
  {
    id: 'l14', journey: 'advanced', planned: true,
    session: '02',
    title: 'Attention & Transformers',
    titleHtml: 'Attention &amp;<br><em>Transformers</em>',
    lede: 'How the transformer architecture actually works — beyond "predicts the next token".',
    file: 'future_lessons/attention_and_transformers.md',
  },
  {
    id: 'l15', journey: 'advanced', planned: true,
    session: '03',
    title: 'Embeddings in Depth',
    titleHtml: 'Embeddings<br><em>in Depth</em>',
    lede: 'Beyond the RAG intuition — how embedding models are actually built.',
    file: 'future_lessons/embeddings_in_depth.md',
  },
  {
    id: 'l16', journey: 'advanced', planned: true,
    session: '04',
    title: 'Safety & Alignment',
    titleHtml: 'Safety &amp;<br><em>Alignment</em>',
    lede: 'What alignment actually means and why it\'s hard.',
    file: 'future_lessons/safety_and_alignment.md',
  },
  {
    id: 'l17', journey: 'advanced', planned: true,
    session: '05',
    title: 'Interpretability',
    titleHtml: 'Interpretability<br><em>&amp; Mechanisms</em>',
    lede: 'What\'s actually happening inside a model when it produces output?',
    file: 'future_lessons/interpretability.md',
  },
  {
    id: 'l18', journey: 'advanced', planned: true,
    session: '06',
    title: 'Inference Optimisation',
    titleHtml: 'Inference<br><em>Optimisation</em>',
    lede: 'How models are made fast and cheap enough to run at scale.',
    file: 'future_lessons/inference_optimisation.md',
  },
  {
    id: 'l19', journey: 'advanced', planned: true,
    session: '07',
    title: 'Multimodal Models',
    titleHtml: 'Multimodal<br><em>Models</em>',
    lede: 'How vision, audio and other modalities get incorporated alongside text.',
    file: 'future_lessons/multimodal_models.md',
  },
  {
    id: 'l20', journey: 'advanced', planned: true,
    session: '08',
    title: 'Agents in Production',
    titleHtml: 'Agents in<br><em>Production</em>',
    lede: 'The gap between a working prototype and a reliable production system.',
    file: 'future_lessons/agents_in_production.md',
  },

  // ── Open Source ───────────────────────────────────────────────────────────────
  {
    id: 'l21', journey: 'open-source', planned: true,
    session: '01',
    title: 'OSS Model Landscape',
    titleHtml: 'Open Source<br><em>Model Landscape</em>',
    lede: 'Llama, Mistral, Gemma, Qwen, Phi — and where each one sits.',
    file: 'future_lessons/oss_model_landscape.md',
  },
  {
    id: 'l22', journey: 'open-source', planned: true,
    session: '02',
    title: 'Running Models Locally',
    titleHtml: 'Running Models<br><em>Locally</em>',
    lede: 'What\'s practical on your own hardware — and what isn\'t.',
    file: 'future_lessons/running_models_locally.md',
  },
  {
    id: 'l23', journey: 'open-source', planned: true,
    session: '03',
    title: 'Hugging Face Ecosystem',
    titleHtml: 'Hugging Face<br><em>Ecosystem</em>',
    lede: 'The central hub for open source models, datasets, and tooling.',
    file: 'future_lessons/hugging_face_ecosystem.md',
  },
  {
    id: 'l24', journey: 'open-source', planned: true,
    session: '04',
    title: 'OSS Agent Frameworks',
    titleHtml: 'Open Source<br><em>Agent Frameworks</em>',
    lede: 'LangChain, LlamaIndex, CrewAI, AutoGen — where they help, where they don\'t.',
    file: 'future_lessons/oss_agent_frameworks.md',
  },
  {
    id: 'l25', journey: 'open-source', planned: true,
    session: '05',
    title: 'Self-hosted vs API',
    titleHtml: 'Self-hosted<br><em>vs. API</em>',
    lede: 'When it makes sense to move from a managed API to running your own model.',
    file: 'future_lessons/self_hosted_vs_api.md',
  },
  {
    id: 'l26', journey: 'open-source', planned: true,
    session: '06',
    title: 'OSS Embedding Models',
    titleHtml: 'Open Source<br><em>Embeddings</em>',
    lede: 'Alternatives to closed embedding APIs — and when they match or beat them.',
    file: 'future_lessons/oss_embedding_models.md',
  },
  {
    id: 'l27', journey: 'open-source', planned: true,
    session: '07',
    title: 'Vector Databases',
    titleHtml: 'Vector<br><em>Databases</em>',
    lede: 'A practical comparison — Chroma, Pinecone, Weaviate, Qdrant, pgvector.',
    file: 'future_lessons/vector_databases.md',
  },
];

const JOURNEY_META = {
  'basics':        { label: 'Basics',        badge: 'Learning LLMs' },
  'intermediate':  { label: 'Intermediate',  badge: 'Intermediate'  },
  'advanced':      { label: 'Advanced',      badge: 'Advanced'      },
  'open-source':   { label: 'Open Source',   badge: 'Open Source'   },
};

// ── Markdown renderer ─────────────────────────────────────────────────────────

const CHIP_ROLES = new Set(['n', 'a', 'b', 'g']);
const CARD_VARIANTS = new Set(['al', 'al2', 'al3', 'at', 'bt', 'gt']);
const CALLOUT_VARIANTS = new Set(['amber', 'blue', 'red']);

// Split the body of a custom block into `rows | ---marker | footer` sections.
// Returns { rows: string[], footer: string | null }.
function splitOnSeparator(body) {
  const lines = body.split('\n').map(l => l.trimEnd()).filter(l => l.length > 0);
  const sep = lines.findIndex(l => /^-{3,}$/.test(l.trim()));
  if (sep === -1) return { rows: lines, footer: null };
  return {
    rows: lines.slice(0, sep),
    footer: lines.slice(sep + 1).join(' ').trim() || null,
  };
}

function renderFlow(body, inline) {
  const { rows, footer } = splitOnSeparator(body);
  const rowHtml = rows.map(row => {
    const pipeIdx = row.indexOf('|');
    const label = pipeIdx === -1 ? '' : row.slice(0, pipeIdx).trim();
    const chain = pipeIdx === -1 ? row : row.slice(pipeIdx + 1);
    const parts = chain.split('>').map(p => p.trim()).filter(Boolean);
    const chips = parts.map(part => {
      const m = part.match(/^\[([nabg])\]\s*(.*)$/);
      const role = m ? m[1] : 'n';
      const text = m ? m[2] : part;
      return `<span class="chip ${role}">${inline(text)}</span>`;
    }).join('<span class="farrow">→</span>');
    const lbl = label ? `<span class="flow-lbl">${inline(label)}</span>` : '';
    return `            <div class="flow-row">${lbl}${chips}</div>`;
  }).join('\n');
  const note = footer ? `\n            <div class="flow-note">${inline(footer)}</div>` : '';
  return `\n          <div class="flow-block">\n${rowHtml}${note}\n          </div>\n`;
}

function renderSteps(body, inline) {
  const lines = body.split('\n').map(l => l.trim()).filter(Boolean);
  const items = lines.map(line => {
    const [num, title, ...rest] = line.split('|').map(p => p.trim());
    const desc = rest.join('|').trim();
    return `            <div class="step"><span class="step-n">${num || ''}</span><div><div class="step-title">${inline(title || '')}</div><div class="step-desc">${inline(desc)}</div></div></div>`;
  }).join('\n');
  return `\n          <div class="steps">\n${items}\n          </div>\n`;
}

function renderSpectrum(body, inline) {
  const { rows, footer } = splitOnSeparator(body);
  const cells = rows.map(row => {
    const [heading, example, inv] = row.split('|').map(p => p.trim());
    return `              <div class="spec-cell"><h5>${inline(heading || '')}</h5><div class="spec-ex">${inline(example || '')}</div><div class="spec-inv">${inline(inv || '')}</div></div>`;
  }).join('\n');
  let axisHtml = '';
  if (footer) {
    const [left, right] = footer.split('|').map(p => p.trim());
    axisHtml = `\n            <div class="spec-footer"><span>${inline(left || '')}</span><span>${inline(right || '')}</span></div>`;
  }
  return `\n          <div class="spectrum">\n            <div class="spec-cells">\n${cells}\n            </div>${axisHtml}\n          </div>\n`;
}

function renderCallout(variant, body, inline) {
  const v = CALLOUT_VARIANTS.has(variant) ? variant : 'amber';
  return `\n          <div class="callout ${v}">${inline(body.trim())}</div>\n`;
}

function renderCards(args, body, inline) {
  const gridCls = args.includes('three') ? 'card-grid three' : 'card-grid';
  const lines = body.split('\n').map(l => l.trim()).filter(Boolean);
  const items = lines.map(line => {
    const m = line.match(/^\[(\w+)\]\s*(.*)$/);
    const variant = m && CARD_VARIANTS.has(m[1]) ? m[1] : 'at';
    const rest = m ? m[2] : line;
    const pipeIdx = rest.indexOf('|');
    const title = pipeIdx === -1 ? rest.trim() : rest.slice(0, pipeIdx).trim();
    const bodyText = pipeIdx === -1 ? '' : rest.slice(pipeIdx + 1).trim();
    return `            <div class="card ${variant}"><h4>${inline(title)}</h4><p>${inline(bodyText)}</p></div>`;
  }).join('\n');
  return `\n          <div class="${gridCls}">\n${items}\n          </div>\n`;
}

function renderCustomBlock(type, args, body, inline) {
  switch (type) {
    case 'flow':     return renderFlow(body, inline);
    case 'steps':    return renderSteps(body, inline);
    case 'spectrum': return renderSpectrum(body, inline);
    case 'callout':  return renderCallout(args[0], body, inline);
    case 'cards':    return renderCards(args, body, inline);
    default:         return null;
  }
}

function buildMarkedInstance(lessonId) {
  let sectionCount = 0;
  const renderer = new Renderer();
  // Forward declaration: the instance is assigned below so helpers can close over it.
  let instance;
  const inline = (text) => instance.parseInline(text || '');

  renderer.heading = (text, level) => {
    if (level === 2) {
      sectionCount++;
      const id = `${lessonId}-s${sectionCount}`;
      const plain = String(text).replace(/<[^>]+>/g, '').trim();
      const cls = plain === 'Key Takeaways' ? ' class="takeaways-hd"' : '';
      return `<h2 id="${id}"${cls}>${text}</h2>\n`;
    }
    return `<h${level}>${text}</h${level}>\n`;
  };

  // Tables → reuse the existing .styled-table CSS
  renderer.table = (header, body) =>
    `<table class="styled-table">\n<thead>\n${header}</thead>\n<tbody>\n${body}</tbody>\n</table>\n`;

  // Blockquotes → reuse the existing .pull CSS
  renderer.blockquote = (quote) =>
    `<blockquote class="pull">${quote}</blockquote>\n`;

  // Fenced code dispatch:
  //   mermaid       → <div class="mermaid"> for the CDN
  //   flow/steps/…  → magazine-style custom components (see renderCustomBlock)
  //   anything else → plain <pre class="code-block">
  renderer.code = (code, lang) => {
    if (lang === 'mermaid') {
      return `<div class="mermaid">${code}</div>\n`;
    }
    const [blockType, ...args] = (lang || '').trim().split(/\s+/);
    const custom = renderCustomBlock(blockType, args, code, inline);
    if (custom !== null) return custom;
    return `<pre class="code-block"><code${lang ? ` class="language-${lang}"` : ''}>${code}</code></pre>\n`;
  };

  instance = new Marked({ renderer });
  return instance;
}

function renderMarkdown(md, lessonId) {
  const instance = buildMarkedInstance(lessonId);
  return instance.parse(md);
}

// ── HTML generation helpers ───────────────────────────────────────────────────

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function progressDots(journeyLessons, currentId) {
  return journeyLessons
    .map(l => `<div class="dot${l.id === currentId ? ' on' : ''}"></div>`)
    .join('');
}

function navBtn(lesson, dir) {
  if (!lesson) {
    return `<button class="nav-btn ghost"><div class="btn-dir">${dir === 'prev' ? '← Prev' : 'Next →'}</div><div>—</div></button>`;
  }
  const label = dir === 'prev' ? '← Prev' : 'Next →';
  return `<button class="nav-btn" onclick="goPage('${lesson.id}')"><div class="btn-dir">${label}</div><div>${esc(lesson.title)}</div></button>`;
}

function articleHero(lesson) {
  const jm = JOURNEY_META[lesson.journey];
  const badgeText = lesson.planned
    ? `${jm.label} · Session ${lesson.session}`
    : `Session ${lesson.session} · ${jm.badge}`;
  const pill = lesson.planned
    ? `<span class="planned-pill">Planned</span>`
    : `<span class="read-time">${lesson.readTime} read</span>`;

  return `
          <div class="article-hero" data-session="${lesson.session}">
            <div class="art-kicker">
              <span class="session-badge">${badgeText}</span>
              ${pill}
            </div>
            <h1 class="art-h1">${lesson.titleHtml}</h1>
            <p class="art-lede">${lesson.lede}</p>
          </div>`;
}

function articleBody(lesson, md) {
  if (lesson.planned) {
    const desc = md.trim();
    return `
          <div class="body">
            <div class="planned-block">
              <div class="planned-title">Not started yet</div>
              <p class="planned-desc">${esc(desc)}</p>
              <p class="planned-hint">This session will be published once the topic is worked through with the Socratic tutor.</p>
            </div>
          </div>`;
  }

  // Strip the H1 title line from the md (build supplies its own hero h1)
  const withoutTitle = md.replace(/^#\s+.+\n/, '');
  const html = renderMarkdown(withoutTitle, lesson.id);
  return `\n          <div class="body">\n${html}\n          </div>`;
}

function articleBottomNav(lesson, prev, next, journeyLessons) {
  return `
          <div class="bottom-nav">
            ${navBtn(prev, 'prev')}
            <div class="progress">${progressDots(journeyLessons, lesson.id)}</div>
            ${navBtn(next, 'next')}
          </div>`;
}

// ── Build ─────────────────────────────────────────────────────────────────────

function build() {
  const templatePath = path.join(ROOT, 'src', 'template.html');
  const outputPath   = path.join(ROOT, 'index.html');

  if (!fs.existsSync(templatePath)) {
    console.error('Error: src/template.html not found. Create it first.');
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, 'utf8');

  // Group lessons by journey for progress-dot generation
  const byJourney = {};
  LESSONS.forEach(l => {
    (byJourney[l.journey] = byJourney[l.journey] || []).push(l);
  });

  let articlesHtml = '';

  LESSONS.forEach((lesson, i) => {
    const filePath = path.join(ROOT, lesson.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: ${lesson.file} not found — skipping ${lesson.id}`);
      return;
    }

    const md   = fs.readFileSync(filePath, 'utf8');
    const prev = LESSONS[i - 1] || null;
    const next = LESSONS[i + 1] || null;
    const journeyLessons = byJourney[lesson.journey];

    articlesHtml += `
        <!-- ══ ${lesson.title} ══ -->
        <article class="page" id="page-${lesson.id}">
          ${articleHero(lesson)}
          ${articleBody(lesson, md)}
          ${articleBottomNav(lesson, prev, next, journeyLessons)}
        </article>\n`;
  });

  const output = template.replace('<!-- ARTICLES_PLACEHOLDER -->', articlesHtml);

  fs.writeFileSync(outputPath, output, 'utf8');
  console.log(`Built index.html (${LESSONS.length} lessons)`);
}

build();
