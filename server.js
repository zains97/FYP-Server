require("dotenv").config();

//Imports
const express = require("express");
const request = require("request");
const userRoutes = require("./routes/userRoutes");
const friendsRoutes = require("./routes/friendsRoutes");
const cors = require("cors");
const auth = require("./routes/auth");
const postRoutes = require("./routes/postRoutes");
const morgan = require("morgan");
const app = express(); //Initialising the server
const connection = require("./config/db");
const messageHandler = require("./api/chatHandler");
const chatroomHandler = require("./api/chatroomHandler");
const adminHandler = require("./api/adminHandler");
const { Message } = require("./models/Message");
const { saveMessage } = require("./message_utils/MessageHandlers");
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`.bgGreen);
});

//Issue
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

connection();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use(cors());

app.get("/", (req, res) => res.send("Hello World! From Connect!"));
app.use("/api/auth", auth);
app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/message", messageHandler);
app.use("/api/admin", adminHandler);
app.use("/api/chatroom", chatroomHandler);

io.on("connection", (socket) => {
  console.log("Connected with id:", socket.id);

  socket.on("joinRoom", ({ chatroomId }, callback) => {
    socket.join(chatroomId);
  });

  socket.on("sendMessage", (data, callback) => {
    let { messageBody, sender, chatroomId } = data;
    saveMessage(data)
      .then((res) => {
        if (res.success === true) {
          console.log(`${sender.firstName} says: ${messageBody}`);
          socket
            .to(chatroomId)
            .emit("message", { messageBody, sender, chatroomId });
          callback(false, {
            sender,
            messageBody,
            chatroomId,
          });
        } else {
          callback(true, { errorMessage: "Failed to send message" });
        }
      })
      .catch(() => {
        callback(true, { errorMessage: "Failed to send message" });
      });
  });

  socket.on("callEnding", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", (data) => {
    console.log(data);
    // socket.to(data.userToCall).emit("callUser", {
    //   signal: data.signalData,
    //   from: data.from,
    //   name: data.name,
    // });
  });

  socket.on("answerCall", (data) => {
    socket
      .to(data.to)
      .emit("callAccepted", { signal: data.signal, from: data.from });
  });

  socket.on("disconnect", () => {
    console.log(`Socket with id  ${socket.id} was disconnected`);
  });
});
