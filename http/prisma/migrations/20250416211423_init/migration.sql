/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `GptAssistant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GptAssistant_name_key" ON "GptAssistant"("name");
