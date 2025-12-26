CREATE TABLE `scheduled_followups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`officeId` int NOT NULL,
	`scheduledFor` timestamp NOT NULL,
	`triggerType` enum('24h','48h','manual') NOT NULL DEFAULT '24h',
	`messageTemplate` text NOT NULL,
	`status` enum('pending','sent','cancelled') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduled_followups_id` PRIMARY KEY(`id`)
);
