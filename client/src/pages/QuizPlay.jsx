import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../CSS/QuizPlay.css";

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

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/quiz/${quizId}`);
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
    }
  }, [currentQuestionIndex, questions]);

  const handleAnswer = (selectedAnswer) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (selectedAnswer === currentQuestion.answer) {
      setCorrectAnswers((prev) => prev + 1);
    }

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (questions.length === 0) {
    return <div>Loading quiz...</div>;
  }

  if (isFinished) {
    const score = Math.round((correctAnswers / questions.length) * 100);
    return (
      <div className="quiz-finished">
        <h2>Quiz Finished!</h2>
        <p>Your score: {score} / 100</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="quiz-container">
      <h2>Question {currentQuestionIndex + 1}</h2>
      <p>{currentQuestion.question}</p>
      <div className="answers-container">
        {shuffledChoices.map((choice, index) => (
          <button key={index} onClick={() => handleAnswer(choice)}>
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
}

export default QuizPlay;
