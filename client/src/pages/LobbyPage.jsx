import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5001"); // ודא שהשרת שלך רץ על פורט 5001

function LobbyPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [players, setPlayers] = useState([]);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    // קבלת עדכונים על חדר
    socket.on("room-update", (roomPlayers) => {
      setPlayers(roomPlayers);
    });

    // התחלת מבחן
    socket.on("quiz-started", ({ quizId }) => {
      navigate(`/competition/quiz/${roomCode}?quizId=${quizId}`);
    });

    // ניקוי מאזינים
    return () => {
      socket.off("room-update");
      socket.off("quiz-started");
    };
  }, [navigate, roomCode]);

  const handleJoin = () => {
    if (!username) return alert("Please enter your name");
    socket.emit("join-room", { roomCode, username });
    setJoined(true);
  };

  const handleStartQuiz = () => {
    const quizId = localStorage.getItem("quizId");
    if (!quizId) return alert("Missing quizId");
    socket.emit("start-quiz", { roomCode, quizId });
  };

  const isHost = () => {
    return players.length > 0 && players[0]?.username === username;
  };

  console.log("players:", players);
  console.log("your username:", username);
  console.log("host username:", players[0]?.username);
  console.log("isHost:", isHost());

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-purple-700 mb-4">
          Lobby: {roomCode}
        </h2>

        {!joined ? (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full border rounded px-4 py-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button
              onClick={handleJoin}
              className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
            >
              Join Lobby
            </button>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-2">Waiting for players...</p>
            <ul className="mb-4">
              {players.map((player, i) => (
                <li key={player.id} className="text-purple-700">
                  {i + 1}. {player.username}
                </li>
              ))}
            </ul>
            {isHost() && (
              <button
                onClick={handleStartQuiz}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Start Quiz
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default LobbyPage;
