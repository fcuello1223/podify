import { Server } from "socket.io";

import { Message } from "../models/message.model.js";

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3001",
      credentials: true,
    },
  });

  const userSockets = new Map();
  const userActivities = new Map();

  io.on("connection", (socket) => {
    socket.on("user_connected", (userId) => {
      userSockets.set(userId, socket.id);
      userActivities.set(userId, "Idle");

      io.emit("user_connected", userId);
      socket.emit("users_online", Array.from(userSockets.keys()));
      io.emit("activities", Array.from(userActivities.entries()));
    });

    socket.on("activity_update", ({ userId, activity }) => {
      userActivities.set(userId, activity);
      io.emit("activity_update", { userId, activity });
    });

    // socket.on("send_message", async (data) => {
    //   try {
    //     const { senderId, receiverId, content } = data;

    //     const message = await Message.create({
    //       senderId,
    //       receiverId,
    //       content,
    //     });

    //     //Send to Receiver in Real-Time if They are Online
    //     const receiverSocketId = userSockets.get(receiverId);
    //     if (receiverSocketId) {
    //       io.to(receiverSocketId).emit("receive_message", message);
    //     }

    //     socket.emit("message_sent", message);
    //   } catch (error) {
    //     console.error("Message Error: ", error);
    //     socket.emit("message_error", error.message);
    //   }
    // });

    socket.on("send_message", async (data) => {
      try {
        const authedUserId = socket.handshake?.auth?.userId; // Clerk ID
        const { receiverId, content } = data;

        const message = await Message.create({
          senderId: authedUserId, // always Clerk ID
          receiverId,
          content,
        });

        const receiverSocketId = userSockets.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", message);
        }

        socket.emit("message_sent", message);
      } catch (error) {
        console.error("Message Error:", error);
        socket.emit("message_error", error.message);
      }
    });

    socket.on("disconnect", () => {
      let disconnectedUserId;

      for (const [userId, socketId] of userSockets.entries()) {
        //Find Disconnected User
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          userSockets.delete(userId);
          userActivities.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        io.emit("user_disconnected", disconnectedUserId);
      }
    });
  });
};
