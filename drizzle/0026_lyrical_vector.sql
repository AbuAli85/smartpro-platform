CREATE TABLE `quiz_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quiz_id` int NOT NULL,
	`user_id` int NOT NULL,
	`score` int NOT NULL,
	`total_questions` int NOT NULL,
	`passed` boolean DEFAULT false,
	`completed_at` timestamp DEFAULT (now()),
	CONSTRAINT `quiz_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_options` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question_id` int NOT NULL,
	`option_text` text NOT NULL,
	`option_text_ar` text,
	`is_correct` boolean DEFAULT false,
	`order_index` int DEFAULT 0,
	CONSTRAINT `quiz_options_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quiz_id` int NOT NULL,
	`question` text NOT NULL,
	`question_ar` text,
	`correct_answer` text NOT NULL,
	`explanation` text,
	`explanation_ar` text,
	`order_index` int DEFAULT 0,
	CONSTRAINT `quiz_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `training_materials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`title_ar` varchar(255),
	`content` text NOT NULL,
	`content_ar` text,
	`category` enum('guidelines','common_mistakes','best_practices','examples') NOT NULL,
	`order_index` int DEFAULT 0,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `training_materials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `training_quizzes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`title_ar` varchar(255),
	`description` text,
	`description_ar` text,
	`passing_score` int DEFAULT 70,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `training_quizzes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `untranslated_content_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content_type` enum('office','template') NOT NULL,
	`content_id` int NOT NULL,
	`priority` enum('low','medium','high','critical') DEFAULT 'medium',
	`status` enum('pending','in_progress','resolved') DEFAULT 'pending',
	`notification_sent` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	`resolved_at` timestamp,
	CONSTRAINT `untranslated_content_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `quiz_attempts` ADD CONSTRAINT `quiz_attempts_quiz_id_training_quizzes_id_fk` FOREIGN KEY (`quiz_id`) REFERENCES `training_quizzes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_attempts` ADD CONSTRAINT `quiz_attempts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_options` ADD CONSTRAINT `quiz_options_question_id_quiz_questions_id_fk` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_questions` ADD CONSTRAINT `quiz_questions_quiz_id_training_quizzes_id_fk` FOREIGN KEY (`quiz_id`) REFERENCES `training_quizzes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `content_idx` ON `untranslated_content_alerts` (`content_type`,`content_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `untranslated_content_alerts` (`status`);--> statement-breakpoint
CREATE INDEX `priority_idx` ON `untranslated_content_alerts` (`priority`);