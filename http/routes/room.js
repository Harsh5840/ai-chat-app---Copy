import express from 'express';
import { PrismaClient } from '@prisma/client';

const roomRouter = express.Router();
const prisma = new PrismaClient();

// GET /room/:name - e.g. room-DevGPT
roomRouter.get('/:name', async (req, res) => {
  try {
    const { name } = req.params;

    const room = await prisma.room.findFirst({
      where: { name },
      include: {
        assistant: true,
        chats: {
          include: { user: true },
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(room);
  } catch (err) {
    console.error('Room fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default roomRouter;
