import { WebSocketServer } from 'ws';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 7070;
const HTTP_SERVICE_URL = process.env.HTTP_SERVICE_URL || 'http://localhost:3001';
const REQUEST_TIMEOUT = 30000; // 30 seconds

const wss = new WebSocketServer({ port: PORT }, () => {
  console.log(`WebSocket server is running on port ${PORT}`);
  console.log(`HTTP service URL: ${HTTP_SERVICE_URL}`);
});

const rooms = {}; // Store WebSocket clients per room

// Helper function to safely send message to client
const safeSend = (client, message) => {
  if (client.readyState === 1) { // WebSocket.OPEN
    try {
      client.send(typeof message === 'string' ? message : JSON.stringify(message));
    } catch (error) {
      console.error('Error sending message to client:', error.message);
    }
  }
};

// Helper function to broadcast to room
const broadcastToRoom = (roomName, message) => {
  if (!rooms[roomName]) return;
  
  const activeClients = rooms[roomName].filter(client => client.readyState === 1);
  rooms[roomName] = activeClients; // Clean up closed connections
  
  activeClients.forEach(client => safeSend(client, message));
  console.log(`Broadcasted to ${activeClients.length} clients in room ${roomName}`);
};

wss.on('connection', (socket) => {
  let currentRoom = null;
  console.log('WebSocket connection established');

  socket.on('message', async (data) => {
    try {
      const msg = JSON.parse(data);
      console.log('Received message:', { type: msg.type, roomName: msg.roomName });

      if (msg.type === 'join') {
        // Leave previous room if any
        if (currentRoom && rooms[currentRoom]) {
          rooms[currentRoom] = rooms[currentRoom].filter(s => s !== socket);
        }

        currentRoom = msg.roomName;
        const { userId } = msg;
        
        if (!rooms[currentRoom]) rooms[currentRoom] = [];
        if (!rooms[currentRoom].includes(socket)) {
          rooms[currentRoom].push(socket);
        }
        
        console.log(`User joined room: ${currentRoom} (${rooms[currentRoom].length} members)`);
        
        // Get username for join notification
        let username = 'A user';
        if (userId) {
          try {
            const userResponse = await axios.get(
              `${HTTP_SERVICE_URL}/api/v1/user/${userId}`,
              { timeout: 5000 }
            );
            username = userResponse.data.username || 'A user';
          } catch (e) {
            console.error('Could not fetch username for join notification:', e.message);
          }
        }
        
        // Broadcast join notification to all users in room
        broadcastToRoom(currentRoom, {
          type: 'user-joined',
          username,
          userId,
          memberCount: rooms[currentRoom].length
        });
        
        // Send join confirmation to the user who joined
        safeSend(socket, {
          type: 'joined',
          roomName: currentRoom,
          memberCount: rooms[currentRoom].length
        });
      }

      if (msg.type === 'typing') {
        const { roomName, userId, isTyping } = msg;
        
        if (!roomName || !userId) return;
        
        let username = 'Unknown';
        try {
          const userResponse = await axios.get(
            `${HTTP_SERVICE_URL}/api/v1/user/${userId}`,
            { timeout: 5000 }
          );
          username = userResponse.data.username || 'Unknown';
        } catch (e) {
          console.error('Could not fetch username:', e.message);
        }
        
        // Broadcast typing indicator to room (excluding sender)
        if (rooms[roomName]) {
          rooms[roomName].forEach(client => {
            if (client !== socket && client.readyState === 1) {
              safeSend(client, {
                type: 'typing',
                username,
                userId,
                isTyping
              });
            }
          });
        }
      }

      if (msg.type === 'chat') {
        const { content, roomName, userId } = msg;
        
        // Validate input
        if (!content || !roomName || !userId) {
          safeSend(socket, {
            type: 'error',
            message: 'Missing required fields'
          });
          return;
        }

        let username = 'Unknown';
        try {
          const userResponse = await axios.get(
            `${HTTP_SERVICE_URL}/api/v1/user/${userId}`,
            { timeout: 5000 }
          );
          username = userResponse.data.username || 'Unknown';
        } catch (e) {
          console.error('Could not fetch username:', e.message);
        }
        
        try {
          const response = await axios.post(
            `${HTTP_SERVICE_URL}/api/v1/chat`,
            { userId, roomName, content },
            { timeout: REQUEST_TIMEOUT }
          );

          const payload = {
            type: 'chat',
            userMessage: {
              content,
              sender: 'user',
              username,
              userId,
              createdAt: new Date().toISOString()
            },
            aiMessage: {
              content: response.data.aiMessage.content,
              sender: 'ai',
              createdAt: response.data.aiMessage.createdAt
            }
          };

          // Broadcast to room
          broadcastToRoom(roomName, payload);
          
        } catch (err) {
          console.error('Error processing chat message:', err.message);
          console.error('Error details:', err.response?.data || err);
          
          let errorMessage = 'Failed to process message';
          if (err.code === 'ECONNABORTED') {
            errorMessage = 'Request timeout. Please try again.';
          } else if (err.response?.status === 429) {
            errorMessage = 'Rate limit exceeded. Please try again later.';
          } else if (err.response?.status >= 500) {
            errorMessage = 'Server error. Please try again.';
          } else if (err.response?.data?.error) {
            errorMessage = err.response.data.error;
          }
          
          safeSend(socket, {
            type: 'error',
            message: errorMessage
          });
        }
      }
    } catch (parseError) {
      console.error('Error parsing message:', parseError.message);
      safeSend(socket, {
        type: 'error',
        message: 'Invalid message format'
      });
    }
  });

  socket.on('close', () => {
    console.log('WebSocket connection closed');
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom] = rooms[currentRoom].filter((s) => s !== socket);
      console.log(`User left room: ${currentRoom} (${rooms[currentRoom].length} members remaining)`);
    }
  });

  socket.on('error', (error) => {
    console.error('WebSocket error:', error.message);
  });
});
