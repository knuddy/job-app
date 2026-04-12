import { db } from "@src/db/client.ts";
import { panel } from "@src/db/schema.ts";
import { eq, InferInsertModel } from "drizzle-orm";

export type Panel = typeof panel.$inferSelect;
type CreatePanel = InferInsertModel<typeof panel>;
type UpdatePanel = Partial<typeof panel.$inferInsert>;

export function getPanel(id: number) {
  return db.select().from(panel).where(eq(panel.id, id)).get();
}

export function getPanels(id: number) {
  return db.select().from(panel).where(eq(panel.windowId, id)).all();
}

export function createPanel(data: CreatePanel) {
  return db.insert(panel).values(data).returning().get();
}

export async function createPanelMultipleOfSame(data: CreatePanel, count: number) {
  if (count <= 0) return [];
  const bulk = Array.from({ length: count }).map(() => ({ ...data }));
  return db.insert(panel).values(bulk).returning();
}

export async function deletePanel(id: number) {
  await db.delete(panel).where(eq(panel.id, id));
}

export async function updatePanel(id: number, data: UpdatePanel): Promise<Panel> {
  const [updated] = await db.update(panel).set(data).where(eq(panel.id, id)).returning();
  return updated;
}