DROP TABLE IF EXISTS `active_sessions`;--> statement-breakpoint
DROP TABLE IF EXISTS `activity_log`;--> statement-breakpoint
DROP TABLE IF EXISTS `auth_audit_log`;--> statement-breakpoint
DROP TABLE IF EXISTS `batch_translation_jobs`;--> statement-breakpoint
DROP TABLE IF EXISTS `booking_analytics`;--> statement-breakpoint
DROP TABLE IF EXISTS `booking_documents`;--> statement-breakpoint
DROP TABLE IF EXISTS `booking_reminders`;--> statement-breakpoint
DROP TABLE IF EXISTS `bookings`;--> statement-breakpoint
DROP TABLE IF EXISTS `bundle_services`;--> statement-breakpoint
DROP TABLE IF EXISTS `canned_responses`;--> statement-breakpoint
DROP TABLE IF EXISTS `chat_assignments`;--> statement-breakpoint
DROP TABLE IF EXISTS `chat_conversations`;--> statement-breakpoint
DROP TABLE IF EXISTS `chat_messages`;--> statement-breakpoint
DROP TABLE IF EXISTS `chat_ratings`;--> statement-breakpoint
DROP TABLE IF EXISTS `chat_transfer_history`;--> statement-breakpoint
DROP TABLE IF EXISTS `client_documents`;--> statement-breakpoint
DROP TABLE IF EXISTS `client_notes`;--> statement-breakpoint
DROP TABLE IF EXISTS `clients`;--> statement-breakpoint
DROP TABLE IF EXISTS `document_templates`;--> statement-breakpoint
DROP TABLE IF EXISTS `draft_forms`;--> statement-breakpoint
DROP TABLE IF EXISTS `expenses`;--> statement-breakpoint
DROP TABLE IF EXISTS `generated_documents`;--> statement-breakpoint
DROP TABLE IF EXISTS `invoices`;--> statement-breakpoint
DROP TABLE IF EXISTS `loyalty_points`;--> statement-breakpoint
DROP TABLE IF EXISTS `loyalty_transactions`;--> statement-breakpoint
DROP TABLE IF EXISTS `notifications`;--> statement-breakpoint
DROP TABLE IF EXISTS `office_availability`;--> statement-breakpoint
DROP TABLE IF EXISTS `office_notification_preferences`;--> statement-breakpoint
DROP TABLE IF EXISTS `office_staff`;--> statement-breakpoint
DROP TABLE IF EXISTS `payments`;--> statement-breakpoint
DROP TABLE IF EXISTS `quality_alerts`;--> statement-breakpoint
DROP TABLE IF EXISTS `quiz_attempts`;--> statement-breakpoint
DROP TABLE IF EXISTS `quiz_options`;--> statement-breakpoint
DROP TABLE IF EXISTS `quiz_questions`;--> statement-breakpoint
DROP TABLE IF EXISTS `referrals`;--> statement-breakpoint
DROP TABLE IF EXISTS `regional_campaigns`;--> statement-breakpoint
DROP TABLE IF EXISTS `request_messages`;--> statement-breakpoint
DROP TABLE IF EXISTS `review_photos`;--> statement-breakpoint
DROP TABLE IF EXISTS `review_votes`;--> statement-breakpoint
DROP TABLE IF EXISTS `reviews`;--> statement-breakpoint
DROP TABLE IF EXISTS `sanad_office_services`;--> statement-breakpoint
DROP TABLE IF EXISTS `sanad_office_staff`;--> statement-breakpoint
DROP TABLE IF EXISTS `sanad_offices`;--> statement-breakpoint
DROP TABLE IF EXISTS `scheduled_followups`;--> statement-breakpoint
DROP TABLE IF EXISTS `security_alerts`;--> statement-breakpoint
DROP TABLE IF EXISTS `service_bids`;--> statement-breakpoint
DROP TABLE IF EXISTS `service_bundles`;--> statement-breakpoint
DROP TABLE IF EXISTS `service_requests`;--> statement-breakpoint
DROP TABLE IF EXISTS `template_downloads`;--> statement-breakpoint
DROP TABLE IF EXISTS `training_materials`;--> statement-breakpoint
DROP TABLE IF EXISTS `training_quizzes`;--> statement-breakpoint
DROP TABLE IF EXISTS `translation_activity_log`;--> statement-breakpoint
DROP TABLE IF EXISTS `translation_memory`;--> statement-breakpoint
DROP TABLE IF EXISTS `translation_requests`;--> statement-breakpoint
DROP TABLE IF EXISTS `translation_review_comments`;--> statement-breakpoint
DROP TABLE IF EXISTS `translation_reviews`;--> statement-breakpoint
DROP TABLE IF EXISTS `translation_versions`;--> statement-breakpoint
DROP TABLE IF EXISTS `untranslated_content_alerts`;--> statement-breakpoint
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