# Office Display Manager

ServiceNow scoped application, built with the ServiceNow Fluent SDK.

<!-- BEGIN:generated:app -->
| Property | Value |
| --- | --- |
| Application | Office Display Manager |
| Scope | `x_804244_odm` |
| Version | `1.0.4` |
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

See [DOCUMENTATION.md](./DOCUMENTATION.md) for the technical reference.

## Authentication

Authenticate the SDK once per machine (credentials are stored under `.now/`, gitignored):

```bash
npx now-sdk auth --add <instance-url>
```
