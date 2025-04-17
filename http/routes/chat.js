import express from 'express';
import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

const chatRouter = express.Router();
const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /chat
chatRouter.post('/', async (req, res) => {
  const { userId, roomId, content } = req.body;

  try {
    // Save the user's message to the database (wrapped in a transaction)
    const userMessage = await prisma.chat.create({
      data: {
        content,
        user: { connect: { id: userId } },
        room: { connect: { id: roomId } },
      },
    });

    // Fetch the room and its assistant's prompt
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { assistant: true, chats: { orderBy: { id: 'asc' } } },
    });

    // Combine the room's assistant prompt with previous messages to create the full prompt
    const fullPrompt = `${room.assistant.prompt}\n\n${room.chats.map((chat) => `${chat.user.name || 'User'}: ${chat.content}`).join('\n')}\nAI:`;

    // Get the GPT response
    const gptResponse = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: room.assistant.prompt },
        { role: 'user', content: fullPrompt },
      ],
      model: 'gpt-3.5-turbo',
    });

    // Extract the AI's reply
    const reply = gptResponse.choices[0].message.content;

    // Save the AI's reply in the database
    const aiMessage = await prisma.chat.create({
      data: {
        content: reply,
        user: { connect: { id: 1 } }, // Assuming AI user has ID 1
        room: { connect: { id: roomId } },
      },
    });

    // Send both the user message and AI reply in the response
    res.json({ userMessage, aiMessage });
  } catch (err) {
    console.error('Error processing chat:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export { chatRouter };
