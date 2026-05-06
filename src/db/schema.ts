import { sqliteTable, integer, text, real, check } from 'drizzle-orm/sqlite-core';
import { sql } from "drizzle-orm";
import roomNames from '@src/db/lookups/room-names.ts';
import safetyOptions from '@src/db/lookups/safety-options.ts';
import glassTypes from '@src/db/lookups/glass-types.ts';
import styleTypes from '@src/db/lookups/style-types.ts';
import extrasOptions from '@src/db/lookups/extras-options.ts';

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
    travelRatePerKm: real('travel_rate_per_km').notNull(),
    notes: text('notes').notNull().default(''),
  },
  (table) => [
    check('name_not_empty', sql`length(trim(${table.name})) > 0`),
  ]
);

export const room = sqliteTable(
  'room',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    jobId: integer('job_id').references(() => job.id, { onDelete: 'cascade' }).notNull(),
    name: text('name').$type<typeof roomNames[number]>().notNull(),
    notes: text('notes').notNull().default(''),
  },
  (table) => [
    check('name_not_empty', sql`length(trim(${table.name})) > 0`),
  ]
);


export const window = sqliteTable(
  'window',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    roomId: integer('room_id').references(() => room.id, { onDelete: 'cascade' }).notNull(),
    jobId: integer('job_id').references(() => job.id, { onDelete: 'cascade' }).notNull(),
    notes: text('notes').notNull().default(''),
  }
);

export const panel = sqliteTable(
  'panel',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    windowId: integer('window_id').references(() => window.id, { onDelete: 'cascade' }).notNull(),
    width: real('width').notNull().default(0),
    height: real('height').notNull().default(0),
    center: real('center').notNull().default(0),
    styleType: text('style_type')
      .$type<typeof styleTypes[number]['name']>()
      .notNull()
      .default(styleTypes[0].name),
    safetyType: text('safety_type')
      .$type<typeof safetyOptions[number]['name']>()
      .notNull()
      .default(safetyOptions[0].name),
    glassType: text('glass_type')
      .$type<typeof glassTypes[number]['name']>()
      .notNull()
      .default(glassTypes[0].name),
    glassCost: real('glass_cost').notNull().default(0),
    dgHour: real('dg_hour').notNull().default(0),
    dgCost: real('dg_cost').notNull().default(0),
    evsHour: real('evs_hour').notNull().default(0),
    evsCost: real('evs_cost').notNull().default(0)

  }
);

export const windowExtra = sqliteTable(
  'extra',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    windowId: integer('window_id').references(() => window.id, { onDelete: 'cascade' }).notNull(),
    option: text('option')
      .$type<typeof extrasOptions[number]['name']>()
      .notNull()
      .default(extrasOptions[0].name),
    quantity: integer('quantity').notNull(),
    totalCost: real('total_cost').notNull().default(0),
  }
);


