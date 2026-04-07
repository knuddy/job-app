import { db } from "@src/db/client.ts";
import { settings } from "@src/db/schema.ts";
import { eq } from "drizzle-orm";

type Settings = typeof settings.$inferSelect;
type UpdateSettings = typeof settings.$inferInsert;

export async function getSettings(): Promise<Settings | undefined> {
  return db.select().from(settings).where(eq(settings.id, 1)).get();
}

export async function updateSettings(data: UpdateSettings) {
  const [updated] = await db.update(settings).set(data).where(eq(settings.id, 1)).returning();
  return updated;
}