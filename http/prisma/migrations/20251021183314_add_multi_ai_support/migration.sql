-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_assistantId_fkey";

-- AlterTable
ALTER TABLE "Room" ALTER COLUMN "assistantId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "RoomAssistant" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "assistantId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RoomAssistant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoomAssistant_roomId_assistantId_key" ON "RoomAssistant"("roomId", "assistantId");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "GptAssistant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomAssistant" ADD CONSTRAINT "RoomAssistant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomAssistant" ADD CONSTRAINT "RoomAssistant_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "GptAssistant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
