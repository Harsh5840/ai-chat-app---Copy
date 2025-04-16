import express from 'express';
import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

const chatRouter = express.Router();
const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /chat
chatRouter.post('/',authMiddleware, async (req, res) => {
  const { userId, roomId, content } = req.body;

  try {
    // Save user's message
    const userMessage = await prisma.chat.create({
      data: {
        content,
        user: { connect: { id: userId } },
        room: { connect: { id: roomId } },
      },
    });

    // Fetch GPT prompt
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { assistant: true, chats: { orderBy: { id: 'asc' } } },
    });

    const fullPrompt = `${room.assistant.prompt}\n\n${room.chats.map(c => `${c.user.name || 'User'}: ${c.content}`).join('\n')}\nAI:`;

    const gptResponse = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: room.assistant.prompt }, 
        { role: 'user', content: fullPrompt }
      ],
      model: 'gpt-3.5-turbo',
    });

    const reply = gptResponse.choices[0].message.content;

    // Save GPT reply
    const aiMessage = await prisma.chat.create({
      data: {
        content: reply,
        user: { connect: { id: userId } }, // or use a dummy AI user
        room: { connect: { id: roomId } },
      },
    });

    res.json({ userMessage, aiMessage });
  } catch (err) {
    console.error('Chat send error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default chatRouter;
