/*
  Warnings:

  - You are about to drop the `popularjobcategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `scrapesession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `popularjobcategory` DROP FOREIGN KEY `PopularJobCategory_scrapeSessionId_fkey`;

-- DropTable
DROP TABLE `popularjobcategory`;

-- DropTable
DROP TABLE `scrapesession`;

-- CreateTable
CREATE TABLE `scrape_session` (
    `scrape_session_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`scrape_session_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `popular_job_category` (
    `job_category_popular_id` VARCHAR(191) NOT NULL,
    `scrape_session_id` VARCHAR(191) NOT NULL,
    `scrape_date` DATETIME(3) NOT NULL,
    `job_title` VARCHAR(191) NOT NULL,
    `job_category` VARCHAR(191) NOT NULL,
    `job_sub_category` VARCHAR(191) NULL,
    `job_posted` DATETIME(3) NOT NULL,
    `job_type` VARCHAR(191) NOT NULL,
    `normalized_job_category` VARCHAR(191) NOT NULL,
    `salary` VARCHAR(191) NULL,
    `source` VARCHAR(191) NULL,

    PRIMARY KEY (`job_category_popular_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `popular_job_category` ADD CONSTRAINT `popular_job_category_scrape_session_id_fkey` FOREIGN KEY (`scrape_session_id`) REFERENCES `scrape_session`(`scrape_session_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
