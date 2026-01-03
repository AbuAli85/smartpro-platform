ALTER TABLE `office_staff` ADD `availabilityStatus` enum('online','offline','busy') DEFAULT 'offline' NOT NULL;--> statement-breakpoint
ALTER TABLE `office_staff` ADD `expertiseTags` json;--> statement-breakpoint
ALTER TABLE `office_staff` ADD `lastActiveAt` timestamp;