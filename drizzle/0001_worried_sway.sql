CREATE TABLE `activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50),
	`entityId` int,
	`description` text,
	`metadata` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`officeId` int NOT NULL,
	`serviceId` int,
	`userId` int NOT NULL,
	`bookingType` varchar(50) NOT NULL DEFAULT 'service',
	`serviceDescription` text,
	`requirements` text,
	`preferredDate` timestamp,
	`scheduledDate` timestamp,
	`completedDate` timestamp,
	`status` enum('pending','confirmed','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
	`price` decimal(10,3),
	`currency` varchar(3) NOT NULL DEFAULT 'OMR',
	`paymentStatus` enum('unpaid','paid','refunded') NOT NULL DEFAULT 'unpaid',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `document_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateName` varchar(255) NOT NULL,
	`templateNameAr` varchar(255),
	`category` varchar(100) NOT NULL,
	`description` text,
	`descriptionAr` text,
	`templateContent` text NOT NULL,
	`variables` json NOT NULL,
	`language` varchar(10) NOT NULL DEFAULT 'en',
	`isOfficial` boolean NOT NULL DEFAULT false,
	`isPremium` boolean NOT NULL DEFAULT false,
	`usageCount` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int,
	CONSTRAINT `document_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generated_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`userId` int NOT NULL,
	`officeId` int,
	`bookingId` int,
	`documentName` varchar(255) NOT NULL,
	`filledData` json NOT NULL,
	`fileUrl` text NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`status` enum('draft','generated','delivered') NOT NULL DEFAULT 'generated',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `generated_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`officeId` int NOT NULL,
	`bookingId` int,
	`userId` int NOT NULL,
	`rating` int NOT NULL,
	`reviewText` text,
	`responseText` text,
	`respondedAt` timestamp,
	`respondedBy` int,
	`isVisible` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sanad_office_services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`officeId` int NOT NULL,
	`serviceName` varchar(255) NOT NULL,
	`serviceNameAr` varchar(255),
	`category` varchar(100) NOT NULL,
	`description` text,
	`descriptionAr` text,
	`price` decimal(10,3),
	`currency` varchar(3) NOT NULL DEFAULT 'OMR',
	`priceType` enum('fixed','hourly','custom') NOT NULL DEFAULT 'fixed',
	`estimatedDeliveryDays` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sanad_office_services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sanad_office_staff` (
	`id` int AUTO_INCREMENT NOT NULL,
	`officeId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','manager','staff','viewer') NOT NULL DEFAULT 'staff',
	`permissions` json,
	`status` enum('active','inactive','invited') NOT NULL DEFAULT 'invited',
	`invitedAt` timestamp,
	`joinedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sanad_office_staff_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_office_user` UNIQUE(`officeId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `sanad_offices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`officeName` varchar(255) NOT NULL,
	`officeNameAr` varchar(255),
	`slug` varchar(255) NOT NULL,
	`commercialRegistration` varchar(100) NOT NULL,
	`tradeLicense` varchar(100),
	`taxRegistration` varchar(100),
	`email` varchar(320) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`whatsapp` varchar(20),
	`website` text,
	`governorate` varchar(100) NOT NULL,
	`wilayat` varchar(100) NOT NULL,
	`addressLine1` text NOT NULL,
	`addressLine2` text,
	`postalCode` varchar(20),
	`locationLat` decimal(10,7),
	`locationLng` decimal(10,7),
	`description` text,
	`descriptionAr` text,
	`yearEstablished` int,
	`employeeCount` int NOT NULL DEFAULT 1,
	`status` enum('pending','active','suspended','inactive') NOT NULL DEFAULT 'pending',
	`verificationStatus` enum('unverified','pending_verification','verified','rejected') NOT NULL DEFAULT 'unverified',
	`verifiedAt` timestamp,
	`verifiedBy` int,
	`ownerId` int NOT NULL,
	`acceptsOnlineBookings` boolean NOT NULL DEFAULT true,
	`autoAcceptBookings` boolean NOT NULL DEFAULT false,
	`workingHours` json,
	`logoUrl` text,
	`coverImageUrl` text,
	`images` json,
	`totalOrders` int NOT NULL DEFAULT 0,
	`completedOrders` int NOT NULL DEFAULT 0,
	`averageRating` decimal(3,2) NOT NULL DEFAULT '0.00',
	`totalReviews` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int,
	`updatedBy` int,
	CONSTRAINT `sanad_offices_id` PRIMARY KEY(`id`),
	CONSTRAINT `sanad_offices_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `sanad_offices_commercialRegistration_unique` UNIQUE(`commercialRegistration`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','sanad_owner','sanad_staff','sme_owner','gig_worker','government_official') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;--> statement-breakpoint
CREATE INDEX `user_idx` ON `activity_log` (`userId`);--> statement-breakpoint
CREATE INDEX `entity_idx` ON `activity_log` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `action_idx` ON `activity_log` (`action`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `activity_log` (`createdAt`);--> statement-breakpoint
CREATE INDEX `office_idx` ON `bookings` (`officeId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `bookings` (`userId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `bookings` (`status`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `bookings` (`scheduledDate`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `document_templates` (`category`);--> statement-breakpoint
CREATE INDEX `language_idx` ON `document_templates` (`language`);--> statement-breakpoint
CREATE INDEX `active_idx` ON `document_templates` (`isActive`);--> statement-breakpoint
CREATE INDEX `template_idx` ON `generated_documents` (`templateId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `generated_documents` (`userId`);--> statement-breakpoint
CREATE INDEX `office_idx` ON `generated_documents` (`officeId`);--> statement-breakpoint
CREATE INDEX `booking_idx` ON `generated_documents` (`bookingId`);--> statement-breakpoint
CREATE INDEX `office_idx` ON `reviews` (`officeId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `reviews` (`userId`);--> statement-breakpoint
CREATE INDEX `booking_idx` ON `reviews` (`bookingId`);--> statement-breakpoint
CREATE INDEX `visible_idx` ON `reviews` (`isVisible`);--> statement-breakpoint
CREATE INDEX `office_idx` ON `sanad_office_services` (`officeId`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `sanad_office_services` (`category`);--> statement-breakpoint
CREATE INDEX `active_idx` ON `sanad_office_services` (`isActive`);--> statement-breakpoint
CREATE INDEX `office_idx` ON `sanad_office_staff` (`officeId`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `sanad_office_staff` (`userId`);--> statement-breakpoint
CREATE INDEX `owner_idx` ON `sanad_offices` (`ownerId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `sanad_offices` (`status`);--> statement-breakpoint
CREATE INDEX `governorate_idx` ON `sanad_offices` (`governorate`);--> statement-breakpoint
CREATE INDEX `verification_idx` ON `sanad_offices` (`verificationStatus`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `users` (`role`);