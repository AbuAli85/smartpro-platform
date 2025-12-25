CREATE TABLE `office_availability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`officeId` int NOT NULL,
	`dayOfWeek` int NOT NULL,
	`startTime` varchar(10) NOT NULL,
	`endTime` varchar(10) NOT NULL,
	`slotDuration` int NOT NULL DEFAULT 60,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `office_availability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `bookings` ADD `scheduledTime` varchar(10);--> statement-breakpoint
ALTER TABLE `bookings` ADD `duration` int DEFAULT 60;--> statement-breakpoint
CREATE INDEX `office_idx` ON `office_availability` (`officeId`);--> statement-breakpoint
CREATE INDEX `day_idx` ON `office_availability` (`dayOfWeek`);