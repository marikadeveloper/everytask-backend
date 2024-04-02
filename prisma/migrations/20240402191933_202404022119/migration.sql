/*
  Warnings:

  - A unique constraint covering the columns `[userId,date]` on the table `TaskDailyStat` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TaskDailyStat_userId_date_key" ON "TaskDailyStat"("userId", "date");
