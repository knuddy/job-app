import { SQLocalDrizzle } from 'sqlocal/drizzle';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import * as schema from './schema';

export const { driver } = new SQLocalDrizzle('db.sqlite3');
export const db = drizzle(driver, { schema });
