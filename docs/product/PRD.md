# FitForge v1.0 Product Requirements Document

## Problem

People beginning or resuming strength training often juggle disconnected meal plans, workout notes, videos, supplement reminders, shopping lists, and body measurements. Many fitness products are either intimidating, overly generic, advertisement-heavy, or designed around guilt-inducing streaks.

## Product promise

FitForge turns a user's goal into a clear daily plan: what to eat, what to train, what to log, and what progress means.

## Primary persona

### Thabo, experienced technologist and early-stage trainee

- Trains three to four evenings weekly
- Uses dumbbells and bodyweight exercises
- Wants body recomposition rather than indiscriminate weight gain
- Needs a protein-focused South African-friendly meal plan
- Values visuals, explanations, and measurable progress
- Has limited appetite for repetitive manual setup

## Secondary personas

- Beginner home trainee
- Busy professional returning to exercise
- User following a trainer-created plan
- User seeking a visual meal and recipe organiser

## Core user journeys

### First-time onboarding

1. Register.
2. Confirm profile details.
3. Select goal.
4. Set available training days and equipment.
5. Set dietary preferences and exclusions.
6. Review calculated/default targets.
7. Accept a starter plan.
8. Arrive at a populated dashboard.

### Daily nutrition

1. Open dashboard.
2. Review planned meals.
3. Mark meals complete or substitute.
4. Log water, supplement and protein totals.
5. Review remaining protein requirement.

### Workout session

1. Start today's workout.
2. View exercise form guidance.
3. Log sets, reps and weight.
4. Use rest timer.
5. Complete session.
6. Receive a simple progression note.

### Weekly review

1. Review workouts completed.
2. Review protein-target consistency.
3. Review weight and waist trends.
4. View strength progress.
5. Adjust the next week without resetting unfinished sessions.

## Functional requirements

### Authentication

- Email/password registration and login
- Password reset
- Session management
- Protected application routes
- User and admin roles

### Dashboard

- Today's workout
- Today's meals
- Protein progress
- Water progress
- Steps
- Creatine status
- Latest weight/waist
- Weekly momentum summary

### Recipes

- Browse, search and filter
- Recipe details
- Nutrition per serving
- Ingredients and quantities
- Ordered preparation steps
- Purpose tags
- Dietary and allergen tags
- Preparation time and difficulty
- Image attribution
- Save favourites
- Admin CRUD for curated recipes
- User CRUD for private recipes

### Meal planning

- Seven-day plan
- Meal slots
- Portion adjustments
- Meal completion
- Substitutions
- Plan templates
- Shopping-list generation

### Foods

- Nutrition per serving
- Serving units
- Categories
- Alternatives/substitutions
- Search

### Workouts

- Weekly plan
- Exercise details
- Target sets, reps and rest
- Session logging
- Previous performance
- Progression suggestions based on deterministic rules
- Roll unfinished workout forward

### Progress

- Weight
- Waist
- Optional chest and arm measurements
- Push-up benchmark
- Exercise personal bests
- Progress photos
- Weekly charts

### Media governance

- Store asset source and licence
- Store creator and attribution
- Store last verification date
- Disable or replace invalid assets
- Link to, rather than re-upload, third-party training videos unless licensed

### Administration

- Manage shared recipes, foods, exercises, programmes and media assets
- Publish/unpublish curated content
- Review broken video and image links

## Non-functional requirements

- Mobile-first and keyboard accessible
- Core pages usable at 360 px width
- Typical dashboard response under two seconds on warm infrastructure
- No secrets in client bundles
- User-owned queries authorised server-side
- Database migrations reproducible
- Seed operation repeatable
- CI must pass before merge
- Graceful empty, loading and error states

## Recommendation rules for v1

Recommendations are deterministic and explainable.

Examples:

- Protein remaining = target minus logged protein.
- Increase exercise repetitions before weight when all sets are completed with clean form.
- Suggest a higher variation after repeated benchmark success.
- Recommend meal alternatives based on meal slot, protein threshold, preparation time, dietary preferences and budget tag.

AI-generated advice is deferred until the structured data and rule engine are reliable.

## Success metrics

- Onboarding completion rate
- Weekly active users
- Meals logged per active user
- Workouts completed per active user
- Percentage of users with at least two weeks of measurements
- Shopping lists generated
- Recipe saves
- Seven-day and thirty-day retention

## Safety and content posture

FitForge provides general fitness and nutrition organisation, not diagnosis or treatment. Users with medical conditions, medication concerns, pregnancy, eating disorders, kidney disease, or other clinically relevant needs should consult an appropriately qualified professional.