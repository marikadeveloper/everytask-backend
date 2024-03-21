/*
  Warnings:

  - The primary key for the `Badge` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Badge` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserBadge" DROP CONSTRAINT "UserBadge_badgeId_fkey";

-- DropIndex
DROP INDEX "Badge_code_key";

-- AlterTable
ALTER TABLE "Badge" DROP CONSTRAINT "Badge_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Badge_pkey" PRIMARY KEY ("code");

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
