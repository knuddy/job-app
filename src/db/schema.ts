import { sqliteTable, integer, text, real, check } from 'drizzle-orm/sqlite-core';
import { sql } from "drizzle-orm";
import roomNames from '@src/db/lookups/room-names.ts';

export const settings = sqliteTable(
  'settings',
  {
    id: integer('id').primaryKey(),
    hourlyRate: real('hourly_rate').notNull().default(70.00),
    evsMargin: real('evs_margin').notNull().default(1.80),
    iguMargin: real('igu_margin').notNull().default(1.50),
    sguRate: real('sgu_rate').notNull().default(114.00),
    igux2Rate: real('igux2_rate').notNull().default(213.40),
    productMargin: real('product_margin').notNull().default(1.50),
    travelRatePerKm: real('travel_rate_per_km').notNull().default(2.00)
  },
  (table) => [
    check('id_check', sql`${table.id} = 1`),
  ]
);

export const job = sqliteTable(
  'job',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    hourlyRate: real('hourly_rate').notNull(),
    evsMargin: real('evs_margin').notNull(),
    iguMargin: real('igu_margin').notNull(),
    sguRate: real('sgu_rate').notNull(),
    igux2Rate: real('igux2_rate').notNull(),
    productMargin: real('product_margin').notNull(),
    travelRatePerKm: real('travel_rate_per_km').notNull()
  },
  (table) => [
    check('name_not_empty', sql`length(trim(${table.name})) > 0`),
  ]
);

export const room = sqliteTable(
  'room',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').$type<typeof roomNames[number]>().notNull(),
    jobId: integer('job_id').references(() => job.id, { onDelete: 'cascade' }).notNull(),
  },
  (table) => [
    check('name_not_empty', sql`length(trim(${table.name})) > 0`),
  ]
);
