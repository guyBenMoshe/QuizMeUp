import React from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/ListPage.css";

function ListPage() {
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  return (
    <div className="menu-container">
      <div className="menu-card">
        <h2 className="menu-title">
          Welcome {email ? <span>{email}</span> : "Guest"} 🎉
        </h2>
        <p className="menu-subtitle">What would you like to do today?</p>

        <div className="menu-buttons">
          <button onClick={() => navigate("/upload")}>Upload Text</button>
          <button onClick={() => navigate("/history")}>View History</button>
          <button onClick={() => navigate("/competition")}>
            Start Competition
          </button>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default ListPage;
