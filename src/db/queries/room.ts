import { db } from "@src/db/client.ts";
import { type Room, room } from "@src/db/schema.ts";
import { eq } from "drizzle-orm";

export async function getRooms(id: number): Promise<Room[]> {
  return db.select().from(room).where(eq(room.jobId, id));
}