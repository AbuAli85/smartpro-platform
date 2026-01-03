CREATE TABLE `loyalty_points` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalPoints` int NOT NULL DEFAULT 0,
	`availablePoints` int NOT NULL DEFAULT 0,
	`redeemedPoints` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loyalty_points_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loyalty_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('earn','redeem') NOT NULL,
	`points` int NOT NULL,
	`reason` varchar(255) NOT NULL,
	`bookingId` int,
	`reviewId` int,
	`referralId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `loyalty_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `user_idx` ON `loyalty_points` (`userId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `loyalty_transactions` (`userId`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `loyalty_transactions` (`type`);