import React, { useEffect, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5001");

function LiveQuizPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const quizId = query.get("quizId");

  const [quiz, setQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const [timer, setTimer] = useState(30);
  const [score, setScore] = useState(0);
  const [finalScores, setFinalScores] = useState(null);

  const username = localStorage.getItem("userEmail") || "Guest";

  const handleAnswerSelection = (choice) => {
    setSelectedAnswer(choice);
    socket.emit("answered", { roomCode, username });
  };

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/quiz/${quizId}`);
        const data = await res.json();
        setQuiz(data);
      } catch (err) {
        console.error("Failed to load quiz", err);
      }
    };

    if (quizId) fetchQuiz();
  }, [quizId]);

  const handleNext = useCallback(() => {
    const question = quiz.questions[currentIndex];
    if (selectedAnswer && selectedAnswer === question.answer) {
      setScore((prev) => prev + 1);
    }

    if (currentIndex + 1 < quiz.questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setTimer(30);
      setSelectedAnswer(null);
    } else {
      socket.emit("submit-score", { roomCode, username, score });
    }
  }, [quiz, currentIndex, selectedAnswer, roomCode, username, score]);

  useEffect(() => {
    if (timer === 0) {
      handleNext();
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, handleNext]);

  useEffect(() => {
    socket.on("next-question", () => {
      handleNext();
    });
    return () => socket.off("next-question");
  }, [handleNext]);

  useEffect(() => {
    socket.on("show-scores", (scores) => {
      setFinalScores(scores);
    });

    return () => {
      socket.off("show-scores");
    };
  }, []);

  if (!quiz) return <div className="p-10 text-center">Loading quiz...</div>;

  if (finalScores) {
    return (
      <div className="min-h-screen bg-green-100 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg text-center">
          <h2 className="text-3xl font-bold mb-4 text-green-700">
            🏆 Final Scores
          </h2>
          <ul className="space-y-2 text-lg">
            {finalScores
              .sort((a, b) => b.score - a.score)
              .map((player, i) => (
                <li key={player.username}>
                  {i + 1}. {player.username}: <strong>{player.score}</strong>
                </li>
              ))}
          </ul>
          <button
            className="mt-6 bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
            onClick={() => navigate("/menu")}
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  if (currentIndex >= quiz.questions.length) {
    return <div className="p-10 text-center">Submitting your score...</div>;
  }

  const question = quiz.questions[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-orange-200 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl text-center">
        <h2 className="text-2xl font-bold mb-4">Question {currentIndex + 1}</h2>
        <p className="text-lg mb-6">{question.question}</p>

        {question.type === "multiple_choice" && (
          <div className="grid grid-cols-1 gap-3">
            {question.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => handleAnswerSelection(choice)}
                className={`border px-4 py-2 rounded ${
                  selectedAnswer === choice
                    ? "bg-indigo-200"
                    : "hover:bg-gray-100"
                }`}
              >
                {choice}
              </button>
            ))}
          </div>
        )}

        {question.type === "true_false" && (
          <div className="flex gap-4 justify-center mt-4">
            {["True", "False"].map((val) => (
              <button
                key={val}
                onClick={() => handleAnswerSelection(val)}
                className={`border px-6 py-2 rounded ${
                  selectedAnswer === val ? "bg-indigo-200" : "hover:bg-gray-100"
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        )}

        <p className="mt-6 text-sm text-gray-600">Time left: {timer} seconds</p>
      </div>
    </div>
  );
}

export default LiveQuizPage;
