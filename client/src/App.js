import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import ListPage from "./pages/ListPage";
import TextUploader from "./components/TextUploader";
import HistoryPage from "./pages/HistoryPage";
import QuizPlay from "./pages/QuizPlay";
import CompetitionEntry from "./pages/CompetitionEntry";
import CompetitionLobby from "./pages/CompetitionLobby";
import LiveQuizPage from "./pages/LiveQuizPage"; // ✅ ייבוא חדש
import QuizResultsPage from "./pages/QuizResultsPage";

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
        <Route path="/competition" element={<CompetitionEntry />} />
        <Route path="/lobby" element={<CompetitionLobby />} />
        <Route path="/live-quiz" element={<LiveQuizPage />} />
        <Route path="/quiz-results" element={<QuizResultsPage />} />
        {/* ✅ מסלול חדש */}
      </Routes>
    </Router>
  );
}

export default App;
