-- AlterTable
ALTER TABLE `scrape_session` MODIFY `finished_at` DATETIME(3) NULL,
    MODIFY `started_at` DATETIME(3) NULL,
    MODIFY `percentage` INTEGER NOT NULL DEFAULT 0;
