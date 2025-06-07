import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function QuizResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sortedScores, setSortedScores] = useState([]);

  useEffect(() => {
    const finalScores = location.state?.scores;
    if (!finalScores) {
      navigate("/");
      return;
    }
    const sorted = Object.entries(finalScores).sort((a, b) => b[1] - a[1]);
    setSortedScores(sorted);
  }, [location, navigate]);

  const podiumHeights = [200, 150, 100];
  const podiumColors = ["bg-yellow-400", "bg-gray-300", "bg-orange-300"];
  const crownEmoji = ["👑", "🥈", "🥉"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-pink-100 p-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Balloons */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="animate-float-slow absolute left-1/4 top-10 w-16 h-24 bg-pink-300 rounded-full opacity-60 blur-xl"></div>
        <div className="animate-float-slow absolute right-1/4 top-20 w-20 h-20 bg-purple-300 rounded-full opacity-50 blur-xl"></div>
        <div className="animate-float-slow absolute left-2/3 top-40 w-12 h-16 bg-yellow-300 rounded-full opacity-40 blur-xl"></div>
      </div>

      <div className="max-w-4xl w-full bg-white rounded-xl shadow-2xl p-10 z-10">
        <h1 className="text-5xl font-extrabold text-pink-600 mb-12 text-center">
          🏆 Quiz Champions!
        </h1>

        {/* Podium */}
        <div className="flex justify-center items-end gap-6 mb-12">
          {sortedScores.slice(0, 3).map(([name, score], idx) => {
            const height = podiumHeights[idx];
            const bg = podiumColors[idx];
            return (
              <div
                key={idx}
                className={`w-28 ${bg} rounded-t-xl flex flex-col justify-end items-center shadow-lg transform transition hover:scale-105`}
                style={{ height: `${height}px` }}
              >
                <div className="text-3xl">{crownEmoji[idx]}</div>
                <div className="text-md font-bold text-white">{name}</div>
                <div className="text-xl font-extrabold text-white mb-2">
                  {score} pts
                </div>
              </div>
            );
          })}
        </div>

        {/* Other players */}
        {sortedScores.length > 3 && (
          <>
            <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">
              🎖 Other Participants
            </h2>
            <ul className="space-y-3 text-lg text-gray-600 text-center">
              {sortedScores.slice(3).map(([name, score], idx) => (
                <li key={idx} className="flex justify-between px-8">
                  <span>{name}</span>
                  <span>{score} pts</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate("/menu")}
        className="mt-10 px-6 py-3 rounded-full bg-purple-600 text-white font-semibold text-lg shadow-md hover:bg-purple-700 transition z-10"
      >
        🔄 Back to Home
      </button>
    </div>
  );
}

export default QuizResultsPage;
