import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from Vite build output (dist)
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback all routes to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Rooms dictionary to maintain room state:
// rooms[roomId] = {
//   name: string,
//   mode: 'chat' | 'talk' | 'video',
//   type: 'public' | 'private',
//   hostPermissionRequired: boolean,
//   hostSocketId: string,
//   coHosts: Set<string>, // set of co-host socketIds
//   users: { [socketId: string]: { username: string, avatar: { emoji: string, bg: string } } },
//   readyUsers: Set<string>,
//   pendingApprovals: { [socketId: string]: { username: string, avatar: { emoji: string, bg: string } } }
// }
const rooms = {};

// Helper: Compile list of active public rooms
const getPublicRooms = () => {
  return Object.entries(rooms)
    .filter(([_, room]) => room.type === 'public')
    .map(([id, room]) => ({
      roomId: id,
      name: room.name,
      mode: room.mode,
      hostPermissionRequired: room.hostPermissionRequired,
      participantCount: Object.keys(room.users).length
    }));
};

// Helper: Broadcast public rooms directory to all lobby clients
const broadcastPublicRooms = () => {
  io.to('lobby-room').emit('public-rooms-list', getPublicRooms());
};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  let currentRoomId = null;

  // Let clients register to receive lobby updates
  socket.on('join-lobby', () => {
    socket.join('lobby-room');
    socket.emit('public-rooms-list', getPublicRooms());
  });

  socket.on('leave-lobby', () => {
    socket.leave('lobby-room');
  });

  // Handle a user requesting to join (handling permissions and waiting rooms)
  socket.on('request-join', ({ roomId, username, avatar }) => {
    // If the room doesn't exist yet, it's a creation, so join is accepted immediately
    if (!rooms[roomId]) {
      socket.emit('join-request-status', { status: 'approved' });
      return;
    }

    const room = rooms[roomId];

    // If permission is required and requester is not already in the room
    if (room.type === 'public' && room.hostPermissionRequired && !room.users[socket.id]) {
      // Add to pending approvals list
      room.pendingApprovals[socket.id] = { username, avatar };
      
      // Notify Host and Co-hosts
      const requestData = { socketId: socket.id, username, avatar };
      io.to(room.hostSocketId).emit('join-request-pending', requestData);
      
      if (room.coHosts) {
        room.coHosts.forEach(coHostId => {
          io.to(coHostId).emit('join-request-pending', requestData);
        });
      }

      socket.emit('join-request-status', { status: 'pending' });
      console.log(`Join request pending for ${username} in room ${roomId}`);
    } else {
      // Open room or already member
      socket.emit('join-request-status', { status: 'approved' });
    }
  });

  // Handle host/co-host approving or rejecting a join request
  socket.on('approve-join', ({ roomId, guestSocketId, approved }) => {
    if (rooms[roomId]) {
      const room = rooms[roomId];
      const isHost = room.hostSocketId === socket.id;
      const isCoHost = room.coHosts && room.coHosts.has(socket.id);

      // Verify that the user approving is host or co-host
      if (isHost || isCoHost) {
        if (room.pendingApprovals && room.pendingApprovals[guestSocketId]) {
          delete room.pendingApprovals[guestSocketId];

          if (approved) {
            io.to(guestSocketId).emit('join-request-status', { status: 'approved' });
            console.log(`Join request APPROVED for guest ${guestSocketId} in room ${roomId}`);
          } else {
            io.to(guestSocketId).emit('join-request-status', { status: 'rejected' });
            console.log(`Join request REJECTED for guest ${guestSocketId} in room ${roomId}`);
          }
        }
      }
    }
  });

  // Cancel pending request (if guest exits waiting room)
  socket.on('cancel-join-request', ({ roomId }) => {
    if (rooms[roomId] && rooms[roomId].pendingApprovals[socket.id]) {
      const room = rooms[roomId];
      delete room.pendingApprovals[socket.id];
      
      // Notify host and co-hosts to close the prompt
      io.to(room.hostSocketId).emit('join-request-canceled', { socketId: socket.id });
      if (room.coHosts) {
        room.coHosts.forEach(coHostId => {
          io.to(coHostId).emit('join-request-canceled', { socketId: socket.id });
        });
      }
      console.log(`Join request canceled by guest ${socket.id} in room ${roomId}`);
    }
  });

  // Handle a user actually entering the room
  socket.on('join-room', ({ roomId, roomName, username, avatar, type, hostPermissionRequired }) => {
    currentRoomId = roomId;

    socket.join(roomId);

    // If the room doesn't exist yet, initialize it
    if (!rooms[roomId]) {
      rooms[roomId] = {
        name: roomName || 'General Room',
        mode: 'chat',
        type: type || 'private',
        hostPermissionRequired: !!hostPermissionRequired,
        hostSocketId: socket.id,
        coHosts: new Set(),
        users: {},
        readyUsers: new Set(),
        pendingApprovals: {}
      };
      console.log(`Room created: ${rooms[roomId].name} (${roomId}) - Type: ${type}`);
    }

    const room = rooms[roomId];

    // Add user profile data
    room.users[socket.id] = {
      username: username,
      avatar: avatar || { emoji: '🐼', bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
      isHost: room.hostSocketId === socket.id,
      isCoHost: room.coHosts.has(socket.id)
    };

    // Send room information back to the joining user
    socket.emit('room-info', {
      name: room.name,
      mode: room.mode,
      type: room.type,
      hostPermissionRequired: room.hostPermissionRequired,
      users: room.users,
      hostSocketId: room.hostSocketId
    });

    // Notify other users in the room about the new participant
    socket.to(roomId).emit('user-joined', {
      socketId: socket.id,
      username: username,
      avatar: room.users[socket.id].avatar
    });

    console.log(`${username} (${socket.id}) entered room ${roomId}`);
    
    // Broadcast updated public directory since member count changed
    broadcastPublicRooms();
  });

  // Relay WebRTC signaling data
  socket.on('signal', ({ targetId, signalData }) => {
    io.to(targetId).emit('signal', {
      senderId: socket.id,
      signalData: signalData
    });
  });

  // Client informs the server they have set up their media stream and are ready to call
  socket.on('ready-for-call', ({ roomId }) => {
    if (rooms[roomId]) {
      const room = rooms[roomId];
      if (!room.readyUsers) {
        room.readyUsers = new Set();
      }
      room.readyUsers.add(socket.id);

      const otherReadyUsers = Array.from(room.readyUsers).filter(id => id !== socket.id);
      socket.emit('ready-peers', otherReadyUsers);
    }
  });

  // Handle chat messages
  socket.on('send-message', ({ roomId, text }) => {
    if (rooms[roomId]) {
      const message = {
        id: `${socket.id}-${Date.now()}`,
        senderId: socket.id,
        senderName: rooms[roomId].users[socket.id]?.username || 'Unknown',
        senderAvatar: rooms[roomId].users[socket.id]?.avatar,
        text: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      io.to(roomId).emit('message', message);
    }
  });

  // Handle user reactions (voice/video calls)
  socket.on('send-reaction', ({ roomId, reaction }) => {
    if (rooms[roomId]) {
      io.to(roomId).emit('reaction-received', {
        senderId: socket.id,
        reaction: reaction
      });
    }
  });

  // Handle room communication mode changes
  socket.on('set-mode', ({ roomId, newMode }) => {
    if (rooms[roomId]) {
      rooms[roomId].mode = newMode;
      rooms[roomId].readyUsers = new Set();
      io.to(roomId).emit('mode-updated', newMode);
      console.log(`Room ${roomId} mode changed to: ${newMode}`);
    }
  });

  // Admin: Toggle a member's co-host tag (Host-only)
  socket.on('toggle-cohost', ({ roomId, targetId }) => {
    if (rooms[roomId]) {
      const room = rooms[roomId];
      if (room.hostSocketId === socket.id) {
        if (room.coHosts.has(targetId)) {
          room.coHosts.delete(targetId);
          if (room.users[targetId]) {
            room.users[targetId].isCoHost = false;
            console.log(`User ${room.users[targetId].username} demoted from Co-host in room ${roomId}`);
          }
        } else {
          room.coHosts.add(targetId);
          if (room.users[targetId]) {
            room.users[targetId].isCoHost = true;
            console.log(`User ${room.users[targetId].username} promoted to Co-host in room ${roomId}`);
          }
        }
        io.to(roomId).emit('roles-updated', { users: room.users });
      }
    }
  });

  // Admin: Kick out a member (Host or Co-host)
  socket.on('kick-user', ({ roomId, targetId }) => {
    if (rooms[roomId]) {
      const room = rooms[roomId];
      const isHost = room.hostSocketId === socket.id;
      const isCoHost = room.coHosts.has(socket.id);

      if (isHost || isCoHost) {
        // Prevent kicking the host or co-hosts kicking other co-hosts/host
        const targetIsHost = room.hostSocketId === targetId;
        const targetIsCoHost = room.coHosts.has(targetId);
        
        if (!targetIsHost && (!isCoHost || !targetIsCoHost)) {
          console.log(`Kicking user ${targetId} from room ${roomId}`);
          io.to(targetId).emit('kicked', { reason: 'Kicked by host/co-host' });
        }
      }
    }
  });

  // Live profile update (nickname and avatar emoji/bg) after joining
  socket.on('update-profile', ({ roomId, username, avatar }) => {
    if (rooms[roomId] && rooms[roomId].users[socket.id]) {
      const user = rooms[roomId].users[socket.id];
      user.username = username;
      user.avatar = avatar;

      // Broadcast changes to everyone in the room
      io.to(roomId).emit('profile-updated', {
        socketId: socket.id,
        username: username,
        avatar: avatar,
        users: rooms[roomId].users
      });

      console.log(`Profile updated for ${socket.id} -> Name: ${username}`);
    }
  });

  // Handle client disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    if (currentRoomId && rooms[currentRoomId]) {
      const room = rooms[currentRoomId];
      const username = room.users[socket.id]?.username;
      
      delete room.users[socket.id];
      
      if (room.readyUsers) room.readyUsers.delete(socket.id);
      if (room.coHosts) room.coHosts.delete(socket.id);
      if (room.pendingApprovals) delete room.pendingApprovals[socket.id];

      // Notify others in the room
      socket.to(currentRoomId).emit('user-left', socket.id);

      // Handle Host leaving (reassign host role to co-host or first user)
      if (room.hostSocketId === socket.id) {
        const remainingUsers = Object.keys(room.users);
        if (remainingUsers.length > 0) {
          // Reassign host
          const coHosts = Array.from(room.coHosts);
          const newHostId = coHosts.length > 0 ? coHosts[0] : remainingUsers[0];
          
          room.hostSocketId = newHostId;
          room.coHosts.delete(newHostId);
          
          // Update flags
          Object.keys(room.users).forEach(id => {
            room.users[id].isHost = (id === newHostId);
            room.users[id].isCoHost = room.coHosts.has(id);
          });

          io.to(currentRoomId).emit('roles-updated', {
            users: room.users,
            hostSocketId: newHostId
          });
          
          console.log(`Host left. New Host assigned: ${room.users[newHostId].username} (${newHostId})`);
        }
      }

      // Clean up the room if empty
      if (Object.keys(room.users).length === 0) {
        delete rooms[currentRoomId];
        console.log(`Room ${currentRoomId} deleted (empty)`);
      } else {
        console.log(`${username} left room ${currentRoomId}`);
      }

      // Broadcast updated public directory
      broadcastPublicRooms();
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
