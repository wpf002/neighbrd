# Neighbrd — Build Roadmap

Derived from the Base44 reference screens. Sequencing rule: **build the engine before
the surfaces that read it** (Phase 2 before 3/4) and **the Advisor after the data it
reasons over** (Phase 5 after 2).

---

## Phase 0 — Repo + infra  ✅ (this scaffold)
- pnpm monorepo, turbo, shared tsconfig, prettier, .gitignore, .env.example.
- Prisma schema (the spine), client, seed.
- Railway config + README with git/deploy steps.
- **Gate:** `pnpm install && pnpm db:migrate && pnpm db:seed && pnpm dev` runs clean.

## Phase 1 — Auth + Contacts
- Replace the demo-user stub (`apps/api/src/lib/auth.ts`) with real auth (JWT or
  session; email + password to start). Scope every query by `userId`.
- Contact CRUD: list, search, relationship filter, tag filter, detail page
  (`/ContactDetail` in the live app — the one route behind login).
- Cadence field is set here even though nothing consumes it yet.
- **Gate:** can create a contact, see it in the grid, open the detail page.

## Phase 2 — Check-in engine + Dashboard  ← the phase that makes it feel alive
- `Activity` model + the single write path: logging an activity updates
  `lastCheckInAt` and recomputes `relationshipHealth` (already wired in `core`).
- Dashboard endpoint returns the four stat cards, Overdue Check-ins (most overdue
  first), Upcoming Birthdays (30d), Recent Activity.
- **Gate:** log a call → contact leaves "overdue" → health bar moves → dashboard
  counts update. If that loop is wrong, stop and fix before Phase 3.

## Phase 3 — Calendar + Events
- Month grid with navigation; events rendered on day cells; birthdays auto-surfaced.
- Feeds "Upcoming Events" on the dashboard.
- **Gate:** create an event → appears on the right day and on the dashboard.

## Phase 4 — Goals
- Goal CRUD, progress increment, % derivation, tags, date ranges, status.
- Self-contained, low risk — good momentum phase.
- **Gate:** create a goal, bump progress, see the bar + percent update.

## Phase 5 — AI Advisor (Flint)
- Wire `packages/ai` to the live contact snapshot (route already drafted).
- Map the four chips: reach-out = overdue re-ranked by health; priority list =
  overdue + birthdays + goal deadlines; works-in-tech = semantic pass over role;
  health overview = aggregate.
- Keep **read-only** first. Add streaming once correctness is proven.
- **Gate:** "Who should I reach out to this week?" names the actually-overdue people
  and nothing invented.

## Phase 6 — My Profile + Public Profile
- Profile form + live preview + Save → mint `shareSlug` → public read-only card
  (`/PublicProfile`). Sharing Options controls per-field visibility.
- This is the growth loop: shared cards bring in new users.
- **Gate:** save profile → open the public link in an incognito window.

## Phase 7 — Import + polish + deploy
- CSV / vCard import (the Import button). Empty states. Mobile. Keyboard focus.
- Railway: API + web services, `db:migrate:deploy` on release.
- **Gate:** import 50 contacts, deploy, smoke-test the dashboard loop in prod.

---

## Open decision (blocks Phase 1 schema finalization)
The gradient health bars + friend/associate types imply a scoring model. Current
default in `core/health.ts`: recency-vs-cadence dominant (0..70) + 90-day frequency
(0..30), scaled by relationship type. Confirm or adjust the weights before migrating —
changing them later means re-backfilling `relationshipHealth` across all contacts.
