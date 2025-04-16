// routes/dashboard.ts
import express from 'express';
const { PrismaClient } = require('@prisma/client');

const dashboardRouter = express.Router();
const prisma = new PrismaClient();

dashboardRouter.get('/', async (req, res) => {
  try {
    const assistants = await prisma.gptAssistant.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        prompt: true
      },
      orderBy: { name: 'asc' },
    });

    res.json(assistants);
  } catch (error) {
    console.error('Error fetching assistants:', error);
    res.status(500).json({ error: 'Failed to load GPT assistants' });
  }
});

export default router;
