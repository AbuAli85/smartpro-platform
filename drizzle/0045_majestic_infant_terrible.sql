CREATE TABLE `office_blocked_slots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`office_id` int NOT NULL,
	`blocked_date` date NOT NULL,
	`start_time` varchar(10),
	`end_time` varchar(10),
	`is_all_day` tinyint NOT NULL DEFAULT 0,
	`reason` text,
	`created_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE INDEX `office_date_idx` ON `office_blocked_slots` (`office_id`,`blocked_date`);