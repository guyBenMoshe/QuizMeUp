import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../CSS/HistoryPage.css";

function HistoryPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(null);

  const email = localStorage.getItem("userEmail");

  const downloadQuizAsPDF = async (index) => {
    const element = document.getElementById(`quiz-preview-${index}`);
    if (!element) {
      alert("Please open the quiz before downloading.");
      return;
    }

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`quiz_${index + 1}.pdf`);
  };

  const copyQuizLink = (quizId) => {
    const link = `${window.location.origin}/quiz/${quizId}`;
    navigator.clipboard.writeText(link).then(() => {
      alert("Link copied to clipboard!");
    });
  };

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const encodedEmail = encodeURIComponent(email);
        const res = await fetch(
          `http://localhost:5001/api/by-user/${encodedEmail}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch quizzes");
        setQuizzes(data);
      } catch (err) {
        setError(err.message);
      }
    };

    if (email) fetchQuizzes();
  }, [email]);

  return (
    <div className="history-container">
      <h2 className="history-title">Your Quiz History</h2>
      {error && <p className="history-error">{error}</p>}

      {quizzes.length === 0 ? (
        <p>No quizzes created yet.</p>
      ) : (
        <ul className="history-list">
          {quizzes.map((quiz, index) => (
            <li key={index} className="history-card">
              <div className="card-header">
                <strong>{new Date(quiz.createdAt).toLocaleString()}</strong>
                <p>{quiz.questions?.length || 0} questions</p>
                <p className="preview-text">
                  Preview:{" "}
                  {quiz.questions?.[0]?.question || "No question available"}
                </p>
              </div>

              <div className="card-buttons">
                <button
                  onClick={() =>
                    setExpandedIndex(index === expandedIndex ? null : index)
                  }
                >
                  {index === expandedIndex ? "Close" : "See More"}
                </button>
                <button onClick={() => downloadQuizAsPDF(index)}>
                  Download PDF
                </button>
                <button onClick={() => copyQuizLink(quiz._id)}>
                  Share Link
                </button>
              </div>

              {index === expandedIndex && (
                <div className="expanded-quiz" id={`quiz-preview-${index}`}>
                  {quiz.questions.map((q, i) => (
                    <div key={i} className="question-block">
                      <strong>
                        {i + 1}. {q.question}
                      </strong>
                      <ul>
                        {q.choices.map((choice, j) => (
                          <li
                            key={j}
                            className={
                              choice === q.answer ? "correct-choice" : ""
                            }
                          >
                            {choice}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default HistoryPage;
