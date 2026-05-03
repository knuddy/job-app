import { db } from "@src/db/client.ts";
import { panel } from "@src/db/schema.ts";
import { and, eq, sql, InferInsertModel } from "drizzle-orm";
import { WindowWithCount } from '@src/db/queries/window.ts';

type Panel = typeof panel.$inferSelect;
type CreatePanel = InferInsertModel<typeof panel>;
type UpdatePanel = Partial<typeof panel.$inferInsert>;
export type PanelWithOrdinal = Panel & { ordinal: number };

async function getOrdinal(instance: Panel) {
  if (!instance?.id) return -1;

  const { count } = await db
    .select({ count: sql<number>`count(*)` })
    .from(panel)
    .where(
      and(
        eq(panel.windowId, instance.windowId),
        sql`${panel.id} <= ${instance.id}`
      )
    )
    .get() as { count: number };

  return count;
}

export async function getPanel(id: number): Promise<PanelWithOrdinal | undefined> {
  const instance = await db.select().from(panel).where(eq(panel.id, id)).get();
  if (!instance?.id) return undefined;

  const ordinal = await getOrdinal(instance);
  return { ...instance, ordinal };
}

export function getPanels(id: number): Promise<PanelWithOrdinal[]> {
  const ordinalSql = sql<number>`ROW_NUMBER() OVER(ORDER BY ${panel.id} ASC)`.as('ordinal')

  return db
    .select({
      id: panel.id,
      windowId: panel.windowId,
      jobId: panel.jobId,
      width: panel.width,
      height: panel.height,
      center: panel.center,
      styleType: panel.styleType,
      safetyType: panel.safetyType,
      glassType: panel.glassType,
      ordinal: ordinalSql
    })
    .from(panel)
    .where(eq(panel.windowId, id))
    .all();
}

export async function createPanel(window: WindowWithCount): Promise<PanelWithOrdinal> {
  const [inserted] = await db.insert(panel).values({ windowId: window.id, jobId: window.jobId }).returning();
  const ordinal = await getOrdinal(inserted);
  return { ...inserted, ordinal };
}

export async function createPanelMultipleOfSame(data: CreatePanel, count: number): Promise<PanelWithOrdinal[]> {
  if (count <= 0) return [];
  const bulk = Array.from({ length: count }).map(() => ({ ...data }));
  const results = await db.insert(panel).values(bulk).returning();

  // Get the ordinal of the first panel in the batch
  const firstPanel = results[0];
  const firstOrdinal = await getOrdinal(firstPanel);

  // Map through results and increment the ordinal manually
  return results.map((p, index) => ({ ...p, ordinal: firstOrdinal + index }));
}

export function duplicatePanel(sourcePanel: Panel, times: number = 1): Promise<PanelWithOrdinal[]> {
  // Strip the ID to satisfy CreatePanel (Insert Model)
  const { id, ...dataToClone } = sourcePanel;

  // Reuse existing for now.
  return createPanelMultipleOfSame(dataToClone, times);
}

export async function updatePanel(id: number, data: UpdatePanel): Promise<PanelWithOrdinal> {
  const [updated] = await db.update(panel).set(data).where(eq(panel.id, id)).returning();
  const ordinal = await getOrdinal(updated);
  return { ...updated, ordinal };
}

export async function deletePanel(id: number) {
  await db.delete(panel).where(eq(panel.id, id));
}