require("dotenv").config(); // Load .env file

// Connect to MongoDB
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

//---------------------------

const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");
const textRoutes = require("./routes/text");
const quizRoutes = require("./routes/quiz");

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api", uploadRoutes);
app.use("/api", textRoutes);
app.use("/api", quizRoutes);

//// Routes
app.get("/", (req, res) => {
  res.send("QuizMeUp server is running!");
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
