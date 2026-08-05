CREATE TYPE "public"."goal" AS ENUM('body_recomposition', 'fat_loss', 'muscle_gain', 'general_fitness');--> statement-breakpoint
CREATE TYPE "public"."meal_type" AS ENUM('breakfast', 'snack', 'lunch', 'pre_workout', 'post_workout', 'dinner');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('food_photo', 'exercise_illustration', 'exercise_video');--> statement-breakpoint
CREATE TABLE "body_measurements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"measured_at" timestamp with time zone DEFAULT now() NOT NULL,
	"weight_kg" numeric(5, 2),
	"waist_cm" numeric(5, 2),
	"chest_cm" numeric(5, 2),
	"arm_cm" numeric(5, 2),
	"pushup_max" integer
);
--> statement-breakpoint
CREATE TABLE "daily_habits" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"log_date" date NOT NULL,
	"water_ml" integer DEFAULT 0 NOT NULL,
	"steps" integer DEFAULT 0 NOT NULL,
	"creatine_g" integer DEFAULT 0 NOT NULL,
	"protein_g" numeric(6, 2) DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"muscle_group" text NOT NULL,
	"equipment" text NOT NULL,
	"instructions_json" text NOT NULL,
	"common_mistakes_json" text NOT NULL,
	"illustration_asset_id" integer,
	"video_asset_id" integer,
	CONSTRAINT "exercises_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "foods" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"serving_label" text NOT NULL,
	"calories" integer NOT NULL,
	"protein_g" numeric(6, 2) NOT NULL,
	"carbs_g" numeric(6, 2) NOT NULL,
	"fat_g" numeric(6, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_plan_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer NOT NULL,
	"day_of_week" integer NOT NULL,
	"meal_type" "meal_type" NOT NULL,
	"recipe_id" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "media_type" NOT NULL,
	"url" text NOT NULL,
	"source_url" text,
	"creator_name" text,
	"creator_url" text,
	"license_name" text,
	"license_url" text,
	"attribution_text" text,
	"last_verified_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"goal" "goal" DEFAULT 'body_recomposition' NOT NULL,
	"height_cm" integer,
	"starting_weight_kg" numeric(5, 2),
	"protein_target_min_g" integer DEFAULT 140 NOT NULL,
	"protein_target_max_g" integer DEFAULT 160 NOT NULL,
	"water_target_ml" integer DEFAULT 2500 NOT NULL,
	"step_target" integer DEFAULT 10000 NOT NULL,
	"creatine_target_g" integer DEFAULT 5 NOT NULL,
	"training_days_per_week" integer DEFAULT 3 NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"summary" text NOT NULL,
	"reason" text NOT NULL,
	"meal_type" "meal_type" NOT NULL,
	"prep_minutes" integer NOT NULL,
	"calories" integer NOT NULL,
	"protein_g" numeric(6, 2) NOT NULL,
	"carbs_g" numeric(6, 2) NOT NULL,
	"fat_g" numeric(6, 2) NOT NULL,
	"ingredients_json" text NOT NULL,
	"steps_json" text NOT NULL,
	"tags_json" text NOT NULL,
	"image_asset_id" integer,
	"is_published" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "workout_plan_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer NOT NULL,
	"day_order" integer NOT NULL,
	"day_name" text NOT NULL,
	"exercise_id" integer NOT NULL,
	"exercise_order" integer NOT NULL,
	"sets" integer NOT NULL,
	"reps_min" integer,
	"reps_max" integer,
	"duration_seconds" integer
);
--> statement-breakpoint
CREATE TABLE "workout_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "body_measurements" ADD CONSTRAINT "body_measurements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_habits" ADD CONSTRAINT "daily_habits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_illustration_asset_id_media_assets_id_fk" FOREIGN KEY ("illustration_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_video_asset_id_media_assets_id_fk" FOREIGN KEY ("video_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plan_items" ADD CONSTRAINT "meal_plan_items_plan_id_meal_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."meal_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plan_items" ADD CONSTRAINT "meal_plan_items_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_image_asset_id_media_assets_id_fk" FOREIGN KEY ("image_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plan_items" ADD CONSTRAINT "workout_plan_items_plan_id_workout_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plan_items" ADD CONSTRAINT "workout_plan_items_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "daily_habits_user_date_idx" ON "daily_habits" USING btree ("user_id","log_date");--> statement-breakpoint
CREATE UNIQUE INDEX "foods_name_idx" ON "foods" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_url_idx" ON "media_assets" USING btree ("url");--> statement-breakpoint
CREATE UNIQUE INDEX "recipes_slug_idx" ON "recipes" USING btree ("slug");