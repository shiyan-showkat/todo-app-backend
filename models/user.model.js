import mongoose from "mongoose";
import jwt from "jsonwebtoken";
const userschema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
  },
  refreshToken: {
    type: String,
  },
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});
userschema.methods.generateAccesstoken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_SECRET, {
    expiresIn: "2d",
  });
};
userschema.methods.generateRefreshtoken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_SECRET, {
    expiresIn: "10d",
  });
};

export const users = mongoose.model("users", userschema);
