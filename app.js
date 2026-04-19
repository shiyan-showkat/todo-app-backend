import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connectdb from "./db.js";
import middleware from "./auth/auth.middleware.js";

// 🔥 USER CONTROLLERS
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

// 🔥 TODO CONTROLLERS
import {
  todos,
  gettodo,
  updatetodos,
  deletetodo,
} from "./controllers/todo.controller.js";

dotenv.config();
connectdb();

const app = express();

// ✅ MIDDLEWARES
app.use(express.json());
app.use(cookieParser());

// ✅ CORS (LOCAL + PRODUCTION BOTH)
app.use(
  cors({
    origin: [
      "http://localhost:5173", // local frontend
      "https://todo-app-frontend-omega-mauve.vercel.app", // deployed frontend
    ],
    credentials: true,
  }),
);

// ================= USER ROUTES =================

app.post("/api/v1/signup", signup);
app.post("/api/v1/login", login);
app.post("/api/v1/logout", middleware, logout);

app.post("/api/v1/verifyotp", verifyotp);
app.post("/api/v1/newrefreshtoken", newrefreshtoken);

app.post("/api/v1/forgot-otp", forgotPasswordOtp);
app.post("/api/v1/verify-forgot-otp", verifyForgotOtp);
app.post("/api/v1/reset-password", resetPassword);

// ✅ CHECK USER (PROTECTED)
app.get("/api/v1/me", middleware, user);

// ================= TODO ROUTES =================

// 🔐 ALL PROTECTED
app.post("/api/v1/todos", middleware, todos);
app.get("/api/v1/gettodos", middleware, gettodo);
app.put("/api/v1/updatetodos/:id", middleware, updatetodos);
app.delete("/api/v1/deletetodos/:id", middleware, deletetodo);

// ================= 404 =================

app.use((req, res) => {
  res.status(404).json({ message: "route not found" });
});

// ================= SERVER =================

const PORT = process.env.PORT || 7777;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
