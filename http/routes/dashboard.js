import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/middleware";
const prisma = new PrismaClient();

// GET /dashboard
    
    router.get('/', authMiddleware ,async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        assistant: true, // include GPT assistant details
      },
    });
    res.json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load rooms' });
  }
});
