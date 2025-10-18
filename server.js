// --- server.js ---
// ARiQRT Walkie-Talkie Signaling Server
// (Node.js + Express + Socket.io)

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// serve the static files from "public" folder
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-room", (room) => {
    socket.join(room);
    socket.to(room).emit("user-joined", socket.id);
  });

  socket.on("offer", (offer, room) => {
    socket.to(room).emit("offer", offer, socket.id);
  });

  socket.on("answer", (answer, to) => {
    io.to(to).emit("answer", answer, socket.id);
  });

  socket.on("ice-candidate", (candidate, to) => {
    io.to(to).emit("ice-candidate", candidate, socket.id);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
