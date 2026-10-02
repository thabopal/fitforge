# Nutrition migration from the authoritative production database

## Observed baseline

Production has 43 public tables, 20 enums, UUID primary/foreign keys, a singular `user` table, and an existing `drizzle.__drizzle_migrations` record with SHA-256 `d3da1118b4d0f418d70f24ca19c9d66763ab1f01bee0b93ec4517988215330c3` and timestamp `1786025567892`.

The repository baseline `0000_lazy_strong_guy.sql` hashes to `fafb68262b0518475718ce63e59077d3c10d2b269e6f127d1f459eaf20cd7f42`. It models 12 tables, plural `users`, and mostly serial identifiers. The observed database does not match it. Git contains no matching production migration; the exact deployment or source that introduced the divergence cannot be established from this checkout. The original committed baseline files and journal remain historical evidence and must never be applied to this database. Superseded unapplied local nutrition migration artifacts were removed during commit preparation; the committed baseline history was not altered.

`production-baseline.json` records all public columns, constraints, indexes, enums, policies, triggers and the original migration record. It contains schema metadata, not account/session secrets or user rows.

## Reuse of meal_logs

The two existing records are food-level lunch logs with names, servings, and stored calorie/protein/carbohydrate/fat totals, with null recipe and meal-plan references. They are food-level nutrition snapshots, not merely meal-plan completion markers. Existing recipe and plan links remain valid.

Reuse `meal_logs`; do not introduce `food_logs`. Add nullable UUID `food_id` and `serving_label_snapshot` for future food entries. Legacy rows stay unchanged. Snapshot macros are consumed totals for the logged quantity, summed directly without multiplying servings a second time. New/edited food entries calculate and store totals from the current food's default portion and requested serving multiplier. Moving a legacy entry preserves its snapshot nutrition.

Profiles receive the five requested nutrition targets. Existing effective-dated `user_targets`, including water/steps/creatine/workout-day targets, remain untouched. Profile nutrition defaults are used by this v1 implementation; effective-dated nutrition target overrides are not implemented.

## Migration strategy

Only explicitly listed SQL files under `drizzle/production` may be run by `npm run db:migrate`. The forward runner uses a direct (non-pooler) Neon URL, validates the observed baseline, and tracks real applied forward migrations in `fitforge_forward.migrations`. It never edits or inserts rows into the original Drizzle history. The observed baseline is evidence, not a migration claimed as applied by this branch.

The migration is executed atomically with a PostgreSQL advisory transaction lock, short lock timeout, and a checksummed ledger entry. Reruns verify the checksum and return without replaying it. Migration SQL is limited to additive ALTER TABLE statements; no DROP, TRUNCATE, DELETE, destructive type conversion, data rewrite, or schema recreation.

`npm run db:generate` and `db:push` are disabled to prevent unreviewed drift reconciliation against production. Future changes require a new reviewed forward SQL file and manifest entry. Use introspection and the baseline audit when authoring them.

Before migration, compare all public table row counts and SHA-256 hashes of existing columns; after migration, project the same columns and require exact equality. The two original meal-log records must remain unchanged throughout CRUD verification. Test entries alone may be removed after verification. No seeding is necessary: production already has users, profiles and eight foods.

## Single-user application configuration

Authentication is not implemented in this checkout. Set `FITFORGE_USER_ID` to an explicitly selected existing UUID; there is no fallback to the first user or a new demo account. The server owns this identity and scopes every read/update/removal. This is a single-user development configuration, not multi-user authentication; do not publicly expose these mutations until session authentication is implemented.

## PR #5 follow-up: quantity edits and forward checkpoints

Quantity changes with an existing `food_id` now fetch the canonical food (including inactive foods retained by existing logs) and scale its per-serving nutrition. They never use previously rounded consumed totals as their source. Unchanged quantities preserve recorded snapshots during meal-group moves. Explicit food replacement still uses an active catalogue food. If a retained reference cannot resolve, fail safely and require explicit replacement rather than silently rescaling. Rows without a food reference retain proportional legacy editing, preserve null macros and reject invalid prior quantities; their original two-decimal snapshots cannot reconstruct lost precision. Selecting a real food replaces that limitation with a canonical source. Legacy editing remains available even when the active catalogue is empty.

The immutable pre-Nutrition baseline remains unchanged. `db/forward-state.ts` now pins each step's SQL SHA-256 and reviewed column additions. The runner derives expected live columns by folding the contiguous, checksummed applied manifest prefix onto that baseline. A new step therefore starts at the post-Nutrition state, rather than incorrectly requiring the original column count. Add future steps with their exact PostgreSQL column type, nullability, default and numeric precision/scale metadata and their SQL checksum; never edit an applied step. Constraint-only additive steps may declare no new columns. The existing SQL allowlist still restricts this runner to additive changes on `profiles` and `meal_logs`; expanding that scope requires separate review.

Unknown ledger tags, missing earlier steps, changed checksums, duplicate columns and live column drift fail closed. Applied reruns now verify live column state as well as the ledger. The transaction rechecks column state, original history and ledger after acquiring the advisory lock, checks the resulting columns before recording the migration, and rolls back on mismatch. `--check` performs no writes and checks the current applied state plus the next pending step; it does not pretend later pending steps have already been applied. Unknown command-line options are rejected.

These guards validate exact column metadata. They do not yet constitute a complete audit of constraint/index/enum definitions, and the regex SQL allowlist is a secondary check on explicitly reviewed, checksum-pinned SQL, not a parser for untrusted SQL. Non-cooperating external DDL still requires operational coordination. No new production migration or database operation is introduced by this follow-up.
