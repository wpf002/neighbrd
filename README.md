# Neighbrd

Personal CRM to nurture relationships, track outreach, and remember what matters — friends, family, colleagues. Rebuild of the Base44 prototype in the standard stack.

**Stack:** TypeScript pnpm monorepo · Next.js 15 (web) · Fastify 5 (API) · Prisma 6 + Postgres · Flint/Anthropic (AI Advisor) · Railway.

## Layout

```
neighbrd/
├── apps/
│   ├── web/            Next.js 15 app (dashboard, contacts, calendar, goals, advisor, profile)
│   └── api/            Fastify API (REST under /api/*)
├── packages/
│   ├── db/             Prisma schema + client + seed
│   ├── core/           Domain engine: cadence, relationship-health, dashboard derivations
│   ├── schemas/        Shared zod validation (web + api)
│   └── ai/             Flint adapter powering the AI Relationship Advisor
└── docs/               ROADMAP.md, ARCHITECTURE.md
```

## First-time setup

```bash
# 1. install
pnpm install

# 2. env
cp .env.example .env            # set DATABASE_URL + JWT_SECRET (+ ANTHROPIC_API_KEY, optional)

# 3a. (no local Postgres?) spin one up in Docker
docker run -d --name neighbrd-pg \
  -e POSTGRES_USER=neighbrd -e POSTGRES_PASSWORD=neighbrd -e POSTGRES_DB=neighbrd \
  -p 5432:5432 postgres:16-alpine
#    then set DATABASE_URL="postgresql://neighbrd:neighbrd@localhost:5432/neighbrd?schema=public"

# 3b. database
pnpm db:generate
pnpm db:migrate                 # creates tables
pnpm db:seed                    # demo user + Test test / Bob Billy + Work Referrals goal

# 4. run (web :3000, api :4000)
pnpm dev
```

**Demo login:** `demo@neighbrd.app` / `demodemo` (or create a new account on the login screen).

The AI Advisor works **without** an Anthropic key — it falls back to a deterministic local
advisor. Set `ANTHROPIC_API_KEY` to a real `sk-ant-...` key to use the model instead.

## Create the GitHub repo

```bash
git init
git add .
git commit -m "chore: scaffold Neighbrd monorepo"
git branch -M main
git remote add origin git@github.com:wpf002/neighbrd.git
git push -u origin main
```

## Deploy (Railway)

Provision a Postgres plugin, set `DATABASE_URL`, `JWT_SECRET`, `ANTHROPIC_API_KEY`,
`FLINT_MODEL`, `WEB_ORIGIN` on the API service. `railway.json` runs
`pnpm db:migrate:deploy` as the pre-deploy step and starts `@neighbrd/api` (via `tsx`, so
the source-based workspace packages resolve without a separate compile). Deploy the web app
as a second service (`pnpm --filter @neighbrd/web build && pnpm --filter @neighbrd/web start`)
with `NEXT_PUBLIC_API_URL` pointed at the API service URL.

## Invariants (locked)

- **Overdue is derived, never stored** — `lastCheckInAt + cadenceDays < now`.
- **relationshipHealth is 0..100**, recomputed only when an Activity is logged.
- **Logging an Activity** is the single write path that moves `lastCheckInAt` + health.
- Money/scoring stays integer where it matters; health is a rounded int.
