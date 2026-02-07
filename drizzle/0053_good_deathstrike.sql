CREATE TABLE IF NOT EXISTS `governorates` (
	`id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
	`name` varchar(100) NOT NULL,
	`name_ar` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`region` enum('north','south','central','coastal','interior') NOT NULL,
	`capital_city` varchar(100),
	`capital_city_ar` varchar(100),
	`area` decimal(10,2),
	`coordinates` json,
	`population` int,
	`population_year` int,
	`major_cities` json,
	`wilayats` json,
	`key_industries` json,
	`key_industries_ar` json,
	`economic_sectors` json,
	`total_businesses` int,
	`sme_count` int,
	`overview` text NOT NULL,
	`overview_ar` text,
	`economic_profile` text,
	`economic_profile_ar` text,
	`historical_significance` text,
	`historical_significance_ar` text,
	`tourist_attractions` json,
	`tourist_attractions_ar` json,
	`business_opportunities` json,
	`business_opportunities_ar` json,
	`investment_zones` json,
	`investment_zones_ar` json,
	`registered_offices_count` int DEFAULT 0,
	`top_service_categories` json,
	`average_service_price` decimal(10,2),
	`cover_image_url` text,
	`gallery_images` json,
	`map_image_url` text,
	`government_office_address` text,
	`government_office_address_ar` text,
	`government_office_phone` varchar(20),
	`government_office_email` varchar(320),
	`meta_title` varchar(255),
	`meta_title_ar` varchar(255),
	`meta_description` text,
	`meta_description_ar` text,
	`keywords` json,
	`featured` tinyint NOT NULL DEFAULT 0,
	`display_order` int DEFAULT 0,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`view_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `office_blocked_slots` (
	`id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
	`office_id` int NOT NULL,
	`blocked_date` date NOT NULL,
	`start_time` varchar(10),
	`end_time` varchar(10),
	`is_all_day` tinyint NOT NULL DEFAULT 0,
	`reason` text,
	`created_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `office_profile_versions` (
	`id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
	`office_id` int NOT NULL,
	`version_number` int NOT NULL,
	`version_label` varchar(255),
	`changed_by` int NOT NULL,
	`changed_by_name` varchar(255) NOT NULL,
	`change_description` text,
	`snapshot_data` json NOT NULL,
	`changed_fields` json,
	`previous_values` json,
	`new_values` json,
	`created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `regulations` (
	`id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
	`title` varchar(255) NOT NULL,
	`title_ar` varchar(255),
	`slug` varchar(255) NOT NULL,
	`category` enum('business_registration','licensing','tax','labor','sme_support','industry_specific','general') NOT NULL,
	`subcategory` varchar(100),
	`applicable_industries` json,
	`applicable_business_types` json,
	`summary` text NOT NULL,
	`summary_ar` text,
	`description` text NOT NULL,
	`description_ar` text,
	`requirements` json NOT NULL,
	`requirements_ar` json,
	`issuing_authority` varchar(255) NOT NULL,
	`issuing_authority_ar` varchar(255),
	`authority_website` text,
	`authority_contact` json,
	`compliance_steps` json,
	`compliance_steps_ar` json,
	`required_documents` json,
	`required_documents_ar` json,
	`estimated_cost` varchar(100),
	`estimated_duration` varchar(100),
	`renewal_required` tinyint DEFAULT 0,
	`renewal_period` varchar(50),
	`downloadable_guide_url` text,
	`downloadable_guide_url_ar` text,
	`related_forms` json,
	`external_links` json,
	`priority` enum('critical','high','medium','low') DEFAULT 'medium',
	`featured` tinyint NOT NULL DEFAULT 0,
	`display_order` int DEFAULT 0,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`published_at` timestamp,
	`last_updated` timestamp,
	`view_count` int NOT NULL DEFAULT 0,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `revenue_model_versions` (
	`id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
	`model_id` int NOT NULL,
	`version` int NOT NULL,
	`name_en` varchar(255) NOT NULL,
	`name_ar` varchar(255) NOT NULL,
	`effective_from` date NOT NULL,
	`rules_json` json NOT NULL,
	`notes` text,
	`created_by_user_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `revenue_model_versions_model_version_unique` UNIQUE(`model_id`,`version`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `revenue_models` (
	`id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
	`stream_type` enum('subscription','marketplace','sanad','pro') NOT NULL,
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`currency` varchar(3) NOT NULL DEFAULT 'OMR',
	`created_by_user_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `success_stories` (
	`id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
	`business_name` varchar(255) NOT NULL,
	`business_name_ar` varchar(255),
	`owner_name` varchar(255) NOT NULL,
	`owner_name_ar` varchar(255),
	`governorate` varchar(100) NOT NULL,
	`wilayat` varchar(100),
	`industry` varchar(100) NOT NULL,
	`service_type` varchar(100),
	`year_established` int,
	`office_id` int,
	`challenge` text NOT NULL,
	`challenge_ar` text,
	`solution` text NOT NULL,
	`solution_ar` text,
	`results` text NOT NULL,
	`results_ar` text,
	`testimonial` text,
	`testimonial_ar` text,
	`jobs_created` int,
	`revenue_growth` varchar(50),
	`customers_served` int,
	`awards_received` json,
	`owner_photo_url` text,
	`business_photo_url` text,
	`additional_photos` json,
	`video_url` text,
	`smartpro_services_used` json,
	`smartpro_impact` text,
	`smartpro_impact_ar` text,
	`featured` tinyint NOT NULL DEFAULT 0,
	`display_order` int DEFAULT 0,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`published_at` timestamp,
	`view_count` int NOT NULL DEFAULT 0,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `user_compliance_checklists` (
	`id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
	`user_id` int NOT NULL,
	`office_id` int,
	`regulation_id` int NOT NULL,
	`status` enum('not_started','in_progress','completed','not_applicable') NOT NULL DEFAULT 'not_started',
	`completed_steps` json,
	`notes` text,
	`documents_uploaded` json,
	`started_at` timestamp,
	`completed_at` timestamp,
	`due_date` timestamp,
	`reminder_date` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
DROP PROCEDURE IF EXISTS _d53_ci;--> statement-breakpoint
CREATE PROCEDURE _d53_ci(IN t VARCHAR(64), IN i VARCHAR(64), IN c VARCHAR(512)) BEGIN IF (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name=t AND index_name=i)=0 THEN SET @s=CONCAT('CREATE INDEX `',i,'` ON `',t,'` ',c); PREPARE st FROM @s; EXECUTE st; DEALLOCATE PREPARE st; END IF; END--> statement-breakpoint
CALL _d53_ci('governorates','governorates_slug_unique','(`slug`)');--> statement-breakpoint
CALL _d53_ci('governorates','governorates_name_unique','(`name`)');--> statement-breakpoint
CALL _d53_ci('governorates','region_idx','(`region`)');--> statement-breakpoint
CALL _d53_ci('governorates','status_idx','(`status`)');--> statement-breakpoint
CALL _d53_ci('governorates','featured_idx','(`featured`)');--> statement-breakpoint
CALL _d53_ci('governorates','display_order_idx','(`display_order`)');--> statement-breakpoint
CALL _d53_ci('office_profile_versions','office_id_idx','(`office_id`)');--> statement-breakpoint
CALL _d53_ci('office_profile_versions','version_number_idx','(`version_number`)');--> statement-breakpoint
CALL _d53_ci('office_profile_versions','changed_by_idx','(`changed_by`)');--> statement-breakpoint
CALL _d53_ci('office_profile_versions','created_at_idx','(`created_at`)');--> statement-breakpoint
CALL _d53_ci('regulations','regulations_slug_unique','(`slug`)');--> statement-breakpoint
CALL _d53_ci('regulations','category_idx','(`category`)');--> statement-breakpoint
CALL _d53_ci('regulations','priority_idx','(`priority`)');--> statement-breakpoint
CALL _d53_ci('regulations','status_idx','(`status`)');--> statement-breakpoint
CALL _d53_ci('regulations','featured_idx','(`featured`)');--> statement-breakpoint
CALL _d53_ci('regulations','display_order_idx','(`display_order`)');--> statement-breakpoint
CALL _d53_ci('revenue_model_versions','revenue_model_versions_model_effective_idx','(`model_id`,`effective_from`)');--> statement-breakpoint
CALL _d53_ci('revenue_models','revenue_models_stream_status_idx','(`stream_type`,`status`)');--> statement-breakpoint
CALL _d53_ci('revenue_models','revenue_models_created_at_idx','(`created_at`)');--> statement-breakpoint
CALL _d53_ci('success_stories','governorate_idx','(`governorate`)');--> statement-breakpoint
CALL _d53_ci('success_stories','industry_idx','(`industry`)');--> statement-breakpoint
CALL _d53_ci('success_stories','status_idx','(`status`)');--> statement-breakpoint
CALL _d53_ci('success_stories','featured_idx','(`featured`)');--> statement-breakpoint
CALL _d53_ci('success_stories','office_idx','(`office_id`)');--> statement-breakpoint
CALL _d53_ci('success_stories','display_order_idx','(`display_order`)');--> statement-breakpoint
CALL _d53_ci('user_compliance_checklists','user_idx','(`user_id`)');--> statement-breakpoint
CALL _d53_ci('user_compliance_checklists','office_idx','(`office_id`)');--> statement-breakpoint
CALL _d53_ci('user_compliance_checklists','regulation_idx','(`regulation_id`)');--> statement-breakpoint
CALL _d53_ci('user_compliance_checklists','status_idx','(`status`)');--> statement-breakpoint
CALL _d53_ci('user_compliance_checklists','user_regulation_idx','(`user_id`,`regulation_id`)');--> statement-breakpoint
DROP PROCEDURE IF EXISTS _d53_ci;