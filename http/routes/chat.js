import express from 'express'
import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const chatRouter = express.Router()
const prisma = new PrismaClient()

// GET /chat/history/:roomName - fetch previous messages
chatRouter.get('/history/:roomName', async (req, res) => {
  const { roomName } = req.params

  try {
    const room = await prisma.room.findUnique({
      where: { name: roomName },
      include: {
        chats: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!room) {
      return res.status(404).json({ error: 'Room not found' })
    }

    const history = room.chats.map(chat => ({
      sender: chat.sender === 'GPT' ? 'ai' : 'user',
      content: chat.content,
    }))

    res.json({ history })
  } catch (err) {
    console.error('Error fetching history:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /chat - main Groq interaction + saving messages
// POST /chat - adding restriction based on description
chatRouter.post('/', async (req, res) => {
  const { userId, roomName, content } = req.body;

  try {
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

    const userMessage = await prisma.chat.create({
      data: {
        content,
        sender: 'USER',
        user: { connect: { id: Number(userId) } },
        room: { connect: { id: room.id } },
      },
    });


    const systemPrompt = `You are a helpful assistant with the following description: "${room.assistant.description}". You are only allowed to answer questions based on your description. If a question is outside of your knowledge domain, respond with "Sorry, I can only answer questions related to [your description]".`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...room.chats.map(chat => ({
        role: chat.sender === 'GPT' ? 'assistant' : 'user',
        content: chat.content,
      })),
      { role: 'user', content },
    ];

    const gptResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-70b-8192',
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const reply = gptResponse.data.choices[0].message.content;

   

    const aiMessage = await prisma.chat.create({
      data: {
        content: reply,
        sender: 'GPT',
        room: { connect: { id: room.id } },
      },
    });

    res.json({ userMessage, aiMessage });
  } catch (err) {
    console.error('Error processing chat:', err?.response?.data || err.message);
    res.status(500).json({ error: 'Server error' });
  }
});


export { chatRouter }
