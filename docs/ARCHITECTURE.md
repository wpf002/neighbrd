# Architecture

## The spine

Neighbrd is a *relationship* CRM, not a sales CRM. One mechanic drives everything:

```
cadenceDays + lastCheckInAt  ──derive──▶  overdue / daysUntilDue
        ▲                                         │
        │                                         ▼
   log Activity ──recompute──▶ relationshipHealth ──▶ Dashboard ──▶ AI Advisor
```

- `packages/core/cadence.ts` — `dueDate`, `isOverdue`, `daysUntilDue`. Pure functions.
- `packages/core/health.ts` — `relationshipHealth()`: recency-vs-cadence (0..70) +
  90-day activity frequency (0..30), lightly scaled by relationship type.
- `packages/core/dashboard.ts` — `overdueCheckIns`, `upcomingBirthdays` (year-wrap safe).

These are the only place the business rules live. The API and web import them; nothing
re-implements overdue/health logic. That keeps the invariants in one testable unit.

## Write paths

| Action                  | Effect                                                              |
|-------------------------|--------------------------------------------------------------------|
| Create/edit contact     | sets cadenceDays; health seeded at 50                              |
| **Log activity**        | sets `lastCheckInAt = occurredAt`, recomputes `relationshipHealth` |
| Create event            | feeds calendar + dashboard "upcoming events"                       |
| Update goal progress    | bumps `current`; UI derives %                                     |
| Save profile            | upserts; mints `shareSlug` when `isPublic`                         |

Everything else is read-derived. Do not denormalize overdue state.

## AI Advisor

`packages/ai` builds a compact contact snapshot (name, relationship, role, health,
days-until-due, birthday) and sends it to the model with a strict system prompt:
answer only from the snapshot, name people, suggest the next move. Phase 1 targets
Anthropic directly with the pinned model; the call site is isolated so the shared
`@flint/core` layer drops in without touching routes. Read-only — the Advisor never
logs activities on the user's behalf until trusted.
