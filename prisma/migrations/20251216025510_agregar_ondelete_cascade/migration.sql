-- DropForeignKey
ALTER TABLE `chat` DROP FOREIGN KEY `Chat_postulacionId_fkey`;

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

-- DropForeignKey
ALTER TABLE `postulacion` DROP FOREIGN KEY `Postulacion_proveedorId_fkey`;

-- DropForeignKey
ALTER TABLE `postulacionvideo` DROP FOREIGN KEY `PostulacionVideo_postulacionId_fkey`;

-- DropIndex
DROP INDEX `Chat_postulacionId_fkey` ON `chat`;

-- DropIndex
DROP INDEX `DocumentoProveedor_proveedorId_fkey` ON `documentoproveedor`;

-- DropIndex
DROP INDEX `Mensaje_chatId_fkey` ON `mensaje`;

-- DropIndex
DROP INDEX `Mensaje_remitenteId_fkey` ON `mensaje`;

-- DropIndex
DROP INDEX `Postulacion_proveedorId_fkey` ON `postulacion`;

-- DropIndex
DROP INDEX `PostulacionVideo_postulacionId_fkey` ON `postulacionvideo`;

-- AddForeignKey
ALTER TABLE `PerfilContratador` ADD CONSTRAINT `PerfilContratador_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PerfilProveedor` ADD CONSTRAINT `PerfilProveedor_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Postulacion` ADD CONSTRAINT `Postulacion_proveedorId_fkey` FOREIGN KEY (`proveedorId`) REFERENCES `PerfilProveedor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostulacionVideo` ADD CONSTRAINT `PostulacionVideo_postulacionId_fkey` FOREIGN KEY (`postulacionId`) REFERENCES `Postulacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_postulacionId_fkey` FOREIGN KEY (`postulacionId`) REFERENCES `Postulacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mensaje` ADD CONSTRAINT `Mensaje_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mensaje` ADD CONSTRAINT `Mensaje_remitenteId_fkey` FOREIGN KEY (`remitenteId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentoProveedor` ADD CONSTRAINT `DocumentoProveedor_proveedorId_fkey` FOREIGN KEY (`proveedorId`) REFERENCES `PerfilProveedor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
