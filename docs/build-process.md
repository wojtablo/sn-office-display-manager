# Office Display Manager — Build process

<!-- Authored page. Explains the toolchain under scripts/. Safe to edit by hand;
     the docs generator never overwrites this file. -->

## Overview

Everything is built by a handful of small, **deterministic** Node scripts in
`scripts/`, wired together by npm scripts in `package.json`. There is no bundler
config and no framework — each script performs one transform from source, and
re-running it on unchanged inputs produces byte-identical output (the CI
freshness gate depends on this).

There are three independent pipelines:

- **App** — compile the browser player + Fluent metadata into an installable
  ServiceNow app, then deploy it to the instance.
- **Docs** — derive the documentation from source and render it into the GitHub
  Pages site (including the interactive C4 model).
- **Release** — orchestrate a versioned release across git, the instance, and
  GitHub in one command.

## Scripts at a glance

| Script | Purpose | Inputs | Outputs |
| --- | --- | --- | --- |
| `build-template.mjs` | Compile the browser player into one deployable server module | `src/client/templates/*`, `src/server/deck.ts`, `handlers.src.ts` | `src/server/OdmTemplates.ts`, `src/server/player-routes.ts` |
| `template-lib.js` | Pure generation helpers used by build-template (jest-tested) | — | — |
| `generate-docs.mjs` | Derive doc pages + README fact block from source | `src/fluent/*.now.ts`, `src/server/*.ts`, `package.json` | `docs/*.md`, `README.md` |
| `build-site.mjs` | Render docs + C4 model into the static site | `docs/*.md`, `architecture/*.c4` | `site/*.html`, `site/c4/index.html` |
| `release.mjs` | One-command versioned release | working tree, tests, build | commit + tag, instance deploy, push |

## `npm run build` — compile & package the app

```
npm run build
   │
   ├─ 1. node scripts/build-template.mjs
   │         player.js + rotator.html  ──▶  OdmTemplates.ts + player-routes.ts
   │
   ├─ 2. npm run docs   (node scripts/generate-docs.mjs)
   │         src/fluent/*.now.ts       ──▶  docs/*.md + README fact block
   │
   └─ 3. now-sdk build
             src/fluent + src/server   ──▶  dist/  (installable app package)
```

Step 3 type-checks and packages the Fluent metadata + server modules into
`dist/`. `npm run deploy` (`now-sdk install`) then pushes `dist/` to the instance.

## 1. Template compilation — `build-template.mjs`

The player runs in the **display's browser**, but ServiceNow must **serve it from
a server module**. build-template bridges the two by inlining and concatenating
the sources into one self-contained module:

```
 src/client/templates/                    src/server/
 ┌──────────────┐ ┌───────────────┐       ┌──────────┐ ┌──────────────────┐
 │  player.js   │ │ rotator.html  │       │ deck.ts  │ │ handlers.src.ts  │
 │ (pure logic) │ │ (shell + CSS) │       │ (pure)   │ │ (Glide layer)    │
 └──────┬───────┘ └──────┬────────┘       └────┬─────┘ └────────┬─────────┘
        │ inline (CDATA)  │                     │  concatenate,  │
        └────────┬────────┘                     │  strip local   │
                 ▼                               │  imports       │
        rotator.html + player.js                 └───────┬────────┘
                 │                                        │
       ┌─────────┴──────────┐                            ▼
       ▼                    ▼                    src/server/player-routes.ts
 OdmTemplates.ts     (also embedded) ──────────▶  = deck.ts + template + handlers
 (template const,                                  ONE self-contained module
  local typecheck)                                 (the only server module deployed)
```

**Why one self-contained module?** The Australia platform cannot resolve
extensionless module-to-module `require()`s at runtime
(`ModuleResolutionException`). So build-template concatenates the pure deck
logic, the inlined HTML template, and the Glide handler into a single module
with **no local imports** — the SDK deploys just that. The separate `deck.ts`,
`handlers.src.ts`, and `OdmTemplates.ts` remain the readable, jest-tested
*sources*; `player-routes.ts` is the generated artifact.

The pure generation logic (inlining, import-stripping, module assembly) lives in
`template-lib.js` so jest can cover every branch directly.

## 2. Documentation generation — `generate-docs.mjs`

Reads the declarative Fluent metadata and server sources through the
**TypeScript compiler API** (AST, not regex) and renders a technical reference:

```
 src/fluent/*.now.ts ─┐
 src/server/*.ts      ├─▶  parse (TS AST)  ─▶  Fluent artifacts:
 package.json         │                        tables · REST · ACLs · rules ·
 now.config.json    ──┘                        forms · menus · script includes
                                                          │
                                                          ▼
                                          render one Markdown page per topic
                                                          │
      ┌──────────────┬─────────────┬─────────────┬────────┴───────┐
      ▼              ▼             ▼             ▼                ▼
 documentations.md data-model.md rest-api.md  ... tests.md  README (fact block)
   (Overview)
```

- **Deterministic** — stable ordering, no timestamps or absolute paths — so
  `npm run docs && git diff --exit-code` is a reliable freshness gate.
- **Generated vs authored** — machine sections live between `BEGIN:generated` /
  `END:generated` markers and are overwritten every run; authored prose lives
  between `BEGIN:manual` / `END:manual` markers (the Overview and Architecture
  notes) and is preserved verbatim.
- Emits the topic pages + the Tests page, and refreshes the README app-fact block.

## 3. Site build — `build-site.mjs`

Turns the Markdown and the LikeC4 model into the published static site:

```
 docs/*.md ──▶ marked ──▶ site/*.html   (sidebar nav · "On this page" TOC ·
                                          scroll-spy · GitHub-Light theme + switch)

 architecture/odm.c4 ──▶ likec4 build --output-single-file
                              └──▶ site/c4/index.html   (3 MB interactive app)
                                          ▲
                                          │ embedded in a full-height iframe by
                                   site/c4.html   (the "C4 model" nav page)
```

Any `.md` in `docs/` becomes a page. `build-process.md` (this page) and
`runbook.md` are **authored**; the rest are **generated**. `site/` is gitignored
and rebuilt fresh in CI.

## 4. Release — `release.mjs`

`npm run release -- patch|minor|major|X.Y.Z` runs an ordered, fail-loud pipeline:

```
 1. Guards      clean tree · on main · origin exists · not behind origin/main
 2. Tests       npm test                       (abort on any failure)
 3. Build       npm run build                  (template + docs + now-sdk build)
 4. Freshness   git status must be clean       (generated files already committed)
 5. Bump        npm version  →  commit + tag vX.Y.Z
 6. Deploy      now-sdk install                (only AFTER the instance accepts…)
 7. Push        git push -u --follow-tags origin main
```

The order is deliberate: a broken build or an unpushable git state aborts
*before* any version bump or deploy, so git, GitHub, and the instance never
drift apart. The pushed tag then fires the GitHub **Release** workflow.

## End-to-end

```
                     ┌──────────────────── SOURCE ────────────────────┐
                     │ src/fluent   src/server   src/client            │
                     │ architecture/odm.c4    docs/*.md (authored)     │
                     └───────────────────────────┬─────────────────────┘
                                                 │
          ┌───────────────────────────┬──────────┴───────────┬───────────────────┐
          ▼                           ▼                      ▼                   ▼
  build-template.mjs          generate-docs.mjs      architecture/odm.c4   authored .md
  → player-routes.ts          → docs/*.md + README          │                   │
          │                           │                      └────────┬──────────┘
          ▼                           └───────────────┬───────────────┘
    now-sdk build                                     ▼
    → dist/                                    build-site.mjs
          │                                → site/*.html + site/c4/
          ▼                                           │
    now-sdk install                                   ▼
    → ServiceNow instance                       GitHub Pages
```

## Continuous integration

| Workflow | Trigger | What it does |
| --- | --- | --- |
| **CI** (`ci.yml`) | push / PR to `main` | `npm test`, run build-template + docs, then a **freshness gate**: generated files must already be committed. Never touches the instance. |
| **Pages** (`pages.yml`) | push to `main` touching `docs/**`, `architecture/**`, or the site builder | `npm run site` → deploy `site/` (including `/c4/`) to GitHub Pages. |
| **Release** (`release.yml`) | push of a `vX.Y.Z` tag | `npm test`, then create a GitHub Release with auto-generated notes. |

The instance deploy happens **locally** in `release.mjs` — instance credentials
never leave the machine. CI only validates, publishes the docs site, and records
the GitHub Release.

## npm scripts reference

| Script | Runs |
| --- | --- |
| `npm run build` | build-template → docs → `now-sdk build` |
| `npm run docs` | regenerate `docs/*.md` + README |
| `npm run site` | render docs + C4 → `site/` |
| `npm run deploy` | `now-sdk install` |
| `npm run release -- <bump>` | full versioned release |
| `npm test` / `npm run test:e2e` | jest unit / Playwright E2E |
