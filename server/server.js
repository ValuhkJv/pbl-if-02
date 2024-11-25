const express = require("express");
const { Pool } = require("pg");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const jwt = require('jsonwebtoken');
const secretKey = 'react';

// Database connection
const db = new Pool({
  host: "localhost",
  user: "postgres",
  password: "password",
  database: "subbagian",
  port: 5432,
});

db.connect((err) => {
  if (err) {
    console.error("Error connection to database :", err);
    return;
  }
  console.log("Connected to the Database");
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Middleware untuk autentikasi
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // Simpan payload token ke req.user
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token." });
  }
};

// Endpoint login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const query = "SELECT * FROM users WHERE username = $1 AND password = $2";
    const result = await db.query(query, [username, password]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        nama: user.nama,
      },
      secretKey,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        nama: user.nama,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Endpoint requests (autentikasi menggunakan middleware)
app.get("/requests", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.request_id, u.full_name, d.division_name, r.request_date, r.purpose, 
              r.requester_status, r.head_unit_status, r.sbum_staff_status
       FROM requests r
       JOIN users u ON r.user_id = u.user_id
       JOIN divisions d ON r.division_id = d.division_id`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching requests" });
  }
});

app.post("/requests", async (req, res) => {
  const {
    user_id,
    division_id,
    request_date,
    purpose,
    requester_status,
    head_unit_status,
    sbum_staff_status,
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO requests (user_id, division_id, request_date, purpose, requester_status, head_unit_status, sbum_staff_status)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        user_id,
        division_id,
        request_date,
        purpose,
        requester_status,
        head_unit_status,
        sbum_staff_status,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error creating request");
  }
});

app.put("/requests/:id", async (req, res) => {
  const { id } = req.params;
  const { requester_status, head_unit_status, sbum_staff_status } = req.body;

  try {
    const result = await db.query(
      `UPDATE requests 
             SET requester_status = $1, head_unit_status = $2, sbum_staff_status = $3
             WHERE request_id = $4 RETURNING *`,
      [requester_status, head_unit_status, sbum_staff_status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Request not found");
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating request");
  }
});

app.delete("/requests/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `DELETE FROM requests WHERE request_id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Request not found");
    }
    res.status(200).send(`Request with ID ${id} deleted`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting request");
  }
});
