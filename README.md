# ⚙️ Todo App Backend

A simple and scalable REST API for managing todos with full CRUD functionality.

This backend is built using **Node.js, Express, and MongoDB (Mongoose)** and handles all operations for the Todo application.

---

## 🔥 Features

- ➕ Create Todo
- 📋 Fetch All Todos
- ✏️ Update Todo
- 🗑️ Delete Todo
- 🚫 Prevent duplicate todos
- 📦 MongoDB database integration
- ⚡ RESTful API design

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- dotenv
- cors

---

## 📂 Folder Structure

```id="backend_structure_final_clean"
backend/
│
├── models/
│   └── todo.model.js
│
├── controllers/
│   └── todo.create.js
│
├── db.js
├── app.js
├── package.json
```

---

## ⚙️ Installation & Setup

### 1. Install dependencies

```id="install_deps_final"
npm install
```

---

### 2. Create `.env` file

```id="env_setup_final"
PORT=7777
MONGO_URI=your_mongodb_connection_string
```

---

### 3. Run the server

```id="run_server_final"
npm run dev
```

Server will run on:
http://localhost:7777

---

## 🌐 API Endpoints

| Method | Endpoint                | Description   |
| ------ | ----------------------- | ------------- |
| POST   | /api/v1/todos           | Create Todo   |
| GET    | /api/v1/gettodos        | Get All Todos |
| PUT    | /api/v1/updatetodos/:id | Update Todo   |
| DELETE | /api/v1/deletetodos/:id | Delete Todo   |

---

## ⚙️ Backend Flow

1. Client sends request
2. Express server receives request
3. Controller handles logic
4. Mongoose interacts with MongoDB
5. Response is sent back to client

---

## 🧠 Example Flow

- POST → saves new todo in database
- GET → retrieves all todos
- PUT → updates todo using ID
- DELETE → removes todo using ID

---

## ❗ Error Handling

- Proper HTTP status codes
- Input validation (text, id)
- Duplicate todo prevention
- Server error handling using try/catch

---

## 🔗 Frontend Repository

https://github.com/shiyan-showkat/todo-app-frontend

---

## 🚀 Future Improvements

- 🔐 JWT Authentication
- 📊 Pagination
- 🔎 Search & filter todos
- 🧠 Centralized error handling

---

## 🙌 Author

**Shiyaan Showkat**
GitHub: https://github.com/shiyan-showkat

---

This backend follows RESTful principles and clean architecture practices.
