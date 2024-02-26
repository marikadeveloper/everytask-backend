/*
  Warnings:

  - You are about to drop the column `impactId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the `TaskImpact` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `impact` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_impactId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "impactId",
ADD COLUMN     "impact" "TASK_IMPACT" NOT NULL;

-- DropTable
DROP TABLE "TaskImpact";
