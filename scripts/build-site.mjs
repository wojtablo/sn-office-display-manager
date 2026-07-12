/**
 * build-site.mjs — render docs/*.md into a multi-page static site with a sidebar.
 *
 * Input : docs/*.md  (documentations.md + tests.md are generated; others, e.g.
 *         runbook.md, are authored — any .md dropped in docs/ becomes a page)
 * Output: site/*.html  (deployed to GitHub Pages by .github/workflows/pages.yml)
 *
 * The Markdown is the single source of truth; this only wraps it in a styled,
 * theme-aware shell and builds a left-hand navigation shared across pages.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const docsDir = join(root, 'docs')
const outDir = join(root, 'site')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

// Nav order: known pages first (in this order), everything else alphabetical.
const ORDER = [
    'documentations',
    'data-model',
    'rest-api',
    'access-control',
    'business-logic',
    'user-interface',
    'reference',
    'tests',
    'runbook',
]
// Nav labels; unknown pages fall back to a title-cased filename.
const LABELS = {
    documentations: 'Overview',
    'data-model': 'Data model',
    'rest-api': 'REST API',
    'access-control': 'Access control',
    'business-logic': 'Business logic',
    'user-interface': 'User interface',
    reference: 'Reference',
    tests: 'Tests',
    runbook: 'Runbook',
}

marked.setOptions({ gfm: true, headerIds: true, mangle: false })

const titleCase = (s) => s.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
// documentations is the landing page (index.html); others keep their name.
const outName = (slug) => (slug === 'documentations' ? 'index.html' : `${slug}.html`)

const pages = readdirSync(docsDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => basename(f, '.md'))
    .sort((a, b) => {
        const ia = ORDER.indexOf(a)
        const ib = ORDER.indexOf(b)
        if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
        return a.localeCompare(b)
    })
    .map((slug) => {
        const md = readFileSync(join(docsDir, `${slug}.md`), 'utf8')
        return {
            slug,
            href: outName(slug),
            label: LABELS[slug] || titleCase(slug),
            title: (/^#\s+(.+)$/m.exec(md)?.[1] || titleCase(slug)).trim(),
            md,
        }
    })

function nav(currentHref) {
    const links = pages
        .map((p) => {
            const active = p.href === currentHref ? ' class="active" aria-current="page"' : ''
            return `      <a href="${p.href}"${active}>${escapeHtml(p.label)}</a>`
        })
        .join('\n')
    return `<nav class="sidebar">
    <div class="brand">${escapeHtml(pkg.name)}<span class="ver">v${escapeHtml(pkg.version)}</span></div>
    <div class="links">
${links}
    </div>
  </nav>`
}

/** Slugify heading text into an anchor id (strip inline tags; keep word chars). */
function slugify(inner) {
    return (
        inner
            .replace(/<[^>]+>/g, '')
            .toLowerCase()
            .replace(/[^\w]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'section'
    )
}

/** marked 18 no longer emits heading ids — inject deduped ids for anchoring + TOC. */
function addHeadingIds(html) {
    const seen = Object.create(null)
    return html.replace(/<h([1-3])>([\s\S]*?)<\/h\1>/g, (_m, lvl, inner) => {
        const base = slugify(inner)
        const id = seen[base] === undefined ? ((seen[base] = 0), base) : `${base}-${++seen[base]}`
        return `<h${lvl} id="${id}">${inner}</h${lvl}>`
    })
}

/** Extract h2/h3 (id + text) from rendered HTML for the "On this page" column. */
function tocItems(html) {
    const items = []
    const re = /<h([23])[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g
    let m
    while ((m = re.exec(html))) {
        const text = m[3].replace(/<[^>]+>/g, '').trim()
        if (text) items.push({ level: Number(m[1]), id: m[2], text })
    }
    return items
}

/** Right-hand "On this page" nav — omitted when a page has too few headings. */
function toc(items) {
    if (items.length < 2) return ''
    const links = items
        .map((i) => `      <a href="#${i.id}" class="lvl-${i.level}">${escapeHtml(i.text)}</a>`)
        .join('\n')
    return `<aside class="toc">
    <div class="toc-title">On this page</div>
    <nav class="toc-links">
${links}
    </nav>
  </aside>`
}

// Scroll-spy: highlight the TOC link for the heading currently near the top.
const SCROLLSPY = `
(function () {
  var links = [].slice.call(document.querySelectorAll('.toc-links a'));
  if (!links.length) return;
  var byId = {};
  links.forEach(function (a) { byId[decodeURIComponent(a.getAttribute('href').slice(1))] = a; });
  var current = null;
  function activate(id) {
    var a = byId[id]; if (!a || a === current) return;
    if (current) current.classList.remove('active');
    a.classList.add('active'); current = a;
  }
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) activate(e.target.id); });
  }, { rootMargin: '0px 0px -72% 0px', threshold: 0 });
  links.forEach(function (a) {
    var h = document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
    if (h) obs.observe(h);
  });
})();
`

function renderPage(page) {
    const body = addHeadingIds(
        marked
            .parse(page.md)
            .replace(/<table>/g, '<div class="table-scroll"><table>')
            .replace(/<\/table>/g, '</table></div>')
    )
    const onThisPage = toc(tocItems(body))
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(page.title)}</title>
<style>${CSS}</style>
</head>
<body>
<div class="layout">
  ${nav(page.href)}
  <main class="content">
${body}
    <footer class="site-foot">Generated from source — do not edit these pages directly; update the code and rerun the docs generator.</footer>
  </main>
  ${onThisPage}
</div>
<script>${SCROLLSPY}</script>
</body>
</html>
`
}

const CSS = `
  /* GitHub Light (refined), with an auto dark variant. */
  :root {
    --bg:#ffffff; --fg:#1f2328; --muted:#59636e; --border:#d1d9e0; --accent:#0969da;
    --code-bg:#f6f8fa; --thead-bg:#f6f8fa; --row-alt:#fbfcfd; --side-bg:#f6f8fa;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg:#0d1117; --fg:#e6edf3; --muted:#9198a1; --border:#30363d; --accent:#4493f8;
      --code-bg:#161b22; --thead-bg:#161b22; --row-alt:#11161d; --side-bg:#0b0f14;
    }
  }
  * { box-sizing:border-box; }
  html { scroll-behavior:smooth; }
  body { margin:0; background:var(--bg); color:var(--fg);
    font:16px/1.6 -apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; }

  /* Three columns: page nav · content · on-this-page */
  .layout { display:flex; align-items:flex-start; min-height:100vh; }

  .sidebar {
    position:sticky; top:0; align-self:stretch; flex:0 0 240px; width:240px;
    background:var(--side-bg); border-right:1px solid var(--border);
    padding:1.5rem 1rem; height:100vh; overflow-y:auto;
  }
  .brand { font-weight:700; font-size:1rem; margin-bottom:1.25rem; line-height:1.3; }
  .brand .ver { display:block; font-weight:400; font-size:.8rem; color:var(--muted); margin-top:.2rem; }
  .links { display:flex; flex-direction:column; gap:.15rem; }
  .links a {
    display:block; padding:.4rem .6rem; border-radius:6px; color:var(--fg);
    text-decoration:none; font-size:.95rem;
  }
  .links a:hover { background:var(--border); }
  .links a.active { background:var(--accent); color:#fff; font-weight:600; }

  .content { flex:1 1 auto; min-width:0; max-width:820px; margin:0 auto; padding:2.5rem 2.5rem 5rem; }
  h1,h2,h3 { line-height:1.25; margin:2rem 0 1rem; scroll-margin-top:1.5rem; }
  h1 { font-size:2rem; padding-bottom:.4rem; border-bottom:1px solid var(--border); margin-top:0; }
  h2 { font-size:1.45rem; padding-bottom:.3rem; border-bottom:1px solid var(--border); margin-top:2.6rem; }
  h3 { font-size:1.15rem; }
  a { color:var(--accent); text-decoration:none; }
  a:hover { text-decoration:underline; }
  blockquote { margin:1rem 0; padding:.3rem 1rem; color:var(--muted); border-left:.25rem solid var(--border); }
  code { background:var(--code-bg); border:1px solid var(--border); border-radius:6px; padding:.12em .4em;
    font-size:.88em; font-family:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,monospace; }
  pre code { display:block; padding:1rem; overflow-x:auto; }
  .table-scroll { overflow-x:auto; margin:1rem 0; border:1px solid var(--border); border-radius:8px; }
  table { border-collapse:collapse; width:100%; font-size:.92rem; }
  th,td { text-align:left; padding:.5rem .75rem; border-bottom:1px solid var(--border); vertical-align:top; }
  th { background:var(--thead-bg); font-weight:600; white-space:nowrap; }
  tr:nth-child(even) td { background:var(--row-alt); }
  td code { white-space:nowrap; }
  .site-foot { margin-top:4rem; padding-top:1rem; border-top:1px solid var(--border); color:var(--muted); font-size:.85rem; }

  .toc {
    position:sticky; top:0; align-self:stretch; flex:0 0 220px; width:220px;
    height:100vh; overflow-y:auto; padding:2.75rem 1.25rem 2rem; border-left:1px solid var(--border);
  }
  .toc-title { font-size:.72rem; text-transform:uppercase; letter-spacing:.06em; color:var(--muted);
    font-weight:600; margin-bottom:.7rem; }
  .toc-links { display:flex; flex-direction:column; gap:.05rem; }
  .toc-links a { color:var(--muted); text-decoration:none; font-size:.85rem; line-height:1.35;
    padding:.25rem 0 .25rem .7rem; border-left:2px solid var(--border); }
  .toc-links a.lvl-3 { padding-left:1.5rem; font-size:.8rem; }
  .toc-links a:hover { color:var(--fg); text-decoration:none; }
  .toc-links a.active { color:var(--accent); border-left-color:var(--accent); font-weight:500; }

  /* Below 1024px there isn't room for the right column — drop it. */
  @media (max-width:1024px) { .toc { display:none; } .content { margin:0; } }
  @media (max-width:720px) {
    .layout { flex-direction:column; }
    .sidebar { position:static; height:auto; width:100%; flex-basis:auto;
      border-right:0; border-bottom:1px solid var(--border); }
    .links { flex-direction:row; flex-wrap:wrap; }
    .content { padding:1.5rem 1.25rem 4rem; max-width:100%; }
  }
`

mkdirSync(outDir, { recursive: true })
for (const page of pages) writeFileSync(join(outDir, page.href), renderPage(page))
// .nojekyll: serve the HTML as-is; skip GitHub's Jekyll processing.
writeFileSync(join(outDir, '.nojekyll'), '')

console.log(`build-site: ${pages.length} page(s) → ${pages.map((p) => p.href).join(', ')}`)

function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
