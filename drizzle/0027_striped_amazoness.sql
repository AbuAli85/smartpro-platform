CREATE TABLE `review_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reviewId` int NOT NULL,
	`photoUrl` text NOT NULL,
	`photoKey` text NOT NULL,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `review_photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `review_votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reviewId` int NOT NULL,
	`userId` int NOT NULL,
	`voteType` enum('helpful','not_helpful') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `review_votes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `review_idx` ON `review_photos` (`reviewId`);--> statement-breakpoint
CREATE INDEX `review_user_idx` ON `review_votes` (`reviewId`,`userId`);--> statement-breakpoint
CREATE INDEX `review_idx` ON `review_votes` (`reviewId`);