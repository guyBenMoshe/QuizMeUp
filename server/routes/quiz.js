const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const Quiz = require("../models/Quiz");

const router = express.Router();

router.post("/generate-quiz", (req, res) => {
  const { content, email } = req.body;
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

module.exports = router;
