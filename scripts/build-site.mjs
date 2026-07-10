/**
 * build-site.mjs — render DOCUMENTATION.md into a self-contained static site.
 *
 * Input : DOCUMENTATION.md (produced by generate-docs.mjs)
 * Output: site/index.html  (deployed to GitHub Pages by .github/workflows/pages.yml)
 *
 * The docs are the single source of truth; this only wraps the rendered Markdown
 * in a styled, theme-aware, responsive HTML shell. No content is authored here.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const md = readFileSync(join(root, 'DOCUMENTATION.md'), 'utf8')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

const title = (/^#\s+(.+)$/m.exec(md)?.[1] || 'Documentation').trim()

marked.setOptions({ gfm: true, headerIds: true, mangle: false })
// Wrap tables so wide reference tables scroll horizontally instead of overflowing.
const body = marked.parse(md).replace(/<table>/g, '<div class="table-scroll"><table>').replace(/<\/table>/g, '</table></div>')

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
  :root {
    --bg: #ffffff; --fg: #1f2328; --muted: #59636e; --border: #d1d9e0;
    --accent: #0969da; --code-bg: #f6f8fa; --thead-bg: #f6f8fa; --row-alt: #fbfcfd;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0d1117; --fg: #e6edf3; --muted: #9198a1; --border: #30363d;
      --accent: #4493f8; --code-bg: #161b22; --thead-bg: #161b22; --row-alt: #11161d;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--fg);
    font: 16px/1.6 -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  .wrap { max-width: 920px; margin: 0 auto; padding: 2.5rem 1.25rem 5rem; }
  h1, h2, h3 { line-height: 1.25; margin: 2rem 0 1rem; }
  h1 { font-size: 2rem; padding-bottom: .4rem; border-bottom: 1px solid var(--border); }
  h2 { font-size: 1.45rem; padding-bottom: .3rem; border-bottom: 1px solid var(--border); margin-top: 2.6rem; }
  h3 { font-size: 1.15rem; }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
  p, li { color: var(--fg); }
  blockquote {
    margin: 1rem 0; padding: .3rem 1rem; color: var(--muted);
    border-left: .25rem solid var(--border);
  }
  code {
    background: var(--code-bg); border: 1px solid var(--border); border-radius: 6px;
    padding: .12em .4em; font-size: .88em;
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  }
  pre code { display: block; padding: 1rem; overflow-x: auto; }
  .table-scroll { overflow-x: auto; margin: 1rem 0; border: 1px solid var(--border); border-radius: 8px; }
  table { border-collapse: collapse; width: 100%; font-size: .92rem; }
  th, td { text-align: left; padding: .5rem .75rem; border-bottom: 1px solid var(--border); vertical-align: top; }
  th { background: var(--thead-bg); font-weight: 600; white-space: nowrap; }
  tr:nth-child(even) td { background: var(--row-alt); }
  td code { white-space: nowrap; }
  .site-foot { margin-top: 4rem; padding-top: 1rem; border-top: 1px solid var(--border); color: var(--muted); font-size: .85rem; }
</style>
</head>
<body>
<main class="wrap">
${body}
<footer class="site-foot">
  ${escapeHtml(pkg.name)} v${escapeHtml(pkg.version)} — generated from source. Do not edit this page directly; update the code and rerun the docs generator.
</footer>
</main>
</body>
</html>
`

const outDir = join(root, 'site')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'index.html'), html)
// .nojekyll: serve the HTML as-is; skip GitHub's Jekyll processing step.
writeFileSync(join(outDir, '.nojekyll'), '')

console.log(`build-site: site/index.html written (${html.length} bytes).`)

function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
