-- Add year_established to sanad_offices (fixes booking reminder cron: Unknown column 'sanad_offices.year_established')
-- Run once; if column already exists, migration will error (safe to ignore on re-run).
ALTER TABLE `sanad_offices` ADD COLUMN `year_established` int NULL;
