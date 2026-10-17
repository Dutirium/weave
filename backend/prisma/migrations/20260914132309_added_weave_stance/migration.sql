-- CreateEnum
CREATE TYPE "Stance" AS ENUM ('SUPPORT', 'CHALLENGE', 'NEUTRAL');

-- DropIndex
DROP INDEX "Weave_id_idx";

-- CreateTable
CREATE TABLE "WeaveStance" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "weave_id" TEXT NOT NULL,
    "stance" "Stance" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeaveStance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeaveStance_user_id_idx" ON "WeaveStance"("user_id");

-- CreateIndex
CREATE INDEX "WeaveStance_weave_id_stance_idx" ON "WeaveStance"("weave_id", "stance");

-- CreateIndex
CREATE UNIQUE INDEX "WeaveStance_user_id_weave_id_key" ON "WeaveStance"("user_id", "weave_id");

-- AddForeignKey
ALTER TABLE "WeaveStance" ADD CONSTRAINT "WeaveStance_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeaveStance" ADD CONSTRAINT "WeaveStance_weave_id_fkey" FOREIGN KEY ("weave_id") REFERENCES "Weave"("id") ON DELETE CASCADE ON UPDATE CASCADE;
