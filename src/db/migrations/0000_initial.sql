CREATE TABLE `job` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`hourly_rate` real NOT NULL,
	`evs_margin` real NOT NULL,
	`igu_margin` real NOT NULL,
	`sgu_rate` real NOT NULL,
	`igux2_rate` real NOT NULL,
	`product_margin` real NOT NULL,
	`travel_rate_per_km` real NOT NULL,
	CONSTRAINT "name_not_empty" CHECK(length(trim("job"."name")) > 0)
);
--> statement-breakpoint
CREATE TABLE `room` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`job_id` integer,
	FOREIGN KEY (`job_id`) REFERENCES `job`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "name_not_empty" CHECK(length(trim("room"."name")) > 0)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`hourly_rate` real DEFAULT 70 NOT NULL,
	`evs_margin` real DEFAULT 1.8 NOT NULL,
	`igu_margin` real DEFAULT 1.5 NOT NULL,
	`sgu_rate` real DEFAULT 114 NOT NULL,
	`igux2_rate` real DEFAULT 213.4 NOT NULL,
	`product_margin` real DEFAULT 1.5 NOT NULL,
	`travel_rate_per_km` real DEFAULT 2 NOT NULL,
	CONSTRAINT "id_check" CHECK("settings"."id" = 1)
);
