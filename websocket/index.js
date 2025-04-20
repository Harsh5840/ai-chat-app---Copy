import { WebSocketServer } from 'ws';
import axios from 'axios';

const wss = new WebSocketServer({ port: 7070 }, () => {
  console.log('WebSocket server is running on port 7070');
});

const rooms = {}; // Store WebSocket clients per room

wss.on('connection', (socket) => {
  let currentRoom = null;
  console.log('WebSocket connection established');

  socket.on('message', async (data) => {
    const msg = JSON.parse(data);
    console.log('Received message:', msg);

    if (msg.type === 'join') {
      currentRoom = msg.roomName;

      if (!rooms[currentRoom]) rooms[currentRoom] = [];
      rooms[currentRoom].push(socket);
      console.log(`User joined room: ${currentRoom}`);
    }

    if (msg.type === 'chat') {
      const { content, roomName, userId } = msg;

      try {
        const response = await axios.post('http://localhost:3000/api/v1/chat', {
          userId,
          roomName,
          content,
        });

        const payload = JSON.stringify({
          type: 'chat',
          userMessage: content,
          aiMessage: response.data.aiMessage,
          sender: userId,
        });

        // Broadcast to all in room
        rooms[roomName]?.forEach((client) => {
          if (client.readyState === 1) {
            client.send(payload);
          }
        });
      } catch (err) {
        console.error('Error processing message:', err.message);
      }
    }
  });

  socket.on('close', () => {
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom] = rooms[currentRoom].filter((s) => s !== socket);
    }
  });
});
