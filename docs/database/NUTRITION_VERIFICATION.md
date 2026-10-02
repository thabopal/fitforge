# Nutrition Tracking v1 production verification — 2026-10-01

Completed on `feat/nutrition-tracking`. No commit, merge, reset, database replacement, DROP, TRUNCATE, or destructive schema recreation.

## Authoritative schema and divergence

Production has 43 public tables and 20 enums, with UUID relationships throughout. `user` is the singular auth user table; `profiles` stores timezone/body/preferences, and `user_targets` retains effective-dated water, step, creatine and workout-day targets. `foods` stores UUIDs, default portion quantity/unit and per-portion `calories_kcal`, `protein_g`, `carbohydrate_g`, `fat_g`. `meal_plans`/`meal_plan_entries` represent plans; `meal_logs` stores consumed meal/food snapshots.

The two original meal-log records contain servings, names and macro snapshots, with null recipe/plan links. They remain unchanged. This model cleanly supports food logging with two nullable additions; no `food_logs` table was created.

The local migration baseline defines 12 tables and mostly serial identifiers. Its SHA-256 is `fafb68262b0518475718ce63e59077d3c10d2b269e6f127d1f459eaf20cd7f42`. Production's existing migration record has hash `d3da1118b4d0f418d70f24ca19c9d66763ab1f01bee0b93ec4517988215330c3` and timestamp `1786025567892`. Repository history does not contain the matching production migration, so the precise source/deployment that caused divergence is unknown. Neither incompatible local migration was applied or represented as applied. Original migration history was preserved.

## Reconciliation and migration

`db/schema.ts` now models all 43 observed tables, columns, enums, relationships and indexes. Introspection operator-class output was corrected against actual index definitions. Tests verify every original column's type/nullability, all FK/index names, and exactly seven additional columns. Habit targets remain in `user_targets`, not invented profile columns.

Only `drizzle/production/20261001_nutrition_v1.sql` was applied to production through a direct Neon connection. SHA-256: `b4a6990b9fb4ba632121a6ffe8fe879376e1933ebc948fc9e79b3dbd33f48b0d`. It was shown before execution, validated as additive, and applied atomically with advisory locking and timeout limits. A real record was inserted into `fitforge_forward.migrations`; rerunning verified the checksum and did not replay SQL. The original `drizzle.__drizzle_migrations` remained untouched.

Exact applied product-schema SQL:

```sql
-- Forward-only extension of the observed UUID production schema.
ALTER TABLE public.profiles
  ADD COLUMN calorie_target_kcal integer DEFAULT 2100 NOT NULL,
  ADD COLUMN protein_target_min_g integer DEFAULT 150 NOT NULL,
  ADD COLUMN protein_target_max_g integer DEFAULT 170 NOT NULL,
  ADD COLUMN carb_target_g integer DEFAULT 210 NOT NULL,
  ADD COLUMN fat_target_g integer DEFAULT 70 NOT NULL;
--> statement-breakpoint
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_nutrition_targets_check CHECK (
    calorie_target_kcal > 0 AND protein_target_min_g > 0
    AND protein_target_max_g >= protein_target_min_g
    AND carb_target_g > 0 AND fat_target_g > 0
  );
--> statement-breakpoint
ALTER TABLE public.meal_logs
  ADD COLUMN food_id uuid,
  ADD COLUMN serving_label_snapshot text;
--> statement-breakpoint
ALTER TABLE public.meal_logs
  ADD CONSTRAINT meal_logs_food_id_foods_id_fk
  FOREIGN KEY (food_id) REFERENCES public.foods(id) ON DELETE SET NULL;
```

The runner also adds its separate metadata schema/table if absent:

```sql
CREATE SCHEMA IF NOT EXISTS fitforge_forward;
CREATE TABLE IF NOT EXISTS fitforge_forward.migrations (
  tag text PRIMARY KEY,
  hash text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);
```

New profile defaults and the nullable UUID food reference were verified live. `food_logs` is absent. Existing foreign keys and UUID identifiers were retained. `db:generate` and `db:push` are guarded; `db:migrate` uses only explicitly reviewed forward migrations. The committed original baseline SQL/snapshot/journal remain historical evidence and are excluded from production migration execution. Superseded, unapplied local nutrition SQL and its generated snapshot/journal entry were removed during commit preparation.

## Production row counts and preservation

All 43 public tables retained identical row counts and SHA-256 fingerprints of original columns immediately after migration and after CRUD cleanup. Added profile defaults and nullable meal-log columns do not change the pre-existing fields.

| Table | Before | Final after cleanup |
|---|---:|---:|
| `account` | 3 | 3 |
| `allergens` | 0 | 0 |
| `body_measurements` | 3 | 3 |
| `daily_habit_logs` | 0 | 0 |
| `dietary_preferences` | 1 | 1 |
| `equipment` | 4 | 4 |
| `exercise_categories` | 2 | 2 |
| `exercise_equipment` | 21 | 21 |
| `exercise_media` | 0 | 0 |
| `exercise_muscle_groups` | 0 | 0 |
| `exercise_sets` | 21 | 21 |
| `exercises` | 14 | 14 |
| `food_allergens` | 0 | 0 |
| `food_categories` | 5 | 5 |
| `foods` | 8 | 8 |
| `meal_logs` | 2 | 2 |
| `meal_plan_entries` | 0 | 0 |
| `meal_plans` | 0 | 0 |
| `media_assets` | 0 | 0 |
| `muscle_groups` | 0 | 0 |
| `personal_records` | 0 | 0 |
| `profiles` | 3 | 3 |
| `progress_photos` | 0 | 0 |
| `recipe_dietary_preferences` | 0 | 0 |
| `recipe_ingredients` | 0 | 0 |
| `recipe_media` | 0 | 0 |
| `recipe_steps` | 0 | 0 |
| `recipe_tag_links` | 0 | 0 |
| `recipe_tags` | 0 | 0 |
| `recipes` | 0 | 0 |
| `session` | 4 | 4 |
| `user` | 3 | 3 |
| `user_allergens` | 0 | 0 |
| `user_dietary_preferences` | 3 | 3 |
| `user_equipment` | 6 | 6 |
| `user_goals` | 3 | 3 |
| `user_targets` | 0 | 0 |
| `verification` | 0 | 0 |
| `workout_day_exercises` | 26 | 26 |
| `workout_days` | 6 | 6 |
| `workout_plans` | 2 | 2 |
| `workout_session_exercises` | 7 | 7 |
| `workout_sessions` | 2 | 2 |

The only temporary extra row was a verification meal log, created through the UI and removed through the UI after the user's explicit approval. No original record was edited or removed. The separate forward ledger has one new migration record.

Seeding was unnecessary. `db:seed` is now a read-only presence check and skipped all writes: eight foods, three users, three profiles already exist.

## Real CRUD and dashboard verification

The production build was run locally against Neon and verified in Chromium:

- Nutrition page loaded the existing catalogue and all six meal groups.
- UI add: Cooked rice, 1.50 servings, Breakfast. Persisted totals: 195.00 kcal, 4.05 g protein, 42.00 g carbs, 0.45 g fat.
- UI edit: Oats, 0.75 servings, Pre-workout. Persisted totals: 114.00 kcal, 3.83 g protein, 20.25 g carbs, 2.25 g fat.
- The entry was also moved through Post-workout, Dinner, Snack and Lunch; all six meal groups were exercised. Group placement and unchanged snapshot totals were checked.
- Final-build edit preserved the recorded food by default and changed quantity to 1.25 servings in Dinner. Totals: 190.00 kcal, 6.38 g protein, 33.75 g carbs, 3.75 g fat.
- Dashboard and diary text matched exactly for consumed/target/remaining values, including the final precision fix.
- The approved test entry was removed through the real UI. Both pages returned to zero consumption and full remaining targets; Neon confirmed the temporary entry absent and original two records retained.
- Desktop and mobile screenshots inspected. At 390 px viewport width, document width was also 390 px. No application page errors or framework error overlays were detected.

Macros are stored as consumed snapshots and summed once, never multiplied twice. Legacy null-food entries can retain their snapshots on edit. Unknown historic macros remain null; the diary warns when totals are incomplete. Profile timezone determines today's records. Server identity is explicitly configured via `FITFORGE_USER_ID` and is not accepted from form input.

## Validation

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run test`: 9 passed, 0 failed.
- `npm run build`: passed; nutrition and dashboard are dynamic server-rendered routes.
- `npm run db:check`: applied forward migration checksum verified.
- `git diff --check`: passed.
- All original production records: final fingerprint/count comparison passed.

## Remaining risks

This checkout still lacks session authentication. `FITFORGE_USER_ID` selects an explicitly configured single user, so it must not be publicly exposed as a multi-user service before authenticated sessions are implemented. Nutrition reads the new profile targets; future effective-dated nutrition overrides in `user_targets` are not wired. Future migrations require a fresh schema audit and reviewed forward SQL; automatic drift reconciliation is disabled. Legacy rows with missing macros cannot provide complete totals without supplying real nutrition data.

## Commit preparation

Permanent contents include the nutrition UI/services, UUID schema reconciliation, forward migration runner/SQL, local tests and validation configuration, schema metadata baseline and migration/verification records. The superseded unapplied local nutrition migration/snapshot were removed and its uncommitted journal entry reverted. The original committed baseline is unchanged. The generated `next-env.d.ts` change is excluded.

Real record identifiers have been removed from this report; test fixtures use synthetic UUIDs. Credentials, local environment contents, endpoints, browser captures and temporary verification scripts are excluded. The schema metadata baseline contains definitions and migration hashes, not user records, credentials or connection details.

Commit preparation reruns lint, TypeScript, all tests and production build locally. Production verification results above describe the completed earlier run; no production database commands are run during commit preparation. No commit, push or merge has been performed.

## PR #5 fix validation — 2026-10-02

This follow-up fixes canonical-food quantity-edit rounding and the forward runner's post-Nutrition baseline handling. No Neon connection, production SQL, seeding or production data changes were performed during this work.

The regression demonstrates the old 5.10 g → 0.05 g → 5.00 g loss and verifies that the actual quantity-edit helper restores all original canonical macros on a 1 → 0.01 → 1 servings round trip. Additional coverage preserves meal-only snapshots, nullable legacy macros and invalid-reference/quantity failures. Forward-state tests cover a synthetic next migration, reruns, drift, ledger gaps and checksum failures.

An isolated in-memory PostgreSQL (PGlite) fixture reconstructed the captured baseline columns/enums and original history, then exercised the updated runner with a local SQL adapter. Nutrition v1 and a synthetic subsequent additive migration applied successfully; check mode did not write; reruns validated the resulting live state; a mismatched post-state rolled back its DDL and ledger changes. This is local runner/SQL validation, not a verification of Neon networking or its HTTP transaction transport. Temporary fixture SQL and testing dependencies are outside the repository; no synthetic migration is added to the production manifest.

Follow-up validation: lint and typecheck passed; all 16 tests passed using `node --import tsx --test lib/*.test.ts db/*.test.ts` (the equivalent runner avoids this environment's blocked tsx CLI IPC socket); production build passed with a dummy localhost database URL; `git diff --check` passed. Generated `next-env.d.ts` changes are excluded. Production `db:check` and migration commands were not run.
