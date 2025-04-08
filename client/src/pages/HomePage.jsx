import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    <div>
      <h1>QuizMeUp – Home Page</h1>

      <form onSubmit={handleLogin}>
        <h2>Sign In</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">Sign In</button>
      </form>

      <p>
        Don’t have an account?{" "}
        <button onClick={() => navigate("/register")}>Register</button>
      </p>

      <hr />
      <button onClick={handleGuest}>Continue as Guest</button>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
    </div>
  );
}

export default HomePage;
