import { db } from "@src/db/client.ts";
import { room } from "@src/db/schema.ts";
import { and, eq, sql, InferInsertModel } from "drizzle-orm";

type Room = typeof room.$inferSelect;
type CreateRoom = InferInsertModel<typeof room>;
type UpdateRoom = Partial<typeof room.$inferInsert>;
export type RoomWithOrdinal = Room & { ordinal: number }

async function getOrdinal(instance: Room) {
  if (!instance?.id) return -1;

  const { count } = await db
    .select({ count: sql<number>`count(*)` })
    .from(room)
    .where(
      and(
        eq(room.jobId, instance.jobId),
        eq(room.name, instance.name),
        sql`${room.id} <= ${instance.id}`
      )
    )
    .get() as { count: number };
  return count;
}

export async function getRoom(id: number): Promise<RoomWithOrdinal | undefined> {
  const instance = await db
    .select()
    .from(room)
    .where(eq(room.id, id))
    .get()
  if (!instance) return undefined;
  const ordinal = await getOrdinal(instance);
  return { ...instance, ordinal } as RoomWithOrdinal | undefined;
}

export async function getRooms(jobId: number): Promise<RoomWithOrdinal[]> {
  const ordinalSql = sql<number>`
    ROW_NUMBER() OVER( 
      PARTITION BY ${room.jobId}, ${room.name}
      ORDER BY ${room.id} ASC
    )
   `.as('ordinal')

  return db
    .select({
      id: room.id,
      name: room.name,
      jobId: room.jobId,
      notes: room.notes,
      ordinal: ordinalSql,
    })
    .from(room)
    .where(eq(room.jobId, jobId))
    .orderBy(room.name);
}

export async function createRoom(data: CreateRoom): Promise<RoomWithOrdinal> {
  const [inserted] = await db.insert(room).values(data).returning();
  const ordinal = await getOrdinal(inserted);
  return { ...inserted, ordinal };
}

export async function updateRoom(id: number, data: UpdateRoom): Promise<RoomWithOrdinal> {
  const [updated] = await db.update(room).set(data).where(eq(room.id, id)).returning();
  const ordinal = await getOrdinal(updated);
  return { ...updated, ordinal };
}

export async function deleteRoom(id: number) {
  await db.delete(room).where(eq(room.id, id));
}