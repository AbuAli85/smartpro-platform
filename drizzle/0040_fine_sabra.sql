CREATE TABLE `security_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertType` enum('multiple_failed_logins','impossible_travel','fast_travel','country_change','mfa_failure','suspicious_ip','password_reset_abuse','session_hijacking','brute_force_attempt','account_lockout') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`status` enum('new','investigating','resolved','false_positive') NOT NULL DEFAULT 'new',
	`userId` int,
	`openId` varchar(64),
	`sessionId` varchar(255),
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`location` json,
	`metadata` json,
	`resolvedBy` int,
	`resolvedAt` timestamp,
	`resolutionNotes` text,
	`notificationSent` boolean DEFAULT false,
	`notificationSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `security_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `security_alerts` (`userId`);--> statement-breakpoint
CREATE INDEX `alert_type_idx` ON `security_alerts` (`alertType`);--> statement-breakpoint
CREATE INDEX `severity_idx` ON `security_alerts` (`severity`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `security_alerts` (`status`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `security_alerts` (`createdAt`);