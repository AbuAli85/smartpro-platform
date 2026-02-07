-- Add year_established to sanad_offices (fixes booking reminder cron). Idempotent: only runs if table exists and column missing.
DROP PROCEDURE IF EXISTS _d52_add_year_established_if_missing;--> statement-breakpoint
CREATE PROCEDURE _d52_add_year_established_if_missing() BEGIN IF (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name='sanad_offices')>0 AND (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='sanad_offices' AND column_name='year_established')=0 THEN ALTER TABLE `sanad_offices` ADD COLUMN `year_established` int NULL; END IF; END--> statement-breakpoint
CALL _d52_add_year_established_if_missing();--> statement-breakpoint
DROP PROCEDURE IF EXISTS _d52_add_year_established_if_missing;
