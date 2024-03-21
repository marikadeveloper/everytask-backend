/*
  Warnings:

  - You are about to drop the column `overdue` on the `TaskDailyStat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TaskDailyStat" DROP COLUMN "overdue",
ADD COLUMN     "inProgress" INTEGER NOT NULL DEFAULT 0;
