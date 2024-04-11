/*
  Warnings:

  - You are about to drop the column `firstCompletedAt` on the `Task` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Task_firstCompletedAt_idx";

-- AlterTable
ALTER TABLE "StatusUpdate" ALTER COLUMN "updatedAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "firstCompletedAt",
ADD COLUMN     "completedAt" TEXT,
ALTER COLUMN "dueDate" SET DATA TYPE TEXT;
