import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import ListPage from "./pages/ListPage";
import TextUploader from "./components/TextUploader";
import HistoryPage from "./pages/HistoryPage";
import QuizPlay from "./pages/QuizPlay";
import CompetitionPage from "./pages/CompetitionPage";
import LobbyPage from "./pages/LobbyPage";
import LiveQuizPage from "./pages/LiveQuizPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/menu" element={<ListPage />} />
        <Route path="/upload" element={<TextUploader />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/quiz/:quizId" element={<QuizPlay />} />
        <Route path="/competition" element={<CompetitionPage />} />
        <Route path="/lobby/:roomCode" element={<LobbyPage />} />
        <Route path="/competition/quiz/:roomCode" element={<LiveQuizPage />} />
      </Routes>
    </Router>
  );
}

export default App;
