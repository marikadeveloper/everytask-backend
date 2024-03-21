/*
  Warnings:

  - A unique constraint covering the columns `[date]` on the table `TaskDailyStat` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TaskDailyStat" ALTER COLUMN "date" DROP DEFAULT,
ALTER COLUMN "date" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TaskDailyStat_date_key" ON "TaskDailyStat"("date");
