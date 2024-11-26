import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Grid,
  Divider,
} from "@mui/material";
import { Add, Replay, ShoppingCart, Close } from "@mui/icons-material";

const PeminjamanBarang = () => {
  const [kodeBarang, setKodeBarang] = useState("");
  const [namaBarang, setNamaBarang] = useState("");
  const [kategori, setKategori] = useState("");
  const [satuan, setSatuan] = useState("");
  const [jumlah, setJumlah] = useState(1);
  const [peminjam, setPeminjam] = useState("Toni");
  const [items, setItems] = useState([]);

  const handleAddItem = () => {
    if (kodeBarang && namaBarang && kategori && satuan && jumlah > 0) {
      setItems([
        ...items,
        { kodeBarang, namaBarang, kategori, satuan, jumlah },
      ]);
      setKodeBarang("");
      setNamaBarang("");
      setKategori("");
      setSatuan("");
      setJumlah(1);
    }
  };

  const handleReset = () => {
    setKodeBarang("");
    setNamaBarang("");
    setKategori("");
    setSatuan("");
    setJumlah(1);
  };

  const handleDeleteItem = (index) => {
    if (index >= 0 && index < items.length) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handlePinjam = () => {
    alert("Barang berhasil dipinjam!");
    setItems([]);
  };

  return (
    <Grid>
      <Typography variant="h4" gutterBottom mb={5} mt={5}>
        Peminjaman Barang
      </Typography>
      <Paper
        sx={{
          width: "100%",
          marginTop: "15px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          padding: "20px",
        }}
      >
        <Box>
          <Typography variant="h6" gutterBottom>
            Input Barang Masuk
          </Typography>
          <Divider />
        </Box>

        <Box p={4}>
          <Box display="flex" gap={2} mb={3}>
            <TextField
              label="No Transaksi Peminjaman"
              value="IT-0001"
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Tanggal"
              value="02 Apr 2023"
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Jam"
              value="10:54:05"
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Nama Peminjam"
              value={peminjam}
              onChange={(e) => setPeminjam(e.target.value)}
            />
          </Box>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#0C628B",
              padding: "10px",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <Typography variant="h6" gutterBottom color="white">
              Input Faktur Barang Masuk
            </Typography>
          </div>

          <Box display="flex" gap={2} mb={2} mt={3}>
            <TextField
              label="Kode Barang"
              value={kodeBarang}
              onChange={(e) => setKodeBarang(e.target.value)}
            />
            <TextField
              label="Nama Barang"
              value={namaBarang}
              onChange={(e) => setNamaBarang(e.target.value)}
            />
            <TextField
              label="Kategori"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
            />
            <TextField
              label="Satuan"
              value={satuan}
              onChange={(e) => setSatuan(e.target.value)}
            />
            <TextField
              type="number"
              label="Jumlah"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
            />
            <Box display="flex" gap={2} mb={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={handleAddItem}
              >
                Tambah
              </Button>
              <Button
                variant="contained"
                color="warning"
                startIcon={<Replay />}
                onClick={handleReset}
              >
                Ulang
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<ShoppingCart />}
                onClick={handlePinjam}
                disabled={items.length === 0}
              >
                Pinjam
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Kode Barang</TableCell>
                  <TableCell>Nama Barang</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell>QTY</TableCell>
                  <TableCell>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.kodeBarang}</TableCell>
                    <TableCell>{item.namaBarang}</TableCell>
                    <TableCell>{item.kategori}</TableCell>
                    <TableCell>{item.jumlah}</TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteItem(index)}
                      >
                        <Close />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    </Grid>
  );
};

export default PeminjamanBarang;
