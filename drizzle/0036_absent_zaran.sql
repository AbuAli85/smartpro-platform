ALTER TABLE `users` ADD `emailVerified` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerificationToken` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerificationExpiry` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `recoveryEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `users` ADD `recoveryEmailVerified` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordResetToken` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordResetExpiry` timestamp;