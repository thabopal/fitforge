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
