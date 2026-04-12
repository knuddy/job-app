import { db } from "@src/db/client.ts";
import { window, panel } from "@src/db/schema.ts";
import { eq, InferInsertModel, count } from "drizzle-orm";

export type Window = typeof window.$inferSelect;
type CreateWindow = InferInsertModel<typeof window>;

const windowWithCount = {
  id: window.id,
  roomId: window.roomId,
  panelCount: count(panel.id).mapWith(Number),
};

export function getWindow(id: number) {
  return db
    .select(windowWithCount)
    .from(window)
    .leftJoin(panel, eq(window.id, panel.windowId))
    .where(eq(window.id, id))
    .groupBy(window.id)
    .get()
}

export function getWindows(roomId: number) {
  return db
    .select(windowWithCount)
    .from(window)
    .leftJoin(panel, eq(window.id, panel.windowId))
    .where(eq(window.roomId, roomId))
    .groupBy(window.id)
    .all();
}

export async function createWindow(data: CreateWindow) {
  const inserted = await db.insert(window).values(data).returning().get();
  return { ...inserted, panelCount: 0 };
}

export async function deleteWindow(id: number) {
  await db.delete(window).where(eq(window.id, id));
}