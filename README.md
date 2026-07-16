# tools.threats.run

Curated cybersecurity tools directory for Threats.run.

## Stack

- Next.js static export for public/admin shells
- Cloudflare Pages Functions for D1-backed APIs
- D1 for tools/categories/submissions/outbound clicks
- R2 binding reserved for future logos/screenshots

## Local build

```bash
npm install
npm run build
npm test
npm run lint
```

## Cloudflare setup

1. Create D1 database `threats-run-tools-db`.
2. Replace `database_id` in `wrangler.toml`.
3. Apply migrations:

```bash
npx wrangler d1 execute threats-run-tools-db --remote --file migrations/0001_initial.sql
npx wrangler d1 execute threats-run-tools-db --remote --file migrations/0002_seed_catalog.sql
```

4. Configure Pages env/secrets:

```text
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
NEXT_PUBLIC_SITE_URL=https://tools.threats.run
NEXT_PUBLIC_MAIN_SITE_URL=https://threats.run
```

5. Connect Cloudflare Pages to the repo, build command `npm run build`, output dir `out`.

No production deploy has been performed from this local skeleton.
