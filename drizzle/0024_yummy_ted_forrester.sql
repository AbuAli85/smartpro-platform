CREATE TABLE `batch_translation_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`job_name` varchar(255) NOT NULL,
	`entity_type` enum('office','template','both') NOT NULL,
	`target_entity_ids` json,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`total_items` int NOT NULL DEFAULT 0,
	`processed_items` int NOT NULL DEFAULT 0,
	`auto_approved_count` int NOT NULL DEFAULT 0,
	`queued_for_review_count` int NOT NULL DEFAULT 0,
	`failed_count` int NOT NULL DEFAULT 0,
	`confidence_threshold` int NOT NULL DEFAULT 80,
	`use_memory_suggestions` boolean NOT NULL DEFAULT true,
	`results` json,
	`created_by` int NOT NULL,
	`created_by_name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`started_at` timestamp,
	`completed_at` timestamp,
	CONSTRAINT `batch_translation_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `status_idx` ON `batch_translation_jobs` (`status`);--> statement-breakpoint
CREATE INDEX `created_by_idx` ON `batch_translation_jobs` (`created_by`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `batch_translation_jobs` (`created_at`);