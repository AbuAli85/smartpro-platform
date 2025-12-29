CREATE TABLE `request_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`request_id` int NOT NULL,
	`sender_id` int NOT NULL,
	`sender_type` enum('customer','office') NOT NULL,
	`message` text NOT NULL,
	`attachments` json,
	`is_read` boolean DEFAULT false,
	`read_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `request_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `request_idx` ON `request_messages` (`request_id`);--> statement-breakpoint
CREATE INDEX `sender_idx` ON `request_messages` (`sender_id`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `request_messages` (`created_at`);