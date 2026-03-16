/*
  Warnings:

  - You are about to drop the `postulacionvideo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `postulacionvideo` DROP FOREIGN KEY `PostulacionVideo_postulacionId_fkey`;

-- AlterTable
ALTER TABLE `postulacion` ADD COLUMN `videoClave` VARCHAR(191) NULL,
    ADD COLUMN `videoDuracionSegundos` INTEGER NULL,
    ADD COLUMN `videoTipoMime` VARCHAR(191) NULL,
    ADD COLUMN `videoUrl` VARCHAR(191) NULL,
    ADD COLUMN `videoUrlMiniatura` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `postulacionvideo`;
