CREATE TABLE `translation_activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` enum('office','template') NOT NULL,
	`entityId` int NOT NULL,
	`entityName` varchar(255) NOT NULL,
	`translatorId` int NOT NULL,
	`translatorName` varchar(255) NOT NULL,
	`actionType` enum('created','updated','bulk_import') NOT NULL,
	`fieldChanged` varchar(50),
	`previousValue` text,
	`newValue` text,
	`source` enum('manual','bulk_import','request_approval') NOT NULL DEFAULT 'manual',
	`requestId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `translation_activity_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `translation_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` enum('office','template') NOT NULL,
	`entityId` int NOT NULL,
	`requesterId` int NOT NULL,
	`requesterName` varchar(255) NOT NULL,
	`requesterEmail` varchar(320),
	`currentNameEn` varchar(255) NOT NULL,
	`currentDescriptionEn` text,
	`proposedNameAr` varchar(255),
	`proposedDescriptionAr` text,
	`notes` text,
	`status` enum('pending','approved','rejected','completed') NOT NULL DEFAULT 'pending',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`reviewNotes` text,
	`completedBy` int,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `translation_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `entity_idx` ON `translation_activity_log` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `translator_idx` ON `translation_activity_log` (`translatorId`);--> statement-breakpoint
CREATE INDEX `action_idx` ON `translation_activity_log` (`actionType`);--> statement-breakpoint
CREATE INDEX `source_idx` ON `translation_activity_log` (`source`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `translation_activity_log` (`createdAt`);--> statement-breakpoint
CREATE INDEX `entity_idx` ON `translation_requests` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `requester_idx` ON `translation_requests` (`requesterId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `translation_requests` (`status`);--> statement-breakpoint
CREATE INDEX `priority_idx` ON `translation_requests` (`priority`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `translation_requests` (`createdAt`);