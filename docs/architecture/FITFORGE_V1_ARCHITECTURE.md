# FitForge v1.0 Architecture

## 1. Product vision

FitForge is a visual, mobile-first fitness and nutrition operating system for people who want practical guidance without the clutter, guilt mechanics, or generic plans common in fitness apps.

The first user is Thabo: 168 cm, 88 kg, training three to four evenings per week, pursuing body recomposition, and targeting 140–160 g protein, 2.5 L water, 10,000 steps, and 5 g creatine daily.

The product must also support additional users through onboarding, editable goals, reusable programme templates, and user-owned activity data.

## 2. v1 outcomes

A user can:

1. Create an account and complete onboarding.
2. Receive or choose a meal and workout plan.
3. Browse recipes with nutrition, ingredients, preparation steps, health-purpose tags, images, and source attribution.
4. Log meals, water, protein, creatine, steps, workouts, sets, repetitions, weight, waist, and progress photos.
5. Follow exercise instructions and curated external demonstration videos.
6. Generate a weekly shopping list from the meal plan.
7. Review weekly progress without being punished for missed days.

## 3. Scope boundaries

### Included in v1

- Authentication and user profiles
- Goal-based onboarding
- Dashboard
- Recipe catalogue and recipe details
- Foods and nutrition reference data
- Weekly meal planner
- Shopping-list generation
- Exercise catalogue
- Workout plans and workout-session logging
- Body measurements and progress charts
- Media-rights ledger
- Admin-managed seed/reference content
- Responsive web application deployed to Vercel
- Neon PostgreSQL persistence

### Deferred

- Apple Health integration
- Samsung Health integration
- Google Health Connect
- Wearable integrations
- Barcode scanning
- AI-generated meal plans
- Trainer/client accounts
- Payments and subscriptions
- Social/community features
- Medical-condition-specific nutrition plans

## 4. Architecture style

FitForge v1 uses a modular monolith.

- One Next.js application
- One PostgreSQL database
- Domain-focused modules
- Server Components for read-heavy pages
- Server Actions and Route Handlers for mutations and integration endpoints
- Drizzle ORM for schema and queries
- Zod for boundary validation

A modular monolith keeps deployment and operations simple while preserving clean domain boundaries for future extraction.

## 5. Technology stack

| Concern | Choice |
|---|---|
| Web framework | Next.js App Router + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Database | Neon PostgreSQL |
| ORM | Drizzle ORM |
| Validation | Zod |
| Authentication | Better Auth |
| Charts | Recharts |
| Forms | React Hook Form |
| Image storage | Vercel Blob, later phase |
| Hosting | Vercel |
| CI | GitHub Actions |
| Monitoring | Vercel Analytics, Speed Insights, structured logs |

## 6. Domain modules

### Identity

Users, sessions, accounts, verification, roles, onboarding state.

### Profiles and goals

Body metrics, training availability, dietary preferences, targets, and health-consideration flags.

### Nutrition reference

Foods, serving units, nutrition values, allergens, categories, and substitutions.

### Recipes

Recipes, ingredients, steps, nutrition totals, tags, media, attribution, and suitability metadata.

### Meal planning

Plans, days, meal slots, planned portions, completion state, substitutions, and generated shopping lists.

### Exercise reference

Exercises, categories, muscle groups, equipment, instructions, common mistakes, regressions, progressions, illustrations, and approved video links.

### Training

Workout plans, days, exercises, target sets/reps, sessions, completed sets, rest timers, and personal bests.

### Progress

Weight, waist, chest, arms, photos, strength benchmarks, weekly summaries, and streaks.

### Integrations

Provider connections, permissions, sync cursors, sync jobs, external identifiers, and audit history. Tables are prepared in v1, provider implementations are deferred.

### Media governance

Asset source, creator, licence, attribution, verification date, usage status, and replacement status.

## 7. Application layers

```text
app/                       Route composition and pages
components/                Shared visual components
features/                  Domain modules
  recipes/
  meals/
  workouts/
  progress/
  profile/
  shopping/
lib/                       Cross-cutting utilities
server/                    Server-only services and repositories
db/                        Drizzle schema, migrations, seed data
```

Each feature should contain UI, validation, server operations, query helpers, and types relevant to that domain.

## 8. Runtime flow

```text
Browser
  ↓
Next.js Server Component / Route Handler / Server Action
  ↓
Authentication and authorisation
  ↓
Zod validation
  ↓
Domain service
  ↓
Drizzle repository/query
  ↓
Neon PostgreSQL
```

## 9. Multi-user design rules

- Every user-owned record carries `user_id`.
- Shared reference records such as foods and exercises are not user-owned.
- User-created recipes can be private in v1.
- Admin-curated recipes are shared and marked as published.
- Queries must scope user-owned records by the authenticated user.
- Demo seed data must never be treated as the authenticated production user.

## 10. Security

- Never expose `DATABASE_URL` to the client.
- Validate every mutation with Zod.
- Enforce ownership in server-side queries.
- Restrict admin content operations by role.
- Use signed upload flows for future progress photos.
- Store no medical diagnoses in v1.
- Treat dietary and health flags as user preferences, not clinical advice.
- Maintain an audit trail for media attribution and integration sync jobs.

## 11. Performance

- Prefer Server Components for initial page data.
- Paginate recipe and exercise catalogues.
- Use database indexes on slugs, foreign keys, dates, publication status, and common filters.
- Avoid N+1 queries by using explicit joins or batched queries.
- Optimise external images through approved Next.js remote patterns.
- Cache shared reference data cautiously; user logs remain dynamic.

## 12. Reliability

- Seed scripts are idempotent.
- Database changes are migration-controlled after the prototype phase.
- CI runs lint, type checking, tests, and production build.
- Preview deployments use a development/preview database branch.
- Production database changes are applied intentionally, not automatically from arbitrary branches.

## 13. Health integrations roadmap

Provider adapters will implement a shared contract:

```ts
interface HealthProviderAdapter {
  connect(userId: string): Promise<ConnectionResult>;
  sync(userId: string, cursor?: string): Promise<SyncResult>;
  disconnect(userId: string): Promise<void>;
}
```

Canonical internal records remain provider-neutral. External records store provider, external ID, source timestamp, and raw metadata where permitted.

## 14. Architectural decisions

- ADR-001: Modular monolith
- ADR-002: Neon PostgreSQL with Drizzle
- ADR-003: Better Auth
- ADR-004: Rule-based recommendations before AI
- ADR-005: Media attribution as first-class data
- ADR-006: Server-first Next.js data access

## 15. Definition of v1 done

FitForge v1 is complete when a new user can register, complete onboarding, receive a usable programme, log a full week of meals and workouts, see progress, generate a shopping list, and use the application comfortably on a phone without relying on hard-coded demo data.