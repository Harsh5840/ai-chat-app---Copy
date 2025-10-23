import express from 'express'
import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const chatRouter = express.Router()
const prisma = new PrismaClient()

// GET /chat/history/:roomName - fetch previous messages
chatRouter.get('/history/:roomName', async (req, res) => {
  const { roomName } = req.params;
  const { limit = 100, offset = 0 } = req.query;

  // Input validation
  if (!roomName || typeof roomName !== 'string') {
    return res.status(400).json({ error: 'Invalid room name' });
  }

  const limitNum = Math.min(parseInt(limit) || 100, 500); // Max 500 messages
  const offsetNum = Math.max(parseInt(offset) || 0, 0);

  try {
    const room = await prisma.room.findUnique({
      where: { name: roomName },
      include: {
        chats: {
          orderBy: { createdAt: 'asc' },
          skip: offsetNum,
          take: limitNum,
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        },
      },
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const history = room.chats.map(chat => ({
      id: chat.id,
      sender: chat.sender === 'GPT' ? 'ai' : 'user',
      content: chat.content,
      createdAt: chat.createdAt,
      user: chat.user ? {
        id: chat.user.id,
        username: chat.user.username
      } : null
    }));

    res.json({ 
      history,
      pagination: {
        limit: limitNum,
        offset: offsetNum,
        total: room.chats.length
      }
    });
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// POST /chat - main Groq interaction + saving messages
// POST /chat - adding restriction based on description
chatRouter.post('/', async (req, res) => {
  const { userId, roomName, content } = req.body;

  // Input validation
  if (!userId || !roomName || !content) {
    return res.status(400).json({ error: 'Missing required fields: userId, roomName, content' });
  }

  if (typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({ error: 'Content must be a non-empty string' });
  }

  if (content.length > 4000) {
    return res.status(400).json({ error: 'Content too long. Maximum 4000 characters allowed.' });
  }

  try {
    const room = await prisma.room.findUnique({
      where: { name: roomName },
      include: {
        assistant: true,
        roomAssistants: {
          include: {
            assistant: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        chats: {
          orderBy: { createdAt: 'asc' },
          take: 50, // Limit chat history to prevent token overflow
        },
      },
    });

    if (!room || !room.assistant) {
      return res.status(404).json({ error: 'Room or assistant not found' });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userMessage = await prisma.chat.create({
      data: {
        content: content.trim(),
        sender: 'USER',
        user: { connect: { id: Number(userId) } },
        room: { connect: { id: room.id } },
      },
    });

    // Determine which AI should respond
    // For multi-AI rooms, rotate or use all assistants
    const assistants = room.roomAssistants.length > 0 
      ? room.roomAssistants.map(ra => ra.assistant)
      : [room.assistant];

    // Check if user @mentioned a specific AI
    const mentionMatch = content.match(/@(\w+GPT)/i);
    let selectedAssistant = assistants[0]; // Default to first AI
    
    if (mentionMatch) {
      const mentionedName = mentionMatch[1];
      const mentioned = assistants.find(a => a.name.toLowerCase() === mentionedName.toLowerCase());
      if (mentioned) {
        selectedAssistant = mentioned;
      }
    } else if (assistants.length > 1) {
      // For multi-AI rooms without mention, rotate based on chat count
      const aiChatCount = room.chats.filter(c => c.sender === 'GPT').length;
      selectedAssistant = assistants[aiChatCount % assistants.length];
    }

    // Build system prompt for multi-AI collaboration
    let systemPrompt;
    if (assistants.length > 1) {
      const aiList = assistants.map(a => `${a.name} (${a.description})`).join(', ');
      systemPrompt = `You are ${selectedAssistant.name}, part of a collaborative AI team including: ${aiList}. 
Your expertise: "${selectedAssistant.description}". 
Provide insights from your domain. If the question is outside your expertise, acknowledge it and suggest which other AI in the team might help better.
You can reference other AIs using @AIName format.`;
    } else {
      systemPrompt = `You are a helpful assistant with the following description: "${selectedAssistant.description}". You are only allowed to answer questions based on your description. If a question is outside of your knowledge domain, respond with "Sorry, I can only answer questions related to ${selectedAssistant.description}".`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...room.chats.map(chat => ({
        role: chat.sender === 'GPT' ? 'assistant' : 'user',
        content: chat.content,
      })),
      { role: 'user', content: content.trim() },
    ];

    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }

    const gptResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    if (!gptResponse.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from AI service');
    }

    const reply = gptResponse.data.choices[0].message.content;

    const aiMessage = await prisma.chat.create({
      data: {
        content: reply,
        sender: 'GPT',
        room: { connect: { id: room.id } },
      },
    });

    res.json({ 
      userMessage: {
        id: userMessage.id,
        content: userMessage.content,
        sender: userMessage.sender,
        createdAt: userMessage.createdAt
      },
      aiMessage: {
        id: aiMessage.id,
        content: aiMessage.content,
        sender: aiMessage.sender,
        createdAt: aiMessage.createdAt,
        aiName: selectedAssistant.name, // Include which AI responded
        aiIcon: selectedAssistant.imageUrl
      }
    });
  } catch (err) {
    console.error('Error processing chat:', err?.response?.data || err.message);
    
    // Handle specific error types
    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      return res.status(408).json({ error: 'Request timeout. Please try again.' });
    }
    
    if (err.response?.status === 401) {
      return res.status(500).json({ error: 'AI service authentication failed' });
    }
    
    if (err.response?.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }

    if (err.message.includes('GROQ_API_KEY')) {
      return res.status(500).json({ error: 'AI service configuration error' });
    }

    res.status(500).json({ error: 'Failed to process chat message. Please try again.' });
  }
});


export { chatRouter }
