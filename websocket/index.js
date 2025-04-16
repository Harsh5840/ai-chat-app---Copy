import { WebSocketServer } from 'ws';
import { PrismaClient } from  "../http/node_modules/@prisma/client/default.js"; 

const prisma = new PrismaClient();
const wss = new WebSocketServer({ port: 6000 });

const rooms = {}; // { roomName: [socket, ...] }

wss.on('connection', (socket) => {
  let currentRoom = null;
    console.log("server working");
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

      // Save message to DB
      await prisma.chat.create({
        data: {
          content,
          room: {
            connect: { name: roomName },
          },
          user: {
            connect: { id: userId },
          },
        },
      });

      // Broadcast to room
      const payload = JSON.stringify({
        type: 'chat',
        content,
        sender: userId,
      });

      rooms[roomName]?.forEach((client) => { //here we are sending the message to all the clients in the room
        if (client.readyState === 1) {
          client.send(payload);
        }
      });
    }
  });

  socket.on('close', () => {
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom] = rooms[currentRoom].filter((s) => s !== socket);
    }
  });
});
