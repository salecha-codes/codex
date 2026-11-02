CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`room` text NOT NULL,
	`slot` integer NOT NULL,
	`token_hash` text NOT NULL,
	`name` text NOT NULL,
	`character` integer NOT NULL,
	`input` text DEFAULT '{}' NOT NULL,
	`signal` text DEFAULT '{}' NOT NULL,
	`last_seen` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `room_slot` ON `members` (`room`,`slot`);--> statement-breakpoint
CREATE INDEX `room_member` ON `members` (`room`);--> statement-breakpoint
CREATE TABLE `rooms` (
	`code` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`state` text DEFAULT '{}' NOT NULL,
	`updated_at` integer NOT NULL
);
