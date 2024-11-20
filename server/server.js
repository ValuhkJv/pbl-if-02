const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());

const db = new Pool({
  host: "localhost",
  user: "postgres",
  password: "12345",
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

app.get("/requests", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.request_id, u.full_name, d.division_name, r.request_date, r.purpose, r.requester_status, r.head_unit_status, r.sbum_staff_status
             FROM requests r
             JOIN users u ON r.user_id = u.user_id
             JOIN divisions d ON r.division_id = d.division_id`
    );
    if (result.rows.length === 0) {
      res.status(200).json([]); // Kirim array kosong jika tidak ada data
    } else {
      res.status(200).json(result.rows);
    }
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
