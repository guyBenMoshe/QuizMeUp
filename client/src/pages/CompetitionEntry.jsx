import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CompetitionEntry() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const encodedEmail = encodeURIComponent(email);
        const res = await fetch(
          `http://localhost:5001/api/by-user/${encodedEmail}`
        );
        const data = await res.json();
        setQuizzes(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch quiz history.");
      }
    };
    fetchQuizzes();
  }, [email]);

  const handleCreateQuiz = () => {
    if (selectedQuiz) {
      navigate(`/lobby?roomCode=${crypto.randomUUID()}&quizId=${selectedQuiz}`);
    } else {
      alert("Please select a quiz to create a live quiz.");
    }
  };

  const handleJoinRoom = () => {
    const roomCode = prompt("Enter room code:");
    if (roomCode) {
      navigate(`/lobby?roomCode=${roomCode}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-purple-800 mb-6">
          Competition Entry
        </h2>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        <div className="space-y-6">
          <button
            onClick={handleJoinRoom}
            className="w-full text-purple-700 border border-purple-500 px-4 py-2 rounded-lg hover:bg-purple-100 transition"
          >
            Join Room by Code
          </button>
          <div className="relative">
            <select
              className="w-full text-purple-700 border border-purple-500 px-4 py-2 rounded-lg hover:bg-purple-100 transition"
              value={selectedQuiz || ""}
              onChange={(e) => setSelectedQuiz(e.target.value)}
            >
              <option value="" disabled>
                Select a quiz to create a live quiz
              </option>
              {quizzes.map((quiz, index) => (
                <option key={index} value={quiz._id}>
                  {quiz.questions[0]?.question.slice(0, 50) +
                    (quiz.questions[0]?.question.length > 50 ? "..." : "")}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCreateQuiz}
            className="w-full text-purple-700 border border-purple-500 px-4 py-2 rounded-lg hover:bg-purple-100 transition"
          >
            Create Live Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompetitionEntry;
