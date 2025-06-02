/*
  Warnings:

  - You are about to drop the `popular_job_category` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `popular_job_category` DROP FOREIGN KEY `popular_job_category_scrape_session_id_fkey`;

-- DropTable
DROP TABLE `popular_job_category`;

-- CreateTable
CREATE TABLE `job_trend_information` (
    `job_trend_information_id` VARCHAR(191) NOT NULL,
    `scrape_session_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `job_title` VARCHAR(191) NOT NULL,
    `job_category` VARCHAR(191) NOT NULL,
    `job_sub_category` VARCHAR(191) NOT NULL,
    `job_posted` DATETIME(3) NOT NULL,
    `job_work_type` VARCHAR(191) NOT NULL,
    `normalized_job_category` VARCHAR(191) NOT NULL,
    `salary` VARCHAR(191) NULL,
    `source` ENUM('jobstreet', 'glints') NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `job_detail_url` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`job_trend_information_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `job_trend_information` ADD CONSTRAINT `job_trend_information_scrape_session_id_fkey` FOREIGN KEY (`scrape_session_id`) REFERENCES `scrape_session`(`scrape_session_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
