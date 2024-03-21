-- AlterTable
ALTER TABLE "Streak" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "TaskCounter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedBeforeNoonToday" INTEGER NOT NULL DEFAULT 0,
    "completedAfterTenPmToday" INTEGER NOT NULL DEFAULT 0,
    "completedToday" INTEGER NOT NULL DEFAULT 0,
    "completedThisWeek" INTEGER NOT NULL DEFAULT 0,
    "completedOnWeekend" INTEGER NOT NULL DEFAULT 0,
    "completedTiny" INTEGER NOT NULL DEFAULT 0,
    "categorized" INTEGER NOT NULL DEFAULT 0,
    "completedOnHoliday" INTEGER NOT NULL DEFAULT 0,
    "completed" INTEGER NOT NULL DEFAULT 0,
    "overdue" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TaskCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskDailyStat" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed" INTEGER NOT NULL DEFAULT 0,
    "overdue" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TaskDailyStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskCounter_userId_key" ON "TaskCounter"("userId");

-- CreateIndex
CREATE INDEX "TaskDailyStat_userId_idx" ON "TaskDailyStat"("userId");

-- CreateIndex
CREATE INDEX "TaskDailyStat_date_idx" ON "TaskDailyStat"("date");

-- AddForeignKey
ALTER TABLE "TaskCounter" ADD CONSTRAINT "TaskCounter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDailyStat" ADD CONSTRAINT "TaskDailyStat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
