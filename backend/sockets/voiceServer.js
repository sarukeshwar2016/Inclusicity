const rooms = {}; 

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", ({ room, role }) => {
    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = {};
    }

    // Add user to the room state
    rooms[room][socket.id] = { sid: socket.id, role };

    // 1. Update everyone's user list UI
    io.to(room).emit("room_users", {
      users: Object.values(rooms[room]),
    });

    // 2. Trigger signaling: Tell others to OFFER to the new user
    socket.to(room).emit("user_joined", { sid: socket.id });
  });

  socket.on("leave_room", ({ room }) => {
    cleanupUserFromRoom(socket, room);
  });

  socket.on("disconnect", () => {
    Object.keys(rooms).forEach((room) => {
      if (rooms[room][socket.id]) {
        cleanupUserFromRoom(socket, room);
      }
    });
  });

  // Signaling Relays
  socket.on("offer", ({ to, offer }) => {
    io.to(to).emit("offer", { from: socket.id, offer });
  });

  socket.on("answer", ({ from, answer }) => {
    io.to(from).emit("answer", { from: socket.id, answer });
  });

  socket.on("ice_candidate", ({ to, candidate }) => {
    io.to(to).emit("ice_candidate", { from: socket.id, candidate });
  });

  socket.on("speaking", ({ room, isSpeaking }) => {
    socket.to(room).emit("speaking", { sid: socket.id, isSpeaking });
  });

  socket.on("force_mute", ({ sid }) => {
    io.to(sid).emit("force_mute", { sid });
  });
});

function cleanupUserFromRoom(socket, room) {
  if (rooms[room] && rooms[room][socket.id]) {
    // Remove user from memory
    delete rooms[room][socket.id];
    socket.leave(room);

    // 1. Tell others to close this specific WebRTC peer connection
    io.to(room).emit("user_left", { sid: socket.id });

    // 2. Broadcast updated list so the name disappears from everyone's UI
    io.to(room).emit("room_users", {
      users: Object.values(rooms[room]),
    });

    // Clean up empty room objects
    if (Object.keys(rooms[room]).length === 0) {
      delete rooms[room];
    }
    console.log(`Cleaned up ${socket.id} from ${room}`);
  }
}