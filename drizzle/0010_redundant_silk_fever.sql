ALTER TABLE `document_templates` ADD `price` decimal(10,3);--> statement-breakpoint
ALTER TABLE `document_templates` ADD `fileUrl` text;--> statement-breakpoint
ALTER TABLE `document_templates` ADD `fileKey` varchar(500);--> statement-breakpoint
ALTER TABLE `document_templates` ADD `fileSize` int;--> statement-breakpoint
ALTER TABLE `document_templates` ADD `mimeType` varchar(100);