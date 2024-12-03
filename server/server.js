const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const app = express();
const multer = require("multer");
const fs = require("fs");
const uploadDir = "uploads/";
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

const jwt = require("jsonwebtoken");
const secretKey = "react";

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
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // Simpan payload token ke req.user
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token." });
  }
};

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use("/uploads", express.static("uploads"));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Endpoint login
app.post("/login", async (req, res) => {
  const { username, password, role } = req.body;

  console.log("Login attempt:", { username, password, role }); // Debugging

  try {
    const query = "SELECT * FROM users WHERE username = $1 AND password = $2";
    const result = await db.query(query, [username, password]);

    if (result.rows.length === 0) {
      console.log("Invalid username or password."); // Debugging
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = result.rows[0];

    // Periksa apakah role sesuai
    if (user.role.toLowerCase() !== role.toLowerCase()) {
      console.log("Role does not match with username."); // Debugging
      return res.status(401).json({ message: "Role does not match with username" });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        nama: user.nama,
        nim_nik_nidn: user.nim_nik_nidn,
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
        nim_nik_nidn: user.nim_nik_nidn,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all barang konsumsi
app.get("/barang-konsumsi", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM barang_konsumsi");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching barang konsumsi" });
  }
});


// POST barang konsumsi
app.post("/barang-konsumsi", async (req, res) => {
  const { kode_barang, nama_barang, stok, satuan } = req.body;

  try {
    const result = await db.query(
      "INSERT INTO barang_konsumsi (kode_barang, nama_barang, stok, satuan) VALUES ($1, $2, $3, $4) RETURNING *",
      [kode_barang, nama_barang, stok, satuan]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      // Unique constraint violation
      res.status(409).json({ error: "Kode barang already exists" });
    } else {
      console.error(err);
      res.status(500).json({ error: "Failed to insert barang konsumsi" });
    }
  }
});

// PUT barang konsumsi
app.put("/barang-konsumsi/:id", async (req, res) => {
  const { id } = req.params;
  const { kode_barang, nama_barang, stok, satuan } = req.body;
  try {
    const result = await db.query(
      "UPDATE barang_konsumsi SET kode_barang = $1, nama_barang = $2, stok = $3, satuan = $4 WHERE id = $5 RETURNING *",
      [kode_barang, nama_barang, stok, satuan, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Barang konsumsi not found" });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating barang konsumsi" });
  }
});

// DELETE barang konsumsi
app.delete("/barang-konsumsi/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      "DELETE FROM barang_konsumsi WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Barang konsumsi not found" });
    } else {
      res
        .status(200)
        .json({ message: "Barang konsumsi deleted", data: result.rows[0] });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting barang konsumsi" });
  }
});

// GET all barang rt
app.get("/barangrt", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM barang_rt");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching barang rt" });
  }
});

// POST barang rt
app.post("/barangrt", async (req, res) => {
  const { kode_barang, nama_barang, stok, satuan } = req.body;

  try {
    const result = await db.query(
      "INSERT INTO barang_rt (kode_barang, nama_barang, stok, satuan) VALUES ($1, $2, $3, $4) RETURNING *",
      [kode_barang, nama_barang, stok, satuan]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      // Unique constraint violation
      res.status(409).json({ error: "Kode barang already exists" });
    } else {
      console.error(err);
      res.status(500).json({ error: "Failed to insert barang rt" });
    }
  }
});

// PUT barang rt
app.put("/barangrt/:id", async (req, res) => {
  const { id } = req.params;
  const { kode_barang, nama_barang, stok, satuan } = req.body;
  try {
    const result = await db.query(
      "UPDATE barang_rt SET kode_barang = $1, nama_barang = $2, stok = $3, satuan = $4 WHERE id = $5 RETURNING *",
      [kode_barang, nama_barang, stok, satuan, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Barang rt not found" });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating barang rt" });
  }
});

// DELETE barang rt
app.delete("/barangrt/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      "DELETE FROM barang_rt WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Barang rt not found" });
    } else {
      res
        .status(200)
        .json({ message: "Barang rt deleted", data: result.rows[0] });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting barang rt" });
  }
});

// GET all barang peminjaman
app.get("/barang-peminjaman", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM barang_peminjaman");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching barang peminjaman" });
  }
});

// POST barang peminjaman
app.post("/barang-peminjaman", async (req, res) => {
  const { no_inventaris, nama_barang, stok, satuan } = req.body;

  try {
    const result = await db.query(
      "INSERT INTO barang_peminjaman (no_inventaris, nama_barang, stok, satuan) VALUES ($1, $2, $3, $4) RETURNING *",
      [no_inventaris, nama_barang, stok, satuan]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      // Unique constraint violation
      res.status(409).json({ error: "No inventaris barang already exists" });
    } else {
      console.error(err);
      res.status(500).json({ error: "Failed to insert barang peminjaman" });
    }
  }
});

// PUT barang peminjaman
app.put("/barang-peminjaman/:id", async (req, res) => {
  const { id } = req.params;
  const { no_inventaris, nama_barang, stok, satuan } = req.body;
  try {
    const result = await db.query(
      "UPDATE barang_peminjaman SET no_inventaris = $1, nama_barang = $2, stok = $3, satuan = $4 WHERE id = $5 RETURNING *",
      [no_inventaris, nama_barang, stok, satuan, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Barang peminjaman not found" });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating barang peminjaman" });
  }
});

// DELETE barang peminjaman
app.delete("/barang-peminjaman/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      "DELETE FROM barang_peminjaman WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Barang peminjaman not found" });
    } else {
      res
        .status(200)
        .json({ message: "Barang peminjaman deleted", data: result.rows[0] });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting barang peminjaman" });
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

// Endpoint untuk mengambil semua data peminjaman
app.get("/peminjaman", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM peminjaman");
    console.log(result.rows);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat mengambil data peminjaman." });
  }
});

// Endpoint untuk pengajuan peminjaman
app.post("/peminjaman", async (req, res) => {
  const {
    no_inventaris,
    jumlah,
    peminjam,
    no_transaksi,
    keterangan,
    nama_barang,
    nim_nik_nidn,
  } = req.body;

  try {
    // Validasi ketersediaan barang
    const barang = await db.query(
      "SELECT stok FROM barang_peminjaman WHERE no_inventaris = $1",
      [no_inventaris]
    );

    if (!barang.rows.length) {
      await db.query("ROLLBACK");
      return res.status(404).json({ error: "Barang tidak ditemukan" });
    }

    if (barang.rows[0].stok < jumlah) {
      await db.query("ROLLBACK");
      return res.status(400).json({ error: "Jumlah melebihi stok tersedia" });
    }

    // Simpan data peminjaman
    await db.query(
      `INSERT INTO peminjaman (no_transaksi, no_inventaris, jumlah, peminjam, status_peminjaman, keterangan, nama_barang, nim_nik_nidn) 
       VALUES ($1, $2, $3, $4, 'Menunggu Persetujuan', $5, $6, $7)`,
      [
        no_transaksi,
        no_inventaris,
        jumlah,
        peminjam,
        keterangan,
        nama_barang,
        nim_nik_nidn,
      ]
    );

    await db.query("COMMIT");
    res
      .status(201)
      .json({ message: "Peminjaman berhasil diajukan, menunggu persetujuan." });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error(err);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat memproses peminjaman." });
  }
});

app.put("/peminjaman/persetujuan/:no_transaksi", async (req, res) => {
  const { no_transaksi } = req.params;
  const { status_peminjaman, alasan_penolakan } = req.body;

  try {
    await db.query("BEGIN");

    if (!["Disetujui", "Ditolak"].includes(status_peminjaman)) {
      await db.query("ROLLBACK");
      return res.status(400).json({ error: "Status tidak valid." });
    }

    // Tambahkan blok ini untuk mengurangi stok saat disetujui
    if (status_peminjaman === "Disetujui") {
      // Ambil data peminjaman untuk mendapatkan detail barang
      const peminjaman = await db.query(
        "SELECT no_inventaris, jumlah FROM peminjaman WHERE no_transaksi = $1",
        [no_transaksi]
      );

      if (!peminjaman.rows.length) {
        await db.query("ROLLBACK");
        return res.status(404).json({ error: "Peminjaman tidak ditemukan" });
      }

      // Update stok
      const updateStok = await db.query(
        "UPDATE barang_peminjaman SET stok = stok - $1 WHERE no_inventaris = $2 RETURNING stok",
        [peminjaman.rows[0].jumlah, peminjaman.rows[0].no_inventaris]
      );

      if (updateStok.rows[0].stok < 0) {
        await db.query("ROLLBACK");
        return res.status(400).json({ error: "Stok tidak mencukupi" });
      }
    }

    // Update status peminjaman
    await db.query(
      `UPDATE peminjaman 
       SET status_peminjaman = $1, 
           alasan_penolakan = $2
       WHERE no_transaksi = $3`,
      [
        status_peminjaman,
        status_peminjaman === "Ditolak" ? alasan_penolakan : null,
        no_transaksi,
      ]
    );

    await db.query("COMMIT");
    res.json({ message: "Status peminjaman berhasil diperbarui" });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});

// Endpoint Pengembalian Barang
app.post(
  "/pengembalian/:no_transaksi",
  upload.single("bukti_pengembalian"),
  async (req, res) => {
    const { no_transaksi } = req.params;
    const { kondisi_saat_ambil, kondisi_saat_kembali } = req.body;

    // Validasi file upload
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "Bukti pengembalian wajib diunggah" });
    }

    try {
      await db.query("BEGIN");

      // Cek status peminjaman
      const peminjaman = await db.query(
        "SELECT no_inventaris, jumlah, status_peminjaman FROM peminjaman WHERE no_transaksi = $1",
        [no_transaksi]
      );

      if (!peminjaman.rows.length) {
        await db.query("ROLLBACK");
        return res.status(404).json({ error: "Peminjaman tidak ditemukan" });
      }

      if (peminjaman.rows[0].status_peminjaman !== "Disetujui") {
        await db.query("ROLLBACK");
        return res
          .status(400)
          .json({ error: "Status peminjaman tidak valid untuk pengembalian" });
      }

    // Update status peminjaman dengan bukti pengembalian
    await db.query(
      `UPDATE peminjaman 
       SET status_peminjaman = 'Kembali',
           kondisi_saat_ambil = $1,
           kondisi_saat_kembali = $2,
           tanggal_kembali = CURRENT_TIMESTAMP,
           bukti_pengembalian = $3
       WHERE no_transaksi = $4`,
      [kondisi_saat_ambil, kondisi_saat_kembali, req.file.filename, no_transaksi]
    );

    // Kembalikan stok
    await db.query(
      "UPDATE barang_peminjaman SET stok = stok + $1 WHERE no_inventaris = $2",
      [peminjaman.rows[0].jumlah, peminjaman.rows[0].no_inventaris]
    );

    await db.query('COMMIT');
    res.json({ 
      message: "Pengembalian berhasil diproses",
      bukti_pengembalian: req.file.filename 
    });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});


// Delete peminjaman
app.delete("/peminjaman/:no_transaksi", async (req, res) => {
  const { no_transaksi } = req.params;

  try {
    const result = await db.query(
      "DELETE FROM peminjaman WHERE no_transaksi = $1 RETURNING *",
      [no_transaksi]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Peminjaman tidak ditemukan" });
    }

    res
      .status(200)
      .json({ message: "Peminjaman berhasil dihapus", data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat menghapus peminjaman" });
  }
});