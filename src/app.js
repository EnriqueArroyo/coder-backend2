import express from "express";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter.js";
import cookieParser from "cookie-parser";
import "dotenv/config";
import passport from "./config/passport.js";
import sessionsRouter from "./routes/sessionsRouter.js";
import productsRouter from "./routes/productsRouter.js";
import cartsRouter from "./routes/cartsRouter.js";

const app = express();

mongoose.connect(process.env.MONGO_URI);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(passport.initialize());

app.use("/api/users", userRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Start Server in Port ${PORT}`);
});
