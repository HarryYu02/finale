CREATE TABLE `investments` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date` integer NOT NULL,
	`ticker` text NOT NULL,
	`currency` text NOT NULL,
	`price` integer NOT NULL,
	`share` integer NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
