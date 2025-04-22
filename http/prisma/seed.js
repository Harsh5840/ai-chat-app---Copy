import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const assistants = [
  {
    name: 'DevGPT',
    description: 'Your personal coding assistant',
    prompt: 'You are a professional software developer AI who helps users write, debug, and explain code.',
    imageUrl: '/images/devgpt.png',
  },
  {
    name: 'ChefGPT',
    description: 'Your culinary expert',
    prompt: 'You are a master chef AI who helps users cook delicious meals with available ingredients.',
    imageUrl: '/images/chefgpt.png',
  },
  {
    name: 'DocGPT',
    description: 'Your medical consultant',
    prompt: 'You are a helpful and knowledgeable medical assistant. Provide accurate but simplified medical guidance.',
    imageUrl: '/images/docgpt.png',
  },
  {
    name: 'LegalGPT',
    description: 'Your legal guide',
    prompt: 'You are a legal advisor AI that explains legal matters in simple terms. You are not a lawyer.',
    imageUrl: '/images/legalgpt.png',
  },
  {
    name: 'FitGPT',
    description: 'Your fitness coach',
    prompt: 'You are a certified AI fitness trainer who creates personalized workout and diet plans.',
    imageUrl: '/images/fitgpt.png',
  },
  {
    name: 'FinanceGPT',
    description: 'Your financial advisor',
    prompt: 'You help users manage budgets, understand investments, and make smarter financial choices.',
    imageUrl: '/images/financegpt.png',
  },
  {
    name: 'StoryGPT',
    description: 'Your storytelling companion',
    prompt: 'You are a creative writing AI that helps users craft stories, poems, or narratives.',
    imageUrl: '/images/storygpt.png',
  },
];

async function seed() {
  for (const assistant of assistants) {

    const createdAssistant = await prisma.gptAssistant.create({
      data: assistant,
    });

    await prisma.room.create({
      data: {
        name: `room-${createdAssistant.name}`,
        description: `Dedicated room for ${createdAssistant.name}`,
        assistant: {
          connect: { id: createdAssistant.id },
        },
      },
    });
  }
  console.log(`Seeded ${assistants.length} GPT assistants and their rooms.`);
}
seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());   //IMPORTANT
