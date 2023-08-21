const io = require("socket.io")(8800, {
  cors: {
    origin: process.env.SOCIAL_MEDIA_LINK || "http://localhost:3000",
  },
});

let activeUsers = [];

io.on("connection", socket => {
  // add new user
  socket.on("new-user-add", newUserId => {
    if (newUserId === null || newUserId === undefined || newUserId === "")
      return;
    // if the user has already joined, don't add them again
    if (activeUsers.includes(newUserId)) return;

    // add the user to the array
    activeUsers.push({ userId: newUserId, socketId: socket.id });

    // send the array of users to all clients
    io.emit("get-users", activeUsers);
  });

  // disconnect user
  socket.on("disconnect", () => {
    // remove the user from the array
    activeUsers = activeUsers.filter(user => user.socketId !== socket.id);

    // send the array of users to all clients
    io.emit("get-users", activeUsers);
  });

  // send message
  socket.on("send-message", data => {
    // find the user with the matching userId
    const user = activeUsers.find(user => user.userId === data.receiverId);

    // if there is no such user, don't send the message
    if (!user) return;

    // send the message to the user with the matching userId
    io.to(user.socketId).emit("recieve-message", data);
  });
});
