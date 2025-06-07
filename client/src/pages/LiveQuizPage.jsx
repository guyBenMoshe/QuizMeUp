import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// import { io } from "socket.io-client";

// const socket = io("http://localhost:5001");
import { socket } from "../socket";

function LiveQuizPage() {
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [scores, setScores] = useState({});

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roomCode = queryParams.get("roomCode");

  useEffect(() => {
    // const userName = localStorage.getItem("userName") || "Guest";

    const handleNewQuestion = ({ question, index, scores }) => {
      console.log("📥 Received newQuestion from server:", question);
      setQuestion(question);
      setQuestionIndex(index);
      setSelectedAnswer(null);
      setAnswered(false);
      if (scores) setScores(scores);
    };

    const handleQuizEnded = ({ scores }) => {
      console.log("🏁 Quiz ended!");
      navigate("/quiz-results", { state: { scores } });
    };

    // בקשה לשאלה הנוכחית
    socket.emit("getCurrentQuestion", { roomCode });

    // מאזינים רק פעם אחת
    console.log("🔔 Listening to newQuestion");
    socket.on("newQuestion", handleNewQuestion);
    socket.on("quizEnded", handleQuizEnded);

    return () => {
      socket.off("newQuestion", handleNewQuestion);
      socket.off("quizEnded", handleQuizEnded);
    };
  }, [navigate, roomCode]);

  const handleAnswer = (answer) => {
    if (answered) return;
    setSelectedAnswer(answer);
    setAnswered(true);
    socket.emit("submitAnswer", { roomCode, answer });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">
        {question ? (
          <>
            <h2 className="text-3xl font-bold text-purple-800 mb-6">
              Question {questionIndex + 1}
            </h2>
            <p className="text-xl text-purple-700 mb-4">{question.question}</p>
            <div className="space-y-4">
              {question.choices.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  className={`w-full px-4 py-3 border rounded-lg transition text-left text-lg font-medium ${
                    selectedAnswer === option
                      ? "bg-purple-200 border-purple-600 text-purple-900"
                      : "border-purple-500 text-purple-700 hover:bg-purple-100"
                  }`}
                  disabled={answered}
                >
                  {option}
                </button>
              ))}
            </div>
            {answered && (
              <p className="mt-6 text-center text-green-600 font-semibold">
                Answer submitted. Waiting for others...
              </p>
            )}
          </>
        ) : (
          <p className="text-center text-purple-600 text-xl">
            Waiting for the first question...
          </p>
        )}

        {Object.keys(scores).length >= 0 && (
          <div className="mt-8 bg-purple-50 border border-purple-300 rounded-lg p-4 shadow-sm">
            <h3 className="text-xl font-semibold text-purple-800 mb-3 text-center">
              Live Scores
            </h3>
            <ul className="space-y-2">
              {Object.entries(scores)
                .sort((a, b) => b[1] - a[1])
                .map(([name, score], idx) => (
                  <li
                    key={idx}
                    className="flex justify-between text-lg text-purple-700 font-medium"
                  >
                    <span>{name}</span>
                    <span>{score} pts</span>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default LiveQuizPage;
