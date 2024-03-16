/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Badge` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Badge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Badge" ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Badge_code_key" ON "Badge"("code");

-- CreateIndex
CREATE INDEX "Badge_code_idx" ON "Badge"("code");
