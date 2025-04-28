import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/HomePage.css";
import logo from "../assets/logo.png";

function HomePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const res = await fetch("http://localhost:5001/api/login", {
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
    <div className="home-container">
      <form className="home-form" onSubmit={handleLogin}>
        <img src={logo} alt="QuizMeUp logo" className="home-logo" />
        <h2 className="home-subtitle">Sign In</h2>

        <input
          type="email"
          placeholder="Email"
          className="home-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="home-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="home-button">
          Sign In
        </button>

        <p className="home-link">
          Don’t have an account?{" "}
          <span onClick={() => navigate("/register")}>Register</span>
        </p>

        <button
          type="button"
          className="home-button guest"
          onClick={handleGuest}
        >
          Continue as Guest
        </button>

        {errorMsg && <p className="home-error">{errorMsg}</p>}
      </form>
    </div>
  );
}

export default HomePage;
