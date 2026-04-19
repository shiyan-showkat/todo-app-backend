import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connectdb from "./db.js";
import middleware from "./auth/auth.middleware.js";

import {
  signup,
  login,
  logout,
  verifyotp,
  newrefreshtoken,
  forgotPasswordOtp,
  verifyForgotOtp,
  resetPassword,
  user,
} from "./controllers/user.controller.js";

dotenv.config();
connectdb();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "https://todo-app-frontend-omega-mauve.vercel.app",
    credentials: true,
  }),
);

// routes
app.post("/api/v1/signup", signup);
app.post("/api/v1/login", login);
app.post("/api/v1/logout", middleware, logout);
app.post("/api/v1/verifyotp", verifyotp);
app.post("/api/v1/newrefreshtoken", newrefreshtoken);
app.post("/api/v1/forgot-otp", forgotPasswordOtp);
app.post("/api/v1/verify-forgot-otp", verifyForgotOtp);
app.post("/api/v1/reset-password", resetPassword);
app.get("/api/v1/me", middleware, user);

// ❌ DON'T USE "*"
app.use((req, res) => {
  res.status(404).json({ message: "route not found" });
});

app.listen(7777, () => console.log("server running"));
