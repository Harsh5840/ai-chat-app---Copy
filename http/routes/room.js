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
        roomAssistants: {
          include: {
            assistant: true
          },
          orderBy: {
            order: 'asc'
          }
        },
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
      assistants: room.roomAssistants.length > 0 
        ? room.roomAssistants.map(ra => ({
            id: ra.assistant.id,
            name: ra.assistant.name,
            description: ra.assistant.description,
            imageUrl: ra.assistant.imageUrl
          }))
        : [{
            id: room.assistant.id,
            name: room.assistant.name,
            description: room.assistant.description,
            imageUrl: room.assistant.imageUrl
          }],
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
    const { name, botTypes } = req.body;

    // Input validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Valid room name is required' });
    }

    // Support both single botType and multiple botTypes
    const assistantNames = Array.isArray(botTypes) ? botTypes : (req.body.botType ? [req.body.botType] : []);
    
    if (assistantNames.length === 0) {
      return res.status(400).json({ error: 'At least one bot type is required' });
    }

    // Check if room already exists
    const existingRoom = await prisma.room.findFirst({
      where: { name: `room-${name.trim()}` }
    });

    if (existingRoom) {
      return res.status(409).json({ error: 'Room with this name already exists' });
    }

    // Find all assistants by bot types
    const assistants = await prisma.gptAssistant.findMany({
      where: { 
        name: { in: assistantNames }
      }
    });

    if (assistants.length === 0) {
      return res.status(404).json({ error: 'No valid bot types found' });
    }

    if (assistants.length !== assistantNames.length) {
      const foundNames = assistants.map(a => a.name);
      const missingNames = assistantNames.filter(n => !foundNames.includes(n));
      return res.status(404).json({ error: `Bot types not found: ${missingNames.join(', ')}` });
    }

    // Create the room with multiple assistants
    const assistantDescriptions = assistants.map(a => a.name).join(', ');
    const newRoom = await prisma.room.create({
      data: {
        name: `room-${name.trim()}`,
        description: assistants.length > 1 
          ? `Multi-AI collaboration room with ${assistantDescriptions}`
          : `Custom ${assistants[0].name} room`,
        assistantId: assistants[0].id, // Set primary assistant for backward compatibility
        roomAssistants: {
          create: assistants.map((assistant, index) => ({
            assistantId: assistant.id,
            order: index
          }))
        }
      },
      include: {
        assistant: true,
        roomAssistants: {
          include: {
            assistant: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    res.status(201).json({
      id: newRoom.id,
      name: newRoom.name,
      description: newRoom.description,
      assistants: newRoom.roomAssistants.map(ra => ({
        id: ra.assistant.id,
        name: ra.assistant.name,
        description: ra.assistant.description,
        icon: ra.assistant.imageUrl
      })),
      // Legacy field for backward compatibility
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


// DELETE /room/:id - Only allow deleting rooms created by the user (not seeded rooms)
roomRouter.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const roomId = Number(req.params.id);
    const userId = req.user?.id;
    if (!roomId || !userId) {
      return res.status(400).json({ error: 'Invalid room or user' });
    }

    // Find the room
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    // Prevent deleting seeded rooms (no userId)
    if (!room.userId || room.userId !== userId) {
      return res.status(403).json({ error: 'Cannot delete seeded or other users\' rooms' });
    }

    // Delete the room (cascade deletes RoomAssistants, RoomMembers, Chats)
    await prisma.room.delete({ where: { id: roomId } });
    res.json({ success: true });
  } catch (err) {
    console.error('Room delete error:', err);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

export { roomRouter };
