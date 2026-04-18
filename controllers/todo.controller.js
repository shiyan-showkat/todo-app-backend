import { Todos } from "../models/todo.model.js";

const todos = async (req, res) => {
  try {
    const { text } = req.body;
    const userid = req.user;

    if (!text) {
      return res.status(400).json({ message: "text is required" });
    }

    const checktodos = await Todos.findOne({
      text,
      userId: userid,
    });

    if (checktodos) {
      return res.status(400).json({ message: "todo already exists" });
    }

    const createtodo = await Todos.create({
      text,
      userId: userid,
    });

    return res
      .status(201)
      .json({ message: "todo created successfully", createtodo });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "internal server error" });
  }
};

const gettodo = async (req, res) => {
  try {
    const gettodos = await Todos.find({ userId: req.user });

    return res
      .status(200)
      .json({ message: "todos fetched successfully", gettodos });
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

    const updateuser = await Todos.findOneAndUpdate(
      { _id: id, userId: req.user },
      { $set: { text } },
      { new: true },
    );

    if (!updateuser) {
      return res.status(404).json({ message: "todo not found" });
    }

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

    const deleted = await Todos.findOneAndDelete({
      _id: id,
      userId: req.user,
    });

    if (!deleted) {
      return res.status(404).json({ message: "todo not found" });
    }

    return res.status(200).json({ message: "todo deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "internal server error" });
  }
};

export { todos, gettodo, updatetodos, deletetodo };
