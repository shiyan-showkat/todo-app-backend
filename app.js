import express from "express";
import connectdb from "./db.js";
import cors from "cors";
import dotenv from "dotenv";
import middleware from "./auth/auth.middleware.js";
import cookieParser from "cookie-parser";

import {
  todos,
  updatetodos,
  deletetodo,
  gettodo,
} from "./controllers/todo.controller.js";
import {
  login,
  logout,
  signup,
  verifyotp,
  newrefreshtoken,
  forgotPasswordOtp,
  verifyForgotOtp,
  resetPassword,
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
const port = process.env.PORT || 7777;

app.get("/", async (req, res) => {
  res.send("app is working");
});
app.post("/api/v1/todos", middleware, todos);

app.get("/api/v1/gettodos", middleware, gettodo);

app.put("/api/v1/updatetodos/:id", middleware, updatetodos);

app.delete("/api/v1/deletetodos/:id", middleware, deletetodo);

app.post("/api/v1/signup", signup);
app.post("/api/v1/verifyotp", verifyotp);
app.post("/api/v1/login", login);
app.post("/api/v1/logout", middleware, logout);
app.post("/api/v1/newrefreshtoken", newrefreshtoken);
app.post("/api/v1/forgot-otp", forgotPasswordOtp);
app.post("/api/v1/verify-forgot-otp", verifyForgotOtp);
app.post("/api/v1/reset-password", resetPassword);

app.listen(port, () => {
  console.log(`server is listening on port:${port}`);
});
