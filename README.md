# FitForge

A visual Next.js fitness, meal, recipe and progress tracker designed for Vercel + Neon.

## Included

- Responsive dashboard based on the approved HTML mock-up
- Pre-populated Thabo profile targets and eating plan
- Dedicated recipe library and recipe detail preview
- Weekly meal-plan view
- Dumbbell workout library with original SVG exercise artwork
- External training-video links
- Progress and measurement screens
- Apple Health and Samsung Health roadmap placeholders
- Drizzle schema covering users, profiles, recipes, media licensing, plans, habits and measurements

## Local setup

1. Install Node.js 20.9 or newer.
2. Copy `.env.example` to `.env.local` and add the Neon `DATABASE_URL`.
3. Run:

```bash
npm install
npm run db:push
npm run dev
```

Open http://localhost:3000.

## Vercel

- Push the folder to GitHub.
- Import the repository in Vercel.
- Add `DATABASE_URL` under Project Settings → Environment Variables.
- Deploy.

## Immediate next development

1. Add authentication and multi-user onboarding.
2. Replace static UI data with Drizzle queries.
3. Build CRUD screens for recipes, meals and workouts.
4. Add daily logging and workout-session mode.
5. Add a media-rights admin ledger and curated video catalogue.
6. Add shopping-list generation.

## Neon seed data

After creating the schema, populate Neon with the demo profile, recipes, meal plan and four-day training plan:

```bash
cp .env.example .env.local
# Add your real Neon connection string to .env.local
npm install
npm run db:push
npm run db:seed
```

The seed is safe to run repeatedly. It upserts the shared recipe, food, exercise and media records, refreshes the demo user's weekly plans, and avoids duplicating the starting measurements.

Seeded content includes:

- Thabo's body-recomposition profile and targets
- 12 recipes with ingredients, steps, nutrition and purpose tags
- Alternating high-protein snacks
- 22 dumbbell, bodyweight and core exercises
- A seven-day eating plan
- A four-day workout plan
- Today's water, protein, step and creatine values
- Starting and current push-up measurements
- Media source, licence and attribution metadata

The demo account uses `thabo@fitforge.local`. Authentication can later map the signed-in account to this profile or create a fresh user-specific plan during onboarding.
