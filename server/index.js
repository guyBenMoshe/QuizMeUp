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

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// const allowedOrigins = [
//   "http://localhost:3000", // בזמן פיתוח
//   "https://quizmeup-client.onrender.com", // ה־frontend שלך ברנדר
// ];

const app = express();
const server = http.createServer(app);

// define the socket server
const io = new Server(server, {
  cors: {
    origin: ["https://quizmeup-client.onrender.com", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const setupCompetitionSocket = require("./socket/competition");
setupCompetitionSocket(io);

// ------------------------

const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");
const textRoutes = require("./routes/text");
const quizRoutes = require("./routes/quiz");

//use cors middleware
app.use(
  cors({
    origin: ["https://quizmeup-client.onrender.com", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());

//routes
app.use("/api", authRoutes);
app.use("/api", uploadRoutes);
app.use("/api", textRoutes);
app.use("/api", quizRoutes);

// default route
app.get("/", (req, res) => {
  res.send("QuizMeUp server is running!");
});

const path = require("path");

// ⬇️ הגשה של קבצי React מתוך client/build
app.use(express.static(path.join(__dirname, "client", "build")));

// ⬇️ הפנייה של כל route שלא תואם API ל-index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

// Start the server
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// הארכת זמן לפני סגירת חיבור
server.keepAliveTimeout = 120000; // 2 דקות
server.headersTimeout = 130000;
