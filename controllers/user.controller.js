import { users } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../utils/sendmail.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "all fields are required" });
    }

    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "email already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await users.create({
      email,
      password: hashedPassword,
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000,
      isVerified: false,
    });

    await sendEmail(email, otp);

    return res.status(201).json({
      message: "OTP sent successfully",
      userId: newUser._id,
    });
  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
};

export const verifyotp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "all fields are required" });
    }

    const user = await users.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "otp is wrong" });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "otp expired" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    return res.status(200).json({
      message: "OTP verified successfully",
    });
  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "all fields are required" });
    }

    const user = await users.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "please verify OTP first" });
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return res.status(400).json({ message: "invalid credentials" });
    }

    const accessToken = user.generateAccesstoken();
    const refreshToken = user.generateRefreshtoken();

    user.refreshToken = refreshToken;
    await user.save();

    return res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      })
      .status(200)
      .json({
        message: "login successful",
        user,
      });
  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
};

export const logout = async (req, res) => {
  const user = await users.findByIdAndUpdate(
    req.user,
    { $set: { refreshToken: null } },
    { new: true },
  );
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  };

  return res
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .status(200)
    .json({ message: "user logout successfully", user });
};

export const newrefreshtoken = async (req, res) => {
  console.log("🔁 refresh hit");

  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.status(400).json({ message: "token not found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

    const user = await users.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    if (user.refreshToken !== token) {
      return res.status(400).json({ message: "invalid refresh token" });
    }

    const accessToken = user.generateAccesstoken();
    const refreshToken = user.generateRefreshtoken();

    user.refreshToken = refreshToken;
    await user.save();

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    };

    return res
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .status(200)
      .json({ message: "tokens refreshed" });
  } catch (err) {
    console.log("refresh error:", err);
    return res.status(500).json({ message: "refresh failed" });
  }
};

export const forgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "all fields are required" });
    }

    const user = await users.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;

    await user.save();

    await sendEmail(email, otp);

    return res.status(200).json({
      message: "OTP sent to email",
    });
  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
};
export const verifyForgotOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await users.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "invalid otp" });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "otp expired" });
    }

    return res.status(200).json({
      message: "otp verified",
    });
  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "all fields required" });
    }

    const user = await users.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    return res.status(200).json({
      message: "password reset successful",
    });
  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
};

export const user = async (req, res) => {
  if (!req.user) {
    return res.status(400).json({ message: "user not found" });
  }
  return res
    .status(200)
    .json({ message: "user valid successfully", userId: req.user });
};
