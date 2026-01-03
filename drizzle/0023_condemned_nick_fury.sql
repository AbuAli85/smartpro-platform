CREATE TABLE `translation_review_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`review_id` int NOT NULL,
	`user_id` int NOT NULL,
	`user_name` varchar(255) NOT NULL,
	`comment` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `translation_review_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `translation_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entity_type` enum('office','template') NOT NULL,
	`entity_id` int NOT NULL,
	`field_name` varchar(50) NOT NULL,
	`translated_text` text NOT NULL,
	`status` enum('pending','approved','rejected','needs_revision') NOT NULL DEFAULT 'pending',
	`submitted_by` int NOT NULL,
	`submitted_by_name` varchar(255) NOT NULL,
	`reviewed_by` int,
	`reviewed_by_name` varchar(255),
	`review_notes` text,
	`submitted_at` timestamp NOT NULL DEFAULT (now()),
	`reviewed_at` timestamp,
	CONSTRAINT `translation_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `review_id_idx` ON `translation_review_comments` (`review_id`);--> statement-breakpoint
CREATE INDEX `entity_idx` ON `translation_reviews` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `translation_reviews` (`status`);--> statement-breakpoint
CREATE INDEX `submitted_by_idx` ON `translation_reviews` (`submitted_by`);