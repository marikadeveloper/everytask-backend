-- DropIndex
DROP INDEX "User_id_email_key";

-- CreateIndex
CREATE INDEX "Task_userId_idx" ON "Task"("userId");
