import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Download, Share2, ArrowLeft } from "lucide-react";

function HistoryPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(null);

  const email = localStorage.getItem("userEmail");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

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
      alert("Link to interactive quiz copied to clipboard!");
    });
  };

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const encodedEmail = encodeURIComponent(email);
        const res = await fetch(`${API_URL}/api/by-user/${encodedEmail}`);
        const data = await res.json();
        setQuizzes(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch quiz history.");
      }
    };
    fetchQuizzes();
  }, [email]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold text-purple-800">Quiz History</h2>
          <Link
            to="/menu"
            className="flex items-center gap-2 text-purple-700 border border-purple-500 px-4 py-2 rounded-lg hover:bg-purple-100 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Menu
          </Link>
        </div>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        {quizzes.length === 0 ? (
          <p className="text-gray-600 text-center">No quizzes found.</p>
        ) : (
          <div className="space-y-6">
            {quizzes.map((quiz, index) => (
              <div
                key={index}
                className="bg-white/60 backdrop-blur-lg rounded-xl shadow p-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-purple-800">
                    {quiz.questions[0]?.question.slice(0, 50) +
                      (quiz.questions[0]?.question.length > 50 ? "..." : "")}
                    <span className="block text-sm text-gray-600 font-normal">
                      {new Date(quiz.createdAt).toLocaleString()} •{" "}
                      {quiz.questions.length} questions
                    </span>
                  </h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        setExpandedIndex(expandedIndex === index ? null : index)
                      }
                      className="text-purple-600 hover:text-purple-800"
                    >
                      {expandedIndex === index ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => downloadQuizAsPDF(index)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => copyQuizLink(quiz._id)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {expandedIndex === index && (
                  <div
                    id={`quiz-preview-${index}`}
                    className="mt-4 space-y-4 text-gray-700"
                  >
                    {quiz.questions.map((q, i) => (
                      <div key={i}>
                        <p className="font-medium">
                          {i + 1}. {q.question}
                        </p>
                        {q.type === "multiple_choice" && (
                          <ul className="list-disc ml-6 text-sm text-gray-600">
                            {q.choices.map((c, idx) => (
                              <li key={idx}>{c}</li>
                            ))}
                          </ul>
                        )}
                        {q.type === "true_false" && (
                          <p className="text-sm text-gray-500">
                            <em>(True/False)</em>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;
