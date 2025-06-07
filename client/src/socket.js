// src/socket.js
import { io } from "socket.io-client";

export const socket = io("http://localhost:5001", {
  autoConnect: true, // או false אם אתה רוצה לשלוט ידנית
});
