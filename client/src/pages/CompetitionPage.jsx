import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CompetitionPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      const email = localStorage.getItem("userEmail");
      if (!email) return;

      const encodedEmail = encodeURIComponent(email);
      try {
        const res = await fetch(
          `http://localhost:5001/api/by-user/${encodedEmail}`
        );
        const data = await res.json();
        setQuizzes(data);
      } catch (err) {
        console.error("Failed to fetch quizzes", err);
      }
    };

    fetchHistory();
  }, []);

  const generateRoomCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
  };

  const handleCreateRoom = () => {
    if (!selectedQuizId) return;
    generateRoomCode();
    localStorage.setItem("quizId", selectedQuizId);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-100 to-purple-200 min-h-screen flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-6 text-purple-800">
        Start a Competition
      </h2>

      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
        <label className="block mb-2 font-semibold text-gray-700">
          Select a Quiz:
        </label>
        <select
          value={selectedQuizId}
          onChange={(e) => setSelectedQuizId(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        >
          <option value="">-- Select from History --</option>
          {quizzes.map((quiz) => (
            <option key={quiz._id} value={quiz._id}>
              {quiz.questions[0]?.question?.slice(0, 50) ||
                `Quiz ${quiz._id.slice(-4)}`}
            </option>
          ))}
        </select>

        <button
          onClick={handleCreateRoom}
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 mb-4"
        >
          Generate Room Code
        </button>

        {roomCode && (
          <div className="text-center">
            <p className="mb-2 font-medium text-gray-700">
              Invite Code: <span className="font-bold">{roomCode}</span>
            </p>
            <button
              onClick={copyToClipboard}
              className="bg-indigo-500 text-white px-4 py-1 rounded hover:bg-indigo-600"
            >
              {copied ? "Copied!" : "Copy Code"}
            </button>
            <button
              onClick={() => navigate(`/lobby/${roomCode}`)}
              className="ml-4 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
            >
              Enter Lobby
            </button>
          </div>
        )}

        <hr className="my-6" />

        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Join an Existing Room
        </h3>
        <input
          type="text"
          placeholder="Enter Room Code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          className="w-full border rounded px-3 py-2 mb-4 text-center uppercase tracking-wide"
        />
        <button
          onClick={() => {
            if (!roomCode) return alert("Please enter a room code.");
            navigate(`/lobby/${roomCode}`);
          }}
          className="w-full bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600"
        >
          Join Existing Room
        </button>
      </div>
    </div>
  );
}

export default CompetitionPage;
