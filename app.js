import express from "express";
import connectdb from "./db.js";
import cors from "cors";
import dotenv from "dotenv";
import {
  todos,
  updatetodos,
  deletetodo,
  gettodo,
} from "./controllers/todo.create.js";
dotenv.config();
connectdb();
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  }),
);
const port = process.env.PORT || 7777;
app.post("/api/v1/todos", todos);
app.get("/api/v1/gettodos", gettodo);
app.put("/api/v1/updatetodos/:id", updatetodos);
app.delete("/api/v1/deletetodos/:id", deletetodo);

app.listen(port, () => {
  console.log(`server is listening on port:${port}`);
});
