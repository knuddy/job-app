import { db } from "@src/db/client.ts";
import { window, panel, job } from "@src/db/schema.ts";
import { type RoomWithOrdinal } from '@src/db/queries/room.ts';
import { eq, sql } from "drizzle-orm";

export type Window = typeof window.$inferSelect;

const windowWithCount = {
  id: window.id,
  roomId: window.roomId,
  jobId: window.jobId,
  notes: window.notes,
  job: job,
  displayText: sql<string>`(count(${panel.id})) || ' Panel Window'`.as('display_name')
};

export type WindowWithCount = Window & {
  displayText: string
  job: typeof job.$inferSelect;
};

export function getWindow(id: number): Promise<WindowWithCount | undefined> {
  return db
    .select(windowWithCount)
    .from(window)
    .innerJoin(job, eq(window.jobId, job.id))
    .leftJoin(panel, eq(window.id, panel.windowId))
    .where(eq(window.id, id))
    .groupBy(window.id)
    .get();
}

export function getWindows(roomId: number): Promise<WindowWithCount[]> {
  return db
    .select(windowWithCount)
    .from(window)
    .innerJoin(job, eq(window.jobId, job.id))
    .leftJoin(panel, eq(window.id, panel.windowId))
    .where(eq(window.roomId, roomId))
    .groupBy(window.id)
    .all();
}

export async function createWindow(room: RoomWithOrdinal) {
  const inserted = await db.insert(window).values({ roomId: room.id, jobId: room.jobId }).returning().get();
  if (!inserted) throw new Error("Failed to create window");
  return inserted;
}

export async function deleteWindow(id: number) {
  await db.delete(window).where(eq(window.id, id));
}