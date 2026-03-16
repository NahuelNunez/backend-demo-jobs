/*
  Warnings:

  - You are about to drop the column `postulacionId` on the `chat` table. All the data in the column will be lost.
  - You are about to drop the `postulacion` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `proveedorId` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Add new columns to PerfilProveedor (descripcion ya existe, solo cambiar tipo si es necesario)
ALTER TABLE `perfilproveedor` 
  ADD COLUMN `titulo` VARCHAR(191) NULL,
  ADD COLUMN `categoria` VARCHAR(191) NULL,
  ADD COLUMN `precioEstimado` DOUBLE NULL,
  ADD COLUMN `estado` ENUM('ACTIVA', 'PAUSADA', 'FINALIZADA') NOT NULL DEFAULT 'ACTIVA',
  ADD COLUMN `videoUrl` VARCHAR(191) NULL,
  ADD COLUMN `videoClave` VARCHAR(191) NULL,
  ADD COLUMN `videoUrlMiniatura` VARCHAR(191) NULL,
  ADD COLUMN `videoDuracionSegundos` INTEGER NULL,
  ADD COLUMN `videoTipoMime` VARCHAR(191) NULL,
  ADD COLUMN `postulacionCreadaEn` DATETIME(3) NULL;

-- Step 1b: Modificar descripcion a TEXT si es necesario
ALTER TABLE `perfilproveedor` MODIFY COLUMN `descripcion` TEXT NULL;

-- Step 2: Add proveedorId to Chat (nullable initially)
ALTER TABLE `chat` ADD COLUMN `proveedorId` VARCHAR(191) NULL;

-- Step 3: Migrate data from postulacionId to proveedorId
UPDATE `chat` c
INNER JOIN `postulacion` p ON c.postulacionId = p.id
SET c.proveedorId = p.proveedorId;

-- Step 4: Drop the foreign key for postulacionId
ALTER TABLE `chat` DROP FOREIGN KEY `Chat_postulacionId_fkey`;

-- Step 5: Drop postulacionId column
ALTER TABLE `chat` DROP COLUMN `postulacionId`;

-- Step 6: Make proveedorId NOT NULL and add foreign key
ALTER TABLE `chat` MODIFY `proveedorId` VARCHAR(191) NOT NULL;
ALTER TABLE `chat` ADD CONSTRAINT `Chat_proveedorId_fkey` FOREIGN KEY (`proveedorId`) REFERENCES `perfilproveedor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 7: Drop Postulacion table
DROP TABLE `postulacion`;

