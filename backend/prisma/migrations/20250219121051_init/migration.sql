-- CreateTable
CREATE TABLE `ScrapeSession` (
    `scrapeSessionId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`scrapeSessionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PopularJobCategory` (
    `jobCategoryPopularId` VARCHAR(191) NOT NULL,
    `jobTitle` VARCHAR(191) NOT NULL,
    `jobCategory` VARCHAR(191) NOT NULL,
    `normalizedJobCategory` VARCHAR(191) NOT NULL,
    `scrapeSessionId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`jobCategoryPopularId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PopularJobCategory` ADD CONSTRAINT `PopularJobCategory_scrapeSessionId_fkey` FOREIGN KEY (`scrapeSessionId`) REFERENCES `ScrapeSession`(`scrapeSessionId`) ON DELETE RESTRICT ON UPDATE CASCADE;
