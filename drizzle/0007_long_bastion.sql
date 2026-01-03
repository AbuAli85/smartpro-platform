CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('booking','points','system','review','referral') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`bookingId` int,
	`reviewId` int,
	`referralId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`actionUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referralCode` varchar(20) NOT NULL,
	`referredId` int,
	`status` enum('pending','completed','expired') NOT NULL DEFAULT 'pending',
	`pointsAwarded` boolean NOT NULL DEFAULT false,
	`firstBookingId` int,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_referralCode_unique` UNIQUE(`referralCode`)
);
--> statement-breakpoint
CREATE INDEX `user_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `notifications` (`type`);--> statement-breakpoint
CREATE INDEX `read_idx` ON `notifications` (`isRead`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `notifications` (`createdAt`);--> statement-breakpoint
CREATE INDEX `referrer_idx` ON `referrals` (`referrerId`);--> statement-breakpoint
CREATE INDEX `referred_idx` ON `referrals` (`referredId`);--> statement-breakpoint
CREATE INDEX `code_idx` ON `referrals` (`referralCode`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `referrals` (`status`);