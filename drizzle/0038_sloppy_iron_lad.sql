CREATE TABLE `active_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(255) NOT NULL,
	`userId` int NOT NULL,
	`deviceInfo` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`lastActive` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	CONSTRAINT `active_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `active_sessions_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `active_sessions` (`userId`);--> statement-breakpoint
CREATE INDEX `session_id_idx` ON `active_sessions` (`sessionId`);--> statement-breakpoint
CREATE INDEX `last_active_idx` ON `active_sessions` (`lastActive`);--> statement-breakpoint
CREATE INDEX `is_active_idx` ON `active_sessions` (`isActive`);