import React, { useState } from "react";
import { Loader, CheckCircle, Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function TextUploader() {
  const [text, setText] = useState("");
  const [response, setResponse] = useState("");
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [textId, setTextId] = useState(null);

  const email = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  const handleTextChange = (e) => setText(e.target.value);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsLoading(true);
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
      setResponse("❌ Error uploading file");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    setResponse("");

    try {
      let currentTextId = textId;

      if (!currentTextId) {
        const saveRes = await fetch("http://localhost:5001/api/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text, email }),
        });

        const saved = await saveRes.json();
        if (saveRes.ok && saved._id) {
          currentTextId = saved._id;
          setTextId(saved._id);
        } else {
          setResponse("❌ Failed to save text before quiz generation");
          setIsLoading(false);
          return;
        }
      }

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 p-6 flex flex-col items-center justify-start">
      <button
          onClick={() => navigate("/menu")}
          className="mt-4 w-3/12 flex items-center justify-center gap-2 border border-purple-500 text-purple-700 py-2 rounded-xl hover:bg-purple-50 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Menu
        </button>
        
      <div className="bg-white/60 backdrop-blur-xl shadow-2xl rounded-xl p-8 w-full max-w-3xl mt-10">
        <h2 className="text-3xl font-bold text-center text-purple-800 mb-6">
          Upload or Paste Text
        </h2>

        <textarea
          rows="8"
          placeholder="Paste or write your text here..."
          value={text}
          onChange={handleTextChange}
          className="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 shadow-sm mb-4"
        />

        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileUpload}
          className="w-full px-4 py-2 mb-4 rounded-lg border border-gray-300 bg-white shadow-sm cursor-pointer hover:border-purple-400"
        />

        <button
          onClick={handleGenerateQuiz}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white w-full px-6 py-3 rounded-xl shadow-md transition duration-200"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" /> Generate Quiz
            </>
          )}
        </button>


        {response && (
          <p className="text-center text-green-700 font-medium mt-4">
            <CheckCircle className="inline w-5 h-5 mr-1" /> {response}
          </p>
        )}

        {questions.length > 0 && (
          <div className="question-list mt-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Generated Questions:
            </h3>
            <ol className="space-y-3 list-decimal list-inside">
              {questions.map((q, i) => (
                <li key={i} className="text-gray-800">
                  <strong>{q.question}</strong>
                  {q.type === "multiple_choice" && (
                    <ul className="list-disc list-inside ml-4 mt-1 text-sm text-gray-600">
                      {q.choices.map((choice, idx) => (
                        <li key={idx}>{choice}</li>
                      ))}
                    </ul>
                  )}
                  {q.type === "true_false" && (
                    <p className="text-sm text-gray-500">
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
