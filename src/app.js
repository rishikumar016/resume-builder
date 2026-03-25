import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRouters from "./routers/auth.routers.js";
import { AppError, errorHandler } from "./middleware/error.js";
const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouters);

app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);

export default app;
