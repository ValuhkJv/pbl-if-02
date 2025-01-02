const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const app = express();
const multer = require("multer");
const bodyParser = require("body-parser");
const fs = require("fs");
const uploadDir = "uploads/";
const path = require("path");
const bcrypt = require("bcryptjs");
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const jwt = require("jsonwebtoken");
const secretKey = "react";

// Database connection
const db = new Pool({
  host: "localhost",
  user: "postgres",
  password: "password",
  database: "sbum",
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
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user; // Attach decoded user to the request
    next();
  });
};

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Pastikan folder uploads ada dan dapat diakses
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Konfigurasi multer yang benar
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "uploads/"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file gambar yang diperbolehkan"));
    }
  },
});

// Endpoint login
app.post("/login", async (req, res) => {
  const { username, password, roles_id } = req.body;

  try {
    // Validasi input
    if (!username || !password || !roles_id) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    // Query ke database untuk mencari user berdasarkan username dan role
    const result = await db.query(
      `SELECT u.*, d.division_name 
   FROM users u
   INNER JOIN divisions d ON u.division_id = d.division_id
   WHERE u.username = $1 AND u.roles_id = $2`,
      [username, roles_id]
    );

    const users = result.rows[0];

    // Jika user tidak ditemukan
    if (!users) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, users.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password salah" });
    }

    // Buat token JWT
    const token = jwt.sign(
      {
        user_id: users.user_id,
        username: users.username,
        roles_id: users.roles_id,
      },
      secretKey,
      { expiresIn: "1h" } // Token akan kadaluarsa dalam 1 jam
    );

    // Kirim respons
    res.json({
      message: "Login successfull",
      token: token,
      roles_id: users.roles_id, // Mengembalikan role untuk redirect di frontend
      user_id: users.user_id,
      full_name: users.full_name,
      division_name: users.division_name,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

app.get("/validate-token", authenticateToken, (req, res) => {
  res.status(200).json({ message: "Valid token" });
});

app.get("/users/:user_id", async (req, res) => {
  const userId = parseInt(req.params.user_id, 10); // Konversi ke integer

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const query = `
      SELECT 
        u.full_name,
        d.division_name 
      FROM users u
      INNER JOIN divisions d ON u.division_id = d.division_id
      WHERE u.user_id = $1
    `;

    const result = await db.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

// Endpoint untuk mendapatkan data kategori barang
app.get("/categories", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM categories WHERE category_id != 3"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.get("/items", async (req, res) => {
  const { category_id } = req.query;
  try {
    const result = await db.query(
      `SELECT i.item_id, i.item_name, i.stock, c.category_name 
      FROM items i
      JOIN
      categories c ON i.category_id = c.category_id 
      WHERE 
      i.category_id = $1 AND i.stock > 0`,
      [category_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//MENAMBAHKAN PERMINTAAN
app.post("/requests/batch", async (req, res) => {
  const { user_id, requests } = req.body; // Menerima user_id dan requests dari body
  if (!user_id || !requests || requests.length === 0) {
    return res.status(400).json({ message: "Data permintaan tidak valid" });
  }

  try {
    await db.query("BEGIN"); // Mulai transaksi

    const batchDetails = [];

    for (const request of requests) {
      const { item_id, quantity, reason } = request;

      // Validasi stok barang
      const itemResult = await db.query(
        `SELECT i.item_id, i.item_name, i.stock, c.category_name 
        FROM items i 
        JOIN categories c ON i.category_id = c.category_id 
        WHERE i.item_id = $1 AND stock > 0 `, // Ambil category_id juga
        [item_id]
      );
      if (itemResult.rows.length === 0) {
        throw new Error(`Barang dengan ID ${item_id} tidak ditemukan`);
      }
      if (!item_id) {
        throw new Error("Item ID tidak valid atau tidak dikirimkan");
      }

      const { item_name, stock, category_name } = itemResult.rows[0];

      if (stock < quantity) {
        throw new Error(
          `Jumlah permintaan untuk barang "${item_name}" melebihi stok yang tersedia (${stock}).`
        );
      }

      // Simpan permintaan dengan mengambil category_id dari item
      await db.query(
        `
        INSERT INTO requests (item_id, quantity, reason, requested_by, status)
        VALUES ($1, $2, $3, $4, 'pending')
        RETURNING request_id`,
        [item_id, quantity, reason, user_id] // Menggunakan requested_by sebagai user_id
      );

      // Menambahkan item_name ke dalam batchDetails
      batchDetails.push({
        item_name, // Menambahkan item_name ke dalam batchDetails
        category_name,
        quantity,
        stock,
        reason,
      });
      console.log("Item Data:", itemResult.rows);
      console.log("Batch Details to be sent:", batchDetails);
    }

    await db.query("COMMIT"); // Selesaikan transaksi
    res.status(201).json({ message: "Permintaan berhasil diajukan" });
  } catch (error) {
    await db.query("ROLLBACK"); // Batalkan transaksi jika terjadi error
    console.error("Error processing batch requests:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
    console.log("Received batch requests:", req.body);
  }
});

// Endpoint untuk mendapatkan daftar permintaan user
app.get("/requests", async (req, res) => {
  const { user_id } = req.query;
  console.log("Received user_id:", user_id); // Debugging

  if (!user_id) {
    return res.status(400).json({ message: "User ID diperlukan" });
  }

  try {
    const result = await db.query(
      `
      SELECT 
        DATE(created_at) AS date,
        COUNT(*) AS total_requests
      FROM 
        requests 
      WHERE 
        requested_by = $1
      GROUP BY 
        DATE(created_at)
      ORDER BY 
        DATE(created_at) DESC
      `,
      [user_id]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching requests:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint: Menampilkan Detail Permintaan
app.get("/requests/detail/:date", async (req, res) => {
  const { date } = req.params;
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: "User ID diperlukan" });
  }

  try {
    const result = await db.query(
      `SELECT 
          r.request_id,
          r.quantity,
          r.reason,
          r.rejection_reason,
          r.status,
          DATE(r.created_at) AS date,
          r.approved_by_head,
          r.approved_by_admin,
          u.full_name AS requested_by,
          i.item_name,
          i.unit,
          TO_CHAR(r.created_at, 'Day') AS day_of_week,
          d.division_name
       FROM 
          requests r
          INNER JOIN
          users u  ON r.requested_by = u.user_id
          INNER JOIN
          items i ON r.item_id = i.item_id
          INNER JOIN
          divisions d ON u.division_id = d.division_id
       WHERE 
          requested_by = $1 AND DATE(created_at) = $2`,
      [user_id, date]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching request details:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

//menampilkan daftar persetujuan kepala unit
app.get("/requestsApprovHead/head-approval/:division", async (req, res) => {
  const { division } = req.params; // Divisi kepala unit dari localStorage

  try {
    const result = await db.query(
      `SELECT 
        r.requested_by AS user_id,
        u.full_name,
        COUNT(DISTINCT r.request_id) AS total_requests,
        r.created_at, 
        d.division_name, 
        r.status
      FROM 
        requests r
      JOIN 
        users u ON r.requested_by = u.user_id
      JOIN 
        divisions d ON u.division_id = d.division_id
      WHERE 
        d.division_name = $1 
        AND r.status = 'pending'
      GROUP BY 
        r.requested_by, u.full_name, d.division_name, r.created_at, r.status
      ORDER BY 
        u.full_name, r.created_at DESC;`,
      [division]
    );
    console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching request details:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

//menampilkan detail persetujuan kepala unit
app.get(
  "/requestsApprovHead/head-approval/details/:created_at",
  authenticateToken,
  async (req, res) => {
    const { created_at } = req.params; // Tanggal dari frontend
    const user_id = req.user.user_id; // Mengambil user_id dari sesi atau token autentikasi
    console.log("User ID:", user_id);
    console.log("Created At received by Backend:", created_at);
    try {
      // Ambil division_id dari user_id
      const divisionResult = await db.query(
        `
        SELECT division_id
        FROM users
        WHERE user_id = $1;
        `,
        [user_id]
      );

      if (divisionResult.rows.length === 0) {
        return res.status(404).json({
          message: "User tidak ditemukan.",
        });
      }

      const division_id = divisionResult.rows[0].division_id;

      // Ambil semua request_id yang sesuai
      const requestIdsResult = await db.query(
        `
         SELECT r.request_id, r.status
        FROM requests r
        JOIN users u ON r.requested_by = u.user_id
        WHERE u.division_id = $1
          AND r.status = 'pending'
          AND r.created_at::date = $2;
        `,
        [division_id, created_at]
      );

      const requestIds = requestIdsResult.rows.map((row) => row.request_id);

      console.log("Request IDs from first query:", requestIds);

      if (requestIds.length === 0) {
        return res.status(404).json({
          message: "Tidak ada detail permintaan yang sesuai.",
        });
      }

      const detailResult = await db.query(
        `
      SELECT 
        r.request_id,
        r.item_id, 
        r.requested_by AS user_id,
        u.full_name,
        i.item_name, 
        r.quantity, 
        r.reason, 
        r.status, 
        r.rejection_reason,
        d.division_name AS user_division,
        r.created_at
      FROM 
        requests r
      JOIN 
        items i ON r.item_id = i.item_id
      JOIN 
        users u ON r.requested_by = u.user_id
      JOIN
        divisions d ON u.division_id = d.division_id 
      WHERE 
        r.request_id = ANY($1::int[]);
      `,
        [requestIds]
      );

      console.log("Detail Result:", detailResult.rows);

      if (detailResult.rows.length === 0) {
        return res
          .status(404)
          .json({ message: "Detail permintaan tidak ditemukan." });
      }

      res.status(200).json(detailResult.rows); // Mengirimkan detail permintaan
    } catch (error) {
      console.error("Error fetching detail persetujuan:", error.message);
      res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
  }
);

//mengupdate status disetujui atau ditolak kepala unit
app.put(
  "/requestsApprovHead/:request_id/head-approval",
  authenticateToken,
  async (req, res) => {
    const { request_id } = req.params;
    const { status, rejection_reason } = req.body;
    const approved_by_head = req.user.user_id;

    try {
      // Validasi input status
      if (!["Approved by Head", "Rejected by Head"].includes(status)) {
        return res.status(400).json({ message: "Status tidak valid." });
      }

      // Validasi alasan penolakan
      if (
        status === "Rejected by Head" &&
        (!rejection_reason || rejection_reason.trim() === "")
      ) {
        return res
          .status(400)
          .json({ message: "Alasan penolakan harus diisi jika ditolak." });
      }

      // Ambil data permintaan
      const request = await db.query(
        `SELECT item_id, quantity,status FROM requests WHERE request_id = $1`,
        [request_id]
      );

      if (request.rows.length === 0) {
        return res.status(404).json({ message: "Permintaan tidak ditemukan." });
      }

      const { status: currentStatus } = request.rows[0];

      // Cek jika permintaan sudah disetujui/ditolak sebelumnya
      if (currentStatus !== "pending") {
        return res
          .status(400)
          .json({ message: "Permintaan sudah diproses sebelumnya." });
      }

      // Update status permintaan
      await db.query(
        `UPDATE 
        requests SET 
        status = $1, 
        rejection_reason = $2,
        approved_by_head = $3
         WHERE 
        request_id = $4 AND status = 'pending'`,
        [status, rejection_reason || null, approved_by_head, request_id]
      );

      // Ambil request_number setelah update
      const updatedRequest = await db.query(
        `SELECT request_number FROM requests WHERE request_id = $1`,
        [request_id]
      );

      res.json({
        message: "Persetujuan kepala unit berhasil diperbarui.",
        request_number: updatedRequest.rows[0].request_number, // Sertakan request_number di respons
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Gagal memperbarui persetujuan kepala unit." });
    }
  }
);

//menampilkan daftar persetujuan staff
app.get("/requestsApprovalAdmin/:division", async (req, res) => {
  const { division } = req.params; // Divisi kepala unit dari localStorage

  try {
    const result = await db.query(
      `SELECT 
      r.requested_by AS user_id,
      u.full_name,
      COUNT(DISTINCT r.request_id) AS total_requests,
      r.created_at, 
      d.division_name,
      r.status
    FROM 
      requests r
    JOIN 
      users u ON r.requested_by = u.user_id
    JOIN 
      divisions d ON u.division_id = d.division_id
    WHERE 
      d.division_name = $1 
      AND r.status = 'Approved by Head'
    GROUP BY 
      r.requested_by, u.full_name, d.division_name, r.created_at, r.status
    ORDER BY 
      u.full_name, r.created_at DESC;`,
      [division]
    );
    console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching request details:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

//menampilkan detail persetujuan staff
app.get(
  "/requestsApprovalAdmin/details/:created_at",
  authenticateToken,
  async (req, res) => {
    const { created_at } = req.params; // Tanggal dari frontend
    const user_id = req.user.user_id; // Mengambil user_id dari sesi atau token autentikasi
    console.log("User ID:", user_id);
    console.log("Created At received by Backend:", created_at);
    try {
      // Ambil division_id dari user_id
      const divisionResult = await db.query(
        `
        SELECT division_id
        FROM users
        WHERE user_id = $1;
        `,
        [user_id]
      );

      if (divisionResult.rows.length === 0) {
        return res.status(404).json({
          message: "User tidak ditemukan.",
        });
      }

      const division_id = divisionResult.rows[0].division_id;

      // Ambil semua request_id yang sesuai
      const requestIdsResult = await db.query(
        `
        SELECT r.request_id, r.status
        FROM requests r
        JOIN users u ON r.requested_by = u.user_id
        WHERE u.division_id = $1
          AND r.status = 'Approved by Head'
          AND r.created_at::date = $2;
        `,
        [division_id, created_at]
      );

      const requestIds = requestIdsResult.rows.map((row) => row.request_id);

      console.log("Request IDs from first query:", requestIds);

      if (requestIds.length === 0) {
        return res.status(404).json({
          message: "Tidak ada detail permintaan yang sesuai.",
        });
      }

      const detailResult = await db.query(
        `
      SELECT 
        r.request_id, 
        r.item_id, 
        r.requested_by AS user_id,
        u.full_name,
        i.item_name, 
        r.quantity, 
        r.reason, 
        r.status, 
        r.rejection_reason,
        d.division_name AS user_division,
        r.created_at
      FROM 
        requests r
      JOIN 
        items i ON r.item_id = i.item_id
      JOIN 
        users u ON r.requested_by = u.user_id
      JOIN
        divisions d ON u.division_id = d.division_id 
      WHERE 
        r.request_id = ANY($1::int[]);
      `,
        [requestIds]
      );

      console.log("Detail Result:", detailResult.rows);

      if (detailResult.rows.length === 0) {
        return res
          .status(404)
          .json({ message: "Detail permintaan tidak ditemukan." });
      }

      res.status(200).json(detailResult.rows); // Mengirimkan detail permintaan
    } catch (error) {
      console.error("Error fetching detail persetujuan:", error.message);
      res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
  }
);

app.put(
  "/requestsApprovalAdmin/:request_id/admin-approval",
  authenticateToken,
  async (req, res) => {
    const { request_id } = req.params;
    const { status, rejection_reason } = req.body;
    const approved_by_admin = req.user.user_id;

    try {
      if (status === "Rejected by Staff SBUM" && !rejection_reason) {
        return res
          .status(400)
          .json({ message: "Alasan penolakan harus diisi jika ditolak." });
      }

      // Ambil data permintaan untuk mendapatkan jumlah barang dan item_id
      const request = await db.query(
        `SELECT item_id, quantity FROM requests WHERE request_id = $1`,
        [request_id]
      );

      if (request.rows.length === 0) {
        return res.status(404).json({ message: "Permintaan tidak ditemukan." });
      }
      const req = await db.query(
        `SELECT status FROM requests WHERE request_id = $1`,
        [request_id]
      );
      console.log("Status saat ini:", req.rows[0]?.status);

      const { item_id, quantity } = request.rows[0];

      // Update status permintaan
      await db.query(
        `UPDATE 
      requests 
      SET 
      status = $1, rejection_reason = $2, approved_by_admin = $3 
      WHERE 
      request_id = $4 AND status = 'Approved by Head'`,
        [status, rejection_reason || null, approved_by_admin, request_id]
      );

      // Kurangi stok barang jika disetujui oleh admin
      if (status === "Approved by Staff SBUM") {
        await db.query(
          `UPDATE items 
         SET stock = stock - $1 
         WHERE item_id = $2`,
          [quantity, item_id]
        );
      }

      res.json({ message: "Persetujuan admin berhasil diperbarui." });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Gagal memperbarui persetujuan oleh Admin." });
    }
  }
);

///CRUD MANAJEMEN BARANG
// CREATE: Tambah Barang
app.post("/items", async (req, res) => {
  const { item_code, item_name, category_id, unit, stock } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO items (item_code, item_name, category_id, unit, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [item_code, item_name, category_id, unit, stock]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// READ: Dapatkan Barang Berdasarkan Kategori
app.get("/manage/:categoryId", async (req, res) => {
  const { categoryId } = req.params;
  const categoryIdInt = parseInt(categoryId, 10);
  if (isNaN(categoryIdInt)) {
    return res.status(400).send("Invalid category ID");
  }

  try {
    const result = await db.query(
      "SELECT * FROM items WHERE category_id = $1",
      [categoryId]
    );
    res.json(result.rows); // kirim data ke frontend
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server Error");
  }
});

// Mendapatkan kategori $3 barang peminjaman
app.get("/items/category/3", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT i.*, c.category_name 
       FROM items i 
       JOIN categories c ON i.category_id = c.category_id
       WHERE c.category_id = 3 AND i.stock > 0
       ORDER BY i.item_name`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mengupdate data item berdasarkan id
app.put("/items/:itemId", async (req, res) => {
  const { itemId } = req.params; // Mengambil item_id dari URL parameter
  const { item_code, item_name, category_id, unit, stock } = req.body;

  try {
    // Update data berdasarkan item_id
    const result = await db.query(
      `UPDATE items SET item_code = $1, item_name = $2, category_id = $3, unit = $4, stock = $5 WHERE item_id = $6 RETURNING *`,
      [item_code, item_name, category_id, unit, stock, itemId]
    );

    // Jika item tidak ditemukan
    if (result.rowCount === 0) {
      return res.status(404).send("Item not found");
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error during PUT request:", error); // Menampilkan error di console
    res.status(500).send("Server Error");
  }
});

// endpoint delete item
app.delete("/items/:itemId", async (req, res) => {
  const { itemId } = req.params; // Mengambil item_id dari URL parameter

  try {
    // Menghapus item berdasarkan item_id
    const result = await db.query(
      "DELETE FROM items WHERE item_id = $1 RETURNING *",
      [itemId]
    );

    // Jika tidak ada item yang dihapus
    if (result.rowCount === 0) {
      return res.status(404).send("Item not found");
    }

    res.status(200).send("Item deleted successfully");
  } catch (error) {
    console.error("Error during DELETE request:", error); // Menampilkan error di console
    res.status(500).send("Server Error");
  }
});

// Endpoint untuk mendapatkan semua peminjaman (dikelompokkan)
app.get("/peminjaman", authenticateToken, async (req, res) => {
  let client;
  try {
    client = await db.connect();
    const user = req.user;
    const { view } = req.query; // Tambahkan parameter view untuk membedakan tampilan

    let query, queryParams;

    if (user.roles_id === 1) {
      if (view === "history") {
        // Untuk LoanHistory: tampilkan semua data
        query = `
          SELECT 
            b.borrowing_id,
            b.borrower_id,
            b.borrow_date,
            b.return_date,
            b.status,
            u.full_name,
            u.nik,
            b.rejection_reason,
            i.item_name,
            b.item_code,
            b.quantity,
            b.reason,
            b.initial_condition,
            b.return_condition,
            b.return_proof,
            b.phone_number
          FROM borrowing b
          LEFT JOIN users u ON b.borrower_id = u.user_id
          LEFT JOIN items i ON b.item_code = i.item_code
          ORDER BY b.borrow_date DESC
        `;
      } else {
        // Untuk LoanApproval: kelompokkan berdasarkan peminjam dan tanggal
        query = `
          SELECT DISTINCT ON (b.borrower_id, DATE(b.borrow_date))
            b.borrowing_id,
            b.borrower_id,
            b.borrow_date,
            b.return_date,
            b.status,
            u.full_name,
            u.nik,
            b.rejection_reason,
            i.item_name,
            b.item_code,
            b.quantity,
            b.reason,
            b.initial_condition,
            b.return_condition,
            b.return_proof,
            b.phone_number,
            ARRAY_AGG(b.borrowing_id) OVER (
              PARTITION BY b.borrower_id, DATE(b.borrow_date)
            ) as borrowing_ids
          FROM borrowing b
          LEFT JOIN users u ON b.borrower_id = u.user_id
          LEFT JOIN items i ON b.item_code = i.item_code
          WHERE NOT b.is_deleted
          ORDER BY b.borrower_id, DATE(b.borrow_date), b.borrow_date DESC
        `;
      }
    } else {
      // Untuk user lain: tampilkan data mereka sendiri
      query = `
        SELECT 
          b.borrowing_id,
          b.borrower_id,
          b.borrow_date,
          b.return_date,
          b.status,
          u.full_name,
          u.nik,
          b.rejection_reason,
          i.item_name,
          b.item_code,
          b.quantity,
          b.reason,
          b.initial_condition,
          b.return_condition,
          b.return_proof,
          b.phone_number,
          ARRAY[b.borrowing_id] as borrowing_ids
        FROM borrowing b
        LEFT JOIN users u ON b.borrower_id = u.user_id
        LEFT JOIN items i ON b.item_code = i.item_code
        WHERE b.borrower_id = $1 AND NOT b.is_deleted
        ORDER BY b.borrow_date DESC
      `;
      queryParams = [user.user_id];
    }

    const result = await client.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching borrowing data:", error);
    res.status(500).json({
      message: "Gagal mengambil data peminjaman",
    });
  } finally {
    if (client) client.release();
  }
});

// Endpoint untuk mendapatkan detail peminjaman berdasarkan borrower dan tanggal
app.get("/peminjaman/detail/:date", authenticateToken, async (req, res) => {
  const { date } = req.params;
  const { borrower_id } = req.query;

  if (!borrower_id) {
    return res.status(400).json({ message: "Borrower ID diperlukan" });
  }

  let client;
  try {
    client = await db.connect();
    const formattedDate = date;

    console.log("Running query with parameters:", {
      borrower_id,
      formattedDate,
      queryString: `
          SELECT *
          FROM borrowing b
          JOIN users u ON b.borrower_id = u.user_id
          JOIN items i ON b.item_code = i.item_code
          WHERE b.borrower_id = '${borrower_id}'
          AND DATE(b.borrow_date)::date = '${formattedDate}'::date
          AND NOT b.is_deleted
      `,
    });

    const result = await client.query(
      `SELECT 
        b.borrowing_id,
        b.item_code,
        i.item_name,
        b.quantity,
        b.reason,
        b.status,
        b.rejection_reason,
        b.initial_condition,
        b.return_condition,
        b.return_proof,
        b.phone_number,
        u.full_name,
        u.nik
      FROM borrowing b
      JOIN users u ON b.borrower_id = u.user_id
      JOIN items i ON b.item_code = i.item_code
      WHERE b.borrower_id = $1 
        AND DATE(b.borrow_date) = $2
        AND NOT b.is_deleted
      ORDER BY b.borrowing_id`,
      [borrower_id, formattedDate]
    );

    // Log hasil query
    console.log("Query executed with results:", {
      rowCount: result.rows.length,
      firstRow: result.rows[0],
      allRows: result.rows,
    });

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching borrowing details:", error);
    res.status(500).json({
      message: "Gagal mengambil detail peminjaman",
    });
  } finally {
    if (client) client.release();
  }
});

// Rute untuk membuat peminjaman
app.post("/peminjaman", authenticateToken, async (req, res) => {
  const {
    item_code,
    quantity,
    borrow_date,
    return_date,
    reason,
    phone_number,
  } = req.body;
  const borrower_id = req.user.user_id;

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Parse tanggal dan waktu dengan timezone
    const parsedBorrowDate = new Date(borrow_date);
    const parsedReturnDate = new Date(return_date);

    if (
      isNaN(parsedBorrowDate.getTime()) ||
      isNaN(parsedReturnDate.getTime())
    ) {
      throw new Error("Invalid date format");
    }

    // Cek stok barang
    const itemQuery = await client.query(
      "SELECT stock FROM items WHERE item_code = $1",
      [item_code]
    );

    if (itemQuery.rows.length === 0) {
      throw new Error("Item not found");
    }

    if (itemQuery.rows[0].stock < quantity) {
      throw new Error("Insufficient stock");
    }

    // Buat catatan peminjaman
    const borrowingQuery = await client.query(
      `INSERT INTO borrowing 
       (item_code, borrower_id, quantity, borrow_date, return_date, reason, phone_number )
       VALUES ($1, $2, $3, $4::timestamp with time zone, $5::timestamp with time zone, $6, $7)
       RETURNING *`,
      [
        item_code,
        borrower_id,
        quantity,
        parsedBorrowDate.toISOString(),
        parsedReturnDate.toISOString(),
        reason,
        phone_number,
      ]
    );

    await client.query("COMMIT");

    res.status(201).json(borrowingQuery.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(400).json({ message: error.message });
  } finally {
    client.release();
  }
});

// Rute untuk memproses pengembalian
app.post(
  "/pengembalian/:borrowing_id",
  authenticateToken,
  upload.single("return_proof"),
  async (req, res) => {
    const borrowing_id = parseInt(req.params.borrowing_id);
    const { initial_condition, return_condition } = req.body;

    // Validate borrowing_id
    if (!borrowing_id || isNaN(borrowing_id)) {
      return res.status(400).json({
        error: "Invalid borrowing ID",
      });
    }

    // Validate required fields
    if (!initial_condition || !return_condition) {
      return res.status(400).json({
        error: "Initial condition and return condition are required",
      });
    }

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        error: "Return proof is required",
      });
    }

    const client = await db.connect();

    try {
      await client.query("BEGIN");

      // Ambil data peminjaman termasuk tanggal seharusnya kembali
      const loanResult = await client.query(
        "SELECT item_code, quantity, status, return_date FROM borrowing WHERE borrowing_id = $1",
        [borrowing_id]
      );

      if (loanResult.rows.length === 0) {
        throw new Error("Loan not found");
      }

      const loan = loanResult.rows[0];
      if (loan.status !== "approved") {
        throw new Error("Invalid loan status for return");
      }

      // Hitung selisih hari
      const expectedReturn = new Date(loan.return_date);
      const actualReturn = new Date();
      const diffTime = Math.abs(actualReturn - expectedReturn);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Buat status message berdasarkan keterlambatan
      let statusMessage = "return";
      if (actualReturn > expectedReturn) {
        statusMessage = `return: terlambat ${diffDays} hari`;
      }

      // Update loan status dengan pesan keterlambatan
      await client.query(
        `UPDATE borrowing 
       SET status = $1,
           initial_condition = $2,
           return_condition = $3,
           return_proof = $4
       WHERE borrowing_id = $5`,
        [
          statusMessage,
          initial_condition,
          return_condition,
          req.file.filename,
          borrowing_id,
        ]
      );
      // Update item stock
      await client.query(
        "UPDATE items SET stock = stock + $1 WHERE item_code = $2",
        [loan.quantity, loan.item_code]
      );

      await client.query("COMMIT");
      res.json({
        message: "Return processed successfully",
        return_proof: req.file.filename,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Database error:", error);
      res.status(500).json({
        error: "Server error",
        details: error.message,
      });
    } finally {
      client.release();
    }
  }
);

// Rute untuk validasi peminjaman
app.put(
  "/peminjaman/:borrowing_id/approval",
  authenticateToken,
  async (req, res) => {
    const { borrowing_id } = req.params;
    const { status, rejection_reason } = req.body;

    const client = await db.connect();

    try {
      await client.query("BEGIN");

      // Check current status
      const checkQuery = "SELECT * FROM borrowing WHERE borrowing_id = $1";
      const currentState = await client.query(checkQuery, [borrowing_id]);

      console.log("Current borrowing state:", currentState.rows[0]);
      if (currentState.rows.length === 0) {
        throw new Error("Peminjaman tidak ditemukan");
      }

      // Validate input
      if (!status || !["approved", "rejected"].includes(status)) {
        throw new Error("Status tidak valid");
      }

      // Validate rejection reason if status is rejected
      if (status === "rejected" && !rejection_reason) {
        throw new Error("Alasan penolakan harus diisi jika ditolak");
      }

      // Update borrowing status
      const updateQuery = `
      UPDATE borrowing 
      SET status = $1, 
          rejection_reason = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE borrowing_id = $3 
      RETURNING *
    `;

      console.log("Executing update with params:", {
        status,
        rejection_reason,
        borrowing_id,
      });

      const updateResult = await client.query(updateQuery, [
        status,
        rejection_reason,
        borrowing_id,
      ]);

      // If approved, update item stock
      if (status === "approved") {
        const { item_code, quantity } = updateResult.rows[0];
        await client.query(
          `UPDATE items 
         SET stock = stock - $1 
         WHERE item_code = $2`,
          [quantity, item_code]
        );
      }

      await client.query("COMMIT");

      // Single response at the end
      return res.json({
        message: `Berhasil ${
          status === "approved" ? "menyetujui" : "menolak"
        } peminjaman`,
        updatedItem: updateResult.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error processing approval/rejection:", error);
      return res.status(500).json({
        message: "Gagal memproses persetujuan/penolakan",
        error: error.message,
      });
    } finally {
      client.release();
    }
  }
);

// Rute untuk membatalkan peminjaman
app.put("/peminjaman/cancel/:id", authenticateToken, async (req, res) => {
  const borrowingId = parseInt(req.params.id); // Pastikan diubah ke integer

  const client = await db.connect();

  try {
    // Mulai transaksi
    await client.query("BEGIN");

    // Hapus item dari tabel borrowing
    const deleteResult = await client.query(
      "DELETE FROM borrowing WHERE borrowing_id = $1 RETURNING *",
      [borrowingId]
    );

    // Kembalikan stok item yang dipinjam
    const restoreStockQuery = `
      UPDATE items i
      SET stock = stock + b.quantity
      FROM borrowing b
      WHERE i.item_code = b.item_code AND b.borrowing_id = $1
    `;
    await client.query(restoreStockQuery, [borrowingId]);

    // Commit transaksi
    await client.query("COMMIT");

    res.json({
      message: "Peminjaman berhasil dibatalkan",
      transaction: deleteResult.rows[0],
    });
  } catch (error) {
    // Rollback transaksi jika terjadi kesalahan
    await client.query("ROLLBACK");
    console.error("Error membatalkan peminjaman:", error);
    res.status(500).json({
      error: "Gagal membatalkan peminjaman",
      details: error.message,
    });
  } finally {
    client.release();
  }
});

// Endpoint untuk menghapus peminjaman
app.delete("/peminjaman/:borrowing_id", authenticateToken, async (req, res) => {
  const borrowing_id = parseInt(req.params.borrowing_id);
  const user = req.user;

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Check if loan exists and get its status
    const loanResult = await client.query(
      "SELECT status, item_code, quantity FROM borrowing WHERE borrowing_id = $1",
      [borrowing_id]
    );

    if (loanResult.rows.length === 0) {
      throw new Error("Peminjaman tidak ditemukan");
    }

    const loan = loanResult.rows[0];

    // Check if the loan status allows deletion
    if (
      !["rejected", "return"].includes(loan.status) &&
      !loan.status.startsWith("return: terlambat")
    ) {
      return res.status(403).json({
        error:
          "Peminjaman hanya dapat dihapus jika statusnya ditolak atau sudah dikembalikan",
      });
    }

    // If user is staff (roles_id === 1), perform hard delete
    // Otherwise, perform soft delete
    if (user.roles_id === 1) {
      await client.query("DELETE FROM borrowing WHERE borrowing_id = $1", [
        borrowing_id,
      ]);
    } else {
      await client.query(
        "UPDATE borrowing SET is_deleted = true WHERE borrowing_id = $1",
        [borrowing_id]
      );
    }

    await client.query("COMMIT");
    res.json({ message: "Peminjaman berhasil dihapus" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Database error:", error);

    if (error.message === "Peminjaman tidak ditemukan") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({
        error: "Terjadi kesalahan server",
        details: error.message,
      });
    }
  } finally {
    client.release();
  }
});

//Endpoint Menampilkan Category Di Stock In
app.get("/categories/stockin", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT category_id, category_name FROM categories WHERE category_id !=3"
    );
    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mendapatkan kategori barang",
      error: error.message,
    });
  }
});

//Endpoint Menampilkan Item Di Stock In
app.get("/items/stockin", async (req, res) => {
  const { category_id } = req.query;

  try {
    const query = `
      SELECT item_id, item_name 
      FROM items 
      WHERE category_id = $1
    `;
    const result = await db.query(query, [category_id]);
    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mendapatkan daftar barang",
      error: error.message,
    });
  }
});

// POST /stock-in
app.post("/stock-in", async (req, res) => {
  const { category_id, item_id, quantity } = req.body;

  console.log("Request body received:", req.body);

  if (
    !category_id ||
    !item_id ||
    !quantity ||
    isNaN(quantity) ||
    quantity <= 0
  ) {
    return res.status(400).json({
      message:
        "Data tidak valid. Pastikan category_id, item_id, dan quantity sudah diisi dengan benar.",
    });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Validasi apakah item_id ada di database
    const checkItemQuery = `SELECT * FROM items WHERE item_id = $1`;
    const itemExists = await client.query(checkItemQuery, [item_id]);
    if (itemExists.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Barang dengan ID tersebut tidak ditemukan." });
    }

    // Update stok di tabel items
    const updateStockQuery = `
      UPDATE items 
      SET stock = stock + $1
      WHERE item_id = $2
      RETURNING item_id, item_name, stock, initial_stock;
    `;
    const updatedItem = await client.query(updateStockQuery, [
      quantity,
      item_id,
    ]);
    console.log("Stock updated:", updatedItem.rows[0]);

    // Perbarui initial_stock jika nilainya masih null
    if (updatedItem.rows[0].initial_stock === null) {
      const setInitialStockQuery = `
        UPDATE items
        SET initial_stock = $1
        WHERE item_id = $2;
      `;
      await client.query(setInitialStockQuery, [
        updatedItem.rows[0].stock,
        item_id,
      ]);
      console.log("Initial stock updated for item_id:", item_id);
    }

    // Tambahkan log ke tabel stock_in
    const insertStockInQuery = `
      INSERT INTO stock_in (category_id, item_id, quantity, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING stock_in_id;
    `;
    const stockInLog = await client.query(insertStockInQuery, [
      category_id,
      item_id,
      quantity,
    ]);
    console.log("Stock-in log added:", stockInLog.rows[0]);

    await client.query("COMMIT");

    res.json({
      message: "Berhasil menambahkan stok barang",
      updatedItem: updatedItem.rows[0],
    });
  } catch (error) {
    console.error("Error in /stock-in endpoint:", error);
    await client.query("ROLLBACK");
    res
      .status(500)
      .json({ message: "Gagal menambahkan stok barang", error: error.message });
  } finally {
    client.release();
  }
});

// Get all stock-in data
app.get("/stock-in", async (req, res) => {
  try {
    const query = `
      SELECT 
        si.stock_in_id,
        si.quantity,
        si.created_at,
        c.category_name,
        i.item_name
      FROM stock_in si
      JOIN items i ON si.item_id = i.item_id
      JOIN categories c ON si.category_id = c.category_id
      ORDER BY si.created_at DESC;
    `;

    const result = await db.query(query);
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching stock-in data:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data barang masuk.",
    });
  }
});

// DELETE /stock-in/:stock_in_id
app.delete("/stock-in/:stock_in_id", async (req, res) => {
  const { stock_in_id } = req.params;

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Ambil data stok masuk yang akan dihapus
    const selectQuery = `
      SELECT item_id, quantity 
      FROM stock_in 
      WHERE stock_in_id = $1
    `;
    const result = await client.query(selectQuery, [stock_in_id]);

    if (result.rows.length === 0) {
      throw new Error("Data tidak ditemukan");
    }

    const { item_id, quantity } = result.rows[0];

    // Kurangi stok di tabel items
    const updateStockQuery = `
      UPDATE items
      SET stock = stock - $1
      WHERE item_id = $2
    `;
    await client.query(updateStockQuery, [quantity, item_id]);

    // Hapus data dari tabel stock_in
    const deleteQuery = `
      DELETE FROM stock_in 
      WHERE stock_in_id = $1
    `;
    await client.query(deleteQuery, [stock_in_id]);

    await client.query("COMMIT");

    res.json({ message: "Data barang masuk berhasil dihapus" });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({
      message: "Gagal menghapus data barang masuk",
      error: error.message,
    });
  } finally {
    client.release();
  }
});

// **2. Endpoint untuk membuat laporan stok barang**
app.get("/report", async (req, res) => {
  const client = await db.connect();

  try {
    const reportQuery = `
      SELECT 
          items.item_id,
          items.item_code,
          items.item_name,
          items.category_id,
          categories.category_name,
          items.initial_stock AS stock_awal,
          COALESCE(SUM(stock_in.quantity), 0) AS barang_masuk,
          COALESCE(SUM(requests.quantity), 0) AS barang_keluar,
          items.stock AS stock_akhir
      FROM 
          items
      LEFT JOIN 
          stock_in ON items.item_id = stock_in.item_id
      LEFT JOIN
          categories ON items.category_id = categories.category_id
      LEFT JOIN 
          requests ON items.item_id = requests.item_id AND requests.status = 'Approved by Staff SBUM'
      WHERE
          items.category_id != 3
      GROUP BY 
          items.item_id, items.item_name, items.initial_stock, items.stock, categories.category_name
      ORDER BY 
          items.item_name;
    `;

    const result = await client.query(reportQuery);

    res.json({
      message: "Laporan stok barang berhasil diambil",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error generating stock report:", error.message);
    res.status(500).json({
      message: "Gagal mengambil laporan stok barang",
      error: error.message,
    });
  } finally {
    client.release();
  }
});

// Dashboard Staf
// Endpoint untuk mendapatkan jumlah data pada dashboard
app.get("/dashboard/counts", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
      (SELECT COUNT(*) FROM requests) AS requests,
      (SELECT COUNT(*) FROM borrowing WHERE is_deleted = false) AS borrowings,
      (SELECT COUNT(*) FROM items WHERE stock > 0) AS items`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk mendapatkan data peminjaman yang terlambat
app.get("/borrowing/overdue", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        b.borrowing_id,
        b.borrow_date,
        b.return_date,
        b.status,
        u.full_name AS borrower,
        u.nik,
        i.item_name,
        b.quantity,
        b.reason,
        b.phone_number
      FROM borrowing b
      JOIN users u ON b.borrower_id = u.user_id
      JOIN items i ON b.item_code = i.item_code
      WHERE b.return_date < CURRENT_DATE
      AND b.status = 'approved'
      AND NOT b.is_deleted
      ORDER BY b.return_date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk mengecek status peminjaman
app.get(
  "/borrowing/status/:borrowing_id",
  authenticateToken,
  async (req, res) => {
    try {
      const { borrowing_id } = req.params;
      const result = await db.query(
        "SELECT status FROM borrowing WHERE borrowing_id = $1",
        [borrowing_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Borrowing not found" });
      }

      // Check if the status indicates the item has been returned
      const isReturned = result.rows[0].status.startsWith("return");

      res.json({
        borrowing_id,
        isReturned,
        status: result.rows[0].status,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Endpoint untuk mendapatkan data permintaan paling banyak
app.get("/requests/top", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        i.item_name as nama,
        COUNT(*) as total,
        TO_CHAR(MAX(r.created_at), 'DD-MM-YYYY') as terakhir
      FROM requests r
      JOIN items i ON r.item_id = i.item_id
      GROUP BY i.item_name
      ORDER BY total DESC
      LIMIT 4
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk mendapatkan data peminjaman paling banyak
app.get("/borrowing/top", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
     SELECT
        i.item_name as nama,
        COUNT(*) as total,
        TO_CHAR(MAX(b.borrow_date), 'DD-MM-YYYY') as terakhir
      FROM borrowing b
      JOIN items i ON b.item_code = i.item_code
      WHERE b.is_deleted = false
      GROUP BY i.item_name
      ORDER BY total DESC
      LIMIT 4
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk mendapatkan data barang yang stoknya habis
app.get("/items/zero-stock", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM items WHERE stock = 0
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
