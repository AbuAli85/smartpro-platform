CREATE TABLE `chat_ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`rating` int NOT NULL,
	`feedback` text,
	`staffUserId` int,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_ratings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `conversation_idx` ON `chat_ratings` (`conversationId`);--> statement-breakpoint
CREATE INDEX `staff_idx` ON `chat_ratings` (`staffUserId`);--> statement-breakpoint
CREATE INDEX `rating_idx` ON `chat_ratings` (`rating`);