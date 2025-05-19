/*
  Warnings:

  - You are about to alter the column `timeupdated` on the `Member` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- AlterTable
ALTER TABLE `Member` MODIFY `timeupdated` INTEGER NOT NULL DEFAULT 1674159696;
