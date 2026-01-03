CREATE TABLE `chat_transfer_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`fromUserId` int NOT NULL,
	`toUserId` int NOT NULL,
	`contextNotes` text,
	`isEscalation` boolean NOT NULL DEFAULT false,
	`transferredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_transfer_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `conversation_idx` ON `chat_transfer_history` (`conversationId`);--> statement-breakpoint
CREATE INDEX `from_user_idx` ON `chat_transfer_history` (`fromUserId`);--> statement-breakpoint
CREATE INDEX `to_user_idx` ON `chat_transfer_history` (`toUserId`);