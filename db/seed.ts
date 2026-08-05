import { config } from "dotenv";

config({ path: ".env.local" });
config();

import { neon } from "@neondatabase/serverless";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Add it to .env.local before running npm run db:seed.");
}

const sql = neon(connectionString);
const db = drizzle({ client: sql, schema });

const DEMO_EMAIL = "thabo@fitforge.local";
type MealType = "breakfast" | "snack" | "lunch" | "pre_workout" | "post_workout" | "dinner";

function required<T>(value: T | undefined, label: string): T {
  if (value === undefined) throw new Error(`Seed could not resolve ${label}.`);
  return value;
}

const recipeSeeds = [
  {
    slug: "eggs-wholewheat-toast",
    name: "Eggs on wholewheat toast",
    summary: "A simple high-protein breakfast using familiar ingredients.",
    reason: "Useful for body recomposition because it combines protein with a controlled carbohydrate portion.",
    mealType: "breakfast" as const,
    prepMinutes: 12,
    calories: 430,
    proteinG: "27",
    carbsG: "34",
    fatG: "20",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=85",
    ingredients: ["3 eggs", "2 slices wholewheat toast", "1 tomato", "Black pepper", "Optional spinach"],
    steps: ["Toast the bread.", "Cook the eggs using minimal oil.", "Serve with tomato and spinach."],
    tags: ["Breakfast", "High protein", "Quick"]
  },
  {
    slug: "protein-oats-banana",
    name: "Protein oats with banana",
    summary: "Creamy oats with banana, cinnamon and whey.",
    reason: "Slow-release carbohydrates and protein make it suitable for breakfast or a pre-workout meal.",
    mealType: "breakfast" as const,
    prepMinutes: 10,
    calories: 520,
    proteinG: "31",
    carbsG: "72",
    fatG: "11",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=85",
    ingredients: ["1/2 cup oats", "250 ml low-fat milk", "1 banana", "1/2 scoop whey", "Cinnamon"],
    steps: ["Cook the oats with milk.", "Remove from heat and stir in whey.", "Top with banana and cinnamon."],
    tags: ["Breakfast", "Pre-workout", "High fibre"]
  },
  {
    slug: "greek-yoghurt-fruit",
    name: "Greek yoghurt and fruit cup",
    summary: "A portable, no-cook snack with fruit and cinnamon.",
    reason: "Helps close the daily protein gap without adding another heavy meal.",
    mealType: "snack" as const,
    prepMinutes: 3,
    calories: 220,
    proteinG: "17",
    carbsG: "27",
    fatG: "4",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=85",
    ingredients: ["170 g plain Greek yoghurt", "1/2 cup berries or chopped apple", "Cinnamon"],
    steps: ["Spoon yoghurt into a bowl.", "Add fruit and cinnamon."],
    tags: ["Snack", "No cook", "High protein"]
  },
  {
    slug: "boiled-eggs-fruit",
    name: "Boiled eggs and fruit",
    summary: "Two boiled eggs paired with an apple or orange.",
    reason: "A budget-friendly snack that combines protein, healthy fats and fibre.",
    mealType: "snack" as const,
    prepMinutes: 12,
    calories: 240,
    proteinG: "13",
    carbsG: "22",
    fatG: "11",
    image: "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&w=1200&q=85",
    ingredients: ["2 eggs", "1 apple or orange", "Black pepper"],
    steps: ["Boil eggs for 9 to 11 minutes.", "Cool, peel and season.", "Serve with fruit."],
    tags: ["Snack", "Budget", "Meal prep"]
  },
  {
    slug: "cottage-cheese-apple",
    name: "Cottage cheese and apple",
    summary: "Creamy cottage cheese with sliced apple and cinnamon.",
    reason: "Provides slow-digesting protein and works well as an afternoon or evening snack.",
    mealType: "snack" as const,
    prepMinutes: 4,
    calories: 250,
    proteinG: "22",
    carbsG: "28",
    fatG: "6",
    image: "https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=1200&q=85",
    ingredients: ["200 g low-fat cottage cheese", "1 small apple", "Cinnamon"],
    steps: ["Slice the apple.", "Serve with cottage cheese and cinnamon."],
    tags: ["Snack", "High protein", "No cook"]
  },
  {
    slug: "grilled-chicken-power-bowl",
    name: "Grilled chicken power bowl",
    summary: "Chicken breast, rice and colourful vegetables.",
    reason: "A predictable high-protein training-day meal that supports muscle retention while controlling calories.",
    mealType: "lunch" as const,
    prepMinutes: 30,
    calories: 610,
    proteinG: "52",
    carbsG: "65",
    fatG: "14",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1200&q=85",
    ingredients: ["200 g chicken breast", "3/4 cup cooked rice", "2 cups mixed vegetables", "1 tsp olive oil", "Paprika, garlic and pepper"],
    steps: ["Season and grill the chicken until cooked through.", "Steam or stir-fry the vegetables.", "Serve over rice with lemon or a light yoghurt sauce."],
    tags: ["High protein", "Fat loss", "Training day"]
  },
  {
    slug: "tuna-avocado-crunch-bowl",
    name: "Tuna avocado crunch bowl",
    summary: "Tuna, beans, salad vegetables and a controlled avocado portion.",
    reason: "A quick fibre-rich lunch for busy days with no stove required.",
    mealType: "lunch" as const,
    prepMinutes: 12,
    calories: 480,
    proteinG: "38",
    carbsG: "42",
    fatG: "17",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=85",
    ingredients: ["1 tin tuna in spring water", "1/4 avocado", "Mixed salad leaves", "Tomato and cucumber", "1/2 cup beans"],
    steps: ["Drain the tuna.", "Combine vegetables and beans.", "Top with tuna and avocado; season with lemon and pepper."],
    tags: ["Quick", "Heart-conscious", "Budget"]
  },
  {
    slug: "hake-sweet-potato-plate",
    name: "Hake, sweet potato and greens",
    summary: "Oven-baked hake with sweet potato and green vegetables.",
    reason: "A lighter high-protein meal with fibre and a moderate carbohydrate portion.",
    mealType: "dinner" as const,
    prepMinutes: 35,
    calories: 510,
    proteinG: "43",
    carbsG: "54",
    fatG: "12",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=85",
    ingredients: ["200 g hake fillet", "1 medium sweet potato", "Broccoli or green beans", "Lemon", "Paprika and pepper"],
    steps: ["Season and bake the hake.", "Roast or boil the sweet potato.", "Steam the greens and serve with lemon."],
    tags: ["Dinner", "Lean protein", "Heart-conscious"]
  },
  {
    slug: "lean-mince-sweet-potato",
    name: "Lean mince and sweet potato skillet",
    summary: "Lean beef mince, sweet potato, tomato and spinach.",
    reason: "A comforting, meal-prep-friendly dinner with enough protein to finish the day strongly.",
    mealType: "dinner" as const,
    prepMinutes: 35,
    calories: 590,
    proteinG: "45",
    carbsG: "58",
    fatG: "18",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85",
    ingredients: ["180 g lean beef mince", "1 medium sweet potato", "Spinach", "Onion", "Tomato"],
    steps: ["Brown the mince with onion.", "Add diced sweet potato and tomato with a splash of water.", "Cover until tender, then fold in spinach."],
    tags: ["Dinner", "Meal prep", "High protein"]
  },
  {
    slug: "chicken-wholewheat-wrap",
    name: "Chicken wholewheat wrap",
    summary: "Chicken strips, salad and yoghurt dressing in a wholewheat wrap.",
    reason: "A portable lunch that keeps protein high while being easier to prepare than a full plated meal.",
    mealType: "lunch" as const,
    prepMinutes: 18,
    calories: 540,
    proteinG: "44",
    carbsG: "52",
    fatG: "16",
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=1200&q=85",
    ingredients: ["160 g cooked chicken", "1 large wholewheat wrap", "Lettuce", "Tomato", "2 tbsp plain yoghurt", "Mustard"],
    steps: ["Warm the wrap.", "Add chicken and vegetables.", "Mix yoghurt and mustard, drizzle over filling and roll."],
    tags: ["Lunch", "Portable", "High protein"]
  },
  {
    slug: "banana-peanut-butter-recovery-shake",
    name: "Banana peanut-butter recovery shake",
    summary: "Your whey, banana, peanut butter and creatine shake.",
    reason: "Convenient protein after evening training, including the daily 5 g creatine target.",
    mealType: "post_workout" as const,
    prepMinutes: 4,
    calories: 330,
    proteinG: "24",
    carbsG: "38",
    fatG: "10",
    image: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=1200&q=85",
    ingredients: ["1 scoop Titan True Whey", "1 banana", "1 tbsp peanut butter", "300 ml water", "5 g creatine"],
    steps: ["Add all ingredients to a blender.", "Blend until smooth.", "Drink after training or use as a protein-gap snack."],
    tags: ["Post-workout", "Fast", "Your plan"]
  },
  {
    slug: "lentil-chicken-bowl",
    name: "Chicken and lentil bowl",
    summary: "Chicken, lentils, vegetables and herbs in one filling bowl.",
    reason: "Combines lean protein and fibre for appetite control on fat-loss-focused days.",
    mealType: "dinner" as const,
    prepMinutes: 30,
    calories: 560,
    proteinG: "49",
    carbsG: "58",
    fatG: "12",
    image: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=1200&q=85",
    ingredients: ["160 g chicken breast", "3/4 cup cooked lentils", "Mixed vegetables", "Tomato", "Herbs and spices"],
    steps: ["Cook and slice the chicken.", "Warm lentils with tomato and vegetables.", "Combine and season with herbs."],
    tags: ["High fibre", "High protein", "Fat loss"]
  }
];

const exerciseSeeds = [
  ["push-ups", "Push-ups", "Chest + triceps", "Bodyweight", ["Place hands slightly wider than shoulder width.", "Brace the core and keep a straight line from head to heel.", "Lower under control and press back up."], ["Flaring elbows directly sideways", "Letting the hips sag"]],
  ["dumbbell-floor-press", "Dumbbell floor press", "Chest + triceps", "Dumbbells", ["Lie on the floor with knees bent.", "Hold dumbbells near chest level.", "Press upward and lower until upper arms lightly touch the floor."], ["Banging dumbbells together", "Flaring elbows to 90 degrees"]],
  ["dumbbell-fly", "Dumbbell fly", "Chest", "Dumbbells", ["Lie on the floor with arms above the chest.", "Keep a soft bend in the elbows.", "Open the arms slowly and squeeze back to the top."], ["Using too much weight", "Turning the movement into a press"]],
  ["overhead-triceps-extension", "Overhead triceps extension", "Triceps", "One dumbbell", ["Hold one dumbbell overhead.", "Keep elbows pointing forward.", "Lower behind the head and extend without arching the back."], ["Elbows drifting wide", "Overextending the lower back"]],
  ["close-grip-push-up", "Close-grip push-up", "Triceps + chest", "Bodyweight", ["Place hands just inside shoulder width.", "Keep elbows close to the torso.", "Lower with control and press up."], ["Hands too close together", "Losing a straight body line"]],
  ["one-arm-dumbbell-row", "One-arm dumbbell row", "Back + biceps", "Dumbbell", ["Support one hand on a stable surface.", "Keep the spine neutral.", "Pull the dumbbell toward the hip and lower slowly."], ["Twisting the torso", "Shrugging the shoulder"]],
  ["reverse-fly", "Reverse fly", "Rear shoulders + upper back", "Dumbbells", ["Hinge at the hips with a neutral spine.", "Keep elbows softly bent.", "Raise arms out to the sides and lower under control."], ["Swinging the weights", "Shrugging toward the ears"]],
  ["biceps-curl", "Biceps curl", "Biceps", "Dumbbells", ["Stand tall with palms forward.", "Keep elbows close to the body.", "Curl without swinging and lower fully."], ["Using momentum", "Moving elbows forward"]],
  ["hammer-curl", "Hammer curl", "Biceps + forearms", "Dumbbells", ["Hold dumbbells with palms facing inward.", "Keep elbows fixed.", "Curl and lower under control."], ["Swinging", "Rushing the lowering phase"]],
  ["zottman-curl", "Zottman curl", "Biceps + forearms", "Dumbbells", ["Curl with palms facing up.", "Rotate palms down at the top.", "Lower slowly, then reset."], ["Using excessive weight", "Skipping the controlled lowering"]],
  ["dumbbell-shoulder-press", "Dumbbell shoulder press", "Shoulders", "Dumbbells", ["Brace the core and hold dumbbells at shoulder height.", "Press overhead without leaning back.", "Lower to shoulder level under control."], ["Overarching the back", "Pressing too far behind the head"]],
  ["lateral-raise", "Lateral raise", "Side shoulders", "Dumbbells", ["Stand tall with light dumbbells.", "Raise arms to roughly shoulder height.", "Lead with elbows and lower slowly."], ["Shrugging", "Swinging heavy weights"]],
  ["rear-delt-fly", "Rear-delt fly", "Rear shoulders", "Dumbbells", ["Hinge forward with a neutral spine.", "Raise arms diagonally outward.", "Pause briefly and lower slowly."], ["Rounding the back", "Pulling with the traps"]],
  ["forearm-plank", "Forearm plank", "Core", "Bodyweight", ["Place elbows below shoulders.", "Brace the abdomen and glutes.", "Hold a straight line while breathing normally."], ["Hips too high", "Holding the breath"]],
  ["leg-raise", "Leg raise", "Lower core", "Bodyweight", ["Lie flat and brace the lower back against the floor.", "Raise legs under control.", "Lower only as far as the back stays stable."], ["Arching the lower back", "Using momentum"]],
  ["bicycle-crunch", "Bicycle crunch", "Core", "Bodyweight", ["Lie down with hands lightly behind the head.", "Rotate shoulder toward opposite knee.", "Move slowly while extending the other leg."], ["Pulling the neck", "Pedalling too quickly"]],
  ["goblet-squat", "Goblet squat", "Legs + glutes", "Dumbbell", ["Hold a dumbbell close to the chest.", "Sit down between the hips while keeping the chest tall.", "Drive through the whole foot to stand."], ["Knees collapsing inward", "Heels lifting"]],
  ["dumbbell-lunge", "Dumbbell lunge", "Legs + glutes", "Dumbbells", ["Take a controlled step forward.", "Lower both knees while staying tall.", "Push through the front foot to return."], ["Front knee collapsing inward", "Taking too narrow a step"]],
  ["romanian-deadlift", "Romanian deadlift", "Hamstrings + glutes", "Dumbbells", ["Hold dumbbells in front of the thighs.", "Push hips back with a neutral spine.", "Stop when hamstrings are loaded, then stand by driving hips forward."], ["Rounding the back", "Turning it into a squat"]],
  ["calf-raise", "Standing calf raise", "Calves", "Bodyweight or dumbbells", ["Stand tall with feet hip-width apart.", "Rise onto the balls of the feet.", "Pause and lower through a full range."], ["Bouncing", "Rolling ankles outward"]],
  ["side-knee-lift", "Side knee lift", "Obliques + hips", "Bodyweight", ["Stand tall with hands lightly behind the head.", "Lift one knee toward the same-side elbow.", "Return slowly and alternate."], ["Pulling the neck", "Leaning excessively"]],
  ["mountain-climber", "Mountain climber", "Core + conditioning", "Bodyweight", ["Start in a strong high-plank position.", "Drive one knee toward the chest.", "Alternate while keeping hips steady."], ["Bouncing hips", "Hands too far ahead of shoulders"]]
] as const;

async function upsertMedia(input: typeof schema.mediaAssets.$inferInsert) {
  const rows = await db.insert(schema.mediaAssets).values(input).onConflictDoUpdate({
    target: schema.mediaAssets.url,
    set: {
      type: input.type,
      sourceUrl: input.sourceUrl,
      creatorName: input.creatorName,
      creatorUrl: input.creatorUrl,
      licenseName: input.licenseName,
      licenseUrl: input.licenseUrl,
      attributionText: input.attributionText,
      lastVerifiedAt: input.lastVerifiedAt
    }
  }).returning({ id: schema.mediaAssets.id });
  return required(rows[0], "media asset").id;
}

async function main() {
  console.log("🌱 Seeding FitForge into Neon...");

  const userRows = await db.insert(schema.users).values({
    email: DEMO_EMAIL,
    displayName: "Thabo Pali"
  }).onConflictDoUpdate({
    target: schema.users.email,
    set: { displayName: "Thabo Pali" }
  }).returning({ id: schema.users.id });
  const userId = required(userRows[0], "demo user").id;

  await db.insert(schema.profiles).values({
    userId,
    goal: "body_recomposition",
    heightCm: 168,
    startingWeightKg: "88",
    proteinTargetMinG: 140,
    proteinTargetMaxG: 160,
    waterTargetMl: 2500,
    stepTarget: 10000,
    creatineTargetG: 5,
    trainingDaysPerWeek: 4
  }).onConflictDoUpdate({
    target: schema.profiles.userId,
    set: {
      goal: "body_recomposition",
      heightCm: 168,
      startingWeightKg: "88",
      proteinTargetMinG: 140,
      proteinTargetMaxG: 160,
      waterTargetMl: 2500,
      stepTarget: 10000,
      creatineTargetG: 5,
      trainingDaysPerWeek: 4
    }
  });

  const foodRows = [
    ["Chicken breast", "200 g cooked", 330, "62", "0", "7"],
    ["Eggs", "3 large eggs", 216, "19", "1", "15"],
    ["Greek yoghurt", "170 g", 120, "17", "7", "2"],
    ["Titan True Whey", "1 scoop / 25 g", 100, "19", "1.5", "1"],
    ["Lean beef mince", "180 g cooked", 390, "45", "0", "22"],
    ["Hake", "200 g cooked", 220, "42", "0", "5"],
    ["Tuna in spring water", "1 drained tin", 145, "32", "0", "1"],
    ["Cottage cheese", "200 g low fat", 190, "24", "8", "6"],
    ["Lentils", "1 cup cooked", 230, "18", "40", "1"],
    ["Oats", "1/2 cup dry", 150, "5", "27", "3"]
  ] as const;

  for (const [name, servingLabel, calories, proteinG, carbsG, fatG] of foodRows) {
    await db.insert(schema.foods).values({ name, servingLabel, calories, proteinG, carbsG, fatG }).onConflictDoUpdate({
      target: schema.foods.name,
      set: { servingLabel, calories, proteinG, carbsG, fatG }
    });
  }

  const recipeIds = new Map<string, number>();
  for (const recipe of recipeSeeds) {
    const imageAssetId = await upsertMedia({
      type: "food_photo",
      url: recipe.image,
      sourceUrl: "https://unsplash.com/",
      licenseName: "Unsplash License",
      licenseUrl: "https://unsplash.com/license",
      attributionText: "Image delivered by Unsplash. Verify and display the specific photographer attribution before public launch.",
      lastVerifiedAt: new Date()
    });

    const rows = await db.insert(schema.recipes).values({
      slug: recipe.slug,
      name: recipe.name,
      summary: recipe.summary,
      reason: recipe.reason,
      mealType: recipe.mealType,
      prepMinutes: recipe.prepMinutes,
      calories: recipe.calories,
      proteinG: recipe.proteinG,
      carbsG: recipe.carbsG,
      fatG: recipe.fatG,
      ingredientsJson: JSON.stringify(recipe.ingredients),
      stepsJson: JSON.stringify(recipe.steps),
      tagsJson: JSON.stringify(recipe.tags),
      imageAssetId,
      isPublished: true
    }).onConflictDoUpdate({
      target: schema.recipes.slug,
      set: {
        name: recipe.name,
        summary: recipe.summary,
        reason: recipe.reason,
        mealType: recipe.mealType,
        prepMinutes: recipe.prepMinutes,
        calories: recipe.calories,
        proteinG: recipe.proteinG,
        carbsG: recipe.carbsG,
        fatG: recipe.fatG,
        ingredientsJson: JSON.stringify(recipe.ingredients),
        stepsJson: JSON.stringify(recipe.steps),
        tagsJson: JSON.stringify(recipe.tags),
        imageAssetId,
        isPublished: true
      }
    }).returning({ id: schema.recipes.id });
    recipeIds.set(recipe.slug, required(rows[0], `recipe ${recipe.slug}`).id);
  }

  const exerciseIds = new Map<string, number>();
  for (const [slug, name, muscleGroup, equipment, instructions, mistakes] of exerciseSeeds) {
    const illustrationAssetId = await upsertMedia({
      type: "exercise_illustration",
      url: `/exercises/${slug}.svg`,
      sourceUrl: `/exercises/${slug}.svg`,
      creatorName: "FitForge",
      licenseName: "Original FitForge asset",
      attributionText: "Original exercise illustration created for FitForge.",
      lastVerifiedAt: new Date()
    });
    const videoUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${name} proper form`)}`;
    const videoAssetId = await upsertMedia({
      type: "exercise_video",
      url: videoUrl,
      sourceUrl: videoUrl,
      licenseName: "External YouTube link",
      licenseUrl: "https://www.youtube.com/static?template=terms",
      attributionText: "External search link only. Replace with a manually reviewed embeddable video before public launch.",
      lastVerifiedAt: new Date()
    });

    const rows = await db.insert(schema.exercises).values({
      slug,
      name,
      muscleGroup,
      equipment,
      instructionsJson: JSON.stringify(instructions),
      commonMistakesJson: JSON.stringify(mistakes),
      illustrationAssetId,
      videoAssetId
    }).onConflictDoUpdate({
      target: schema.exercises.slug,
      set: {
        name,
        muscleGroup,
        equipment,
        instructionsJson: JSON.stringify(instructions),
        commonMistakesJson: JSON.stringify(mistakes),
        illustrationAssetId,
        videoAssetId
      }
    }).returning({ id: schema.exercises.id });
    exerciseIds.set(slug, required(rows[0], `exercise ${slug}`).id);
  }

  const existingWorkout = await db.select({ id: schema.workoutPlans.id }).from(schema.workoutPlans)
    .where(and(eq(schema.workoutPlans.userId, userId), eq(schema.workoutPlans.name, "Thabo's 4-Day Dumbbell Plan"))).limit(1);
  let workoutPlanId = existingWorkout[0]?.id;
  if (!workoutPlanId) {
    const rows = await db.insert(schema.workoutPlans).values({ userId, name: "Thabo's 4-Day Dumbbell Plan", active: true }).returning({ id: schema.workoutPlans.id });
    workoutPlanId = required(rows[0], "workout plan").id;
  }
  await db.delete(schema.workoutPlanItems).where(eq(schema.workoutPlanItems.planId, workoutPlanId));

  const days = [
    [1, "Monday · Chest + Triceps", [["push-ups",3,10,20,null],["dumbbell-floor-press",3,10,12,null],["dumbbell-fly",3,10,12,null],["overhead-triceps-extension",3,10,12,null],["close-grip-push-up",3,6,15,null]]],
    [2, "Tuesday · Back + Biceps", [["one-arm-dumbbell-row",3,10,12,null],["reverse-fly",3,10,12,null],["biceps-curl",3,10,12,null],["hammer-curl",3,10,12,null],["zottman-curl",3,8,10,null]]],
    [3, "Wednesday · Shoulders + Core", [["dumbbell-shoulder-press",3,10,12,null],["lateral-raise",3,10,15,null],["rear-delt-fly",3,10,15,null],["forearm-plank",3,null,null,45],["leg-raise",3,10,15,null],["bicycle-crunch",3,20,20,null]]],
    [4, "Thursday · Legs + Core", [["goblet-squat",3,12,15,null],["dumbbell-lunge",3,10,12,null],["romanian-deadlift",3,10,12,null],["calf-raise",4,15,20,null],["side-knee-lift",3,15,20,null],["mountain-climber",3,null,null,30]]]
  ] as const;

  for (const [dayOrder, dayName, items] of days) {
    for (let i = 0; i < items.length; i++) {
      const [slug, sets, repsMin, repsMax, durationSeconds] = items[i];
      await db.insert(schema.workoutPlanItems).values({
        planId: workoutPlanId,
        dayOrder,
        dayName,
        exerciseId: exerciseIds.get(slug)!,
        exerciseOrder: i + 1,
        sets,
        repsMin,
        repsMax,
        durationSeconds
      });
    }
  }

  const existingMealPlan = await db.select({ id: schema.mealPlans.id }).from(schema.mealPlans)
    .where(and(eq(schema.mealPlans.userId, userId), eq(schema.mealPlans.name, "Body Recomposition Weekly Plan"))).limit(1);
  let mealPlanId = existingMealPlan[0]?.id;
  if (!mealPlanId) {
    const rows = await db.insert(schema.mealPlans).values({ userId, name: "Body Recomposition Weekly Plan", active: true }).returning({ id: schema.mealPlans.id });
    mealPlanId = required(rows[0], "meal plan").id;
  }
  await db.delete(schema.mealPlanItems).where(eq(schema.mealPlanItems.planId, mealPlanId));

  const weeklyMeals: Record<number, Array<[MealType, string]>> = {
    1: [["breakfast","eggs-wholewheat-toast"],["snack","greek-yoghurt-fruit"],["lunch","grilled-chicken-power-bowl"],["post_workout","banana-peanut-butter-recovery-shake"],["dinner","lean-mince-sweet-potato"]],
    2: [["breakfast","protein-oats-banana"],["snack","cottage-cheese-apple"],["lunch","tuna-avocado-crunch-bowl"],["post_workout","banana-peanut-butter-recovery-shake"],["dinner","hake-sweet-potato-plate"]],
    3: [["breakfast","eggs-wholewheat-toast"],["snack","boiled-eggs-fruit"],["lunch","chicken-wholewheat-wrap"],["post_workout","banana-peanut-butter-recovery-shake"],["dinner","chicken-lentil-bowl"]],
    4: [["breakfast","protein-oats-banana"],["snack","greek-yoghurt-fruit"],["lunch","grilled-chicken-power-bowl"],["post_workout","banana-peanut-butter-recovery-shake"],["dinner","hake-sweet-potato-plate"]],
    5: [["breakfast","eggs-wholewheat-toast"],["snack","cottage-cheese-apple"],["lunch","tuna-avocado-crunch-bowl"],["snack","boiled-eggs-fruit"],["dinner","lean-mince-sweet-potato"]],
    6: [["breakfast","protein-oats-banana"],["snack","greek-yoghurt-fruit"],["lunch","chicken-wholewheat-wrap"],["snack","cottage-cheese-apple"],["dinner","chicken-lentil-bowl"]],
    7: [["breakfast","eggs-wholewheat-toast"],["snack","boiled-eggs-fruit"],["lunch","grilled-chicken-power-bowl"],["snack","greek-yoghurt-fruit"],["dinner","hake-sweet-potato-plate"]]
  };

  // Handle the recipe name used in the plan while keeping the canonical slug readable.
  recipeIds.set("chicken-lentil-bowl", recipeIds.get("lentil-chicken-bowl")!);

  for (const [day, entries] of Object.entries(weeklyMeals)) {
    for (let i = 0; i < entries.length; i++) {
      const [mealType, slug] = entries[i];
      await db.insert(schema.mealPlanItems).values({
        planId: mealPlanId,
        dayOfWeek: Number(day),
        mealType,
        recipeId: recipeIds.get(slug)!,
        sortOrder: i + 1
      });
    }
  }

  const habitDate = new Date().toISOString().slice(0, 10);
  await db.insert(schema.dailyHabits).values({
    userId,
    logDate: habitDate,
    waterMl: 1800,
    steps: 7420,
    creatineG: 5,
    proteinG: "108"
  }).onConflictDoUpdate({
    target: [schema.dailyHabits.userId, schema.dailyHabits.logDate],
    set: { waterMl: 1800, steps: 7420, creatineG: 5, proteinG: "108" }
  });

  const existingMeasurements = await db.select({ id: schema.bodyMeasurements.id }).from(schema.bodyMeasurements)
    .where(eq(schema.bodyMeasurements.userId, userId)).limit(1);
  if (existingMeasurements.length === 0) {
    await db.insert(schema.bodyMeasurements).values([
      { userId, measuredAt: new Date("2026-06-18T08:00:00+02:00"), weightKg: "88", pushupMax: 10 },
      { userId, measuredAt: new Date("2026-07-30T08:00:00+02:00"), weightKg: "88", pushupMax: 15 }
    ]);
  }

  console.log("✅ Seed complete");
  console.log(`   Demo user: ${DEMO_EMAIL}`);
  console.log(`   Recipes: ${recipeSeeds.length}`);
  console.log(`   Exercises: ${exerciseSeeds.length}`);
  console.log("   Meal plan: 7 days");
  console.log("   Workout plan: 4 days");
}

main().catch((error) => {
  console.error("❌ Seed failed", error);
  process.exit(1);
});
