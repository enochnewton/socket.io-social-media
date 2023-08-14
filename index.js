const io = require("socket.io")(8800, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let activeUsers = [];

io.on("connection", socket => {
  // add new user
  socket.on("new-user-add", newUserId => {
    if (activeUsers.includes(newUserId)) return;

    activeUsers.push({ userId: newUserId, socketId: socket.id });

    io.emit("get-users", activeUsers);
  });

  // disconnect user
  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter(user => user.socketId !== socket.id);
    io.emit("get-users", activeUsers);
  });

  // send message
  socket.on("send-message", data => {
    const user = activeUsers.find(user => user.userId === data.receiverId);

    if (!user) return;

    io.to(user.socketId).emit("recieve-message", data);
  });
});
