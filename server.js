const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

// Create the Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Use an absolute path when serving static assets.  When your app
// is deployed the working directory may not be the root of your
// project, so __dirname ensures the correct location.  The Express
// documentation notes that you should use an absolute path when you
// don't control the working directory 【935048399286251†L116-L123】.
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// Serve the main index page explicitly.  Without this route the
// Express static middleware will not automatically respond to
// requests for the root path and you'll see "Cannot GET /".  By
// responding with your index.html file here you ensure that both
// the root path and the `/index.html` path render the client UI.
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Handle WebRTC signalling with Socket.IO
io.on('connection', (socket) => {
  console.log('A user connected: ' + socket.id);

  socket.on('join-room', (room) => {
    socket.join(room);
    socket.to(room).emit('user-joined', socket.id);
  });

  socket.on('offer', (offer, room) => {
    socket.to(room).emit('offer', offer, socket.id);
  });

  socket.on('answer', (answer, to) => {
    io.to(to).emit('answer', answer, socket.id);
  });

  socket.on('ice-candidate', (candidate, to) => {
    io.to(to).emit('ice-candidate', candidate, socket.id);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected: ' + socket.id);
  });
});

// Start the server.  Use the PORT environment variable on hosts such
// as Render; default to 3000 locally.  Logging the port helps when
// debugging or viewing deployment logs.
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});