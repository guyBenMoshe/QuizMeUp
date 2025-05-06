import React, { useState } from "react";
import "../CSS/TextUploader.css";

function TextUploader() {
  const [text, setText] = useState("");
  const [response, setResponse] = useState("");
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [textId, setTextId] = useState(null);

  const email = localStorage.getItem("userEmail");

  const handleTextChange = (e) => setText(e.target.value);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5001/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.text) {
        setText(data.text);
        setResponse("✅ File uploaded and text extracted");

        const saveRes = await fetch("http://localhost:5001/api/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: data.text, email }),
        });

        const saved = await saveRes.json();
        if (saveRes.ok && saved._id) {
          setTextId(saved._id);
        } else {
          setResponse("❌ Failed to save extracted text");
        }
      } else {
        setResponse("❌ Failed to extract text from file");
      }
    } catch (err) {
      console.error("File upload error:", err);
      setResponse("Error uploading file");
    }
  };

  const handleGenerateQuiz = async () => {
    if (!text.trim()) return; // אם אין טקסט בכלל, אין מה לעשות

    setIsLoading(true);
    setResponse("");

    try {
      let currentTextId = textId;

      // אם אין textId (כלומר - טקסט חופשי בלבד), ניצור עכשיו
      if (!currentTextId) {
        const saveRes = await fetch("http://localhost:5001/api/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text, email }),
        });

        const saved = await saveRes.json();
        if (saveRes.ok && saved._id) {
          currentTextId = saved._id;
          setTextId(saved._id); // נעדכן גם בסטייט
        } else {
          setResponse("❌ Failed to save text before quiz generation");
          setIsLoading(false);
          return;
        }
      }

      // עכשיו יש לנו textId (בין אם מהעלאת קובץ ובין אם מטקסט חופשי)
      const res = await fetch("http://localhost:5001/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, email, textId: currentTextId }),
      });

      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
        setResponse(`✅ Generated ${data.questions.length} questions`);
      } else {
        setResponse("No questions generated.");
      }
    } catch (err) {
      console.error("Quiz generation error:", err);
      setResponse("Error generating quiz");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h2>Upload or Paste Text</h2>

        <textarea
          rows="8"
          placeholder="Paste or write your text here..."
          value={text}
          onChange={handleTextChange}
          className="upload-textarea"
        />

        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileUpload}
          className="upload-file"
        />

        <button
          onClick={handleGenerateQuiz}
          className="upload-button"
          disabled={isLoading}
        >
          {isLoading ? "Generating..." : "Generate Quiz"}
        </button>

        {response && <p className="upload-response">{response}</p>}

        {questions.length > 0 && (
          <div className="question-list">
            <h3>Generated Questions:</h3>
            <ol>
              {questions.map((q, i) => (
                <li key={i}>
                  <strong>{q.question}</strong>
                  {q.type === "multiple_choice" && (
                    <ul>
                      {q.choices.map((choice, idx) => (
                        <li key={idx}>{choice}</li>
                      ))}
                    </ul>
                  )}
                  {q.type === "true_false" && (
                    <p>
                      <em>(True/False)</em>
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

export default TextUploader;
