import express, { Application, Request, Response } from "express";
const app: Application = express();
const PORT: number = 8080;
// require("./model/index");
import * as dotenv from "dotenv";
dotenv.config();

import "./database/conection";

import userRoute from "./routes/userRoutes";
import productRoute from "./routes/productRoute";
import adminseeder from "./adminSeeder";
import categoryController from "./controllers/categoryController";
import categoryRoute from "./routes/categoryRoute";
import cartRoute from "./routes/cartRoute";
import orderRoute from "./routes/orderRoute";
import cors from "cors";
import { Server } from "socket.io";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import cron from "node-cron";
import User from "./database/models/userModel";
app.use(
  cors({
    origin: "*",
  })
);
cron.schedule("* * * * * *", () => {
  console.log("Task running every second");
});

app.use(express.json());
app.use(express.static("src"));
adminseeder();

//localhost:8080/register
app.use("", userRoute);
app.use("/admin/product", productRoute);
app.use("/admin/category", categoryRoute);
app.use("/customer/cart", cartRoute);
app.use("/order", orderRoute);
const server = app.listen(PORT, () => {
  categoryController.seedCategory();
  console.log("server has started", PORT);
  app;
});

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
  },
});
io.on("connection", () => {
  console.log("A client connected");
});

let onlineUsers: any = [];
const addToOnlineUsers = (socketId: string, userId: string, role: string) => {
  onlineUsers = onlineUsers.filter((user: any) => user.userId !== userId);
  onlineUsers.push({ socketId, userId, role });
};
io.on("connection", async (socket) => {
  console.log("A client connected");
  const { token } = socket.handshake.auth;
  console.log(token);
  if (token) {
    //@ts-ignore
    const decoded = await promisify(jwt.verify)(token, process.env.SECRET_KEY);
    //@ts-ignore
    const doesUserExists = await User.findByPk(decoded.id);
    if (doesUserExists) {
      addToOnlineUsers(socket.id, doesUserExists.id, doesUserExists.role);
    }
  }
  socket.on("updatedOrderStatus", ({ status, orderId, userId }) => {
    const findUser = onlineUsers.find((user: any) => user.userId == userId);
    if (findUser) {
      io.to(findUser.socketId).emit("statusUpdated", { status, orderId });
    }
  });
  socket.on("updatedPaymentStatus", ({ paymentStatus, orderId, userId }) => {
    const findUser = onlineUsers.find((user: any) => user.userId == userId);
    if (findUser) {
      io.to(findUser.socketId).emit("paymentStatusUpdated", {
        paymentStatus,
        orderId,
      });
    } else {
      console.log(`User with ID ${userId} not found in onlineUsers`);
    }
  });

  console.log(onlineUsers);
});

// "dev": "nodemon",
//     "build": "rimraf ./build && tsc",
//     "start": "npm run build && node ./build/index.js"
