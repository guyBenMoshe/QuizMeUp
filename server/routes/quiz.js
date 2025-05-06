const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const Quiz = require("../models/Quiz");

const router = express.Router();

router.post("/generate-quiz", (req, res) => {
  const { content, email, textId } = req.body;
  const userEmail = email || "Guest";

  if (!content) {
    return res.status(400).json({ error: "Missing content" });
  }

  const scriptPath = path.join(__dirname, "..", "..", "ml", "process_text.py");
  const cmd = `python3 "${scriptPath}" "${content.replace(/"/g, '\\"')}"`;

  exec(cmd, async (error, stdout, stderr) => {
    if (error) {
      console.error("Python error:", stderr);
      console.error("Full stdout:", stdout);
      return res.status(500).json({ error: "Failed to generate quiz" });
    }

    try {
      const questions = JSON.parse(stdout);

      const newQuiz = new Quiz({
        email: userEmail,
        textId,
        originalText: content,
        questions,
      });

      await newQuiz.save();

      res.json({ message: "Quiz generated and saved", questions });
    } catch (parseErr) {
      console.error("Failed to parse Python output:", parseErr);
      res.status(500).json({ error: "Invalid Python response" });
    }
  });
});

// Route to fetch quizzes by textId
router.get("/quizzes/by-text-id/:textId", async (req, res) => {
  const { textId } = req.params;

  try {
    const quizzes = await Quiz.find({ textId }).sort({ createdAt: -1 });
    res.json({ quizzes });
  } catch (err) {
    console.error("Error fetching quizzes by textId:", err);
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
});

// GET /quiz/by-user/:email
router.get("/by-user/:email", async (req, res) => {
  // console.log("📩 email param:", req.params.email);
  try {
    const quizzes = await Quiz.find({ email: req.params.email }).sort({
      createdAt: -1,
    });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
});

// GET /quiz/:id - Fetch a single quiz by its ID
router.get("/quiz/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    res.json(quiz);
  } catch (err) {
    console.error("Error fetching quiz by ID:", err);
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
});

module.exports = router;
