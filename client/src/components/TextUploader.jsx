import React, { useState } from "react";

function TextUploader() {
  const [text, setText] = useState("");
  const [response, setResponse] = useState("");
  const [questions, setQuestions] = useState([]);

  const email = localStorage.getItem("userEmail");

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

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
      } else {
        setResponse("❌ Failed to extract text from file");
      }
    } catch (err) {
      console.error("File upload error:", err);
      setResponse("Error uploading file");
    }
  };

  const handleGenerateQuiz = async () => {
    if (!text.trim()) return;

    try {
      const res = await fetch("http://localhost:5001/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, email }),
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
    }
  };

  return (
    <div>
      <h2>Upload or Paste Text</h2>

      <textarea
        rows="8"
        cols="60"
        placeholder="Paste or write your text here..."
        value={text}
        onChange={handleTextChange}
      />
      <br />
      <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} />
      <br />
      <button onClick={handleGenerateQuiz}>Generate Quiz</button>
      <br />
      {response && <p>{response}</p>}

      {questions.length > 0 && (
        <div>
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
  );
}

export default TextUploader;
