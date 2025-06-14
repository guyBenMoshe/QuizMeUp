// src/socket.js
import { io } from "socket.io-client";

const socketURL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5001";

// שמירה קבועה שלא יווצר שוב
export const socket = io(socketURL, {
  autoConnect: true,
});
