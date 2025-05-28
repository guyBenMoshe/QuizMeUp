import React from "react";
import { useNavigate } from "react-router-dom";
import { Upload, History, Trophy, LogOut } from "lucide-react";

function ListPage() {
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center p-6">
      <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl p-10 w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-purple-800 mb-2">
          Welcome {email ? <span>{email}</span> : "Guest"} 🎉
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          What would you like to do today?
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/upload")}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium shadow transition"
          >
            <Upload className="w-5 h-5" /> Upload Text
          </button>
          <button
            onClick={() => navigate("/history")}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium shadow transition"
          >
            <History className="w-5 h-5" /> View History
          </button>
          <button
            onClick={() => navigate("/competition")}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium shadow transition"
          >
            <Trophy className="w-5 h-5" /> Start Competition
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 text-sm text-purple-600 hover:underline flex items-center justify-center gap-1"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );
}

export default ListPage;
