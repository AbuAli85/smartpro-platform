ALTER TABLE `users` ADD `referralCode` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_referralCode_unique` UNIQUE(`referralCode`);