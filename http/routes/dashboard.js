import { PrismaClient } from "@prisma/client";
import  {authMiddleware}  from "../middleware/middleware.js";
const prisma = new PrismaClient();
import { Router } from "express";
const dashboardRouter = Router();

// GET /dashboard
    
  dashboardRouter.get('/', authMiddleware ,async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        assistant: true, // include GPT assistant details (primary)
        roomAssistants: {
          include: {
            assistant: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
    });
    
    // Format rooms to include all assistants
    const formattedRooms = rooms.map(room => ({
      ...room,
      assistants: room.roomAssistants.length > 0 
        ? room.roomAssistants.map(ra => ra.assistant)
        : [room.assistant]
    }));
    
    res.json(formattedRooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load rooms' });
  }
});

export { dashboardRouter };
