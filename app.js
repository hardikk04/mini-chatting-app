const express = require("express");
const path = require("path");
const socketio = require("socket.io");
const http = require("http");

const app = express();

const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
  socket.on("client-message", (message) => {
    io.emit("server-message", { message, id: socket.id });
  });
  socket.on("typing", (typing) => {
    io.emit("user-typing", { typing, id: socket.id });
  });
});

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

server.listen(3000, () => {
  console.log("Server started on port 3000"); // logs to console when server starts
});
