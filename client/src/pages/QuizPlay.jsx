import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function QuizPlay() {
  const { quizId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [shuffledChoices, setShuffledChoices] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/quiz/${quizId}`
        );
        const data = await res.json();
        if (data.questions) {
          setQuestions(data.questions);
        }
      } catch (err) {
        console.error("Failed to load quiz", err);
      }
    };

    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentChoices = questions[currentQuestionIndex].choices;
      setShuffledChoices(shuffleArray(currentChoices));
      setSelectedAnswer(null);
      setIsAnswerCorrect(null);
    }
  }, [currentQuestionIndex, questions]);

  const handleAnswer = (selected) => {
    const current = questions[currentQuestionIndex];
    const correct = selected === current.answer;
    setSelectedAnswer(selected);
    setIsAnswerCorrect(correct);
    if (correct) setCorrectAnswers((prev) => prev + 1);

    setTimeout(() => {
      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 1200);
  };

  if (questions.length === 0) {
    return (
      <div className="text-center mt-20 text-xl text-gray-600">
        Loading quiz...
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center">
        <div className="bg-white/60 backdrop-blur-lg p-10 rounded-xl shadow-xl text-center">
          <h2 className="text-4xl font-bold text-purple-800 mb-4">
            Quiz Completed!
          </h2>
          <p className="text-lg text-gray-700">
            You scored {correctAnswers} out of {questions.length}
          </p>
        </div>
      </div>
    );
  }

  const current = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
        <div className="mb-6">
          <h2 className="text-xl text-purple-800 font-semibold mb-2">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <p className="text-lg font-medium text-gray-800">
            {current.question}
          </p>
        </div>

        <div className="space-y-4">
          {shuffledChoices.map((choice, index) => {
            const isSelected = selectedAnswer === choice;
            let className =
              "bg-white hover:bg-purple-100 border border-gray-300";

            if (selectedAnswer !== null) {
              if (isSelected && isAnswerCorrect) {
                className = "bg-green-200 border border-green-500";
              } else if (isSelected && !isAnswerCorrect) {
                className = "bg-red-200 border border-red-500";
              } else {
                className = "bg-white border border-gray-300 opacity-50";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(choice)}
                disabled={selectedAnswer !== null}
                className={`w-full text-left px-6 py-3 rounded-xl transition font-medium shadow ${className}`}
              >
                {choice}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default QuizPlay;
