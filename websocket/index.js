import { WebSocketServer } from 'ws';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const wss = new WebSocketServer({ port: 6000 });

const rooms = {}; // Store WebSocket connections by room name

wss.on('connection', (socket) => {
  let currentRoom = null;

  socket.on('message', async (data) => {
    const msg = JSON.parse(data);

    if (msg.type === 'join') {
      const { roomName } = msg;
      currentRoom = roomName;

      if (!rooms[currentRoom]) {
        rooms[currentRoom] = [];
      }
      rooms[currentRoom].push(socket);
      console.log(`User joined ${currentRoom}`);
    }

    if (msg.type === 'chat') {
      const { content, roomName, userId } = msg;

      // Send the message to the HTTP server to handle OpenAI and database logic
      try {
        const response = await axios.post('http://localhost:5000/chat', {
          userId,
          roomName,
          content,
        });

        // Broadcast the user's message and GPT response to all users in the room
        const payload = JSON.stringify({
          type: 'chat',
          userMessage: content,
          aiMessage: response.data.aiMessage,
          sender: userId,
        });

        rooms[roomName]?.forEach((client) => {
          if (client.readyState === 1) {
            client.send(payload);
          }
        });
      } catch (err) {
        console.error('Error processing message:', err);
      }
    }
  });

  socket.on('close', () => {
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom] = rooms[currentRoom].filter((s) => s !== socket);
    }
  });
});
