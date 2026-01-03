CREATE TABLE `office_notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`officeId` int NOT NULL,
	`serviceTypes` json NOT NULL,
	`governorates` json NOT NULL,
	`minBudget` int NOT NULL DEFAULT 0,
	`maxBudget` int NOT NULL DEFAULT 999999,
	`emailNotifications` tinyint NOT NULL DEFAULT 1,
	`inAppNotifications` tinyint NOT NULL DEFAULT 1,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE `active_sessions` DROP INDEX `active_sessions_sessionId_unique`;--> statement-breakpoint
ALTER TABLE `referrals` DROP INDEX `referrals_referralCode_unique`;--> statement-breakpoint
ALTER TABLE `sanad_office_staff` DROP INDEX `unique_office_user`;--> statement-breakpoint
ALTER TABLE `sanad_offices` DROP INDEX `sanad_offices_slug_unique`;--> statement-breakpoint
ALTER TABLE `sanad_offices` DROP INDEX `sanad_offices_commercialRegistration_unique`;--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `users_openId_unique`;--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `users_referralCode_unique`;--> statement-breakpoint
ALTER TABLE `quiz_attempts` DROP FOREIGN KEY `quiz_attempts_quiz_id_training_quizzes_id_fk`;
--> statement-breakpoint
DROP INDEX `leaderboard_idx` ON `sanad_offices`;--> statement-breakpoint
DROP INDEX `entity_idx` ON `translation_requests`;--> statement-breakpoint
ALTER TABLE `active_sessions` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `activity_log` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `auth_audit_log` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `batch_translation_jobs` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `bookings` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `bundle_services` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `canned_responses` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `chat_assignments` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `chat_conversations` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `chat_messages` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `chat_ratings` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `chat_transfer_history` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `document_templates` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `generated_documents` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `loyalty_points` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `loyalty_transactions` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `notifications` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `office_availability` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `office_staff` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `quality_alerts` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `quiz_attempts` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `quiz_options` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `quiz_questions` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `referrals` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `regional_campaigns` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `request_messages` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `review_photos` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `review_votes` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `reviews` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `sanad_office_services` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `sanad_office_staff` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `sanad_offices` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `scheduled_followups` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `security_alerts` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `service_bids` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `service_bundles` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `service_requests` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `template_downloads` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `training_materials` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `training_quizzes` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `translation_activity_log` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `translation_memory` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `translation_requests` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `translation_review_comments` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `translation_reviews` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `translation_versions` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `untranslated_content_alerts` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `users` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `active_sessions` MODIFY COLUMN `lastActive` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `active_sessions` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `active_sessions` MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `activity_log` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `auth_audit_log` MODIFY COLUMN `success` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `auth_audit_log` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `batch_translation_jobs` MODIFY COLUMN `use_memory_suggestions` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `batch_translation_jobs` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `bookings` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `bundle_services` MODIFY COLUMN `created_at` timestamp DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `canned_responses` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `chat_assignments` MODIFY COLUMN `assignedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `chat_conversations` MODIFY COLUMN `lastMessageAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `chat_conversations` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `chat_messages` MODIFY COLUMN `isRead` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `chat_messages` MODIFY COLUMN `isRead` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `chat_messages` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `chat_ratings` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `chat_transfer_history` MODIFY COLUMN `isEscalation` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `chat_transfer_history` MODIFY COLUMN `isEscalation` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `chat_transfer_history` MODIFY COLUMN `transferredAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `document_templates` MODIFY COLUMN `useGoogleDocs` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `document_templates` MODIFY COLUMN `useGoogleDocs` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `document_templates` MODIFY COLUMN `isOfficial` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `document_templates` MODIFY COLUMN `isOfficial` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `document_templates` MODIFY COLUMN `isPremium` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `document_templates` MODIFY COLUMN `isPremium` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `document_templates` MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `document_templates` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `generated_documents` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `loyalty_points` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `loyalty_transactions` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `isRead` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `isRead` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `notifications` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `office_availability` MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `office_availability` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `office_staff` MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `office_staff` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `quality_alerts` MODIFY COLUMN `detected_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `quality_alerts` MODIFY COLUMN `email_sent` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `quality_alerts` MODIFY COLUMN `email_sent` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `quiz_attempts` MODIFY COLUMN `passed` tinyint;--> statement-breakpoint
ALTER TABLE `quiz_attempts` MODIFY COLUMN `passed` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `quiz_attempts` MODIFY COLUMN `completed_at` timestamp DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `quiz_options` MODIFY COLUMN `is_correct` tinyint;--> statement-breakpoint
ALTER TABLE `quiz_options` MODIFY COLUMN `is_correct` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `referrals` MODIFY COLUMN `pointsAwarded` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `referrals` MODIFY COLUMN `pointsAwarded` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `referrals` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `regional_campaigns` MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `regional_campaigns` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `request_messages` MODIFY COLUMN `is_read` tinyint;--> statement-breakpoint
ALTER TABLE `request_messages` MODIFY COLUMN `is_read` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `request_messages` MODIFY COLUMN `created_at` timestamp DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `review_photos` MODIFY COLUMN `uploadedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `review_votes` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `reviews` MODIFY COLUMN `isVisible` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `reviews` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `sanad_office_services` MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `sanad_office_services` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `sanad_office_staff` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `sanad_offices` MODIFY COLUMN `acceptsOnlineBookings` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `sanad_offices` MODIFY COLUMN `autoAcceptBookings` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `sanad_offices` MODIFY COLUMN `autoAcceptBookings` tinyint NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `sanad_offices` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `scheduled_followups` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `security_alerts` MODIFY COLUMN `notificationSent` tinyint;--> statement-breakpoint
ALTER TABLE `security_alerts` MODIFY COLUMN `notificationSent` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `security_alerts` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `service_bids` MODIFY COLUMN `viewed_by_customer` tinyint;--> statement-breakpoint
ALTER TABLE `service_bids` MODIFY COLUMN `viewed_by_customer` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `service_bids` MODIFY COLUMN `created_at` timestamp DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `service_bundles` MODIFY COLUMN `is_active` tinyint NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `service_bundles` MODIFY COLUMN `created_at` timestamp DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `service_requests` MODIFY COLUMN `remote_accepted` tinyint DEFAULT 1;--> statement-breakpoint
ALTER TABLE `service_requests` MODIFY COLUMN `created_at` timestamp DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `template_downloads` MODIFY COLUMN `downloadedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `training_materials` MODIFY COLUMN `is_active` tinyint DEFAULT 1;--> statement-breakpoint
ALTER TABLE `training_materials` MODIFY COLUMN `created_at` timestamp DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `training_quizzes` MODIFY COLUMN `is_active` tinyint DEFAULT 1;--> statement-breakpoint
ALTER TABLE `training_quizzes` MODIFY COLUMN `created_at` timestamp DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `translation_activity_log` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `translation_memory` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `translation_requests` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `translation_review_comments` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `translation_reviews` MODIFY COLUMN `submitted_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `translation_versions` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `untranslated_content_alerts` MODIFY COLUMN `notification_sent` tinyint;--> statement-breakpoint
ALTER TABLE `untranslated_content_alerts` MODIFY COLUMN `notification_sent` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `untranslated_content_alerts` MODIFY COLUMN `created_at` timestamp DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `whatsappEnabled` tinyint;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `whatsappEnabled` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `mfaEnabled` tinyint;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `mfaEnabled` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `emailVerified` tinyint;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `emailVerified` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `recoveryEmailVerified` tinyint;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `recoveryEmailVerified` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `lastSignedIn` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `bookings` ADD `reminder24HSent` tinyint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `bookings` ADD `reminder1HSent` tinyint DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `office_idx` ON `office_notification_preferences` (`officeId`);--> statement-breakpoint
CREATE INDEX `active_idx` ON `office_notification_preferences` (`isActive`);--> statement-breakpoint
CREATE INDEX `office_prefs_unique` ON `office_notification_preferences` (`officeId`);--> statement-breakpoint
ALTER TABLE `quiz_attempts` ADD CONSTRAINT `quiz_attempts_quiz_id_training_quizzes_id_fk` FOREIGN KEY (`quiz_id`) REFERENCES `training_quizzes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `active_sessions_sessionId_unique` ON `active_sessions` (`sessionId`);--> statement-breakpoint
CREATE INDEX `referrals_referralCode_unique` ON `referrals` (`referralCode`);--> statement-breakpoint
CREATE INDEX `unique_office_user` ON `sanad_office_staff` (`officeId`,`userId`);--> statement-breakpoint
CREATE INDEX `sanad_offices_slug_unique` ON `sanad_offices` (`slug`);--> statement-breakpoint
CREATE INDEX `sanad_offices_commercialRegistration_unique` ON `sanad_offices` (`commercialRegistration`);--> statement-breakpoint
CREATE INDEX `source_idx` ON `translation_memory` (`sourceText`);--> statement-breakpoint
CREATE INDEX `entity_idx_req` ON `translation_requests` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `users_openId_unique` ON `users` (`openId`);--> statement-breakpoint
CREATE INDEX `users_referralCode_unique` ON `users` (`referralCode`);--> statement-breakpoint
ALTER TABLE `bookings` DROP COLUMN `reminder24hSent`;--> statement-breakpoint
ALTER TABLE `bookings` DROP COLUMN `reminder1hSent`;