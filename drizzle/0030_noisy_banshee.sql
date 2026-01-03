ALTER TABLE `sanad_offices` ADD `performanceScore` decimal(5,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `sanad_offices` ADD `performanceRank` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `whatsappEnabled` boolean DEFAULT false;