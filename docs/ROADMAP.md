# FitForge v1.0 Delivery Roadmap

## Delivery principles

- Ship thin vertical slices.
- Replace static data early.
- Keep `main` deployable.
- Use preview deployments for every pull request.
- Prefer deterministic rules before AI features.
- Build mobile usability during each sprint, not afterwards.

## Sprint 0: Foundation

### Goal

A reproducible project connected to Neon with architecture, migration discipline and CI.

### Deliverables

- Drizzle schema path fixed
- Neon schema applied
- Idempotent seed data
- Architecture and PRD approved
- Environment validation
- Migration baseline
- GitHub Actions for lint, typecheck and build
- Vercel project linked with preview environment

### Exit criteria

A clean clone can install, migrate, seed, build and run using documented commands.

## Sprint 1: Authentication and onboarding

### Deliverables

- Better Auth integration
- Registration, login, logout and password reset
- Protected application layout
- User role support
- Onboarding wizard
- Profile and goal persistence
- Starter-plan assignment

### Exit criteria

A new user reaches a populated dashboard without manual database edits.

## Sprint 2: Recipe and food catalogue

### Deliverables

- Normalised food reference model
- Recipe list and detail pages backed by Neon
- Search and filters
- Ingredients and ordered steps
- Nutrition and purpose tags
- Favourites
- Admin recipe CRUD
- Media attribution display

### Exit criteria

Published recipes are fully database-driven and manageable without code changes.

## Sprint 3: Meal planner and shopping list

### Deliverables

- Weekly meal plan
- Meal completion and substitutions
- Portion adjustments
- Protein totals
- Plan templates
- Shopping-list generation and grocery mode

### Exit criteria

A user can follow and log a complete seven-day eating plan.

## Sprint 4: Exercise catalogue and workout plans

### Deliverables

- Exercise catalogue backed by Neon
- Muscle and equipment metadata
- Form guidance, common mistakes and variations
- Curated training videos
- Workout templates and user plans
- Roll-forward scheduling

### Exit criteria

A user can view the next workout and understand every prescribed exercise.

## Sprint 5: Workout session engine

### Deliverables

- Start/resume/complete sessions
- Set, repetition, weight and duration logging
- Rest timer
- Previous-performance display
- Personal bests
- Rule-based progression suggestions

### Exit criteria

A complete workout can be logged comfortably from a phone.

## Sprint 6: Progress and weekly review

### Deliverables

- Weight, waist, chest and arm measurements
- Push-up and strength benchmarks
- Progress charts
- Photo upload groundwork
- Weekly summary
- Helpful adherence language without punitive streak mechanics

### Exit criteria

A user can distinguish scale change, waist change and strength improvement over time.

## Sprint 7: Quality, accessibility and launch

### Deliverables

- Accessibility review
- Empty/loading/error states
- Performance pass
- Mobile-device testing
- Security review
- Seed and migration rehearsal
- Production deployment
- Feedback capture

### Exit criteria

FitForge v1 is stable enough for invited users beyond the original account.

## Post-v1 roadmap

- Apple Health
- Samsung Health
- Google Health Connect
- Wearables
- Trainer/client workflows
- Subscriptions
- Barcode scanning
- AI-assisted substitutions and coaching
- Native mobile companion

## Branch conventions

- `fix/*` for defects
- `docs/*` for documentation
- `feat/*` for product work
- `chore/*` for tooling and maintenance

## Commit conventions

- `feat:` user-facing capability
- `fix:` defect correction
- `docs:` documentation
- `refactor:` structural change without changed behaviour
- `test:` tests
- `chore:` tooling and maintenance

## Pull-request checklist

- Scope matches issue
- Database changes include migration
- User-owned data is authorised
- Inputs are validated
- Responsive state checked
- Loading, empty and error states included
- Tests updated
- Lint, typecheck and build pass
- Screenshots supplied for visual changes