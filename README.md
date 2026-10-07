# KAUMA DESIGN

**Powered by Kauma Digital**

A production-oriented website-builder foundation built with React, Vite, TypeScript and Cloudflare-compatible architecture.

## What works in the first version

- Business information wizard
- 10 templates
- Automatic website generation
- Local draft persistence
- Visual editor
- Click-to-edit text, images, buttons and services
- Add, duplicate, move and delete sections
- Desktop / tablet / mobile preview
- Multi-page project structure
- Local image uploads using browser object URLs for the current session
- Real ZIP website export with standalone HTML/CSS/JS
- Responsive exported websites
- SEO settings
- Shop mode
- AI assistant interface with safe local fallback; connect a server endpoint through `VITE_AI_ENDPOINT` only if your architecture intentionally proxies to a secure server
- Cloudflare Worker endpoint scaffold for future AI/deployment integrations

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown by Vite.

## Build

```bash
npm run build
npm run preview
```

## Cloudflare Pages

Connect this repository to Cloudflare Pages:

- Build command: `npm run build`
- Build output directory: `dist`

Or use:

```bash
npm run deploy
```

after authenticating Wrangler.

## Cloudflare Workers / secure integrations

`worker/index.ts` contains a minimal API scaffold. Put private credentials in Worker secrets, never in browser code.

Example:

```bash
npx wrangler secret put AI_API_KEY
npx wrangler secret put CLOUDFLARE_API_TOKEN
```

Do not use `VITE_` for secrets.

## D1 architecture

Recommended tables:

- users
- websites
- pages
- sections
- assets
- domains
- deployments
- subscriptions
- settings

A local-first draft is intentionally used when D1/authentication is not configured. The interface never claims that a remote database has saved something when it has not.

## R2

Use R2 for production image storage. The first version keeps uploaded images temporary in the browser so the builder can be tested without pretending that an asset has been uploaded to a production bucket.

## Publishing

The UI exposes publishing states but does not claim success without a real deployment API response. Connect your own server-side Cloudflare deployment endpoint to `POST /api/deploy`.

## Authentication

The first version works in local mode without authentication. Replace the local project store with your chosen identity/session provider when auth is configured.

## Security notes

- Editable text is rendered as React text, not injected HTML.
- Exported text is HTML-escaped.
- No arbitrary JavaScript blocks are accepted by the editor.
- Secrets belong in Worker/server environment variables.
- Validate and sanitize any future AI-generated content before persisting it.

## License

Private/commercial project — configure your own license before public distribution.
