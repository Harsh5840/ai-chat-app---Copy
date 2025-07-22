import { WebSocketServer } from 'ws';
import axios from 'axios';
const PORT = process.env.PORT || 7070;  
const wss = new WebSocketServer({ port: PORT }, () => {
  console.log(`WebSocket server is running on port ${PORT}`);
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
      if (!rooms[currentRoom].includes(socket)) {
        rooms[currentRoom].push(socket);
      }
      console.log(`User joined room: ${currentRoom}`);
      console.log('Room members:', rooms[currentRoom].length);
      console.log('Room sockets:', rooms[currentRoom].map(s => s._socket && s._socket.remoteAddress));
    }

    if (msg.type === 'chat') {
      const { content, roomName, userId } = msg;
      let username = 'Unknown';
      try {
        const user = await axios.get(`http://localhost:3000/api/v1/user/${userId}`);
        username = user.data.username || 'Unknown';
      } catch (e) {
        console.error('Could not fetch username for chat message', e);
      }
      
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'typing',
            roomName,
          }))
        }
      })
      
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
          username,
        });

        // Broadcast to all in room
        if (rooms[roomName]) {
          console.log(`Broadcasting to ${rooms[roomName].length} clients in room ${roomName}`);
        }
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
