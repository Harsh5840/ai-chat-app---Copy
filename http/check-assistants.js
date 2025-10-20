import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAssistants() {
  const assistants = await prisma.gptAssistant.findMany();
  console.log('Found assistants:', JSON.stringify(assistants, null, 2));
  await prisma.$disconnect();
}

checkAssistants().catch(console.error);
