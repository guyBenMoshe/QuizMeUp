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

const app = express();
const server = http.createServer(app);

// define the socket server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
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
app.use(cors());
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

// Start the server
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
