import React from "react";
import { useNavigate } from "react-router-dom";

function ListPage() {
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  return (
    <div>
      <h2>Welcome, {email || "Guest"}</h2>
      <p>Select an option:</p>
      <button onClick={() => navigate("/upload")}>Upload Text</button>
      <button onClick={() => navigate("/history")}>History</button>
      <button onClick={() => navigate("/competition")}>Competition</button>
      <br />
      <br />
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default ListPage;
