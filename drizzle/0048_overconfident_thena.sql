CREATE TABLE `booking_analytics` (
	`id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
	`officeId` int NOT NULL,
	`date` timestamp NOT NULL,
	`totalViews` int NOT NULL DEFAULT 0,
	`totalBookings` int NOT NULL DEFAULT 0,
	`totalCancellations` int NOT NULL DEFAULT 0,
	`conversionRate` decimal(5,2) NOT NULL DEFAULT '0.00',
	`popularTimeSlots` json,
	`cancellationReasons` json,
	`avgBookingValue` decimal(10,3) NOT NULL DEFAULT '0.000',
	`createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updatedAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE INDEX `office_date_idx` ON `booking_analytics` (`officeId`,`date`);--> statement-breakpoint
CREATE INDEX `office_idx` ON `booking_analytics` (`officeId`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `booking_analytics` (`date`);