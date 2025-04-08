import React, { useEffect, useState } from "react";

function HistoryPage() {
  const [texts, setTexts] = useState([]);
  const [error, setError] = useState("");

  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    const fetchTexts = async () => {
      try {
        const res = await fetch(
          `http://localhost:5001/api/texts?email=${email}`
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch texts");

        setTexts(data.texts);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError(err.message);
      }
    };

    if (email) fetchTexts();
  }, [email]);

  return (
    <div>
      <h2>Your Text Upload History</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {texts.length === 0 ? (
        <p>No texts uploaded yet.</p>
      ) : (
        <ul>
          {texts.map((item, index) => (
            <li key={index} style={{ marginBottom: "1em" }}>
              <strong>{new Date(item.createdAt).toLocaleString()}</strong>
              <p>{item.content.slice(0, 100)}...</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default HistoryPage;
