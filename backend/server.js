require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

pool.query(`
  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL
  )
`);

app.post("/messages", async (req, res) => {
  const { content } = req.body;

  await pool.query(
    "INSERT INTO messages (content) VALUES ($1)",
    [content]
  );

  res.status(201).send("Message saved");
});

app.get("/messages", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM messages ORDER BY id DESC"
  );

  res.json(result.rows);
});

app.listen(process.env.PORT, () => {
  console.log(`Backend running on port ${process.env.PORT}`);
});
