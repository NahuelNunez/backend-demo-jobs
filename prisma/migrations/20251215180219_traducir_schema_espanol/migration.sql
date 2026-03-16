/*
  Warnings:

  - You are about to drop the column `createdAt` on the `chat` table. All the data in the column will be lost.
  - You are about to drop the column `attachmentType` on the `mensaje` table. All the data in the column will be lost.
  - You are about to drop the column `attachmentUrl` on the `mensaje` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `mensaje` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `mensaje` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `postulacion` table. All the data in the column will be lost.
  - You are about to drop the column `providerId` on the `postulacion` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `postulacionvideo` table. All the data in the column will be lost.
  - You are about to drop the column `durationSec` on the `postulacionvideo` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `postulacionvideo` table. All the data in the column will be lost.
  - You are about to drop the column `mimeType` on the `postulacionvideo` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailUrl` on the `postulacionvideo` table. All the data in the column will be lost.
  - You are about to drop the `contractorprofile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `providerdocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `providerprofile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `remitenteId` to the `Mensaje` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proveedorId` to the `Postulacion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `contractorprofile` DROP FOREIGN KEY `ContractorProfile_userId_fkey`;

-- DropForeignKey
ALTER TABLE `mensaje` DROP FOREIGN KEY `Mensaje_senderId_fkey`;

-- DropForeignKey
ALTER TABLE `postulacion` DROP FOREIGN KEY `Postulacion_providerId_fkey`;

-- DropForeignKey
ALTER TABLE `providerdocument` DROP FOREIGN KEY `ProviderDocument_providerId_fkey`;

-- DropForeignKey
ALTER TABLE `providerprofile` DROP FOREIGN KEY `ProviderProfile_userId_fkey`;

-- DropIndex
DROP INDEX `Mensaje_senderId_fkey` ON `mensaje`;

-- DropIndex
DROP INDEX `Postulacion_providerId_fkey` ON `postulacion`;

-- AlterTable
ALTER TABLE `chat` DROP COLUMN `createdAt`,
    ADD COLUMN `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `mensaje` DROP COLUMN `attachmentType`,
    DROP COLUMN `attachmentUrl`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `senderId`,
    ADD COLUMN `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `remitenteId` VARCHAR(191) NOT NULL,
    ADD COLUMN `tipoAdjunto` VARCHAR(191) NULL,
    ADD COLUMN `urlAdjunto` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `postulacion` DROP COLUMN `createdAt`,
    DROP COLUMN `providerId`,
    ADD COLUMN `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `proveedorId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `postulacionvideo` DROP COLUMN `createdAt`,
    DROP COLUMN `durationSec`,
    DROP COLUMN `key`,
    DROP COLUMN `mimeType`,
    DROP COLUMN `thumbnailUrl`,
    ADD COLUMN `clave` VARCHAR(191) NULL,
    ADD COLUMN `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `duracionSegundos` INTEGER NULL,
    ADD COLUMN `tipoMime` VARCHAR(191) NULL,
    ADD COLUMN `urlMiniatura` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `contractorprofile`;

-- DropTable
DROP TABLE `providerdocument`;

-- DropTable
DROP TABLE `providerprofile`;

-- DropTable
DROP TABLE `user`;

-- CreateTable
CREATE TABLE `Usuario` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `contrasena` VARCHAR(191) NOT NULL,
    `rol` ENUM('ADMIN', 'CONTRATADOR', 'PROVEEDOR') NOT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PerfilContratador` (
    `id` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `nombreCompleto` VARCHAR(191) NULL,
    `nombreUsuario` VARCHAR(191) NULL,
    `cuit` VARCHAR(191) NULL,
    `direccion` VARCHAR(191) NULL,
    `ciudad` VARCHAR(191) NULL,
    `codigoPostal` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,

    UNIQUE INDEX `PerfilContratador_usuarioId_key`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PerfilProveedor` (
    `id` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,
    `nombreCompleto` VARCHAR(191) NOT NULL,
    `nombreUsuario` VARCHAR(191) NULL,
    `rubro` VARCHAR(191) NULL,
    `experiencia` INTEGER NULL,
    `descripcion` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,
    `direccion` VARCHAR(191) NULL,
    `ciudad` VARCHAR(191) NULL,
    `codigoPostal` VARCHAR(191) NULL,
    `perfilCompleto` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `PerfilProveedor_usuarioId_key`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DocumentoProveedor` (
    `id` VARCHAR(191) NOT NULL,
    `proveedorId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PerfilContratador` ADD CONSTRAINT `PerfilContratador_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PerfilProveedor` ADD CONSTRAINT `PerfilProveedor_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Postulacion` ADD CONSTRAINT `Postulacion_proveedorId_fkey` FOREIGN KEY (`proveedorId`) REFERENCES `PerfilProveedor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mensaje` ADD CONSTRAINT `Mensaje_remitenteId_fkey` FOREIGN KEY (`remitenteId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentoProveedor` ADD CONSTRAINT `DocumentoProveedor_proveedorId_fkey` FOREIGN KEY (`proveedorId`) REFERENCES `PerfilProveedor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
