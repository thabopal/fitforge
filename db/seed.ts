import { config } from "dotenv";
config({ path: ".env.local" });
// The authoritative production catalogue is already populated. Never run the
// obsolete serial-ID demo seed against it or overwrite existing user data.
async function main() {
  const { db } = await import("./index");
  const { foods, user, profiles } = await import("./schema");
  const [catalogue, users, profileRows] = await Promise.all([
    db.select({ id: foods.id }).from(foods),
    db.select({ id: user.id }).from(user),
    db.select({ id: profiles.id }).from(profiles),
  ]);
  if (!catalogue.length || !users.length || !profileRows.length) throw new Error("Reference data is missing. Prepare a reviewed, insert-only seed for the authoritative UUID schema.");
  console.log(`Seed skipped: ${catalogue.length} foods, ${users.length} users, ${profileRows.length} profiles already exist. No data written.`);
}
main().catch(() => { console.error("Seed check failed. No data written."); process.exitCode = 1; });
