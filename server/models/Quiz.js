const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  type: String,
  question: String,
  choices: [String], // רק אם זה multiple_choice
  answer: String,
});

const QuizSchema = new mongoose.Schema({
  email: { type: String, default: "Guest" },
  originalText: String,
  questions: [QuestionSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Quiz", QuizSchema);
