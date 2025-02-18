import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Grid,
  Box,
  Paper,
  IconButton,
  Autocomplete,
} from "@mui/material";
import axios from "axios";
import ClearIcon from "@mui/icons-material/Clear";
import sweetAlert from "../../components/SweetAlert";
import { styled } from "@mui/system";

const StyledTableCell = styled(TableCell)({
  padding: "12px",
  border: "1px solid #ddd",
  textAlign: "center",
  wordWrap: "break-word",
});

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
  },
}));

const RequestForm = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [formData, setFormData] = useState({
    category_id: "",
    item_id: "",
    quantity: "",
    reason: "",
    stock: "",
  });
  const [userData, setUserData] = useState({
    name: "",
    division_name: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = sessionStorage.getItem("user_id"); // Atau dari session atau token JWT
      if (userId) {
        try {
          const userResponse = await axios.get(
            `http://localhost:5000/users/${userId}`
          ); // Sesuaikan user_id
          setUserData({
            full_name: sessionStorage.getItem("full_name"),
            division_name: userResponse.data.division_name,
            division_id: userResponse.data.division_id,
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, []);

  // Fetch categories on component mount
  useEffect(() => {
    axios
      .get("http://localhost:5000/categories")
      .then((response) => setCategories(response.data));
  }, []);

  // Fetch items when category changes
  useEffect(() => {
    if (formData.category_id) {
      console.log("Category ID:", formData.category_id);
      axios
        .get(`http://localhost:5000/items?category_id=${formData.category_id}`)
        .then((response) => {
          console.log("Items:", response.data);
          setItems(response.data);
        })
        .catch((error) => {
          console.error("Error fetching items:", error);
        });
    }
  }, [formData.category_id]);

  // Fetch stock of selected item
  useEffect(() => {
    if (formData.item_id) {
      const selectedItem = items.find(
        (item) => item.item_id === formData.item_id
      );
      setFormData((prev) => ({ ...prev, stock: selectedItem?.stock || "" }));
    }
  }, [formData.item_id, items]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateFormData = () => {
    if (!formData.category_id) {
      sweetAlert.error("Error", "Silahkan pilih kategori terlebih dahulu");
      return false;
    }
    if (!formData.item_id) {
      sweetAlert.error("Error", "Silahkan pilih barang terlebih dahulu");
      return false;
    }
    if (!formData.quantity || formData.quantity <= 0) {
      sweetAlert.error("Error", "Jumlah harus lebih dari 0");
      return false;
    }
    if (!formData.reason.trim()) {
      sweetAlert.error("Error", "Silahkan isi alasan permintaan");
      return false;
    }
    return true;
  };

  const addRequest = () => {
    if (!validateFormData()) {
      return;
    }
    const selectedItem = items.find(
      (item) => item.item_id === formData.item_id
    );

    if (!selectedItem) {
      sweetAlert.error("Error", "Barang tidak ditemukan");
      return;
    }

    if (requests.length >= 3) {
      sweetAlert.error("Error", "Maksimal 3 barang per permintaan!");
      return;
    }

    // Check if item already exists in requests
    if (requests.some((request) => request.item_id === selectedItem.item_id)) {
      sweetAlert.error("Error", "Barang sudah ada dalam daftar permintaan");
      return;
    }

    const quantity = parseInt(formData.quantity);
    const stock = parseInt(selectedItem.stock);

    if (quantity > stock) {
      sweetAlert.error(
        "Error",
        `Jumlah permintaan (${quantity}) melebihi stok yang tersedia (${stock})`
      );
      return;
    }

    setRequests([
      ...requests,
      {
        item_id: selectedItem.item_id,
        item_name: selectedItem.item_name,
        category_name: selectedItem.category_name,
        quantity: quantity,
        reason: formData.reason,
        stock: stock,
      },
    ]);

    // Reset form
    setFormData({
      category_id: "",
      item_id: "",
      quantity: "",
      reason: "",
      stock: "",
    });
  };

  // Fungsi untuk menghapus item dari daftar pinjaman
  const removeItem = (itemId) => {
    setRequests(requests.filter((request) => request.item_id !== itemId));
  };

  const handleSubmit = async () => {
    const userId = sessionStorage.getItem("user_id");
    if (!userId) {
      sweetAlert.error("Error", "User ID tidak ditemukan");
      return;
    }

    const payload = {
      user_id: userId,
      requests: requests.map((req) => ({
        item_id: req.item_id,
        quantity: req.quantity,
        reason: req.reason,
        category_name: req.category_name,
      })),
    };

    try {
      await axios.post("http://localhost:5000/requests/batch", payload);
      sweetAlert.success("Berhasil!", "Permintaan telah berhasil diajukan");
      setRequests([]);
    } catch (error) {
      sweetAlert.error(
        "Error",
        error.response?.data?.message || "Terjadi kesalahan pada server"
      );
      console.error(error);
    }
  };

  const handleItemChange = (_, newValue) => {
    setFormData((prev) => ({
      ...prev,
      item_id: newValue?.item_id || "",
      stock: newValue?.stock || "",
    }));
  };

  return (
    <div>
      <Box sx={{ padding: 2 }}>
        <Paper elevation={3} sx={{ padding: 3, borderRadius: "6px" }}>
          <Typography variant="h4" gutterBottom>
            FORM PERMINTAAN BARANG
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                fullWidth
                id="name"
                label="Nama"
                value={userData.full_name || ""}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                fullWidth
                id="division_id"
                label="Division"
                value={userData.division_name || ""}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                fullWidth
                displayEmpty
              >
                <MenuItem value="">-- Pilih Kategori --</MenuItem>
                {categories.map((category) => (
                  <MenuItem
                    key={category.category_id}
                    value={category.category_id}
                  >
                    {category.category_name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={items}
                getOptionLabel={(option) => option.item_name || ""}
                value={
                  items.find((item) => item.item_id === formData.item_id) ||
                  null
                }
                onChange={handleItemChange}
                disabled={!formData.category_id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="-- Pilih Barang --"
                    className="w-full"
                  />
                )}
                className="w-full"
                noOptionsText={
                  formData.category_id
                    ? "Barang belum tersedia"
                    : "Pilih kategori terlebih dahulu"
                }
                ListboxProps={{
                  style: {
                    maxHeight: "200px",
                    overflow: "auto",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Stok Barang"
                name="stock"
                value={formData.stock}
                fullWidth
                InputProps={{
                  readOnly: true, // agar hanya untuk tampilan, tidak dapat diubah manual
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Jumlah"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Alasan"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                color="primary"
                onClick={addRequest}
                fullWidth
              >
                Tambahkan Barang
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Request Table */}
      <Box sx={{ padding: 2 }}>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: "6px",
            overflow: "hidden",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
            padding: 3,
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            flexGrow={1}
            sx={{ padding: 3 }}
          >
            Barang yang Diminta
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Nama Barang</StyledTableCell>
                <StyledTableCell>Kategori</StyledTableCell>
                <StyledTableCell>Jumlah</StyledTableCell>
                <StyledTableCell>Stok</StyledTableCell>
                <StyledTableCell>Alasan</StyledTableCell>
                <StyledTableCell>Aksi</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request, index) => (
                <StyledTableRow key={index}>
                  <StyledTableCell>{request.item_name}</StyledTableCell>
                  <StyledTableCell>{request.category_name}</StyledTableCell>
                  <StyledTableCell>{request.quantity}</StyledTableCell>
                  <StyledTableCell>{request.stock}</StyledTableCell>
                  <StyledTableCell>{request.reason}</StyledTableCell>
                  <StyledTableCell>
                    <IconButton
                      color="error"
                      onClick={() => removeItem(request.item_id)}
                    >
                      <ClearIcon />
                    </IconButton>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={requests.length === 0}
            sx={{ mt: 2 }}
          >
            Kirim Permintaan
          </Button>
        </TableContainer>
      </Box>
    </div>
  );
};

export default RequestForm;
