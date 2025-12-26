CREATE TABLE `quality_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alert_type` enum('low_accuracy','high_revision_rate','memory_usage_drop') NOT NULL,
	`severity` enum('warning','critical') NOT NULL,
	`current_value` decimal(5,2) NOT NULL,
	`threshold_value` decimal(5,2) NOT NULL,
	`message` text NOT NULL,
	`status` enum('active','resolved','acknowledged') NOT NULL DEFAULT 'active',
	`detected_at` timestamp NOT NULL DEFAULT (now()),
	`resolved_at` timestamp,
	`acknowledged_at` timestamp,
	`email_sent` boolean NOT NULL DEFAULT false,
	`email_sent_at` timestamp,
	CONSTRAINT `quality_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `status_idx` ON `quality_alerts` (`status`);--> statement-breakpoint
CREATE INDEX `detected_at_idx` ON `quality_alerts` (`detected_at`);