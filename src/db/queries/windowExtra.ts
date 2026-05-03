import { db } from "@src/db/client.ts";
import { windowExtra } from "@src/db/schema.ts";
import { eq, InferInsertModel } from "drizzle-orm";

export type WindowExtra = typeof windowExtra.$inferSelect;
type CreateWindowExtra = InferInsertModel<typeof windowExtra>;
type UpdateWindowExtra = Partial<typeof windowExtra.$inferInsert>;

export async function getWindowExtra(id: number): Promise<WindowExtra | undefined> {
  const instance = await db.select().from(windowExtra).where(eq(windowExtra.id, id)).get();
  if (!instance?.id) return undefined;
  return instance;
}

export function getWindowExtras(windowId: number): Promise<WindowExtra[]> {
  return db.select().from(windowExtra).where(eq(windowExtra.windowId, windowId)).all();
}

export async function createWindowExtra(data: CreateWindowExtra): Promise<WindowExtra> {
  const [inserted] = await db.insert(windowExtra).values(data).returning();
  if (!inserted) throw new Error("Failed to create window extra");
  return inserted;
}
export async function updateWindowExtra(id: number, data: UpdateWindowExtra): Promise<WindowExtra> {
  const [updated] = await db.update(windowExtra).set(data).where(eq(windowExtra.id, id)).returning();
  if (!updated) throw new Error("Failed to update window extra");
  return updated;
}

export async function deleteWindowExtra(id: number) {
  await db.delete(windowExtra).where(eq(windowExtra.id, id));
}