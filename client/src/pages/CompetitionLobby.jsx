import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { socket } from "../socket";

function CompetitionLobby() {
  const [userName, setUserName] = useState("");
  const [users, setUsers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roomCode = queryParams.get("roomCode");
  const quizId = queryParams.get("quizId");
  const hasPrompted = useRef(false);
  const hasJoined = useRef(false);
  const hasStartedQuiz = useRef(false); // חדש

  useEffect(() => {
    if (!roomCode) {
      alert("Missing room code.");
      navigate("/competition-entry");
      return;
    }

    if (!hasPrompted.current) {
      hasPrompted.current = true;
      const enteredUserName = prompt("Enter your name:");
      if (enteredUserName) {
        setUserName(enteredUserName);
        localStorage.setItem("userName", enteredUserName);

        socket.emit(
          "joinRoom",
          { roomCode, userName: enteredUserName },
          ({ status, isHost }) => {
            if (status === "joined") {
              setIsHost(isHost);
              hasJoined.current = true;
            }
          }
        );
      } else {
        navigate("/competition-entry");
      }
    }

    const handleUserList = (userList) => {
      setUsers(userList);
    };

    socket.on("userList", handleUserList);

    return () => {
      if (hasJoined.current && !hasStartedQuiz.current) {
        socket.emit("leaveRoom", { roomCode });
      }
      socket.off("userList", handleUserList);
    };
  }, [navigate, roomCode]);

  useEffect(() => {
    socket.on("startQuizClientSide", ({ roomCode }) => {
      hasStartedQuiz.current = true;
      navigate(`/live-quiz?roomCode=${roomCode}`);
    });

    return () => {
      socket.off("startQuizClientSide");
    };
  }, [navigate]);

  const handleStartQuiz = async () => {
    if (!isHost) {
      alert("Only the host can start the quiz.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/quiz/${quizId}`
      );
      const quiz = await res.json();
      socket.emit("startQuiz", { roomCode, quiz });
      hasStartedQuiz.current = true;
      navigate(`/live-quiz?roomCode=${roomCode}`);
    } catch (err) {
      console.error("Failed to fetch quiz:", err);
      alert("Failed to load quiz. Please try again.");
    }
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy room code:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h2 className="text-4xl font-bold text-purple-800 mb-4 text-center">
          Lobby
        </h2>
        <div className="flex items-center justify-center mb-2 gap-2">
          <p className="text-lg text-purple-700 text-center">
            Room Code: <span className="font-semibold">{roomCode}</span>
          </p>
          <button
            onClick={copyRoomCode}
            className="text-sm bg-purple-200 hover:bg-purple-300 text-purple-800 px-3 py-1 rounded-md transition"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <p className="text-lg text-purple-700 text-center mb-6">
          Welcome, <span className="font-semibold">{userName}</span>!
        </p>

        {users.length > 0 ? (
          <ul className="list-disc pl-6 mb-6">
            {users.map((user, index) => (
              <li key={index} className="text-purple-700 text-lg">
                {user}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-purple-600 italic mb-6">
            💡 Waiting for players to join...
          </div>
        )}

        {isHost && (
          <button
            onClick={handleStartQuiz}
            className="w-full text-purple-700 border border-purple-500 px-6 py-3 rounded-lg hover:bg-purple-100 transition text-lg font-medium"
          >
            Start Quiz
          </button>
        )}
      </div>
    </div>
  );
}

export default CompetitionLobby;
