CREATE TABLE `translation_memory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceText` text NOT NULL,
	`translatedText` text NOT NULL,
	`sourceLanguage` varchar(10) NOT NULL DEFAULT 'en',
	`targetLanguage` varchar(10) NOT NULL DEFAULT 'ar',
	`context` varchar(100),
	`usageCount` int NOT NULL DEFAULT 0,
	`lastUsedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` int NOT NULL,
	CONSTRAINT `translation_memory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `translation_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` enum('office','template') NOT NULL,
	`entityId` int NOT NULL,
	`fieldName` varchar(50) NOT NULL,
	`oldValue` text,
	`newValue` text,
	`changedBy` int NOT NULL,
	`changedByName` varchar(255) NOT NULL,
	`changeReason` text,
	`source` enum('manual','bulk_import','request_approval','auto_translate') NOT NULL DEFAULT 'manual',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `translation_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `context_idx` ON `translation_memory` (`context`);--> statement-breakpoint
CREATE INDEX `usage_idx` ON `translation_memory` (`usageCount`);--> statement-breakpoint
CREATE INDEX `entity_idx` ON `translation_versions` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `changed_by_idx` ON `translation_versions` (`changedBy`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `translation_versions` (`createdAt`);