import { db } from "@src/db/client.ts";
import { window, panel } from "@src/db/schema.ts";
import { eq, sql } from "drizzle-orm";
import { createPanelMultipleOfSame } from '@src/db/queries/panel.ts';

export type Window = typeof window.$inferSelect;

const windowWithCount = {
  id: window.id,
  roomId: window.roomId,
  displayText: sql<string>`(count(${panel.id})) || ' Panel Window'`.as('display_name')
};

export type WindowWithCount = Window & { displayText: string };

export function getWindow(id: number): Promise<WindowWithCount | undefined> {
  return db
    .select(windowWithCount)
    .from(window)
    .leftJoin(panel, eq(window.id, panel.windowId))
    .where(eq(window.id, id))
    .groupBy(window.id)
    .get()
}

export function getWindows(roomId: number): Promise<WindowWithCount[]> {
  return db
    .select(windowWithCount)
    .from(window)
    .leftJoin(panel, eq(window.id, panel.windowId))
    .where(eq(window.roomId, roomId))
    .groupBy(window.id)
    .all();
}

export async function createWindow(roomId: number, panelCount?: number) {
  const inserted = await db.insert(window).values({ roomId }).returning().get();
  if (!inserted) throw new Error("Failed to create window");

  if (panelCount && panelCount > 0) {
    await createPanelMultipleOfSame({ windowId: inserted.id }, panelCount);
  }

  return {
    ...inserted,
    displayText: `${panelCount || 0} Panel Window`
  };
}


export async function deleteWindow(id: number) {
  await db.delete(window).where(eq(window.id, id));
}