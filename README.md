# Office Display Manager

ServiceNow scoped application, built with the ServiceNow Fluent SDK.

<!-- BEGIN:generated:app -->
| Property | Value |
| --- | --- |
| Application | Office Display Manager |
| Scope | `x_804244_odm` |
| Version | `1.0.7` |
| REST base | `/api/x_804244_odm/player` |
| Browser entry | `x_804244_odm_player.do` |
<!-- END:generated:app -->

## Development

```bash
npm install
npm run build      # build template, regenerate docs, now-sdk build
npm test           # jest
npm run deploy     # now-sdk install (uses .now/ credential alias)
```

## Release

```bash
npm run release -- patch   # build, test, bump, deploy, tag, push
```

The technical reference lives in [`docs/`](./docs/) as topic pages — Overview,
Data model, REST API, Access control, Business logic, User interface, Reference,
Tests, and Runbook — and is published to GitHub Pages with sidebar navigation.
Start at [docs/documentations.md](./docs/documentations.md) (the Overview page).

## Authentication

Authenticate the SDK once per machine (credentials are stored under `.now/`, gitignored):

```bash
npx now-sdk auth --add <instance-url>
```
