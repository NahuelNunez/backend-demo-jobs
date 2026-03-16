/*
  Warnings:

  - You are about to drop the column `contrasena` on the `usuario` table. All the data in the column will be lost.
  - Added the required column `clave` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `usuario` DROP COLUMN `contrasena`,
    ADD COLUMN `clave` VARCHAR(191) NOT NULL;
