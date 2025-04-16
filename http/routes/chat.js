import express from 'express';
import { PrismaClient } from '@prisma/client';
import { generateResponse } from '../utils/openai.js'; // your wrapper function
import authMiddleware from '../middleware/middleware.js';

const chatRouter = express.Router();
const prisma = new PrismaClient();

chatRouter.get('/:roomId', authMiddleware, async (req, res) => {
  const roomId = parseInt(req.params.roomId);

  try {
    const chats = await prisma.chat.findMany({
      where: { roomId },
      orderBy: { id: 'asc' },
      include: { user: true },
    });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load chat history' });
  }
});

chatRouter.post('/:roomId', authMiddleware, async (req, res) => {
  const roomId = parseInt(req.params.roomId);
  const userId = req.user.id;
  const { content } = req.body;

  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { assistant: true },
    });

    if (!room) return res.status(404).json({ error: 'Room not found' });

    // Save user message
    await prisma.chat.create({
      data: {
        content,
        userId,
        roomId,
      },
    });

    // Generate GPT response
    const aiResponse = await generateResponse(room.assistant.prompt, content);

    // Save AI response
    await prisma.chat.create({
      data: {
        content: aiResponse,
        roomId,
        userId: null, // no user = AI
      },
    });

    res.json({ reply: aiResponse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong during chat' });
  }
});

export default chatRouter;
