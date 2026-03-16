/*
  Warnings:

  - You are about to drop the column `contratoId` on the `chat` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `contractorprofile` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `providerprofile` table. All the data in the column will be lost.
  - You are about to drop the `contrato` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `postulacionId` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullname` to the `ProviderProfile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `chat` DROP FOREIGN KEY `Chat_contratoId_fkey`;

-- DropForeignKey
ALTER TABLE `contrato` DROP FOREIGN KEY `Contrato_contractorId_fkey`;

-- DropForeignKey
ALTER TABLE `contrato` DROP FOREIGN KEY `Contrato_postulacionId_fkey`;

-- DropForeignKey
ALTER TABLE `contrato` DROP FOREIGN KEY `Contrato_providerId_fkey`;

-- DropIndex
DROP INDEX `Chat_contratoId_key` ON `chat`;

-- AlterTable
ALTER TABLE `chat` DROP COLUMN `contratoId`,
    ADD COLUMN `postulacionId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `contractorprofile` DROP COLUMN `companyName`,
    ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `fullname` VARCHAR(191) NULL,
    ADD COLUMN `username` VARCHAR(191) NULL,
    ADD COLUMN `zipCode` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `providerprofile` DROP COLUMN `name`,
    ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `fullname` VARCHAR(191) NOT NULL,
    ADD COLUMN `username` VARCHAR(191) NULL,
    ADD COLUMN `zipCode` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `contrato`;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_postulacionId_fkey` FOREIGN KEY (`postulacionId`) REFERENCES `Postulacion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
