/*
  Warnings:

  - You are about to drop the column `job_location` on the `job_trend_information` table. All the data in the column will be lost.
  - You are about to drop the column `job_salary` on the `job_trend_information` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `job_trend_information` DROP COLUMN `job_location`,
    DROP COLUMN `job_salary`;
