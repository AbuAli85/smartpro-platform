CREATE TABLE IF NOT EXISTS `office_blocked_slots` (
	`id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
	`office_id` int NOT NULL,
	`blocked_date` date NOT NULL,
	`start_time` varchar(10),
	`end_time` varchar(10),
	`is_all_day` tinyint NOT NULL DEFAULT 0,
	`reason` text,
	`created_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
DROP PROCEDURE IF EXISTS _d51_create_office_date_idx;--> statement-breakpoint
CREATE PROCEDURE _d51_create_office_date_idx() BEGIN IF (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='office_blocked_slots' AND index_name='office_date_idx')=0 THEN CREATE INDEX `office_date_idx` ON `office_blocked_slots` (`office_id`,`blocked_date`); END IF; END--> statement-breakpoint
CALL _d51_create_office_date_idx();--> statement-breakpoint
DROP PROCEDURE IF EXISTS _d51_create_office_date_idx;