CREATE TABLE `service_bids` (
	`id` int AUTO_INCREMENT NOT NULL,
	`request_id` int NOT NULL,
	`office_id` int NOT NULL,
	`proposed_price` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'OMR',
	`estimated_duration` varchar(100),
	`cover_letter` text NOT NULL,
	`methodology` text,
	`portfolio` json,
	`status` enum('pending','accepted','rejected','withdrawn') NOT NULL DEFAULT 'pending',
	`viewed_by_customer` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_bids_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`service_type` varchar(100) NOT NULL,
	`category` varchar(100),
	`requirements` text,
	`documents` json,
	`budget_min` decimal(10,2),
	`budget_max` decimal(10,2),
	`currency` varchar(3) NOT NULL DEFAULT 'OMR',
	`deadline` timestamp,
	`urgency` enum('low','medium','high','urgent') DEFAULT 'medium',
	`governorate` varchar(100),
	`wilayat` varchar(100),
	`remote_accepted` boolean DEFAULT true,
	`status` enum('open','bidding','awarded','in_progress','completed','cancelled') NOT NULL DEFAULT 'open',
	`accepted_bid_id` int,
	`view_count` int DEFAULT 0,
	`bid_count` int DEFAULT 0,
	`expires_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `request_idx` ON `service_bids` (`request_id`);--> statement-breakpoint
CREATE INDEX `office_idx` ON `service_bids` (`office_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `service_bids` (`status`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `service_requests` (`user_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `service_requests` (`status`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `service_requests` (`category`);--> statement-breakpoint
CREATE INDEX `urgency_idx` ON `service_requests` (`urgency`);--> statement-breakpoint
CREATE INDEX `location_idx` ON `service_requests` (`governorate`,`wilayat`);