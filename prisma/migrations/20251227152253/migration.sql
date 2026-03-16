/*
  Warnings:

  - You are about to drop the column `creadoEn` on the `chat` table. All the data in the column will be lost.
  - You are about to drop the column `proveedorId` on the `chat` table. All the data in the column will be lost.
  - You are about to drop the `documentoproveedor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mensaje` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `perfilcontratador` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `perfilproveedor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuario` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `providerId` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `chat` DROP FOREIGN KEY `Chat_proveedorId_fkey`;

-- DropForeignKey
ALTER TABLE `documentoproveedor` DROP FOREIGN KEY `DocumentoProveedor_proveedorId_fkey`;

-- DropForeignKey
ALTER TABLE `mensaje` DROP FOREIGN KEY `Mensaje_chatId_fkey`;

-- DropForeignKey
ALTER TABLE `mensaje` DROP FOREIGN KEY `Mensaje_remitenteId_fkey`;

-- DropForeignKey
ALTER TABLE `perfilcontratador` DROP FOREIGN KEY `PerfilContratador_usuarioId_fkey`;

-- DropForeignKey
ALTER TABLE `perfilproveedor` DROP FOREIGN KEY `PerfilProveedor_usuarioId_fkey`;

-- DropIndex
DROP INDEX `Chat_proveedorId_fkey` ON `chat`;

-- AlterTable
ALTER TABLE `chat` DROP COLUMN `creadoEn`,
    DROP COLUMN `proveedorId`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `providerId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `documentoproveedor`;

-- DropTable
DROP TABLE `mensaje`;

-- DropTable
DROP TABLE `perfilcontratador`;

-- DropTable
DROP TABLE `perfilproveedor`;

-- DropTable
DROP TABLE `usuario`;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'CONTRACTOR', 'PROVIDER') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContractorProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NULL,
    `username` VARCHAR(191) NULL,
    `cuit` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `zipCode` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,

    UNIQUE INDEX `ContractorProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProviderProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NULL,
    `trade` VARCHAR(191) NULL,
    `experience` INTEGER NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `zipCode` VARCHAR(191) NULL,
    `profileComplete` BOOLEAN NOT NULL DEFAULT false,
    `title` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `category` VARCHAR(191) NULL,
    `estimatedPrice` DOUBLE NULL,
    `status` ENUM('ACTIVE', 'PAUSED', 'FINISHED') NOT NULL DEFAULT 'ACTIVE',
    `videoUrl` VARCHAR(191) NULL,
    `videoKey` VARCHAR(191) NULL,
    `videoThumbnailUrl` VARCHAR(191) NULL,
    `videoDurationSeconds` INTEGER NULL,
    `videoMimeType` VARCHAR(191) NULL,
    `applicationCreatedAt` DATETIME(3) NULL,

    UNIQUE INDEX `ProviderProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `id` VARCHAR(191) NOT NULL,
    `chatId` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `text` VARCHAR(191) NULL,
    `attachmentUrl` VARCHAR(191) NULL,
    `attachmentType` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProviderDocument` (
    `id` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ContractorProfile` ADD CONSTRAINT `ContractorProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProviderProfile` ADD CONSTRAINT `ProviderProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `ProviderProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProviderDocument` ADD CONSTRAINT `ProviderDocument_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `ProviderProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
