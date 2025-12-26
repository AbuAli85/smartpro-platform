CREATE TABLE `chat_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`officeId` int NOT NULL,
	`bookingId` int,
	`status` enum('active','closed','archived') NOT NULL DEFAULT 'active',
	`lastMessageAt` timestamp NOT NULL DEFAULT (now()),
	`lastMessagePreview` varchar(255),
	`unreadByUser` int NOT NULL DEFAULT 0,
	`unreadByOffice` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chat_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`senderId` int NOT NULL,
	`senderType` enum('user','office') NOT NULL,
	`message` text NOT NULL,
	`messageType` enum('text','file','system') NOT NULL DEFAULT 'text',
	`fileUrl` text,
	`fileName` varchar(255),
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `template_downloads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`userId` int NOT NULL,
	`downloadedAt` timestamp NOT NULL DEFAULT (now()),
	`ipAddress` varchar(45),
	`userAgent` text,
	CONSTRAINT `template_downloads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `user_idx` ON `chat_conversations` (`userId`);--> statement-breakpoint
CREATE INDEX `office_idx` ON `chat_conversations` (`officeId`);--> statement-breakpoint
CREATE INDEX `booking_idx` ON `chat_conversations` (`bookingId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `chat_conversations` (`status`);--> statement-breakpoint
CREATE INDEX `last_message_idx` ON `chat_conversations` (`lastMessageAt`);--> statement-breakpoint
CREATE INDEX `conversation_idx` ON `chat_messages` (`conversationId`);--> statement-breakpoint
CREATE INDEX `sender_idx` ON `chat_messages` (`senderId`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `chat_messages` (`createdAt`);--> statement-breakpoint
CREATE INDEX `template_idx` ON `template_downloads` (`templateId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `template_downloads` (`userId`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `template_downloads` (`downloadedAt`);