import express from 'express';
import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

const chatRouter = express.Router();
const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /chat
chatRouter.post('/', async (req, res) => {
  const { userId, roomName, content } = req.body;

  try {
    // Find the room
    const room = await prisma.room.findUnique({
      where: { name: roomName },
      include: {
        assistant: true,
        chats: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!room || !room.assistant) {
      return res.status(404).json({ error: 'Room or assistant not found' });
    }

    // Save user's message
    const userMessage = await prisma.chat.create({
      data: {
        content,
        sender: 'USER',
        user: { connect: { id: Number(userId) } },
        room: { connect: { id: Number(room.id) } }
      },
    });

    // Structure messages for GPT-3.5
    const messages = [
      { role: 'system', content: room.assistant.prompt },
      ...room.chats.map((chat) => ({
        role: chat.sender === 'GPT' ? 'assistant' : 'user',
        content: chat.content,
      })),
      { role: 'user', content },
    ];

    // Call OpenAI
    const gptResponse = await openai.chat.completions.create({
      messages,
      model: 'gpt-3.5-turbo',
    });

    const reply = gptResponse.choices[0].message.content;

    // Save GPT response
    const aiMessage = await prisma.chat.create({
      data: {
        content: reply,
        sender: 'GPT',
        room: { connect: { id: room.id } },
      },
    });

    res.json({ userMessage, aiMessage });
  } catch (err) {
    console.error('Error processing chat:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export { chatRouter };
