import mongoose from "mongoose";

const todoschema = new mongoose.Schema({
  text: {
    type: String,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});
export const Todos = mongoose.model("Todos", todoschema);
