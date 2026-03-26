import { db } from '@src/db/client';
import { settings } from '@src/db/schema.ts';
import { count } from 'drizzle-orm';

export default async function seedDatabase() {
  console.debug('Checking if database requires seeding..');

  const settingsRowCount = await db.select({ count: count(settings.id) }).from(settings).get();
  if (!settingsRowCount || settingsRowCount.count === 0) {
    try {
      console.debug('Initialising settings');
      await db.insert(settings).values({ id: 1 }).onConflictDoNothing();
      console.debug('Settings initialised successfully');
    } catch (error) {
      console.error(`Failed to initialise settings: ${error}`);
    }
  }
}