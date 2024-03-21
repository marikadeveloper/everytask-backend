/*
  Warnings:

  - You are about to drop the column `completedAfterTenPmToday` on the `TaskCounter` table. All the data in the column will be lost.
  - You are about to drop the column `completedBeforeNoonToday` on the `TaskCounter` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TaskCounter" DROP COLUMN "completedAfterTenPmToday",
DROP COLUMN "completedBeforeNoonToday",
ADD COLUMN     "completedAfterTenPm" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "completedBeforeNoon" INTEGER NOT NULL DEFAULT 0;
