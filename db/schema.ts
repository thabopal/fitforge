import { boolean, date, integer, numeric, pgEnum, pgTable, serial, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const goalEnum = pgEnum("goal", ["body_recomposition", "fat_loss", "muscle_gain", "general_fitness"]);
export const mealTypeEnum = pgEnum("meal_type", ["breakfast", "snack", "lunch", "pre_workout", "post_workout", "dinner"]);
export const mediaTypeEnum = pgEnum("media_type", ["food_photo", "exercise_illustration", "exercise_video"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  goal: goalEnum("goal").default("body_recomposition").notNull(),
  heightCm: integer("height_cm"),
  startingWeightKg: numeric("starting_weight_kg", { precision: 5, scale: 2 }),
  proteinTargetMinG: integer("protein_target_min_g").default(140).notNull(),
  proteinTargetMaxG: integer("protein_target_max_g").default(160).notNull(),
  waterTargetMl: integer("water_target_ml").default(2500).notNull(),
  stepTarget: integer("step_target").default(10000).notNull(),
  creatineTargetG: integer("creatine_target_g").default(5).notNull(),
  trainingDaysPerWeek: integer("training_days_per_week").default(3).notNull()
});

export const mediaAssets = pgTable("media_assets", {
  id: serial("id").primaryKey(),
  type: mediaTypeEnum("type").notNull(),
  url: text("url").notNull(),
  sourceUrl: text("source_url"),
  creatorName: text("creator_name"),
  creatorUrl: text("creator_url"),
  licenseName: text("license_name"),
  licenseUrl: text("license_url"),
  attributionText: text("attribution_text"),
  lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true })
}, (table) => [uniqueIndex("media_assets_url_idx").on(table.url)]);

export const foods = pgTable("foods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  servingLabel: text("serving_label").notNull(),
  calories: integer("calories").notNull(),
  proteinG: numeric("protein_g", { precision: 6, scale: 2 }).notNull(),
  carbsG: numeric("carbs_g", { precision: 6, scale: 2 }).notNull(),
  fatG: numeric("fat_g", { precision: 6, scale: 2 }).notNull()
}, (table) => [uniqueIndex("foods_name_idx").on(table.name)]);

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  summary: text("summary").notNull(),
  reason: text("reason").notNull(),
  mealType: mealTypeEnum("meal_type").notNull(),
  prepMinutes: integer("prep_minutes").notNull(),
  calories: integer("calories").notNull(),
  proteinG: numeric("protein_g", { precision: 6, scale: 2 }).notNull(),
  carbsG: numeric("carbs_g", { precision: 6, scale: 2 }).notNull(),
  fatG: numeric("fat_g", { precision: 6, scale: 2 }).notNull(),
  ingredientsJson: text("ingredients_json").notNull(),
  stepsJson: text("steps_json").notNull(),
  tagsJson: text("tags_json").notNull(),
  imageAssetId: integer("image_asset_id").references(() => mediaAssets.id),
  isPublished: boolean("is_published").default(true).notNull()
}, (table) => [uniqueIndex("recipes_slug_idx").on(table.slug)]);

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  muscleGroup: text("muscle_group").notNull(),
  equipment: text("equipment").notNull(),
  instructionsJson: text("instructions_json").notNull(),
  commonMistakesJson: text("common_mistakes_json").notNull(),
  illustrationAssetId: integer("illustration_asset_id").references(() => mediaAssets.id),
  videoAssetId: integer("video_asset_id").references(() => mediaAssets.id)
});

export const workoutPlans = pgTable("workout_plans", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  active: boolean("active").default(true).notNull()
});

export const workoutPlanItems = pgTable("workout_plan_items", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").references(() => workoutPlans.id, { onDelete: "cascade" }).notNull(),
  dayOrder: integer("day_order").notNull(),
  dayName: text("day_name").notNull(),
  exerciseId: integer("exercise_id").references(() => exercises.id).notNull(),
  exerciseOrder: integer("exercise_order").notNull(),
  sets: integer("sets").notNull(),
  repsMin: integer("reps_min"),
  repsMax: integer("reps_max"),
  durationSeconds: integer("duration_seconds")
});

export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  active: boolean("active").default(true).notNull()
});

export const mealPlanItems = pgTable("meal_plan_items", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").references(() => mealPlans.id, { onDelete: "cascade" }).notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  mealType: mealTypeEnum("meal_type").notNull(),
  recipeId: integer("recipe_id").references(() => recipes.id).notNull(),
  sortOrder: integer("sort_order").default(0).notNull()
});

export const dailyHabits = pgTable("daily_habits", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  logDate: date("log_date").notNull(),
  waterMl: integer("water_ml").default(0).notNull(),
  steps: integer("steps").default(0).notNull(),
  creatineG: integer("creatine_g").default(0).notNull(),
  proteinG: numeric("protein_g", { precision: 6, scale: 2 }).default("0").notNull()
}, (table) => [uniqueIndex("daily_habits_user_date_idx").on(table.userId, table.logDate)]);

export const bodyMeasurements = pgTable("body_measurements", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  measuredAt: timestamp("measured_at", { withTimezone: true }).defaultNow().notNull(),
  weightKg: numeric("weight_kg", { precision: 5, scale: 2 }),
  waistCm: numeric("waist_cm", { precision: 5, scale: 2 }),
  chestCm: numeric("chest_cm", { precision: 5, scale: 2 }),
  armCm: numeric("arm_cm", { precision: 5, scale: 2 }),
  pushupMax: integer("pushup_max")
});
