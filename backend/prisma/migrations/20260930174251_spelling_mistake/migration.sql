/*
  Warnings:

  - You are about to drop the column `creadibility` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "creadibility",
ADD COLUMN     "credibility" INTEGER NOT NULL DEFAULT 0;
