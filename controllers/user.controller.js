import { users } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../utils/sendmail.js";
import jwt from "jsonwebtoken";
import { sendSMS } from "../utils/sms.js";

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
export const signup = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!password || (!email && !phone)) {
      return res.status(400).json({ message: "email or phone required" });
    }

    const query = email ? { email } : { phone };

    const exist = await users.findOne(query);
    if (exist) {
      return res.status(400).json({ message: "user exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = await users.create({
      email: email || null,
      phone: phone || null,
      password: await bcrypt.hash(password, 10),
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000,
      isVerified: false,
    });

    // 🔥 SEND OTP
    if (email) {
      await sendEmail(email, otp);
    } else if (phone) {
      await sendSMS(phone, otp);
    }

    return res.status(201).json({
      message: "OTP sent",
      identifier: email || phone,
    });
  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
};
export const verifyotp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({ message: "invalid request" });
    }

    const isEmail = identifier.includes("@");

    const query = isEmail ? { email: identifier } : { phone: identifier };

    const user = await users.findOne(query);

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "invalid otp" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    return res.json({ message: "verified" });
  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
};
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "all fields required" });
    }

    const isEmail = identifier.includes("@");

    const query = isEmail ? { email: identifier } : { phone: identifier };

    const user = await users.findOne(query);

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "user not verified" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "wrong password" });
    }

    const accessToken = user.generateAccesstoken();
    const refreshToken = user.generateRefreshtoken();

    user.refreshToken = refreshToken;
    await user.save();

    return res
      .cookie("accessToken", accessToken, accessOptions)
      .cookie("refreshToken", refreshToken, refreshOptions)
      .json({
        message: "login success",
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
        },
      });
  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
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
