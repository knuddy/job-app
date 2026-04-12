import { db } from "@src/db/client.ts";
import { panel } from "@src/db/schema.ts";
import { eq, InferInsertModel } from "drizzle-orm";

export type Panel = typeof panel.$inferSelect;
type CreatePanel = InferInsertModel<typeof panel>;


export function getPanel(id: number) {
  return db.select().from(panel).where(eq(panel.id, id)).get();
}

export function getPanels(windowId: number) {
  return db.select().from(panel).where(eq(panel.windowId, windowId)).all();
}

export function createPanel(data: CreatePanel) {
  return db.insert(panel).values(data).returning().get();
}

export async function deletePanel(id: number) {
  await db.delete(panel).where(eq(panel.id, id));
}