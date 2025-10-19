import express from 'express';
import { PrismaClient } from '@prisma/client';
import  {authMiddleware}  from '../middleware/middleware.js';

const roomRouter = express.Router();
const prisma = new PrismaClient();

// GET /room/:name - e.g. room-DevGPT

roomRouter.get('/:name', authMiddleware, async (req, res) => {
  try {
    const { name } = req.params;

    // Input validation
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Invalid room name' });
    }

    const room = await prisma.room.findFirst({
      where: { name },
      include: {
        assistant: true,
        chats: {
          include: { 
            user: {
              select: {
                id: true,
                username: true
              }
            }
          },
          orderBy: { createdAt: 'asc' },
          take: 100, // Limit initial chat load
        },
      },
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Format response
    const formattedRoom = {
      id: room.id,
      name: room.name,
      description: room.description,
      assistant: {
        id: room.assistant.id,
        name: room.assistant.name,
        description: room.assistant.description,
        imageUrl: room.assistant.imageUrl
      },
      chats: room.chats.map(chat => ({
        id: chat.id,
        content: chat.content,
        sender: chat.sender,
        createdAt: chat.createdAt,
        user: chat.user
      }))
    };

    res.json(formattedRoom);
  } catch (err) {
    console.error('Room fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch room data' });
  }
});

// POST /room/:name/chat
roomRouter.post('/:name/chat',authMiddleware, async (req, res) => {
  const { message, userId } = req.body;

  const room = await prisma.room.findFirst({ where: { name: req.params.name } });
  if (!room) return res.status(404).json({ error: 'Room not found' });

  const newChat = await prisma.chat.create({
    data: {
      message,
      userId,
      roomId: room.id,
    },
  });

  res.json(newChat);
});

// POST /room/create - Create a new custom room
roomRouter.post('/create', authMiddleware, async (req, res) => {
  try {
    const { name, botType } = req.body;

    // Input validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Valid room name is required' });
    }

    if (!botType || typeof botType !== 'string') {
      return res.status(400).json({ error: 'Bot type is required' });
    }

    // Check if room already exists
    const existingRoom = await prisma.room.findFirst({
      where: { name: `room-${name.trim()}` }
    });

    if (existingRoom) {
      return res.status(409).json({ error: 'Room with this name already exists' });
    }

    // Find the assistant by bot type
    const assistant = await prisma.gptAssistant.findFirst({
      where: { name: botType }
    });

    if (!assistant) {
      return res.status(404).json({ error: 'Bot type not found' });
    }

    // Create the room
    const newRoom = await prisma.room.create({
      data: {
        name: `room-${name.trim()}`,
        description: `Custom ${assistant.name} room`,
        assistantId: assistant.id
      },
      include: {
        assistant: true
      }
    });

    res.status(201).json({
      id: newRoom.id,
      name: newRoom.name,
      description: newRoom.description,
      assistant: {
        id: newRoom.assistant.id,
        name: newRoom.assistant.name,
        description: newRoom.assistant.description
      }
    });
  } catch (err) {
    console.error('Room creation error:', err);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

export { roomRouter };
