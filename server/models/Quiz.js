const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  type: String,
  question: String,
  choices: [String],
  answer: String,
});

const QuizSchema = new mongoose.Schema({
  email: { type: String, default: "Guest" },
  textId: { type: mongoose.Schema.Types.ObjectId, ref: "Text" },
  originalText: String,
  questions: [QuestionSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Quiz", QuizSchema);
