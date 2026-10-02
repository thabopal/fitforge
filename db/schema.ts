// Authoritative UUID production schema, introspected 2026-10-01.
// Nutrition additions: drizzle/production/20261001_nutrition_v1.sql.
import { pgTable, index, uuid, text, timestamp, uniqueIndex, boolean, foreignKey, unique, numeric, check, date, integer, time, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const allergySeverity = pgEnum("allergy_severity", ['mild', 'moderate', 'severe'])
export const biologicalSex = pgEnum("biological_sex", ['female', 'male', 'intersex', 'prefer_not_to_say'])
export const contentStatus = pgEnum("content_status", ['draft', 'published', 'archived'])
export const exerciseDifficulty = pgEnum("exercise_difficulty", ['beginner', 'intermediate', 'advanced'])
export const fitnessGoal = pgEnum("fitness_goal", ['body_recomposition', 'fat_loss', 'muscle_gain', 'general_fitness', 'strength', 'endurance'])
export const mealType = pgEnum("meal_type", ['breakfast', 'snack', 'lunch', 'pre_workout', 'post_workout', 'dinner'])
export const measurementSource = pgEnum("measurement_source", ['manual', 'apple_health', 'samsung_health', 'health_connect', 'import'])
export const mediaProvider = pgEnum("media_provider", ['vercel_blob', 'cloudinary', 'unsplash', 'pexels', 'wikimedia', 'youtube', 'external'])
export const mediaRole = pgEnum("media_role", ['cover', 'gallery', 'video'])
export const mediaType = pgEnum("media_type", ['food_photo', 'recipe_photo', 'exercise_illustration', 'exercise_video', 'progress_photo'])
export const movementPattern = pgEnum("movement_pattern", ['push', 'pull', 'squat', 'hinge', 'lunge', 'carry', 'rotation', 'anti_rotation', 'locomotion', 'isolation'])
export const muscleRole = pgEnum("muscle_role", ['primary', 'secondary'])
export const photoPose = pgEnum("photo_pose", ['front', 'side', 'back', 'other'])
export const planStatus = pgEnum("plan_status", ['draft', 'active', 'completed', 'archived'])
export const recipeDifficulty = pgEnum("recipe_difficulty", ['easy', 'moderate', 'advanced'])
export const servingUnit = pgEnum("serving_unit", ['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'item', 'slice', 'scoop', 'serving'])
export const setType = pgEnum("set_type", ['warmup', 'working', 'drop', 'failure'])
export const unitSystem = pgEnum("unit_system", ['metric', 'imperial'])
export const userRole = pgEnum("user_role", ['user', 'admin'])
export const workoutSessionStatus = pgEnum("workout_session_status", ['planned', 'in_progress', 'completed', 'cancelled'])


export const verification = pgTable("verification", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("verification_identifier_idx").using("btree", table.identifier.asc().nullsLast()),
]);

export const user = pgTable("user", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	role: userRole().default('user').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("user_email_unique").using("btree", table.email.asc().nullsLast()),
]);

export const account = pgTable("account", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: uuid("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true, mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true, mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("account_provider_account_unique").using("btree", table.providerId.asc().nullsLast(), table.accountId.asc().nullsLast()),
	index("account_user_id_idx").using("btree", table.userId.asc().nullsLast()),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const session = pgTable("session", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: uuid("user_id").notNull(),
}, (table) => [
	uniqueIndex("session_token_unique").using("btree", table.token.asc().nullsLast()),
	index("session_user_id_idx").using("btree", table.userId.asc().nullsLast()),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const foods = pgTable("foods", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	categoryId: uuid("category_id"),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	defaultServingQuantity: numeric("default_serving_quantity", { precision: 8, scale:  2 }).notNull(),
	defaultServingUnit: servingUnit("default_serving_unit").notNull(),
	caloriesKcal: numeric("calories_kcal", { precision: 8, scale:  2 }).notNull(),
	proteinG: numeric("protein_g", { precision: 8, scale:  2 }).notNull(),
	carbohydrateG: numeric("carbohydrate_g", { precision: 8, scale:  2 }).notNull(),
	fatG: numeric("fat_g", { precision: 8, scale:  2 }).notNull(),
	fibreG: numeric("fibre_g", { precision: 8, scale:  2 }),
	sodiumMg: numeric("sodium_mg", { precision: 8, scale:  2 }),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("foods_category_active_idx").using("btree", table.categoryId.asc().nullsLast(), table.isActive.asc().nullsLast()),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [foodCategories.id],
			name: "foods_category_id_food_categories_id_fk"
		}).onDelete("set null"),
	unique("foods_slug_unique").on(table.slug),
]);

export const foodAllergens = pgTable("food_allergens", {
	foodId: uuid("food_id").notNull(),
	allergenId: uuid("allergen_id").notNull(),
}, (table) => [
	uniqueIndex("food_allergens_unique").using("btree", table.foodId.asc().nullsLast(), table.allergenId.asc().nullsLast()),
	foreignKey({
			columns: [table.foodId],
			foreignColumns: [foods.id],
			name: "food_allergens_food_id_foods_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.allergenId],
			foreignColumns: [allergens.id],
			name: "food_allergens_allergen_id_allergens_id_fk"
		}).onDelete("cascade"),
]);

export const allergens = pgTable("allergens", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
}, (table) => [
	unique("allergens_slug_unique").on(table.slug),
]);

export const foodCategories = pgTable("food_categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
}, (table) => [
	unique("food_categories_slug_unique").on(table.slug),
]);

export const mealLogs = pgTable("meal_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	foodId: uuid("food_id"),
	servingLabelSnapshot: text("serving_label_snapshot"),
	mealPlanEntryId: uuid("meal_plan_entry_id"),
	recipeId: uuid("recipe_id"),
	loggedAt: timestamp("logged_at", { withTimezone: true, mode: 'string' }).notNull(),
	mealType: mealType("meal_type").notNull(),
	nameSnapshot: text("name_snapshot").notNull(),
	servings: numeric({ precision: 6, scale:  2 }).default('1').notNull(),
	caloriesKcal: numeric("calories_kcal", { precision: 8, scale:  2 }),
	proteinG: numeric("protein_g", { precision: 8, scale:  2 }),
	carbohydrateG: numeric("carbohydrate_g", { precision: 8, scale:  2 }),
	fatG: numeric("fat_g", { precision: 8, scale:  2 }),
	notes: text(),
}, (table) => [
	foreignKey({ columns: [table.foodId], foreignColumns: [foods.id], name: "meal_logs_food_id_foods_id_fk" }).onDelete("set null"),
	index("meal_logs_user_time_idx").using("btree", table.userId.asc().nullsLast(), table.loggedAt.asc().nullsLast()),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "meal_logs_user_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.mealPlanEntryId],
			foreignColumns: [mealPlanEntries.id],
			name: "meal_logs_meal_plan_entry_id_meal_plan_entries_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.recipeId],
			foreignColumns: [recipes.id],
			name: "meal_logs_recipe_id_recipes_id_fk"
		}).onDelete("set null"),
]);

export const mealPlanEntries = pgTable("meal_plan_entries", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	mealPlanId: uuid("meal_plan_id").notNull(),
	plannedDate: date("planned_date").notNull(),
	mealType: mealType("meal_type").notNull(),
	recipeId: uuid("recipe_id"),
	customName: text("custom_name"),
	servings: numeric({ precision: 6, scale:  2 }).default('1').notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
}, (table) => [
	index("meal_plan_entries_day_idx").using("btree", table.mealPlanId.asc().nullsLast(), table.plannedDate.asc().nullsLast()),
	foreignKey({
			columns: [table.mealPlanId],
			foreignColumns: [mealPlans.id],
			name: "meal_plan_entries_meal_plan_id_meal_plans_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.recipeId],
			foreignColumns: [recipes.id],
			name: "meal_plan_entries_recipe_id_recipes_id_fk"
		}).onDelete("set null"),
	check("meal_plan_entry_content_check", sql`(recipe_id IS NOT NULL) OR (custom_name IS NOT NULL)`),
]);

export const recipes = pgTable("recipes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	ownerUserId: uuid("owner_user_id"),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	mealType: mealType("meal_type").notNull(),
	difficulty: recipeDifficulty().notNull(),
	prepMinutes: integer("prep_minutes").default(0).notNull(),
	cookMinutes: integer("cook_minutes").default(0).notNull(),
	servings: numeric({ precision: 6, scale:  2 }).default('1').notNull(),
	caloriesKcal: numeric("calories_kcal", { precision: 8, scale:  2 }),
	proteinG: numeric("protein_g", { precision: 8, scale:  2 }),
	carbohydrateG: numeric("carbohydrate_g", { precision: 8, scale:  2 }),
	fatG: numeric("fat_g", { precision: 8, scale:  2 }),
	fibreG: numeric("fibre_g", { precision: 8, scale:  2 }),
	isPublic: boolean("is_public").default(false).notNull(),
	isFeatured: boolean("is_featured").default(false).notNull(),
	status: contentStatus().default('draft').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("recipes_discovery_idx").using("btree", table.status.asc().nullsLast(), table.isPublic.asc().nullsLast(), table.mealType.asc().nullsLast()),
	foreignKey({
			columns: [table.ownerUserId],
			foreignColumns: [user.id],
			name: "recipes_owner_user_id_user_id_fk"
		}).onDelete("set null"),
	unique("recipes_slug_unique").on(table.slug),
]);

export const mealPlans = pgTable("meal_plans", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	name: text().notNull(),
	startsOn: date("starts_on").notNull(),
	endsOn: date("ends_on").notNull(),
	status: planStatus().default('draft').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("meal_plans_user_dates_idx").using("btree", table.userId.asc().nullsLast(), table.startsOn.asc().nullsLast(), table.endsOn.asc().nullsLast()),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "meal_plans_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const recipeDietaryPreferences = pgTable("recipe_dietary_preferences", {
	recipeId: uuid("recipe_id").notNull(),
	dietaryPreferenceId: uuid("dietary_preference_id").notNull(),
}, (table) => [
	uniqueIndex("recipe_dietary_preferences_unique").using("btree", table.recipeId.asc().nullsLast(), table.dietaryPreferenceId.asc().nullsLast()),
	foreignKey({
			columns: [table.recipeId],
			foreignColumns: [recipes.id],
			name: "recipe_dietary_preferences_recipe_id_recipes_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.dietaryPreferenceId],
			foreignColumns: [dietaryPreferences.id],
			name: "recipe_dietary_preferences_dietary_preference_id_dietary_prefer"
		}).onDelete("cascade"),
]);

export const dietaryPreferences = pgTable("dietary_preferences", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
}, (table) => [
	unique("dietary_preferences_slug_unique").on(table.slug),
]);

export const recipeIngredients = pgTable("recipe_ingredients", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	recipeId: uuid("recipe_id").notNull(),
	foodId: uuid("food_id").notNull(),
	quantity: numeric({ precision: 8, scale:  2 }).notNull(),
	unit: servingUnit().notNull(),
	preparationNote: text("preparation_note"),
	sortOrder: integer("sort_order").notNull(),
}, (table) => [
	uniqueIndex("recipe_ingredients_order_unique").using("btree", table.recipeId.asc().nullsLast(), table.sortOrder.asc().nullsLast()),
	foreignKey({
			columns: [table.recipeId],
			foreignColumns: [recipes.id],
			name: "recipe_ingredients_recipe_id_recipes_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.foodId],
			foreignColumns: [foods.id],
			name: "recipe_ingredients_food_id_foods_id_fk"
		}),
]);

export const recipeMedia = pgTable("recipe_media", {
	recipeId: uuid("recipe_id").notNull(),
	mediaAssetId: uuid("media_asset_id").notNull(),
	role: mediaRole().notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
}, (table) => [
	uniqueIndex("recipe_media_unique").using("btree", table.recipeId.asc().nullsLast(), table.mediaAssetId.asc().nullsLast(), table.role.asc().nullsLast()),
	foreignKey({
			columns: [table.recipeId],
			foreignColumns: [recipes.id],
			name: "recipe_media_recipe_id_recipes_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.mediaAssetId],
			foreignColumns: [mediaAssets.id],
			name: "recipe_media_media_asset_id_media_assets_id_fk"
		}).onDelete("cascade"),
]);

export const mediaAssets = pgTable("media_assets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	mediaType: mediaType("media_type").notNull(),
	storageProvider: mediaProvider("storage_provider").notNull(),
	url: text().notNull(),
	thumbnailUrl: text("thumbnail_url"),
	sourceUrl: text("source_url"),
	creatorName: text("creator_name"),
	creatorUrl: text("creator_url"),
	licenseName: text("license_name"),
	licenseUrl: text("license_url"),
	attributionText: text("attribution_text"),
	externalId: text("external_id"),
	isApproved: boolean("is_approved").default(false).notNull(),
	lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("media_assets_provider_external_unique").using("btree", table.storageProvider.asc().nullsLast(), table.externalId.asc().nullsLast()),
	index("media_assets_type_approved_idx").using("btree", table.mediaType.asc().nullsLast(), table.isApproved.asc().nullsLast()),
]);

export const recipeSteps = pgTable("recipe_steps", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	recipeId: uuid("recipe_id").notNull(),
	sortOrder: integer("sort_order").notNull(),
	instruction: text().notNull(),
}, (table) => [
	uniqueIndex("recipe_steps_order_unique").using("btree", table.recipeId.asc().nullsLast(), table.sortOrder.asc().nullsLast()),
	foreignKey({
			columns: [table.recipeId],
			foreignColumns: [recipes.id],
			name: "recipe_steps_recipe_id_recipes_id_fk"
		}).onDelete("cascade"),
]);

export const recipeTagLinks = pgTable("recipe_tag_links", {
	recipeId: uuid("recipe_id").notNull(),
	recipeTagId: uuid("recipe_tag_id").notNull(),
}, (table) => [
	uniqueIndex("recipe_tag_links_unique").using("btree", table.recipeId.asc().nullsLast(), table.recipeTagId.asc().nullsLast()),
	foreignKey({
			columns: [table.recipeId],
			foreignColumns: [recipes.id],
			name: "recipe_tag_links_recipe_id_recipes_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.recipeTagId],
			foreignColumns: [recipeTags.id],
			name: "recipe_tag_links_recipe_tag_id_recipe_tags_id_fk"
		}).onDelete("cascade"),
]);

export const recipeTags = pgTable("recipe_tags", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
}, (table) => [
	unique("recipe_tags_slug_unique").on(table.slug),
]);

export const profiles = pgTable("profiles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	calorieTargetKcal: integer("calorie_target_kcal").default(2100).notNull(),
	proteinTargetMinG: integer("protein_target_min_g").default(150).notNull(),
	proteinTargetMaxG: integer("protein_target_max_g").default(170).notNull(),
	carbTargetG: integer("carb_target_g").default(210).notNull(),
	fatTargetG: integer("fat_target_g").default(70).notNull(),
	dateOfBirth: date("date_of_birth"),
	sex: biologicalSex(),
	heightCm: numeric("height_cm", { precision: 5, scale:  2 }),
	timezone: text().default('Africa/Johannesburg').notNull(),
	preferredUnitSystem: unitSystem("preferred_unit_system").default('metric').notNull(),
	preferredWorkoutTime: time("preferred_workout_time"),
	onboardingCompletedAt: timestamp("onboarding_completed_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	check("profiles_nutrition_targets_check", sql`${table.calorieTargetKcal} > 0 AND ${table.proteinTargetMinG} > 0 AND ${table.proteinTargetMaxG} >= ${table.proteinTargetMinG} AND ${table.carbTargetG} > 0 AND ${table.fatTargetG} > 0`),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "profiles_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("profiles_user_id_unique").on(table.userId),
]);

export const userAllergens = pgTable("user_allergens", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	allergenId: uuid("allergen_id").notNull(),
	severity: allergySeverity().default('mild').notNull(),
	notes: text(),
}, (table) => [
	uniqueIndex("user_allergens_unique").using("btree", table.userId.asc().nullsLast(), table.allergenId.asc().nullsLast()),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "user_allergens_user_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.allergenId],
			foreignColumns: [allergens.id],
			name: "user_allergens_allergen_id_allergens_id_fk"
		}).onDelete("cascade"),
]);

export const userDietaryPreferences = pgTable("user_dietary_preferences", {
	userId: uuid("user_id").notNull(),
	dietaryPreferenceId: uuid("dietary_preference_id").notNull(),
}, (table) => [
	uniqueIndex("user_dietary_preferences_unique").using("btree", table.userId.asc().nullsLast(), table.dietaryPreferenceId.asc().nullsLast()),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "user_dietary_preferences_user_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.dietaryPreferenceId],
			foreignColumns: [dietaryPreferences.id],
			name: "user_dietary_preferences_dietary_preference_id_dietary_preferen"
		}).onDelete("cascade"),
]);

export const userEquipment = pgTable("user_equipment", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	equipmentId: uuid("equipment_id").notNull(),
	quantity: integer().default(1).notNull(),
	maximumWeightKg: numeric("maximum_weight_kg", { precision: 7, scale:  2 }),
}, (table) => [
	uniqueIndex("user_equipment_unique").using("btree", table.userId.asc().nullsLast(), table.equipmentId.asc().nullsLast()),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "user_equipment_user_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.equipmentId],
			foreignColumns: [equipment.id],
			name: "user_equipment_equipment_id_equipment_id_fk"
		}).onDelete("cascade"),
]);

export const equipment = pgTable("equipment", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
}, (table) => [
	unique("equipment_slug_unique").on(table.slug),
]);

export const userGoals = pgTable("user_goals", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	goalType: fitnessGoal("goal_type").notNull(),
	targetWeightKg: numeric("target_weight_kg", { precision: 5, scale:  2 }),
	targetDate: date("target_date"),
	isPrimary: boolean("is_primary").default(false).notNull(),
	startsOn: date("starts_on").notNull(),
	endsOn: date("ends_on"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("user_goals_active_primary_unique").using("btree", table.userId.asc().nullsLast()).where(sql`((is_primary = true) AND (ends_on IS NULL))`),
	index("user_goals_user_id_idx").using("btree", table.userId.asc().nullsLast()),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "user_goals_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const userTargets = pgTable("user_targets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	effectiveFrom: date("effective_from").notNull(),
	effectiveTo: date("effective_to"),
	calorieTargetKcal: integer("calorie_target_kcal"),
	proteinTargetMinG: integer("protein_target_min_g").notNull(),
	proteinTargetMaxG: integer("protein_target_max_g").notNull(),
	waterTargetMl: integer("water_target_ml").notNull(),
	stepTarget: integer("step_target").notNull(),
	creatineTargetG: numeric("creatine_target_g", { precision: 4, scale:  1 }),
	workoutDaysPerWeek: integer("workout_days_per_week").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("user_targets_user_effective_idx").using("btree", table.userId.asc().nullsLast(), table.effectiveFrom.asc().nullsLast()),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "user_targets_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const bodyMeasurements = pgTable("body_measurements", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	measuredAt: timestamp("measured_at", { withTimezone: true, mode: 'string' }).notNull(),
	weightKg: numeric("weight_kg", { precision: 5, scale:  2 }),
	waistCm: numeric("waist_cm", { precision: 5, scale:  2 }),
	chestCm: numeric("chest_cm", { precision: 5, scale:  2 }),
	leftArmCm: numeric("left_arm_cm", { precision: 5, scale:  2 }),
	rightArmCm: numeric("right_arm_cm", { precision: 5, scale:  2 }),
	bodyFatPercentage: numeric("body_fat_percentage", { precision: 5, scale:  2 }),
	source: measurementSource().default('manual').notNull(),
	notes: text(),
}, (table) => [
	index("body_measurements_user_time_idx").using("btree", table.userId.asc().nullsLast(), table.measuredAt.asc().nullsLast()),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "body_measurements_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const dailyHabitLogs = pgTable("daily_habit_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	logDate: date("log_date").notNull(),
	waterMl: integer("water_ml").default(0).notNull(),
	steps: integer().default(0).notNull(),
	creatineG: numeric("creatine_g", { precision: 4, scale:  1 }).default('0').notNull(),
	sleepMinutes: integer("sleep_minutes"),
	activeEnergyKcal: integer("active_energy_kcal"),
	notes: text(),
	source: measurementSource().default('manual').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("daily_habit_logs_user_date_idx").using("btree", table.userId.asc().nullsLast(), table.logDate.asc().nullsLast()),
	uniqueIndex("daily_habit_logs_user_date_unique").using("btree", table.userId.asc().nullsLast(), table.logDate.asc().nullsLast()),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "daily_habit_logs_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const personalRecords = pgTable("personal_records", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	recordType: text("record_type").notNull(),
	label: text().notNull(),
	value: numeric({ precision: 10, scale:  2 }).notNull(),
	unit: text().notNull(),
	achievedAt: timestamp("achieved_at", { withTimezone: true, mode: 'string' }).notNull(),
	notes: text(),
}, (table) => [
	index("personal_records_user_type_idx").using("btree", table.userId.asc().nullsLast(), table.recordType.asc().nullsLast()),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "personal_records_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const progressPhotos = pgTable("progress_photos", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	mediaAssetId: uuid("media_asset_id").notNull(),
	pose: photoPose().notNull(),
	capturedOn: date("captured_on").notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("progress_photos_user_date_idx").using("btree", table.userId.asc().nullsLast(), table.capturedOn.asc().nullsLast()),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "progress_photos_user_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.mediaAssetId],
			foreignColumns: [mediaAssets.id],
			name: "progress_photos_media_asset_id_media_assets_id_fk"
		}).onDelete("cascade"),
]);

export const exercises = pgTable("exercises", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	categoryId: uuid("category_id").notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	instructions: text().notNull(),
	commonMistakes: text("common_mistakes"),
	difficulty: exerciseDifficulty().notNull(),
	movementPattern: movementPattern("movement_pattern"),
	isUnilateral: boolean("is_unilateral").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("exercises_category_active_idx").using("btree", table.categoryId.asc().nullsLast(), table.isActive.asc().nullsLast()),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [exerciseCategories.id],
			name: "exercises_category_id_exercise_categories_id_fk"
		}),
	unique("exercises_slug_unique").on(table.slug),
]);

export const exerciseEquipment = pgTable("exercise_equipment", {
	exerciseId: uuid("exercise_id").notNull(),
	equipmentId: uuid("equipment_id").notNull(),
}, (table) => [
	uniqueIndex("exercise_equipment_unique").using("btree", table.exerciseId.asc().nullsLast(), table.equipmentId.asc().nullsLast()),
	foreignKey({
			columns: [table.exerciseId],
			foreignColumns: [exercises.id],
			name: "exercise_equipment_exercise_id_exercises_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.equipmentId],
			foreignColumns: [equipment.id],
			name: "exercise_equipment_equipment_id_equipment_id_fk"
		}).onDelete("cascade"),
]);

export const exerciseMedia = pgTable("exercise_media", {
	exerciseId: uuid("exercise_id").notNull(),
	mediaAssetId: uuid("media_asset_id").notNull(),
	role: mediaRole().notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
}, (table) => [
	uniqueIndex("exercise_media_unique").using("btree", table.exerciseId.asc().nullsLast(), table.mediaAssetId.asc().nullsLast(), table.role.asc().nullsLast()),
	foreignKey({
			columns: [table.exerciseId],
			foreignColumns: [exercises.id],
			name: "exercise_media_exercise_id_exercises_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.mediaAssetId],
			foreignColumns: [mediaAssets.id],
			name: "exercise_media_media_asset_id_media_assets_id_fk"
		}).onDelete("cascade"),
]);

export const exerciseMuscleGroups = pgTable("exercise_muscle_groups", {
	exerciseId: uuid("exercise_id").notNull(),
	muscleGroupId: uuid("muscle_group_id").notNull(),
	role: muscleRole().notNull(),
}, (table) => [
	uniqueIndex("exercise_muscle_groups_unique").using("btree", table.exerciseId.asc().nullsLast(), table.muscleGroupId.asc().nullsLast(), table.role.asc().nullsLast()),
	foreignKey({
			columns: [table.exerciseId],
			foreignColumns: [exercises.id],
			name: "exercise_muscle_groups_exercise_id_exercises_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.muscleGroupId],
			foreignColumns: [muscleGroups.id],
			name: "exercise_muscle_groups_muscle_group_id_muscle_groups_id_fk"
		}).onDelete("cascade"),
]);

export const muscleGroups = pgTable("muscle_groups", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	parentId: uuid("parent_id"),
	name: text().notNull(),
	slug: text().notNull(),
}, (table) => [
	unique("muscle_groups_slug_unique").on(table.slug),
]);

export const workoutSessionExercises = pgTable("workout_session_exercises", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	workoutSessionId: uuid("workout_session_id").notNull(),
	exerciseId: uuid("exercise_id"),
	nameSnapshot: text("name_snapshot").notNull(),
	sortOrder: integer("sort_order").notNull(),
	notes: text(),
}, (table) => [
	uniqueIndex("workout_session_exercises_order_unique").using("btree", table.workoutSessionId.asc().nullsLast(), table.sortOrder.asc().nullsLast()),
	foreignKey({
			columns: [table.workoutSessionId],
			foreignColumns: [workoutSessions.id],
			name: "workout_session_exercises_workout_session_id_workout_sessions_i"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.exerciseId],
			foreignColumns: [exercises.id],
			name: "workout_session_exercises_exercise_id_exercises_id_fk"
		}).onDelete("set null"),
]);

export const exerciseSets = pgTable("exercise_sets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	sessionExerciseId: uuid("session_exercise_id").notNull(),
	setNumber: integer("set_number").notNull(),
	setType: setType("set_type").default('working').notNull(),
	repetitions: integer(),
	weightKg: numeric("weight_kg", { precision: 7, scale:  2 }),
	durationSeconds: integer("duration_seconds"),
	distanceMetres: numeric("distance_metres", { precision: 9, scale:  2 }),
	rpe: numeric({ precision: 3, scale:  1 }),
	completed: boolean().default(true).notNull(),
}, (table) => [
	uniqueIndex("exercise_sets_number_unique").using("btree", table.sessionExerciseId.asc().nullsLast(), table.setNumber.asc().nullsLast()),
	foreignKey({
			columns: [table.sessionExerciseId],
			foreignColumns: [workoutSessionExercises.id],
			name: "exercise_sets_session_exercise_id_workout_session_exercises_id_"
		}).onDelete("cascade"),
]);

export const exerciseCategories = pgTable("exercise_categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
}, (table) => [
	unique("exercise_categories_slug_unique").on(table.slug),
]);

export const workoutDays = pgTable("workout_days", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	workoutPlanId: uuid("workout_plan_id").notNull(),
	dayNumber: integer("day_number").notNull(),
	name: text().notNull(),
	description: text(),
	estimatedMinutes: integer("estimated_minutes"),
}, (table) => [
	uniqueIndex("workout_days_plan_day_unique").using("btree", table.workoutPlanId.asc().nullsLast(), table.dayNumber.asc().nullsLast()),
	foreignKey({
			columns: [table.workoutPlanId],
			foreignColumns: [workoutPlans.id],
			name: "workout_days_workout_plan_id_workout_plans_id_fk"
		}).onDelete("cascade"),
]);

export const workoutDayExercises = pgTable("workout_day_exercises", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	workoutDayId: uuid("workout_day_id").notNull(),
	exerciseId: uuid("exercise_id").notNull(),
	sortOrder: integer("sort_order").notNull(),
	targetSets: integer("target_sets").notNull(),
	targetRepsMin: integer("target_reps_min"),
	targetRepsMax: integer("target_reps_max"),
	targetDurationSeconds: integer("target_duration_seconds"),
	restSeconds: integer("rest_seconds"),
	tempo: text(),
	notes: text(),
}, (table) => [
	uniqueIndex("workout_day_exercises_order_unique").using("btree", table.workoutDayId.asc().nullsLast(), table.sortOrder.asc().nullsLast()),
	foreignKey({
			columns: [table.workoutDayId],
			foreignColumns: [workoutDays.id],
			name: "workout_day_exercises_workout_day_id_workout_days_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.exerciseId],
			foreignColumns: [exercises.id],
			name: "workout_day_exercises_exercise_id_exercises_id_fk"
		}),
]);

export const workoutPlans = pgTable("workout_plans", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	name: text().notNull(),
	description: text(),
	goalType: fitnessGoal("goal_type"),
	daysPerWeek: integer("days_per_week").notNull(),
	status: planStatus().default('draft').notNull(),
	startsOn: timestamp("starts_on", { withTimezone: true, mode: 'string' }),
	endsOn: timestamp("ends_on", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("workout_plans_user_status_idx").using("btree", table.userId.asc().nullsLast(), table.status.asc().nullsLast()),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "workout_plans_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const workoutSessions = pgTable("workout_sessions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	workoutPlanId: uuid("workout_plan_id"),
	workoutDayId: uuid("workout_day_id"),
	nameSnapshot: text("name_snapshot").notNull(),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }).notNull(),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
	status: workoutSessionStatus().notNull(),
	notes: text(),
}, (table) => [
	index("workout_sessions_user_started_idx").using("btree", table.userId.asc().nullsLast(), table.startedAt.asc().nullsLast()),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "workout_sessions_user_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.workoutPlanId],
			foreignColumns: [workoutPlans.id],
			name: "workout_sessions_workout_plan_id_workout_plans_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.workoutDayId],
			foreignColumns: [workoutDays.id],
			name: "workout_sessions_workout_day_id_workout_days_id_fk"
		}).onDelete("set null"),
]);
