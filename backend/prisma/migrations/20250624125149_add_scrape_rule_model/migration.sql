-- CreateTable
CREATE TABLE `scrape_rule` (
    `scrape_rule_id` VARCHAR(191) NOT NULL,
    `platform` ENUM('jobstreet', 'glints') NOT NULL,
    `field_name` VARCHAR(191) NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `selector_value` VARCHAR(191) NOT NULL,
    `attribute` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `scrape_rule_platform_field_name_key`(`platform`, `field_name`),
    PRIMARY KEY (`scrape_rule_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
