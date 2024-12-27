import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import StockInTable from "../../components/StockInTable.jsx";
import StockInForm from "../../components/StockInForm";
import axios from "axios";

const App = () => {
  const [stockInData, setStockInData] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fetch data dari API
  const fetchStockInData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/stock-in");
      setStockInData(response.data.data);
    } catch (error) {
      console.error("Error fetching stock-in data:", error);
    }
  };

  useEffect(() => {
    fetchStockInData();
  }, []);

  const handleOpenForm = (data = null) => {
    setEditData(data);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setEditData(null);
    setOpenForm(false);
  };

  const handleSave = async (formData) => {
    try {
      if (editData) {
        // Update data
        await axios.put(
          `http://localhost:5000/stock-in/${editData.stock_in_id}`,
          formData
        );
      } else {
        // Tambah data baru
        await axios.post("http://localhost:5000/stock-in", formData);
      }
      fetchStockInData();
      handleCloseForm();
    } catch (error) {
      console.error("Error saving stock-in data:", error);
    }
  };

  const handleDelete = async (stockInId) => {
    try {
      await axios.delete(`http://localhost:5000/stock-in/${stockInId}`);
      fetchStockInData();
    } catch (error) {
      console.error("Error deleting stock-in data:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" align="center" marginY={4}>
        Manajemen Barang Masuk
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpenForm()}
      >
        Tambah Barang Masuk
      </Button>
      <Box marginTop={4}>
        <StockInTable
          data={stockInData}
          onEdit={handleOpenForm}
          onDelete={handleDelete}
        />
      </Box>
      <Dialog open={openForm} onClose={handleCloseForm} fullWidth maxWidth="sm">
        <DialogTitle>
          {editData ? "Edit Barang Masuk" : "Tambah Barang Masuk"}
        </DialogTitle>
        <DialogContent>
          <StockInForm
            data={editData}
            onSave={handleSave}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default App;
