const express = require("express");
const bcrypt = require("bcryptjs");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
// const { pool } = require('./db');
const { Pool } = require("pg");
require("dotenv").config();

// Enable CORS for all origins with specific options
// Enable CORS for all domains
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"], // You can specify the methods you want to allow
  })
);

app.use(express.json()); // Parses JSON bodies

// If you're expecting URL-encoded data (from forms):
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT,
});

// POST /users - Create a new user
app.post("/users", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const { rows } = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id",
      [name, email, hashedPassword]
    );
    res.status(201).send({ message: "User added", id: `${rows[0].id}` });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "server error" });
  }
});

// GET /users/:id - Retrieve a user by ID
app.get("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const { rows } = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [id]
    );
    res.status(200).json({ message: rows[0], id: `${rows[0].id}` });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "server error" });
  }
});

// PUT /users/:id - Update a user's information
app.put("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email } = req.body;
  try {
    await pool.query("UPDATE users SET name = $1, email = $2 WHERE id = $3", [
      name,
      email,
      id,
    ]);
    res
      .status(200)
      .send({ message: `User modified with ID: ${id}`, id: `${id}` });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "server error" });
  }
});

// DELETE /users/:id - Deletes a user
app.delete("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res
      .status(200)
      .send({ message: `User deleted with ID: ${id}`, id: `${id}` });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "server error" });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
