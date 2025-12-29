CREATE TABLE `auth_audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`openId` varchar(64),
	`eventType` enum('login_success','login_failure','logout','session_expired','role_changed','permission_denied','password_reset_requested','password_reset_completed','mfa_enabled','mfa_disabled','mfa_verified','mfa_failed','email_verified','account_locked','account_unlocked') NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`deviceInfo` json,
	`country` varchar(100),
	`city` varchar(100),
	`metadata` json,
	`success` boolean NOT NULL,
	`severity` enum('info','warning','error','critical') NOT NULL DEFAULT 'info',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auth_audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `auth_audit_log` (`userId`);--> statement-breakpoint
CREATE INDEX `event_type_idx` ON `auth_audit_log` (`eventType`);--> statement-breakpoint
CREATE INDEX `ip_address_idx` ON `auth_audit_log` (`ipAddress`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `auth_audit_log` (`createdAt`);--> statement-breakpoint
CREATE INDEX `severity_idx` ON `auth_audit_log` (`severity`);--> statement-breakpoint
CREATE INDEX `user_event_idx` ON `auth_audit_log` (`userId`,`eventType`,`createdAt`);