import { Todos } from "../models/todo.model.js";

const todos = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "all fields are required" });
    }
    const checktodos = await Todos.findOne({ text });
    if (checktodos) {
      return res.status(400).json({ message: "todos already exists" });
    }
    const createtodo = await Todos.create({
      text,
    });
    return res
      .status(200)
      .json({ message: "todo created successfully", createtodo });
  } catch (err) {
    console.log(`internal server error`);
    return res.status(500).json({ message: "internal server error" });
  }
};

const gettodo = async (req, res) => {
  try {
    const gettodos = await Todos.find();
    return res
      .status(200)
      .json({ message: "todo find successfully", gettodos });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "internal server error" });
  }
};

const updatetodos = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!id) {
      return res.status(400).json({ message: "id is required" });
    }
    const updateuser = await Todos.findByIdAndUpdate(
      id,
      { $set: { text } },
      { new: true },
    );
    return res
      .status(200)
      .json({ message: "todo updated successfully", updateuser });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "internal server error" });
  }
};
const deletetodo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "id is required" });
    }
    await Todos.findByIdAndDelete(id);
    return res.status(200).json({ message: "todos deleted succeesfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "internal server error" });
  }
};
export { todos, gettodo, updatetodos, deletetodo };
