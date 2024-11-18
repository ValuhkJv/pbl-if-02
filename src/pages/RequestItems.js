import React, { useState, useEffect, useCallback } from "react";
import {
  TextField,
  Button,
  Box,
  Modal,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";

export default function RequestItems({ requestId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    item_name: "",
    quantity: "",
    request_id: requestId, // Menyertakan requestId yang diteruskan dari parent (Request)
  });

  // Fetch barang berdasarkan requestId
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/items/${requestId}`);
      const data = await response.json();
      setItems(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching items:", error);
      setLoading(false);
    }
  }, [requestId]); // Menambahkan requestId sebagai dependensi

  // Fetch barang berdasarkan requestId saat pertama kali render
  useEffect(() => {
    if (requestId) {
      fetchItems(); // Memanggil fetchItems saat requestId berubah atau komponen pertama kali dirender
    }
  }, [fetchItems, requestId]); // Memasukkan fetchItems ke dalam dependensi

  // Handle perubahan form input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle submit form barang
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/requestItems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result) {
        fetchItems(); // Reload items after submit
        setFormData({
          item_name: "",
          quantity: "",
          request_id: requestId,
        });
      }
    } catch (error) {
      console.error("Error submitting request item:", error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <Typography variant="h6" gutterBottom>
        Barang yang Diminta
      </Typography>

      {/* Form untuk Menambahkan Barang */}
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          label="Nama Barang"
          name="item_name"
          value={formData.item_name}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          type="number"
          label="Jumlah"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          type="submit"
          style={{ marginTop: "10px" }}
        >
          Tambah Barang
        </Button>
      </form>

      {/* Menampilkan Daftar Barang yang Sudah Diminta */}
      <div style={{ marginTop: "20px" }}>
        <Typography variant="body1" gutterBottom>
          Barang yang sudah diminta:
        </Typography>
        {items.length > 0 ? (
          <ul>
            {items.map((item, index) => (
              <li key={index}>
                {item.item_name} - {item.quantity} pcs
              </li>
            ))}
          </ul>
        ) : (
          <Typography variant="body2" color="textSecondary">
            Tidak ada barang yang diminta
          </Typography>
        )}
      </div>
    </div>
  );
}
