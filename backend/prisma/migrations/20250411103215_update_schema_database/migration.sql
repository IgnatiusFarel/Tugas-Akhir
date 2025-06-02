/*
  Warnings:

  - Added the required column `job_url` to the `popular_job_category` table without a default value. This is not possible if the table is not empty.
  - Made the column `job_sub_category` on table `popular_job_category` required. This step will fail if there are existing NULL values in that column.
  - Made the column `source` on table `popular_job_category` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `finished_at` to the `scrape_session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `scrape_session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `started_at` to the `scrape_session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `popular_job_category` ADD COLUMN `job_url` VARCHAR(191) NOT NULL,
    MODIFY `job_sub_category` VARCHAR(191) NOT NULL,
    MODIFY `source` ENUM('jobstreet', 'glints') NOT NULL;

-- AlterTable
ALTER TABLE `scrape_session` ADD COLUMN `finished_at` DATETIME(3) NOT NULL,
    ADD COLUMN `scheduled_run` DATETIME(3) NULL,
    ADD COLUMN `source` ENUM('jobstreet', 'glints') NOT NULL,
    ADD COLUMN `started_at` DATETIME(3) NOT NULL,
    ADD COLUMN `status` ENUM('success', 'failed', 'pending', 'running', 'canceled', 'scheduled') NOT NULL DEFAULT 'pending';
