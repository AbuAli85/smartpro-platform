DROP TABLE `active_sessions`;--> statement-breakpoint
DROP TABLE `activity_log`;--> statement-breakpoint
DROP TABLE `auth_audit_log`;--> statement-breakpoint
DROP TABLE `batch_translation_jobs`;--> statement-breakpoint
DROP TABLE `booking_analytics`;--> statement-breakpoint
DROP TABLE `booking_documents`;--> statement-breakpoint
DROP TABLE `booking_reminders`;--> statement-breakpoint
DROP TABLE `bookings`;--> statement-breakpoint
DROP TABLE `bundle_services`;--> statement-breakpoint
DROP TABLE `canned_responses`;--> statement-breakpoint
DROP TABLE `chat_assignments`;--> statement-breakpoint
DROP TABLE `chat_conversations`;--> statement-breakpoint
DROP TABLE `chat_messages`;--> statement-breakpoint
DROP TABLE `chat_ratings`;--> statement-breakpoint
DROP TABLE `chat_transfer_history`;--> statement-breakpoint
DROP TABLE `client_documents`;--> statement-breakpoint
DROP TABLE `client_notes`;--> statement-breakpoint
DROP TABLE `clients`;--> statement-breakpoint
DROP TABLE `document_templates`;--> statement-breakpoint
DROP TABLE `draft_forms`;--> statement-breakpoint
DROP TABLE `expenses`;--> statement-breakpoint
DROP TABLE `generated_documents`;--> statement-breakpoint
DROP TABLE `invoices`;--> statement-breakpoint
DROP TABLE `loyalty_points`;--> statement-breakpoint
DROP TABLE `loyalty_transactions`;--> statement-breakpoint
DROP TABLE `notifications`;--> statement-breakpoint
DROP TABLE `office_availability`;--> statement-breakpoint
DROP TABLE `office_notification_preferences`;--> statement-breakpoint
DROP TABLE `office_staff`;--> statement-breakpoint
DROP TABLE `payments`;--> statement-breakpoint
DROP TABLE `quality_alerts`;--> statement-breakpoint
DROP TABLE `quiz_attempts`;--> statement-breakpoint
DROP TABLE `quiz_options`;--> statement-breakpoint
DROP TABLE `quiz_questions`;--> statement-breakpoint
DROP TABLE `referrals`;--> statement-breakpoint
DROP TABLE `regional_campaigns`;--> statement-breakpoint
DROP TABLE `request_messages`;--> statement-breakpoint
DROP TABLE `review_photos`;--> statement-breakpoint
DROP TABLE `review_votes`;--> statement-breakpoint
DROP TABLE `reviews`;--> statement-breakpoint
DROP TABLE `sanad_office_services`;--> statement-breakpoint
DROP TABLE `sanad_office_staff`;--> statement-breakpoint
DROP TABLE `sanad_offices`;--> statement-breakpoint
DROP TABLE `scheduled_followups`;--> statement-breakpoint
DROP TABLE `security_alerts`;--> statement-breakpoint
DROP TABLE `service_bids`;--> statement-breakpoint
DROP TABLE `service_bundles`;--> statement-breakpoint
DROP TABLE `service_requests`;--> statement-breakpoint
DROP TABLE `template_downloads`;--> statement-breakpoint
DROP TABLE `training_materials`;--> statement-breakpoint
DROP TABLE `training_quizzes`;--> statement-breakpoint
DROP TABLE `translation_activity_log`;--> statement-breakpoint
DROP TABLE `translation_memory`;--> statement-breakpoint
DROP TABLE `translation_requests`;--> statement-breakpoint
DROP TABLE `translation_review_comments`;--> statement-breakpoint
DROP TABLE `translation_reviews`;--> statement-breakpoint
DROP TABLE `translation_versions`;--> statement-breakpoint
DROP TABLE `untranslated_content_alerts`;--> statement-breakpoint
DROP INDEX `users_openId_unique` ON `users`;--> statement-breakpoint
DROP INDEX `email_idx` ON `users`;--> statement-breakpoint
DROP INDEX `role_idx` ON `users`;--> statement-breakpoint
DROP INDEX `users_referralCode_unique` ON `users`;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `lastSignedIn` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `users` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_openId_unique` UNIQUE(`openId`);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `phone`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `avatarUrl`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `referralCode`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `preferredLanguage`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `notificationPreferences`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `whatsappEnabled`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `mfaEnabled`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `mfaSecret`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `mfaBackupCodes`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `mfaEnabledAt`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `emailVerified`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `emailVerificationToken`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `emailVerificationExpiry`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `recoveryEmail`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `recoveryEmailVerified`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `passwordResetToken`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `passwordResetExpiry`;