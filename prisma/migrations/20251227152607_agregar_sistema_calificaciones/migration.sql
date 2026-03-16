-- AlterTable
ALTER TABLE `providerprofile` ADD COLUMN `averageRating` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `totalRatings` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `Rating` (
    `id` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `contractorProfileId` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Rating_providerId_idx`(`providerId`),
    UNIQUE INDEX `Rating_providerId_contractorProfileId_key`(`providerId`, `contractorProfileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Rating` ADD CONSTRAINT `Rating_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `ProviderProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rating` ADD CONSTRAINT `Rating_contractorProfileId_fkey` FOREIGN KEY (`contractorProfileId`) REFERENCES `ContractorProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
