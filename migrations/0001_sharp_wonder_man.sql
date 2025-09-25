CREATE TABLE `stock_prices` (
	`id` integer PRIMARY KEY NOT NULL,
	`ticker` text NOT NULL,
	`currency` text NOT NULL,
	`price` integer NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
