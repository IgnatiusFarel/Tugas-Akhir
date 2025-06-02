/*
  Warnings:

  - You are about to drop the column `job_normalized_job_category` on the `job_trend_information` table. All the data in the column will be lost.
  - Added the required column `job_category_normalization` to the `job_trend_information` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `job_trend_information` DROP COLUMN `job_normalized_job_category`,
    ADD COLUMN `job_category_normalization` VARCHAR(191) NOT NULL;
