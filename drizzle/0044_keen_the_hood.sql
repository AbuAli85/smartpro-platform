CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`office_id` int NOT NULL,
	`category` enum('rent','utilities','salaries','supplies','marketing','travel','insurance','maintenance','software','other') NOT NULL,
	`description` text NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`expense_date` date NOT NULL,
	`payment_method` enum('cash','bank_transfer','credit_card','debit_card','cheque','other'),
	`receipt_url` text,
	`vendor` varchar(255),
	`notes` text,
	`created_by` int NOT NULL,
	`created_by_name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoice_number` varchar(50) NOT NULL,
	`office_id` int NOT NULL,
	`client_id` int,
	`client_name` varchar(255) NOT NULL,
	`client_email` varchar(255),
	`client_phone` varchar(20),
	`client_address` text,
	`issue_date` date NOT NULL,
	`due_date` date NOT NULL,
	`status` enum('draft','sent','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
	`subtotal` decimal(10,2) NOT NULL,
	`tax_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
	`discount_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
	`total_amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'OMR',
	`notes` text,
	`items` json,
	`created_by` int NOT NULL,
	`created_by_name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoice_id` int NOT NULL,
	`office_id` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`payment_method` enum('cash','bank_transfer','credit_card','debit_card','cheque','other') NOT NULL,
	`payment_date` date NOT NULL,
	`reference_number` varchar(100),
	`notes` text,
	`created_by` int NOT NULL,
	`created_by_name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE INDEX `office_id_idx` ON `expenses` (`office_id`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `expenses` (`category`);--> statement-breakpoint
CREATE INDEX `expense_date_idx` ON `expenses` (`expense_date`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `expenses` (`created_at`);--> statement-breakpoint
CREATE INDEX `invoice_number_unique` ON `invoices` (`invoice_number`);--> statement-breakpoint
CREATE INDEX `office_id_idx` ON `invoices` (`office_id`);--> statement-breakpoint
CREATE INDEX `client_id_idx` ON `invoices` (`client_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `invoices` (`status`);--> statement-breakpoint
CREATE INDEX `issue_date_idx` ON `invoices` (`issue_date`);--> statement-breakpoint
CREATE INDEX `due_date_idx` ON `invoices` (`due_date`);--> statement-breakpoint
CREATE INDEX `invoice_id_idx` ON `payments` (`invoice_id`);--> statement-breakpoint
CREATE INDEX `office_id_idx` ON `payments` (`office_id`);--> statement-breakpoint
CREATE INDEX `payment_date_idx` ON `payments` (`payment_date`);--> statement-breakpoint
CREATE INDEX `payment_method_idx` ON `payments` (`payment_method`);