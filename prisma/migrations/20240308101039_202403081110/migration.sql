/*
  Warnings:

  - Added the required column `relativeOrder` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "relativeOrder" INTEGER NOT NULL;
