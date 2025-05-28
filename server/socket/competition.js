module.exports = (io) => {
  const activeRooms = {};
  const roomState = {};

  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    socket.on("join-room", ({ roomCode, username }) => {
      socket.join(roomCode);
      if (!activeRooms[roomCode]) activeRooms[roomCode] = [];
      activeRooms[roomCode].push({ id: socket.id, username });

      io.to(roomCode).emit("room-update", activeRooms[roomCode]);
    });

    socket.on("start-quiz", ({ roomCode, quizId }) => {
      console.log("📥 start-quiz received:", roomCode, quizId);
      roomState[roomCode] = {
        answeredUsers: new Set(),
        totalPlayers: activeRooms[roomCode]?.length || 0,
      };
      io.to(roomCode).emit("quiz-started", { quizId });
    });

    socket.on("answered", ({ roomCode, username }) => {
      const state = roomState[roomCode];
      if (!state) return;

      state.answeredUsers.add(username);
      if (state.answeredUsers.size === state.totalPlayers) {
        io.to(roomCode).emit("next-question");
        state.answeredUsers.clear();
      }
    });

    socket.on("submit-score", ({ roomCode, username, score }) => {
      if (!roomState[roomCode].scores) {
        roomState[roomCode].scores = [];
      }
      roomState[roomCode].scores.push({ username, score });

      if (
        roomState[roomCode].scores.length === roomState[roomCode].totalPlayers
      ) {
        io.to(roomCode).emit("show-scores", roomState[roomCode].scores);
      }
    });

    socket.on("disconnect", () => {
      for (const room in activeRooms) {
        activeRooms[room] = activeRooms[room].filter((u) => u.id !== socket.id);
        io.to(room).emit("room-update", activeRooms[room]);
      }
      console.log("❌ Client disconnected:", socket.id);
    });
  });
};
