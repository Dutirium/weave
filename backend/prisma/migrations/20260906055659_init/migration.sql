-- CreateEnum
CREATE TYPE "ArgumentRelation" AS ENUM ('REPLY', 'SUPPORT', 'CHALLENGE', 'COUNTER', 'QUESTION');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "Weave" (
    "id" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Weave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Messages" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "weave_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "clientMessage_id" TEXT,
    "target_message_id" TEXT,
    "relation" "ArgumentRelation",
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Session_user_id_idx" ON "Session"("user_id");

-- CreateIndex
CREATE INDEX "Weave_id_idx" ON "Weave"("id");

-- CreateIndex
CREATE INDEX "Messages_weave_id_sequence_idx" ON "Messages"("weave_id", "sequence");

-- CreateIndex
CREATE INDEX "Messages_target_message_id_idx" ON "Messages"("target_message_id");

-- CreateIndex
CREATE INDEX "Messages_weave_id_idx" ON "Messages"("weave_id");

-- CreateIndex
CREATE UNIQUE INDEX "weave_id_clientMessage_id" ON "Messages"("weave_id", "clientMessage_id");

-- CreateIndex
CREATE UNIQUE INDEX "Messages_weave_id_sequence_key" ON "Messages"("weave_id", "sequence");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Weave" ADD CONSTRAINT "Weave_creator_fkey" FOREIGN KEY ("creator") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_weave_id_fkey" FOREIGN KEY ("weave_id") REFERENCES "Weave"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_target_message_id_fkey" FOREIGN KEY ("target_message_id") REFERENCES "Messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
