const competitions = {}; // זיכרון זמני למבחנים חיים

module.exports = (io) => {
  function emitUpdatedUserList(roomCode) {
    const room = io.sockets.adapter.rooms.get(roomCode);
    if (!room) return;

    const users = Array.from(room)
      .map((id) => io.sockets.sockets.get(id))
      .filter((s) => s?.userName)
      .map((s) => s.userName);

    io.to(roomCode).emit("userList", users);
  }

  io.on("connection", (socket) => {
    console.log("🟢 New client connected:", socket.id);

    socket.on("joinRoom", ({ roomCode, userName }, callback) => {
      socket.userName = userName;
      socket.roomCode = roomCode;
      socket.join(roomCode);

      console.log(`🔗 ${userName} joined room ${roomCode}`);

      if (typeof callback === "function") {
        const roomSize = io.sockets.adapter.rooms.get(roomCode)?.size || 0;
        callback({ status: "joined", isHost: roomSize === 1 });
      }

      emitUpdatedUserList(roomCode);
    });

    // socket.on("leaveRoom", ({ roomCode }) => {
    //   socket.leave(roomCode);
    //   console.log(`❌ ${socket.userName} left room ${roomCode}`);
    //   emitUpdatedUserList(roomCode);
    // });

    socket.on("leaveRoom", ({ roomCode }) => {
      // יציאה מהחדר
      socket.leave(roomCode);

      console.log(`❌ ${socket.userName} left room ${roomCode}`);

      if (competitions[roomCode]) {
        const comp = competitions[roomCode];

        if (comp.answers?.[socket.id]) {
          delete comp.answers[socket.id];
        }

        // הסרת השחקן מהניקוד
        if (comp.scores?.[socket.userName]) {
          delete comp.scores[socket.userName];
        }
      }

      // שליחת רשימת משתמשים עדכנית
      emitUpdatedUserList(roomCode);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Disconnected: ${socket.id} (${socket.userName})`);
      for (const roomCode of socket.rooms) {
        if (roomCode !== socket.id) {
          socket.leave(roomCode);
          emitUpdatedUserList(roomCode);
        }
      }

      for (const [roomCode, comp] of Object.entries(competitions)) {
        if (comp.answers?.[socket.id]) {
          delete comp.answers[socket.id];
        }
        if (comp.scores?.[socket.userName]) {
          delete comp.scores[socket.userName];
        }
      }
    });

    socket.on("startQuiz", ({ roomCode, quiz }) => {
      competitions[roomCode] = {
        quiz,
        currentQuestionIndex: 0,
        answers: {},
        scores: {},
      };

      const room = io.sockets.adapter.rooms.get(roomCode);
      if (room) {
        for (const socketId of room) {
          const user = io.sockets.sockets.get(socketId);
          if (user?.connected && user?.userName) {
            competitions[roomCode].scores[user.userName] = 0;
          }
        }
      }

      io.to(roomCode).emit("startQuizClientSide", { roomCode });

      const question = quiz.questions[0];
      io.to(roomCode).emit("newQuestion", {
        question,
        index: 0,
        scores: competitions[roomCode].scores,
      });
    });

    socket.on("submitAnswer", ({ roomCode, answer }) => {
      const comp = competitions[roomCode];
      if (!comp || comp.answers[socket.id]) return;

      const currentQ = comp.quiz.questions[comp.currentQuestionIndex];
      const isCorrect = answer === currentQ.answer;

      if (isCorrect) {
        const username = socket.userName;
        if (username) {
          comp.scores[username] = (comp.scores[username] || 0) + 1;
        }
      }

      comp.answers[socket.id] = true;

      const totalPlayers = Object.keys(comp.scores).length;
      const answeredCount = Object.keys(comp.answers).length;

      if (answeredCount >= totalPlayers) {
        comp.currentQuestionIndex++;

        if (comp.currentQuestionIndex >= comp.quiz.questions.length) {
          io.to(roomCode).emit("quizEnded", { scores: comp.scores });
          delete competitions[roomCode];
        } else {
          comp.answers = {};
          const nextQuestion = comp.quiz.questions[comp.currentQuestionIndex];
          io.to(roomCode).emit("newQuestion", {
            question: nextQuestion,
            index: comp.currentQuestionIndex,
            scores: comp.scores,
          });
        }
      }
    });

    socket.on("getCurrentQuestion", ({ roomCode }) => {
      const comp = competitions[roomCode];
      if (!comp) return;

      const question = comp.quiz.questions[comp.currentQuestionIndex];
      socket.emit("newQuestion", {
        question,
        index: comp.currentQuestionIndex,
        scores: comp.scores,
      });
    });
  });
};
