ALTER TABLE `taccounts` ADD `user_id` text NOT NULL REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `transactions` ADD `user_id` text NOT NULL REFERENCES users(id);