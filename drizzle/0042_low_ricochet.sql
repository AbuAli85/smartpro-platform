CREATE TABLE IF NOT EXISTS `office_notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
	`officeId` int NOT NULL,
	`serviceTypes` json NOT NULL,
	`governorates` json NOT NULL,
	`minBudget` int NOT NULL DEFAULT 0,
	`maxBudget` int NOT NULL DEFAULT 999999,
	`emailNotifications` tinyint NOT NULL DEFAULT 1,
	`inAppNotifications` tinyint NOT NULL DEFAULT 1,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);--> statement-breakpoint
DROP PROCEDURE IF EXISTS _d42_drop_idx;--> statement-breakpoint
CREATE PROCEDURE _d42_drop_idx(IN t VARCHAR(64), IN i VARCHAR(64)) BEGIN IF (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name=t AND index_name=i)>0 THEN SET @s=CONCAT('ALTER TABLE `',t,'` DROP INDEX `',i,'`'); PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st; END IF; END--> statement-breakpoint
CALL _d42_drop_idx('active_sessions','active_sessions_sessionId_unique');--> statement-breakpoint
CALL _d42_drop_idx('referrals','referrals_referralCode_unique');--> statement-breakpoint
CALL _d42_drop_idx('sanad_office_staff','unique_office_user');--> statement-breakpoint
CALL _d42_drop_idx('sanad_offices','sanad_offices_slug_unique');--> statement-breakpoint
CALL _d42_drop_idx('sanad_offices','sanad_offices_commercialRegistration_unique');--> statement-breakpoint
CALL _d42_drop_idx('users','users_openId_unique');--> statement-breakpoint
CALL _d42_drop_idx('users','users_referralCode_unique');--> statement-breakpoint
DROP PROCEDURE IF EXISTS _d42_drop_fk;--> statement-breakpoint
CREATE PROCEDURE _d42_drop_fk(IN t VARCHAR(64), IN c VARCHAR(64)) BEGIN IF (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE table_schema=DATABASE() AND table_name=t AND constraint_name=c AND constraint_type='FOREIGN KEY')>0 THEN SET @s=CONCAT('ALTER TABLE `',t,'` DROP FOREIGN KEY `',c,'`'); PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st; END IF; END--> statement-breakpoint
CALL _d42_drop_fk('quiz_attempts','quiz_attempts_quiz_id_training_quizzes_id_fk');--> statement-breakpoint
CALL _d42_drop_fk('quiz_options','quiz_options_question_id_quiz_questions_id_fk');--> statement-breakpoint
CALL _d42_drop_fk('quiz_questions','quiz_questions_quiz_id_training_quizzes_id_fk');--> statement-breakpoint
CALL _d42_drop_fk('quiz_attempts','quiz_attempts_user_id_users_id_fk');--> statement-breakpoint
DROP PROCEDURE IF EXISTS _d42_drop_fk;--> statement-breakpoint
CALL _d42_drop_idx('sanad_offices','leaderboard_idx');--> statement-breakpoint
CALL _d42_drop_idx('translation_requests','entity_idx');--> statement-breakpoint
DROP PROCEDURE IF EXISTS _d42_drop_idx;--> statement-breakpoint
DROP PROCEDURE IF EXISTS _d42_alter_pk_if_exists;--> statement-breakpoint
CREATE PROCEDURE _d42_alter_pk_if_exists(IN tname VARCHAR(64)) BEGIN IF (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name=tname)>0 AND (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE table_schema=DATABASE() AND table_name=tname AND constraint_type='PRIMARY KEY')>0 THEN SET @s=CONCAT('ALTER TABLE `',tname,'` MODIFY COLUMN `id` int NOT NULL'); PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st; SET @s=CONCAT('ALTER TABLE `',tname,'` DROP PRIMARY KEY'); PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st; END IF; END--> statement-breakpoint
CALL _d42_alter_pk_if_exists('active_sessions');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('activity_log');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('auth_audit_log');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('batch_translation_jobs');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('bookings');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('bundle_services');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('canned_responses');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('chat_assignments');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('chat_conversations');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('chat_messages');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('chat_ratings');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('chat_transfer_history');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('document_templates');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('generated_documents');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('loyalty_points');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('loyalty_transactions');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('notifications');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('office_availability');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('office_staff');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('quality_alerts');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('quiz_attempts');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('quiz_options');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('quiz_questions');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('referrals');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('regional_campaigns');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('request_messages');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('review_photos');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('review_votes');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('reviews');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('sanad_office_services');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('sanad_office_staff');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('sanad_offices');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('scheduled_followups');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('security_alerts');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('service_bids');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('service_bundles');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('service_requests');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('template_downloads');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('training_materials');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('training_quizzes');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('translation_activity_log');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('translation_memory');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('translation_requests');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('translation_review_comments');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('translation_reviews');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('translation_versions');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('untranslated_content_alerts');--> statement-breakpoint
CALL _d42_alter_pk_if_exists('users');--> statement-breakpoint
DROP PROCEDURE IF EXISTS _d42_alter_pk_if_exists;--> statement-breakpoint
DROP PROCEDURE IF EXISTS _d42_run_alter_if_exists;--> statement-breakpoint
CREATE PROCEDURE _d42_run_alter_if_exists(IN tname VARCHAR(64), IN alter_suffix VARCHAR(1024)) BEGIN IF (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name=tname)>0 THEN SET @s=CONCAT('ALTER TABLE `',tname,'` ',alter_suffix); PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st; END IF; END--> statement-breakpoint
DROP PROCEDURE IF EXISTS _d42_add_col_if_not_exists;--> statement-breakpoint
CREATE PROCEDURE _d42_add_col_if_not_exists(IN tname VARCHAR(64), IN colname VARCHAR(64), IN add_clause VARCHAR(512)) BEGIN IF (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE table_schema=DATABASE() AND table_name=tname AND column_name=colname)=0 THEN SET @s=CONCAT('ALTER TABLE `',tname,'` ',add_clause); PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st; END IF; END--> statement-breakpoint
DROP PROCEDURE IF EXISTS _d42_drop_col_if_exists;--> statement-breakpoint
CREATE PROCEDURE _d42_drop_col_if_exists(IN tname VARCHAR(64), IN colname VARCHAR(64)) BEGIN IF (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE table_schema=DATABASE() AND table_name=tname AND column_name=colname)>0 THEN SET @s=CONCAT('ALTER TABLE `',tname,'` DROP COLUMN `',colname,'`'); PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st; END IF; END--> statement-breakpoint
DROP PROCEDURE IF EXISTS _d42_create_idx_if_not_exists;--> statement-breakpoint
CREATE PROCEDURE _d42_create_idx_if_not_exists(IN tname VARCHAR(64), IN idx_name VARCHAR(64), IN cols VARCHAR(256)) BEGIN IF (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name=tname AND index_name=idx_name)=0 THEN SET @s=CONCAT('CREATE INDEX `',idx_name,'` ON `',tname,'` ',cols); PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st; END IF; END--> statement-breakpoint
DROP PROCEDURE IF EXISTS _d42_add_quiz_fk_if_ref_has_pk;--> statement-breakpoint
CREATE PROCEDURE _d42_add_quiz_fk_if_ref_has_pk() BEGIN IF (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE table_schema=DATABASE() AND table_name='training_quizzes' AND constraint_type='PRIMARY KEY')>0 AND (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name='quiz_attempts')>0 AND (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE table_schema=DATABASE() AND table_name='quiz_attempts' AND constraint_name='quiz_attempts_quiz_id_training_quizzes_id_fk')=0 THEN SET @s='ALTER TABLE `quiz_attempts` ADD CONSTRAINT `quiz_attempts_quiz_id_training_quizzes_id_fk` FOREIGN KEY (`quiz_id`) REFERENCES `training_quizzes`(`id`) ON DELETE cascade ON UPDATE no action'; PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st; END IF; END--> statement-breakpoint
CALL _d42_run_alter_if_exists('active_sessions','MODIFY COLUMN `lastActive` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('active_sessions','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('active_sessions','MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1');--> statement-breakpoint
CALL _d42_run_alter_if_exists('activity_log','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('auth_audit_log','MODIFY COLUMN `success` tinyint NOT NULL');--> statement-breakpoint
CALL _d42_run_alter_if_exists('auth_audit_log','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('batch_translation_jobs','MODIFY COLUMN `use_memory_suggestions` tinyint NOT NULL DEFAULT 1');--> statement-breakpoint
CALL _d42_run_alter_if_exists('batch_translation_jobs','MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('bookings','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('bundle_services','MODIFY COLUMN `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('canned_responses','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('chat_assignments','MODIFY COLUMN `assignedAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('chat_conversations','MODIFY COLUMN `lastMessageAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('chat_conversations','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('chat_messages','MODIFY COLUMN `isRead` tinyint NOT NULL');--> statement-breakpoint
CALL _d42_run_alter_if_exists('chat_messages','MODIFY COLUMN `isRead` tinyint NOT NULL DEFAULT 0');--> statement-breakpoint
CALL _d42_run_alter_if_exists('chat_messages','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('chat_ratings','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('chat_transfer_history','MODIFY COLUMN `isEscalation` tinyint NOT NULL');--> statement-breakpoint
CALL _d42_run_alter_if_exists('chat_transfer_history','MODIFY COLUMN `isEscalation` tinyint NOT NULL DEFAULT 0');--> statement-breakpoint
CALL _d42_run_alter_if_exists('chat_transfer_history','MODIFY COLUMN `transferredAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('document_templates','MODIFY COLUMN `useGoogleDocs` tinyint NOT NULL');--> statement-breakpoint
CALL _d42_run_alter_if_exists('document_templates','MODIFY COLUMN `useGoogleDocs` tinyint NOT NULL DEFAULT 0');--> statement-breakpoint
CALL _d42_run_alter_if_exists('document_templates','MODIFY COLUMN `isOfficial` tinyint NOT NULL');--> statement-breakpoint
CALL _d42_run_alter_if_exists('document_templates','MODIFY COLUMN `isOfficial` tinyint NOT NULL DEFAULT 0');--> statement-breakpoint
CALL _d42_run_alter_if_exists('document_templates','MODIFY COLUMN `isPremium` tinyint NOT NULL');--> statement-breakpoint
CALL _d42_run_alter_if_exists('document_templates','MODIFY COLUMN `isPremium` tinyint NOT NULL DEFAULT 0');--> statement-breakpoint
CALL _d42_run_alter_if_exists('document_templates','MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1');--> statement-breakpoint
CALL _d42_run_alter_if_exists('document_templates','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('generated_documents','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('loyalty_points','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('loyalty_transactions','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('notifications','MODIFY COLUMN `isRead` tinyint NOT NULL');--> statement-breakpoint
CALL _d42_run_alter_if_exists('notifications','MODIFY COLUMN `isRead` tinyint NOT NULL DEFAULT 0');--> statement-breakpoint
CALL _d42_run_alter_if_exists('notifications','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('office_availability','MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1');--> statement-breakpoint
CALL _d42_run_alter_if_exists('office_availability','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('office_staff','MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1');--> statement-breakpoint
CALL _d42_run_alter_if_exists('office_staff','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('quality_alerts','MODIFY COLUMN `detected_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('quality_alerts','MODIFY COLUMN `email_sent` tinyint NOT NULL');--> statement-breakpoint
CALL _d42_run_alter_if_exists('quality_alerts','MODIFY COLUMN `email_sent` tinyint NOT NULL DEFAULT 0');--> statement-breakpoint
CALL _d42_run_alter_if_exists('quiz_attempts','MODIFY COLUMN `passed` tinyint');--> statement-breakpoint
CALL _d42_run_alter_if_exists('quiz_attempts','MODIFY COLUMN `passed` tinyint DEFAULT 0');--> statement-breakpoint
CALL _d42_run_alter_if_exists('quiz_attempts','MODIFY COLUMN `completed_at` timestamp DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('quiz_options','MODIFY COLUMN `is_correct` tinyint');--> statement-breakpoint
CALL _d42_run_alter_if_exists('quiz_options','MODIFY COLUMN `is_correct` tinyint DEFAULT 0');--> statement-breakpoint
CALL _d42_run_alter_if_exists('referrals','MODIFY COLUMN `pointsAwarded` tinyint NOT NULL');--> statement-breakpoint
CALL _d42_run_alter_if_exists('referrals','MODIFY COLUMN `pointsAwarded` tinyint NOT NULL DEFAULT 0');--> statement-breakpoint
CALL _d42_run_alter_if_exists('referrals','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('regional_campaigns','MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1');--> statement-breakpoint
CALL _d42_run_alter_if_exists('regional_campaigns','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('request_messages','MODIFY COLUMN `is_read` tinyint');--> statement-breakpoint
CALL _d42_run_alter_if_exists('request_messages','MODIFY COLUMN `is_read` tinyint DEFAULT 0');--> statement-breakpoint
CALL _d42_run_alter_if_exists('request_messages','MODIFY COLUMN `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('review_photos','MODIFY COLUMN `uploadedAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('review_votes','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('reviews','MODIFY COLUMN `isVisible` tinyint NOT NULL DEFAULT 1');--> statement-breakpoint
CALL _d42_run_alter_if_exists('reviews','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('sanad_office_services','MODIFY COLUMN `isActive` tinyint NOT NULL DEFAULT 1');--> statement-breakpoint
CALL _d42_run_alter_if_exists('sanad_office_services','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('sanad_office_staff','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('sanad_offices','MODIFY COLUMN `acceptsOnlineBookings` tinyint NOT NULL DEFAULT 1');--> statement-breakpoint
CALL _d42_run_alter_if_exists('sanad_offices','MODIFY COLUMN `autoAcceptBookings` tinyint NOT NULL');--> statement-breakpoint
CALL _d42_run_alter_if_exists('sanad_offices','MODIFY COLUMN `autoAcceptBookings` tinyint NOT NULL DEFAULT 0');--> statement-breakpoint
CALL _d42_run_alter_if_exists('sanad_offices','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('scheduled_followups','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('security_alerts','MODIFY COLUMN `notificationSent` tinyint');--> statement-breakpoint
CALL _d42_run_alter_if_exists('security_alerts','MODIFY COLUMN `notificationSent` tinyint DEFAULT 0');--> statement-breakpoint
CALL _d42_run_alter_if_exists('security_alerts','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('service_bids','MODIFY COLUMN `viewed_by_customer` tinyint');--> statement-breakpoint
CALL _d42_run_alter_if_exists('service_bids','MODIFY COLUMN `viewed_by_customer` tinyint DEFAULT 0');--> statement-breakpoint
CALL _d42_run_alter_if_exists('service_bids','MODIFY COLUMN `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('service_bundles','MODIFY COLUMN `is_active` tinyint NOT NULL DEFAULT 1');--> statement-breakpoint
CALL _d42_run_alter_if_exists('service_bundles','MODIFY COLUMN `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('service_requests','MODIFY COLUMN `remote_accepted` tinyint DEFAULT 1');--> statement-breakpoint
CALL _d42_run_alter_if_exists('service_requests','MODIFY COLUMN `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('template_downloads','MODIFY COLUMN `downloadedAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('training_materials','MODIFY COLUMN `is_active` tinyint DEFAULT 1');--> statement-breakpoint
CALL _d42_run_alter_if_exists('training_materials','MODIFY COLUMN `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('training_quizzes','MODIFY COLUMN `is_active` tinyint DEFAULT 1');--> statement-breakpoint
CALL _d42_run_alter_if_exists('training_quizzes','MODIFY COLUMN `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('translation_activity_log','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('translation_memory','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('translation_requests','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('translation_review_comments','MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('translation_reviews','MODIFY COLUMN `submitted_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('translation_versions','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('untranslated_content_alerts','MODIFY COLUMN `notification_sent` tinyint');--> statement-breakpoint
CALL _d42_run_alter_if_exists('untranslated_content_alerts','MODIFY COLUMN `notification_sent` tinyint DEFAULT 0');--> statement-breakpoint
CALL _d42_run_alter_if_exists('untranslated_content_alerts','MODIFY COLUMN `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('users','MODIFY COLUMN `whatsappEnabled` tinyint');--> statement-breakpoint
CALL _d42_run_alter_if_exists('users','MODIFY COLUMN `whatsappEnabled` tinyint DEFAULT 0');--> statement-breakpoint
CALL _d42_run_alter_if_exists('users','MODIFY COLUMN `mfaEnabled` tinyint');--> statement-breakpoint
CALL _d42_run_alter_if_exists('users','MODIFY COLUMN `mfaEnabled` tinyint DEFAULT 0');--> statement-breakpoint
CALL _d42_run_alter_if_exists('users','MODIFY COLUMN `emailVerified` tinyint');--> statement-breakpoint
CALL _d42_run_alter_if_exists('users','MODIFY COLUMN `emailVerified` tinyint DEFAULT 0');--> statement-breakpoint
CALL _d42_run_alter_if_exists('users','MODIFY COLUMN `recoveryEmailVerified` tinyint');--> statement-breakpoint
CALL _d42_run_alter_if_exists('users','MODIFY COLUMN `recoveryEmailVerified` tinyint DEFAULT 0');--> statement-breakpoint
CALL _d42_run_alter_if_exists('users','MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_run_alter_if_exists('users','MODIFY COLUMN `lastSignedIn` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)');--> statement-breakpoint
CALL _d42_add_col_if_not_exists('bookings','reminder24HSent','ADD `reminder24HSent` tinyint DEFAULT 0 NOT NULL');--> statement-breakpoint
CALL _d42_add_col_if_not_exists('bookings','reminder1HSent','ADD `reminder1HSent` tinyint DEFAULT 0 NOT NULL');--> statement-breakpoint
CALL _d42_create_idx_if_not_exists('office_notification_preferences','office_idx','(`officeId`)');--> statement-breakpoint
CALL _d42_create_idx_if_not_exists('office_notification_preferences','active_idx','(`isActive`)');--> statement-breakpoint
CALL _d42_create_idx_if_not_exists('office_notification_preferences','office_prefs_unique','(`officeId`)');--> statement-breakpoint
CALL _d42_add_quiz_fk_if_ref_has_pk();--> statement-breakpoint
CALL _d42_create_idx_if_not_exists('active_sessions','active_sessions_sessionId_unique','(`sessionId`)');--> statement-breakpoint
CALL _d42_create_idx_if_not_exists('referrals','referrals_referralCode_unique','(`referralCode`)');--> statement-breakpoint
CALL _d42_create_idx_if_not_exists('sanad_office_staff','unique_office_user','(`officeId`,`userId`)');--> statement-breakpoint
CALL _d42_create_idx_if_not_exists('sanad_offices','sanad_offices_slug_unique','(`slug`)');--> statement-breakpoint
CALL _d42_create_idx_if_not_exists('sanad_offices','sanad_offices_commercialRegistration_unique','(`commercialRegistration`)');--> statement-breakpoint
CALL _d42_create_idx_if_not_exists('translation_memory','source_idx','(`sourceText`(191))');--> statement-breakpoint
CALL _d42_create_idx_if_not_exists('translation_requests','entity_idx_req','(`entityType`,`entityId`)');--> statement-breakpoint
CALL _d42_create_idx_if_not_exists('users','users_openId_unique','(`openId`)');--> statement-breakpoint
CALL _d42_create_idx_if_not_exists('users','users_referralCode_unique','(`referralCode`)');--> statement-breakpoint
CALL _d42_drop_col_if_exists('bookings','reminder24hSent');--> statement-breakpoint
CALL _d42_drop_col_if_exists('bookings','reminder1hSent');--> statement-breakpoint
DROP PROCEDURE IF EXISTS _d42_create_idx_if_not_exists;--> statement-breakpoint
DROP PROCEDURE IF EXISTS _d42_add_quiz_fk_if_ref_has_pk;--> statement-breakpoint
DROP PROCEDURE IF EXISTS _d42_drop_col_if_exists;--> statement-breakpoint
DROP PROCEDURE IF EXISTS _d42_add_col_if_not_exists;--> statement-breakpoint
DROP PROCEDURE IF EXISTS _d42_run_alter_if_exists;