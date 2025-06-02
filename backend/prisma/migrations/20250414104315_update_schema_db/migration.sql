/*
  Warnings:

  - You are about to drop the column `location` on the `job_trend_information` table. All the data in the column will be lost.
  - You are about to drop the column `normalized_job_category` on the `job_trend_information` table. All the data in the column will be lost.
  - You are about to drop the column `salary` on the `job_trend_information` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `job_trend_information` table. All the data in the column will be lost.
  - Added the required column `job_location` to the `job_trend_information` table without a default value. This is not possible if the table is not empty.
  - Added the required column `job_normalized_job_category` to the `job_trend_information` table without a default value. This is not possible if the table is not empty.
  - Added the required column `job_source` to the `job_trend_information` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `job_trend_information` DROP COLUMN `location`,
    DROP COLUMN `normalized_job_category`,
    DROP COLUMN `salary`,
    DROP COLUMN `source`,
    ADD COLUMN `job_location` VARCHAR(191) NOT NULL,
    ADD COLUMN `job_normalized_job_category` VARCHAR(191) NOT NULL,
    ADD COLUMN `job_salary` VARCHAR(191) NULL,
    ADD COLUMN `job_source` ENUM('jobstreet', 'glints') NOT NULL;
