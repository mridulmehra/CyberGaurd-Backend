import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import fetch from "node-fetch";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://cybergaurd.onrender.com", // Replace with frontend URL
    methods: ["GET", "POST"]
  }
});


// Middleware
app.use(express.json());
app.use(cors());

// Proxy API for translation
app.post("/translate", async (req, res) => {
  try {
    const response = await fetch("https://api.funtranslations.com/translate/dothraki.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: req.body.text }),
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Translation API error" });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Translation failed" });
  }
});

// WebSocket connection for real-time chat
io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.on("sendMessage", (message, callback) => {
    io.emit("message", { text: message, createdAt: new Date().getTime() });
    callback();
  });

  socket.on("sendLocation", (coords, callback) => {
    io.emit("locationMessage", {
      url: `https://google.com/maps?q=${coords.Latitude},${coords.Longitude}`,
      createdAt: new Date().getTime(),
    });
    callback();
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 5000; // Render assigns its own port

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
