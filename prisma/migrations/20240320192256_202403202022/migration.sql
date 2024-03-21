/*
  Warnings:

  - You are about to drop the column `currentStreak` on the `Streak` table. All the data in the column will be lost.
  - You are about to drop the column `longestStreak` on the `Streak` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Streak" DROP COLUMN "currentStreak",
DROP COLUMN "longestStreak",
ADD COLUMN     "current" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "longest" INTEGER NOT NULL DEFAULT 0;
