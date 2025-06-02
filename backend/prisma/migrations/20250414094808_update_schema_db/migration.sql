/*
  Warnings:

  - You are about to drop the column `job_type` on the `popular_job_category` table. All the data in the column will be lost.
  - You are about to drop the column `job_url` on the `popular_job_category` table. All the data in the column will be lost.
  - Added the required column `job_detail_url` to the `popular_job_category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `job_work_type` to the `popular_job_category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `popular_job_category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `popular_job_category` DROP COLUMN `job_type`,
    DROP COLUMN `job_url`,
    ADD COLUMN `job_detail_url` VARCHAR(191) NOT NULL,
    ADD COLUMN `job_work_type` VARCHAR(191) NOT NULL,
    ADD COLUMN `location` VARCHAR(191) NOT NULL;
