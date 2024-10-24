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
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

adminseeder();

//localhost:8080/register
app.use("", userRoute);
app.use("/admin/product", productRoute);
app.use("/admin/category", categoryRoute);
app.use("/customer/cart", cartRoute);
app.use("/order", orderRoute);
app.listen(PORT, () => {
  categoryController.seedCategory();
  console.log("server has started", PORT);
  app;
});

// "dev": "nodemon",
//     "build": "rimraf ./build && tsc",
//     "start": "npm run build && node ./build/index.js"
