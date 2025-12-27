ALTER TABLE `document_templates` ADD `googleDocId` varchar(255);--> statement-breakpoint
ALTER TABLE `document_templates` ADD `useGoogleDocs` boolean DEFAULT false NOT NULL;