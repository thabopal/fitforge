# FitForge API and Folder Structure

## Server interface strategy

FitForge uses three server interaction styles:

1. Server Components for authenticated reads used during page rendering.
2. Server Actions for first-party form mutations.
3. Route Handlers for webhooks, integration callbacks, file operations, exports, and future public/mobile APIs.

Domain services contain business rules. UI files must not contain direct ad hoc database logic.

## Proposed folder structure

```text
app/
  (auth)/
    login/page.tsx
    register/page.tsx
    forgot-password/page.tsx
  (app)/
    layout.tsx
    dashboard/page.tsx
    recipes/page.tsx
    recipes/[slug]/page.tsx
    meals/page.tsx
    meals/shopping-list/page.tsx
    workouts/page.tsx
    workouts/session/[id]/page.tsx
    progress/page.tsx
    settings/page.tsx
  admin/
    recipes/page.tsx
    exercises/page.tsx
    media/page.tsx
  api/
    auth/[...all]/route.ts
    health/route.ts
    integrations/[provider]/callback/route.ts
    webhooks/[provider]/route.ts

components/
  ui/
  layout/
  charts/
  feedback/

features/
  auth/
  profile/
  recipes/
    components/
    actions.ts
    queries.ts
    schemas.ts
    service.ts
    types.ts
  foods/
  meals/
  shopping/
  exercises/
  workouts/
  progress/
  integrations/
  media/

server/
  auth/
  repositories/
  services/
  permissions/
  logging/

db/
  schema/
    identity.ts
    profile.ts
    nutrition.ts
    recipes.ts
    meals.ts
    exercises.ts
    workouts.ts
    progress.ts
    integrations.ts
    media.ts
    index.ts
  migrations/
  seed/
    reference-data.ts
    demo-user.ts
  index.ts

lib/
  env.ts
  dates.ts
  nutrition.ts
  units.ts
  constants.ts
```

## Server Action examples

### Recipe mutation

```ts
export async function createRecipeAction(input: unknown) {
  const user = await requireUser();
  const command = createRecipeSchema.parse(input);
  return recipeService.createPrivateRecipe(user.id, command);
}
```

### Meal completion

```ts
export async function completeMealAction(input: unknown) {
  const user = await requireUser();
  const command = completeMealSchema.parse(input);
  return mealService.completePlannedMeal(user.id, command);
}
```

## Route Handler catalogue

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Deployment health response |
| ALL | `/api/auth/[...all]` | Better Auth handlers |
| GET | `/api/integrations/:provider/callback` | OAuth callback |
| POST | `/api/webhooks/:provider` | Provider webhook receiver |
| POST | `/api/uploads/progress-photo` | Future signed upload flow |
| GET | `/api/exports/weekly-summary` | Future PDF/CSV export |

## Domain operations

### Recipes

- `listPublishedRecipes(filters)`
- `getRecipeBySlug(slug, viewerId?)`
- `createPrivateRecipe(userId, command)`
- `updateOwnedRecipe(userId, recipeId, command)`
- `publishCuratedRecipe(adminId, recipeId)`
- `toggleFavourite(userId, recipeId)`

### Meal planning

- `getActiveMealPlan(userId, week)`
- `createPlanFromTemplate(userId, templateId)`
- `substituteMeal(userId, entryId, recipeId)`
- `completeMeal(userId, entryId, actualPortion)`
- `generateShoppingList(userId, planId)`

### Workouts

- `getNextWorkout(userId)`
- `startWorkoutSession(userId, planDayId)`
- `recordSet(userId, sessionExerciseId, command)`
- `completeWorkoutSession(userId, sessionId)`
- `calculateProgression(userId, exerciseId)`

### Progress

- `recordBodyMeasurement(userId, command)`
- `getMeasurementTrend(userId, range)`
- `getStrengthTrend(userId, exerciseId)`
- `buildWeeklySummary(userId, week)`

## Validation

Every public boundary uses Zod. Database rows are not trusted as form input shapes. Separate schemas are maintained for create, update, filters, and output view models.

## Error model

Domain services throw typed application errors:

- `UnauthenticatedError`
- `ForbiddenError`
- `NotFoundError`
- `ValidationError`
- `ConflictError`

UI actions convert these to safe user-facing messages. Logs retain diagnostic context without secrets.

## Authorization rules

- A user may read and mutate only their own plans, logs, sessions, measurements, photos, preferences, and private recipes.
- Published reference content is readable by authenticated users.
- Only admins may publish shared recipes, exercises, templates, and media.
- Ownership is checked in the query/service, not inferred from hidden form fields.

## Environment validation

Create `lib/env.ts` using Zod to validate server-only and public variables at startup. Required server variables include `DATABASE_URL` and authentication secrets. Public variables must be explicitly prefixed with `NEXT_PUBLIC_`.