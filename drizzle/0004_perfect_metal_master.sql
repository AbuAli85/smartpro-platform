ALTER TABLE `bookings` ADD `cancellationReason` text;--> statement-breakpoint
ALTER TABLE `bookings` ADD `cancelledBy` int;--> statement-breakpoint
ALTER TABLE `bookings` ADD `cancelledAt` timestamp;--> statement-breakpoint
ALTER TABLE `bookings` ADD `cancellationPenalty` decimal(10,3);--> statement-breakpoint
ALTER TABLE `bookings` ADD `refundAmount` decimal(10,3);--> statement-breakpoint
ALTER TABLE `sanad_offices` ADD `cancellationWindowHours` int DEFAULT 24 NOT NULL;--> statement-breakpoint
ALTER TABLE `sanad_offices` ADD `cancellationPenaltyPercent` int DEFAULT 0 NOT NULL;