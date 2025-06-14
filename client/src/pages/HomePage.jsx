import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { LogIn, User, UserPlus } from "lucide-react";

function HomePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("userEmail", email);
      navigate("/menu");
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleGuest = () => {
    localStorage.removeItem("userEmail");
    navigate("/menu");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center p-6">
      <div className="bg-white/40 backdrop-blur-md shadow-2xl rounded-2xl p-10 w-full max-w-md animate-fade-in">
        <div className="flex justify-center mb-6">
          <img
            src={logo}
            alt="QuizMeUp Logo"
            className="h-30 drop-shadow-lg animate-[float_2s_ease-in-out_infinite]"
          />
        </div>
        {/* <h1 className="text-4xl font-bold text-center text-purple-800 mb-2">
          QuizMeUp
        </h1>
        <p className="text-center text-gray-700 mb-6 text-sm">
          Smart quiz generation, beautiful interface.
        </p> */}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 shadow-sm"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 shadow-sm"
              placeholder="••••••••"
              required
            />
          </div>
          {errorMsg && (
            <div className="text-red-600 text-center text-sm">{errorMsg}</div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl shadow-md transition duration-200"
          >
            <LogIn className="w-5 h-5" /> Login
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleGuest}
            className="text-sm text-purple-700 hover:underline flex items-center justify-center gap-1"
          >
            <User className="w-4 h-4" /> Continue as Guest
          </button>
        </div>

        <div className="mt-2 text-center">
          <Link
            to="/register"
            className="text-sm text-purple-700 hover:underline flex items-center justify-center gap-1"
          >
            <UserPlus className="w-4 h-4" /> Don't have an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
