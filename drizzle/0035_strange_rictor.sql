ALTER TABLE `users` ADD `mfaEnabled` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `mfaSecret` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `mfaBackupCodes` json;--> statement-breakpoint
ALTER TABLE `users` ADD `mfaEnabledAt` timestamp;