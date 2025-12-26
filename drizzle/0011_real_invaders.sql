CREATE TABLE `canned_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`officeId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`category` enum('pricing','hours','services','general') NOT NULL DEFAULT 'general',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `canned_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`assignedToUserId` int NOT NULL,
	`assignedByUserId` int NOT NULL,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `office_staff` (
	`id` int AUTO_INCREMENT NOT NULL,
	`officeId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','manager','agent') NOT NULL DEFAULT 'agent',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `office_staff_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `office_idx` ON `canned_responses` (`officeId`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `canned_responses` (`category`);--> statement-breakpoint
CREATE INDEX `conversation_idx` ON `chat_assignments` (`conversationId`);--> statement-breakpoint
CREATE INDEX `assigned_to_idx` ON `chat_assignments` (`assignedToUserId`);--> statement-breakpoint
CREATE INDEX `office_idx` ON `office_staff` (`officeId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `office_staff` (`userId`);