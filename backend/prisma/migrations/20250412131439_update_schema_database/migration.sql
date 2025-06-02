/*
  Warnings:

  - You are about to drop the column `scrape_date` on the `popular_job_category` table. All the data in the column will be lost.
  - Added the required column `created_at` to the `popular_job_category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `percentage` to the `scrape_session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `popular_job_category` DROP COLUMN `scrape_date`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `scrape_session` ADD COLUMN `percentage` INTEGER NOT NULL;
