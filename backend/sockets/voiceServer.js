const rooms = {}; 

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", ({ room, role, name }) => {

    // 🔍 TEMP LOG — Step 2.1
    console.log("JOIN_ROOM EVENT:", {
      sid: socket.id,
      room,
      role,
      name,
    });

    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = {};
    }

    rooms[room][socket.id] = {
      sid: socket.id,
      name: name || "Anonymous",
      role,
    };

    io.to(room).emit("room_users", {
      users: Object.values(rooms[room]),
    });

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
    delete rooms[room][socket.id];
    socket.leave(room);

    io.to(room).emit("user_left", { sid: socket.id });

    io.to(room).emit("room_users", {
      users: Object.values(rooms[room]),
    });

    if (Object.keys(rooms[room]).length === 0) {
      delete rooms[room];
    }

    console.log(`Cleaned up ${socket.id} from ${room}`);
  }
}
