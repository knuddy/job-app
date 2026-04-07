import { job } from "@src/db/schema.ts";
import { eq, InferInsertModel } from "drizzle-orm";
import { db } from "@src/db/client.ts";

export type Job = typeof job.$inferSelect;
type CreateJob = InferInsertModel<typeof job>;
type UpdateJob = Partial<typeof job.$inferInsert>;

export function getJob(id: number): Promise<Job | undefined> {
  return db.select().from(job).where(eq(job.id, id)).get()
}

export function getAllJobs(): Promise<Job[]> {
  return db.select().from(job);
}

export async function createJob(data: CreateJob): Promise<Job> {
  const [created] = await db.insert(job).values(data).returning();
  return created;

}

export async function updateJob(id: number, data: UpdateJob): Promise<Job> {
  const [updated] = await db.update(job).set(data).where(eq(job.id, id)).returning();
  return updated;
}

export async function deleteJob(id: number) {
  await db.delete(job).where(eq(job.id, id));
}