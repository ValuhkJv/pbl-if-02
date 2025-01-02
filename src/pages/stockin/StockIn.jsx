import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Grid,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import axios from "axios";

const StockInPage = () => {
  const [formData, setFormData] = useState({
    category_id: "",
    item_id: "",
    quantity: "",
  });
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [stockInData, setStockInData] = useState([]);
  const [open, setOpen] = useState(false); // State untuk mengontrol modal

  // Fetch stock-in data as a reusable function
  const fetchStockInData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/stock-in");
      setStockInData(response.data.data);
    } catch (error) {
      console.error("Error fetching stock-in data:", error);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/categories/stockin"
        );
        setCategories(response.data.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (formData.category_id) {
      const fetchItems = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/items/stockin?category_id=${formData.category_id}`
          );
          setItems(response.data.data);
        } catch (error) {
          console.error("Error fetching items:", error);
        }
      };
      fetchItems();
    } else {
      setItems([]);
    }
  }, [formData.category_id]);

  // Fetch stock-in data initially
  useEffect(() => {
    fetchStockInData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "quantity" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/stock-in", formData);
      alert("Stok barang berhasil ditambahkan!");
      setFormData({ category_id: "", item_id: "", quantity: "" });
      fetchStockInData(); // Refresh table after adding stock
      handleClose(); // Tutup modal setelah submit
    } catch (error) {
      console.error("Error adding stock-in:", error);
      alert("Gagal menambahkan stok barang.");
    }
  };

  const handleDelete = async (stock_in_id) => {
    if (
      !window.confirm("Apakah Anda yakin ingin menghapus log barang masuk ini?")
    ) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/stock-in/${stock_in_id}`);
      alert("Data barang masuk berhasil dihapus!");
      fetchStockInData(); // Refresh table after deletion
    } catch (error) {
      console.error("Error deleting stock-in data:", error);
      alert("Gagal menghapus data barang masuk.");
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Manajemen Barang Masuk</h2>

      {/* Tombol untuk membuka modal */}
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Tambah Stok
      </Button>

      {/* Modal Form */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Tambah Barang Masuk</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Kategori Barang"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                >
                  {categories.map((category) => (
                    <MenuItem
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.category_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Nama Barang"
                  name="item_id"
                  value={formData.item_id}
                  onChange={handleChange}
                  required
                >
                  {items.map((item) => (
                    <MenuItem key={item.item_id} value={item.item_id}>
                      {item.item_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Jumlah Barang"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Batal
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Tambah Stok
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tabel */}
      <TableContainer component={Paper} style={{ marginTop: "20px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Kategori Barang</TableCell>
              <TableCell>Nama Barang</TableCell>
              <TableCell>Jumlah</TableCell>
              <TableCell>Tanggal Masuk</TableCell>
              <TableCell>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stockInData.map((row) => (
              <TableRow key={row.stock_in_id}>
                <TableCell>{row.category_name}</TableCell>
                <TableCell>{row.item_name}</TableCell>
                <TableCell>{row.quantity}</TableCell>
                <TableCell>
                  {new Date(row.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={() => handleDelete(row.stock_in_id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default StockInPage;
