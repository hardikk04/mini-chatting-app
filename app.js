import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();

const server = http.createServer(app);

const io = new Server(server);

const userData = [];

io.on("connection", (socket) => {
  // Get username
  socket.on("username", (username) => {
    const newUser = { name: username, id: socket.id };
    userData.push(newUser);
    io.emit("online-user", userData.length);
    io.emit("user-join", newUser);
  });

  // Disconnect socket
  socket.on("disconnect", () => {
    const userIndex = userData.findIndex((user) => user.id === socket.id);
    if (userIndex !== -1) {
      const user = userData[userIndex];
      userData.splice(userIndex, 1);
      io.emit("user-leave", user);
    }
  });

  // Get message
  socket.on("message", (message) => {
    const userIndex = userData.findIndex((user) => user.id === socket.id);
    if (userIndex !== -1) {
      const user = userData[userIndex];
      io.emit("send-message", {
        message,
        id: socket.id,
        time: socket.handshake.time,
        username: user.name,
      });
    }
  });
});

app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("chat");
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
