/*
  Warnings:

  - You are about to drop the column `points` on the `TaskImpact` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TaskImpact" DROP COLUMN "points",
ADD COLUMN     "basePoints" INTEGER NOT NULL DEFAULT 1;
