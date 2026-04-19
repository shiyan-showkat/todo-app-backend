import { users } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../utils/sendmail.js";
import jwt from "jsonwebtoken";

const accessOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
  maxAge: 2 * 24 * 60 * 60 * 1000,
};

const refreshOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
  maxAge: 10 * 24 * 60 * 60 * 1000,
};

// ✅ SIGNUP
export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "all fields required" });

    const exist = await users.findOne({ email });
    if (exist) return res.status(400).json({ message: "email already exists" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = await users.create({
      email,
      password: await bcrypt.hash(password, 10),
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000,
      isVerified: false,
    });

    await sendEmail(email, otp);

    res.status(201).json({ message: "OTP sent", userId: newUser._id });
  } catch {
    res.status(500).json({ message: "server error" });
  }
};

// ✅ VERIFY OTP
export const verifyotp = async (req, res) => {
  const { email, otp } = req.body;

  const user = await users.findOne({ email });

  if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
    return res.status(400).json({ message: "invalid otp" });
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  res.json({ message: "verified" });
};

// ✅ LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await users.findOne({ email });

  if (!user || !user.isVerified)
    return res.status(400).json({ message: "invalid user" });

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) return res.status(400).json({ message: "wrong password" });

  const accessToken = user.generateAccesstoken();
  const refreshToken = user.generateRefreshtoken();

  user.refreshToken = refreshToken;
  await user.save();

  res
    .cookie("accessToken", accessToken, accessOptions)
    .cookie("refreshToken", refreshToken, refreshOptions)
    .json({ message: "login success" });
};

// ✅ LOGOUT
export const logout = async (req, res) => {
  await users.findByIdAndUpdate(req.user, {
    $set: { refreshToken: null },
  });

  res
    .clearCookie("accessToken", accessOptions)
    .clearCookie("refreshToken", refreshOptions)
    .json({ message: "logout" });
};

// ✅ REFRESH TOKEN
export const newrefreshtoken = async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) return res.status(401).json({ message: "no token" });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

    const user = await users.findById(decoded.id);

    if (!user || user.refreshToken !== token)
      return res.status(401).json({ message: "invalid token" });

    const accessToken = user.generateAccesstoken();
    const refreshToken = user.generateRefreshtoken();

    user.refreshToken = refreshToken;
    await user.save();

    res
      .cookie("accessToken", accessToken, accessOptions)
      .cookie("refreshToken", refreshToken, refreshOptions)
      .json({ message: "refreshed" });
  } catch {
    res.status(401).json({ message: "expired" });
  }
};

// ✅ USER CHECK
export const user = (req, res) => {
  res.json({ userId: req.user });
};

// ✅ FORGOT PASSWORD
export const forgotPasswordOtp = async (req, res) => {
  const { email } = req.body;

  const user = await users.findOne({ email });
  if (!user) return res.status(400).json({ message: "not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.otp = otp;
  user.otpExpiry = Date.now() + 5 * 60 * 1000;

  await user.save();
  await sendEmail(email, otp);

  res.json({ message: "otp sent" });
};

export const verifyForgotOtp = async (req, res) => {
  const { email, otp } = req.body;

  const user = await users.findOne({ email });

  if (!user || user.otp !== otp || user.otpExpiry < Date.now())
    return res.status(400).json({ message: "invalid otp" });

  res.json({ message: "otp ok" });
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  const user = await users.findOne({ email });

  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = null;
  user.otpExpiry = null;

  await user.save();

  res.json({ message: "password updated" });
};
